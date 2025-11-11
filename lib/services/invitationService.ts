import { createClient } from "@/lib/supabase/server";
import {
  InvitationService,
  GroupInvitation,
  GroupMember,
  AppError,
  ErrorCode,
} from "@/types";
import { groupConfig } from "@/config/groups";
import { handleDatabaseError, createNotFoundError } from "@/lib/errors";
import { emailService } from "./emailService";

export class GenericInvitationService implements InvitationService {
  constructor(private config = groupConfig) {}

  async createInvitation(
    groupId: string,
    email: string,
    role: string,
    invitedBy: string
  ): Promise<GroupInvitation> {
    const supabase = await createClient();

    // Validate role
    if (!this.config.defaultRoles.includes(role)) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        `Invalid role: ${role}`,
        400
      );
    }

    // Check for pending invitation
    const { data: pendingInvitation } = await supabase
      .from("group_invitations")
      .select("id")
      .eq("group_id", groupId)
      .eq("email", email)
      .eq("status", "pending")
      .single();

    if (pendingInvitation) {
      throw new AppError(
        ErrorCode.PENDING_INVITATION,
        "There is already a pending invitation for this email",
        400
      );
    }

    // Check invitation limit
    const { count: invitationCount } = await supabase
      .from("group_invitations")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId)
      .eq("status", "pending");

    if (
      invitationCount &&
      invitationCount >= this.config.limits.maxInvitationsPerGroup
    ) {
      throw new AppError(
        ErrorCode.LIMIT_EXCEEDED,
        `Maximum ${
          this.config.limits.maxInvitationsPerGroup
        } pending invitations per ${this.config.entityName.toLowerCase()}`,
        400
      );
    }

    // Get current user details from JWT for inviter name
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    const inviterName =
      currentUser?.user_metadata?.name ||
      currentUser?.email?.split("@")[0] ||
      "Someone";

    // Generate secure token
    const token = this.generateSecureToken();

    // Log plain token for testing (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔑 INVITATION TOKEN for ${email}: ${token}`);
      console.log(`📧 Test URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invitations/${token}/accept`);
    }

    // Create invitation with inviter name stored
    const { data: invitation, error } = await supabase
      .from("group_invitations")
      .insert({
        group_id: groupId,
        email,
        role,
        invited_by: invitedBy,
        token: this.hashToken(token),
        expires_at: new Date(
          Date.now() +
            this.config.limits.invitationExpiryDays * 24 * 60 * 60 * 1000
        ).toISOString(),
        // Store inviter name to avoid querying auth.users later
        details: { inviter_name: inviterName },
      })
      .select()
      .single();

    if (error) throw handleDatabaseError(error, "creating invitation");

    // Send invitation email asynchronously
    this.sendInvitationEmail(invitation, token, inviterName).catch((err) => {
      console.error("Failed to send invitation email:", err);
      // Don't fail the invitation creation if email fails
    });

    return invitation;
  }

  async getPendingInvitations(
    groupId: string,
    userId: string
  ): Promise<GroupInvitation[]> {
    const supabase = await createClient();

    // Verify user has permission to view invitations
    const { data: membership } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .single();

    if (!membership) {
      throw createNotFoundError(this.config.entityName);
    }

    // Only owners and admins can view invitations
    if (!["owner", "admin"].includes(membership.role)) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        "Insufficient permissions to view invitations",
        403
      );
    }

    const { data: invitations, error } = await supabase
      .from("group_invitations")
      .select("*")
      .eq("group_id", groupId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw handleDatabaseError(error, "fetching invitations");

    return invitations || [];
  }

  async acceptInvitation(
    token: string,
    userId: string
  ): Promise<{ groupId: string }> {
    const supabase = await createClient();

    // Find invitation by token
    const { data: invitation, error: findError } = await supabase
      .from("group_invitations")
      .select("*, groups(*)")
      .eq("token", this.hashToken(token))
      .eq("status", "pending")
      .single();

    if (findError || !invitation) {
      throw createNotFoundError("Invitation");
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from("group_invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id);

      throw new AppError(
        ErrorCode.INVITATION_EXPIRED,
        "This invitation has expired",
        400
      );
    }

    // Verify the user matches the invitation email
    const { data: user } = await supabase.auth.getUser();
    if (!user.user || user.user.email !== invitation.email) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        "You can only accept invitations sent to your email address",
        403
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", invitation.group_id)
      .eq("user_id", userId)
      .single();

    if (existingMember) {
      throw new AppError(
        ErrorCode.ALREADY_MEMBER,
        "You are already a member of this group",
        400
      );
    }

    // Start transaction-like operation
    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: invitation.group_id,
      user_id: userId,
      role: invitation.role,
      permissions: this.getRolePermissions(invitation.role),
    });

    if (memberError) throw handleDatabaseError(memberError, "adding member");

    // Update invitation status
    const { error: updateError } = await supabase
      .from("group_invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    if (updateError)
      throw handleDatabaseError(updateError, "updating invitation");

    // Send welcome email
    this.sendWelcomeEmail(invitation, userId).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });

    // Log the acceptance
    await this.logAuditEvent(
      invitation.group_id,
      userId,
      "invitation_accepted",
      {
        invitationId: invitation.id,
        role: invitation.role,
      }
    );

    return { groupId: invitation.group_id };
  }

  async rejectInvitation(token: string, userId: string): Promise<void> {
    const supabase = await createClient();

    // Find invitation by token
    const { data: invitation, error: findError } = await supabase
      .from("group_invitations")
      .select("*")
      .eq("token", this.hashToken(token))
      .eq("status", "pending")
      .single();

    if (findError || !invitation) {
      throw createNotFoundError("Invitation");
    }

    // Verify the user matches the invitation email
    const { data: user } = await supabase.auth.getUser();
    if (!user.user || user.user.email !== invitation.email) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        "You can only reject invitations sent to your email address",
        403
      );
    }

    // Update invitation status
    const { error } = await supabase
      .from("group_invitations")
      .update({ status: "rejected" })
      .eq("id", invitation.id);

    if (error) throw handleDatabaseError(error, "rejecting invitation");

    // Log the rejection
    await this.logAuditEvent(
      invitation.group_id,
      userId,
      "invitation_rejected",
      {
        invitationId: invitation.id,
      }
    );
  }

  async cancelInvitation(invitationId: string, userId: string): Promise<void> {
    const supabase = await createClient();

    // Find invitation
    const { data: invitation, error: findError } = await supabase
      .from("group_invitations")
      .select("*, groups(*)")
      .eq("id", invitationId)
      .eq("status", "pending")
      .single();

    if (findError || !invitation) {
      throw createNotFoundError("Invitation");
    }

    // Verify user has permission (group owner or admin)
    const { data: membership } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", invitation.group_id)
      .eq("user_id", userId)
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        "Insufficient permissions to cancel invitations",
        403
      );
    }

    // Update invitation status to cancelled
    const { error } = await supabase
      .from("group_invitations")
      .update({ status: "cancelled" })
      .eq("id", invitation.id);

    if (error) throw handleDatabaseError(error, "cancelling invitation");

    // Log the cancellation
    await this.logAuditEvent(
      invitation.group_id,
      userId,
      "invitation_cancelled",
      {
        invitationId: invitation.id,
        cancelledEmail: invitation.email,
      }
    );
  }

  async resendInvitation(invitationId: string, userId: string): Promise<void> {
    const supabase = await createClient();

    // Find invitation
    const { data: invitation, error: findError } = await supabase
      .from("group_invitations")
      .select("*, groups(*)")
      .eq("id", invitationId)
      .eq("status", "pending")
      .single();

    if (findError || !invitation) {
      throw createNotFoundError("Invitation");
    }

    // Verify user has permission
    const { data: membership } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", invitation.group_id)
      .eq("user_id", userId)
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        "Insufficient permissions to resend invitations",
        403
      );
    }

    // Generate new token and expiry
    const token = this.generateSecureToken();
    const newExpiry = new Date(
      Date.now() + this.config.limits.invitationExpiryDays * 24 * 60 * 60 * 1000
    );

    // Update invitation
    const { error: updateError } = await supabase
      .from("group_invitations")
      .update({
        token: this.hashToken(token),
        expires_at: newExpiry.toISOString(),
      })
      .eq("id", invitation.id);

    if (updateError)
      throw handleDatabaseError(updateError, "updating invitation");

    // Get current user details for inviter name
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    const inviterName =
      currentUser?.user_metadata?.name ||
      currentUser?.email?.split("@")[0] ||
      invitation.details?.inviter_name ||
      "Someone";

    // Send invitation email
    this.sendInvitationEmail(
      { ...invitation, expires_at: newExpiry.toISOString() },
      token,
      inviterName
    ).catch((err) => {
      console.error("Failed to resend invitation email:", err);
    });

    // Log the resend
    await this.logAuditEvent(invitation.group_id, userId, "invitation_resent", {
      invitationId: invitation.id,
    });
  }

  async getInvitationByToken(token: string): Promise<GroupInvitation | null> {
    const supabase = await createClient();

    const { data: invitation, error } = await supabase
      .from("group_invitations")
      .select("*, groups(*)")
      .eq("token", this.hashToken(token))
      .single();

    if (error || !invitation) {
      return null;
    }

    return invitation;
  }

  async cleanupExpiredInvitations(): Promise<number> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("group_invitations")
      .update({ status: "expired" })
      .eq("status", "pending")
      .lt("expires_at", new Date().toISOString())
      .select("id");

    if (error)
      throw handleDatabaseError(error, "cleaning up expired invitations");

    return data?.length || 0;
  }

  private generateSecureToken(): string {
    return require("crypto").randomBytes(32).toString("hex");
  }

  private hashToken(token: string): string {
    return require("crypto").createHash("sha256").update(token).digest("hex");
  }

  private getRolePermissions(role: string): Record<string, boolean> {
    const permissions = this.config.rolePermissions[role] || [];
    return permissions.reduce((acc, perm) => ({ ...acc, [perm]: true }), {});
  }

  private async sendInvitationEmail(
    invitation: any,
    plainToken: string,
    inviterName: string
  ): Promise<void> {
    const supabase = await createClient();

    // Get group details
    const { data: group } = await supabase
      .from("groups")
      .select("name, slug")
      .eq("id", invitation.group_id)
      .single();

    if (!group) return;

    // Use the inviter name passed as parameter (stored in invitation.details)
    const displayName =
      inviterName || invitation.details?.inviter_name || "Someone";

    const acceptUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/invitations/accept?token=${plainToken}`;

    await emailService.sendInvitation({
      email: invitation.email,
      groupName: group.name,
      inviterName: displayName,
      role: invitation.role,
      acceptUrl,
      expiryDays: this.config.limits.invitationExpiryDays,
    });
  }

  private async sendWelcomeEmail(
    invitation: any,
    userId: string
  ): Promise<void> {
    const supabase = await createClient();

    // Get group details
    const { data: group } = await supabase
      .from("groups")
      .select("name, slug")
      .eq("id", invitation.group_id)
      .single();

    if (!group) return;

    // Get current user details from JWT (since we're in a server action, this should work)
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) return;

    const userName =
      currentUser.user_metadata?.name ||
      currentUser.email?.split("@")[0] ||
      "there";
    const groupUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/dashboard/groups/${group.slug}`;

    await emailService.sendWelcome({
      email: currentUser.email!,
      userName,
      groupName: group.name,
      role: invitation.role,
      groupUrl,
    });
  }

  private async logAuditEvent(
    groupId: string,
    userId: string,
    action: string,
    details: Record<string, any>
  ): Promise<void> {
    const supabase = await createClient();

    await supabase.from("group_audit_log").insert({
      group_id: groupId,
      user_id: userId,
      action,
      details,
    });
  }
}

// Export singleton instance
export const invitationService = new GenericInvitationService();
