import { createClient } from '@/lib/supabase/server';
import {
  MemberService,
  GroupInvitation,
  GroupMember,
  MemberWithUser,
  PaginatedResponse,
  PaginationOptions,
  AppError,
  ErrorCode,
} from '@/types';
import { groupConfig } from '@/config/groups';
import { handleDatabaseError, createLimitExceededError, createNotFoundError } from '@/lib/errors';
import { invitationService } from './invitationService';

export class GenericMemberService implements MemberService {
  constructor(private config = groupConfig) {}

  async getGroupMembers(
    groupId: string,
    userId: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResponse<MemberWithUser>> {
    const supabase = await createClient();

    // Verify user has access to this group
    await this.verifyGroupAccess(groupId, userId);

    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('group_members')
      .select('id, group_id, user_id, role, permissions, joined_at')
      .eq('group_id', groupId)
      .range(offset, offset + limit - 1);

    if (options.search) {
      // This would require joining with auth.users, which needs special handling
      // For now, we'll skip search and focus on basic functionality
    }

    if (options.sortBy) {
      const order = options.sortOrder || 'desc';
      query = query.order(options.sortBy, { ascending: order === 'asc' });
    } else {
      query = query.order('joined_at', { ascending: false });
    }

    const { data: members, error, count } = await query;

    if (error) throw handleDatabaseError(error, 'fetching group members');

    // Get user details (simplified - in production you'd want to batch this)
    const membersWithUsers: MemberWithUser[] = [];
    for (const member of members || []) {
      // Note: Getting user details from auth.users requires service role
      // For now, we'll return basic member data
      membersWithUsers.push({
        id: member.id,
        group_id: member.group_id,
        user_id: member.user_id,
        role: member.role,
        permissions: member.permissions,
        joined_at: member.joined_at,
        user: {
          id: member.user_id,
          email: '', // Would need separate query with proper permissions
          name: undefined,
        },
      });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: membersWithUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  async addMember(
    groupId: string,
    userId: string,
    email: string,
    role: string
  ): Promise<GroupInvitation> {
    // Verify user has permission to invite
    const canInvite = await this.canPerformAction(userId, groupId, 'invite_members');
    if (!canInvite) {
      throw new AppError(ErrorCode.FORBIDDEN, 'Insufficient permissions to invite members', 403);
    }

    // Use invitation service to create the invitation
    return await invitationService.createInvitation(groupId, email, role, userId);
  }

  async updateMemberRole(
    groupId: string,
    memberId: string,
    newRole: string,
    userId: string
  ): Promise<GroupMember> {
    const supabase = await createClient();

    // Verify user has permission to change roles (only owners)
    const { data: userMembership } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (!userMembership || userMembership.role !== 'owner') {
      throw new AppError(ErrorCode.FORBIDDEN, 'Only owners can change member roles', 403);
    }

    // Validate new role
    if (!this.config.defaultRoles.includes(newRole)) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, `Invalid role: ${newRole}`, 400);
    }

    // Cannot change owner role
    const { data: targetMember } = await supabase
      .from('group_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('group_id', groupId)
      .single();

    if (!targetMember) {
      throw createNotFoundError('Member');
    }

    // Check if target is the owner
    const { data: group } = await supabase
      .from('groups')
      .select('owner_id')
      .eq('id', groupId)
      .single();

    if (targetMember.user_id === group?.owner_id) {
      throw new AppError(ErrorCode.FORBIDDEN, 'Cannot change owner role', 403);
    }

    // Update role
    const { data: updatedMember, error } = await supabase
      .from('group_members')
      .update({
        role: newRole,
        permissions: this.getRolePermissions(newRole),
      })
      .eq('id', memberId)
      .eq('group_id', groupId)
      .select()
      .single();

    if (error) throw handleDatabaseError(error, 'updating member role');

    // Log the change
    await this.logAuditEvent(groupId, userId, 'member_role_changed', {
      memberId,
      oldRole: targetMember.role,
      newRole,
    });

    return updatedMember;
  }

  async removeMember(
    groupId: string,
    memberId: string,
    userId: string
  ): Promise<void> {
    const supabase = await createClient();

    // Get member details
    const { data: member } = await supabase
      .from('group_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('group_id', groupId)
      .single();

    if (!member) {
      throw createNotFoundError('Member');
    }

    // Check permissions
    const canRemove = userId === member.user_id || // User can remove themselves
      await this.canPerformAction(userId, groupId, 'manage_members'); // Or has manage permission

    if (!canRemove) {
      throw new AppError(ErrorCode.FORBIDDEN, 'Cannot remove this member', 403);
    }

    // Cannot remove the owner
    const { data: group } = await supabase
      .from('groups')
      .select('owner_id')
      .eq('id', groupId)
      .single();

    if (member.user_id === group?.owner_id) {
      throw new AppError(ErrorCode.FORBIDDEN, 'Cannot remove the owner', 403);
    }

    // Remove member
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('id', memberId)
      .eq('group_id', groupId);

    if (error) throw handleDatabaseError(error, 'removing member');

    // Log the removal
    await this.logAuditEvent(groupId, userId, 'member_removed', {
      memberId,
      removedUserId: member.user_id,
    });
  }

  async canPerformAction(
    userId: string,
    groupId: string,
    action: string
  ): Promise<boolean> {
    const supabase = await createClient();

    // Check if user is owner
    const { data: group } = await supabase
      .from('groups')
      .select('owner_id')
      .eq('id', groupId)
      .single();

    if (group?.owner_id === userId) {
      return true; // Owners can do anything
    }

    // Check member permissions
    const { data: membership } = await supabase
      .from('group_members')
      .select('permissions')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    return membership?.permissions?.[action] === true || false;
  }

  private async verifyGroupAccess(groupId: string, userId: string): Promise<void> {
    const supabase = await createClient();

    const { data: membership } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (!membership) {
      // Check if user is owner
      const { data: group } = await supabase
        .from('groups')
        .select('owner_id')
        .eq('id', groupId)
        .eq('is_deleted', false)
        .single();

      if (!group || group.owner_id !== userId) {
        throw createNotFoundError(this.config.entityName);
      }
    }
  }



  private getRolePermissions(role: string): Record<string, boolean> {
    const permissions = this.config.rolePermissions[role] || [];
    return permissions.reduce((acc, perm) => ({ ...acc, [perm]: true }), {});
  }

  private async logAuditEvent(
    groupId: string,
    userId: string,
    action: string,
    details: Record<string, any>
  ): Promise<void> {
    const supabase = await createClient();

    await supabase.from('group_audit_log').insert({
      group_id: groupId,
      user_id: userId,
      action,
      details,
    });
  }
}

// Export singleton instance
export const memberService = new GenericMemberService();