import { groupConfig } from "@/config/groups";
import { createNotFoundError, handleDatabaseError } from "@/lib/errors";
import { getUsersDetails } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
	AppError,
	ErrorCode,
	type GroupInvitation,
	type GroupMember,
	type MemberService,
	type MemberWithUser,
	type PaginatedResponse,
	type PaginationOptions,
} from "@/types";
import { invitationService } from "./invitationService";

export class GenericMemberService implements MemberService {
	constructor(private config = groupConfig) {}

	async getGroupMembers(
		groupId: string,
		userId: string,
		options: PaginationOptions = {},
	): Promise<PaginatedResponse<MemberWithUser>> {
		const supabase = await createClient();

		// Verify user has access to this group
		await this.verifyGroupAccess(groupId, userId);

		const page = options.page || 1;
		const limit = Math.min(options.limit || 20, 100);
		const offset = (page - 1) * limit;

		let query = supabase
			.from("group_members")
			.select("id, group_id, user_id, role, permissions, joined_at")
			.eq("group_id", groupId)
			.range(offset, offset + limit - 1);

		if (options.search) {
			// This would require joining with auth.users, which needs special handling
			// For now, we'll skip search and focus on basic functionality
		}

		if (options.sortBy) {
			const order = options.sortOrder || "desc";
			query = query.order(options.sortBy, { ascending: order === "asc" });
		} else {
			query = query.order("joined_at", { ascending: true });
		}

		const { data: members, error, count } = await query;

		if (error) throw handleDatabaseError(error, "fetching group members");

		// Get user details from auth.users using admin client
		const userIds = (members || []).map((member) => member.user_id);
		let usersDetails: Awaited<ReturnType<typeof getUsersDetails>> = [];
		try {
			usersDetails = userIds.length > 0 ? await getUsersDetails(userIds) : [];
		} catch (error) {
			// Log error but continue with empty user details
			console.error("Failed to fetch user details:", error);
		}

		// Create a map for quick lookup
		const userDetailsMap = new Map(usersDetails.map((user) => [user.id, user]));

		// Transform members with user details
		const membersWithUsers: MemberWithUser[] = (members || []).map((member) => {
			const userDetails = userDetailsMap.get(member.user_id);
			return {
				id: member.id,
				group_id: member.group_id,
				user_id: member.user_id,
				role: member.role,
				permissions: member.permissions,
				joined_at: member.joined_at,
				user: {
					id: member.user_id,
					email: userDetails?.email || "",
					name: userDetails?.name,
					avatar_url: userDetails?.avatar_url,
				},
			};
		});

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

	async getMember(
		groupId: string,
		memberId: string,
		userId: string,
	): Promise<MemberWithUser> {
		const supabase = await createClient();

		// Verify user has access to this group
		await this.verifyGroupAccess(groupId, userId);

		// Get the member
		const { data: member, error } = await supabase
			.from("group_members")
			.select("id, group_id, user_id, role, permissions, joined_at")
			.eq("user_id", memberId)
			.eq("group_id", groupId)
			.single();

		if (error || !member) {
			throw createNotFoundError("Member");
		}

		// Get user details from auth.users using admin client
		let userDetails: Awaited<ReturnType<typeof getUsersDetails>>[0] | undefined;
		try {
			const usersDetails = await getUsersDetails([memberId]);
			userDetails = usersDetails[0];
		} catch (error) {
			// Log error but continue with empty user details
			console.error("Failed to fetch user details:", error);
		}

		// Transform member with user details
		const memberWithUser: MemberWithUser = {
			id: member.id,
			group_id: member.group_id,
			user_id: member.user_id,
			role: member.role,
			permissions: member.permissions,
			joined_at: member.joined_at,
			user: {
				id: member.user_id,
				email: userDetails?.email || "",
				name: userDetails?.name,
				avatar_url: userDetails?.avatar_url,
			},
		};

		return memberWithUser;
	}

	async addMember(
		groupId: string,
		userId: string,
		email: string,
		role: string,
	): Promise<GroupInvitation> {
		// Verify user has permission to invite
		const canInvite = await this.canPerformAction(
			userId,
			groupId,
			"invite_members",
		);
		if (!canInvite) {
			throw new AppError(
				ErrorCode.FORBIDDEN,
				"Insufficient permissions to invite members",
				403,
			);
		}

		// Use invitation service to create the invitation
		return await invitationService.createInvitation(
			groupId,
			email,
			role,
			userId,
		);
	}

	async updateMemberRole(
		groupId: string,
		targetUserId: string,
		newRole: string,
		requestingUserId: string,
	): Promise<GroupMember> {
		const supabase = await createClient();

		// Verify user has permission to change roles (only owners)
		const { data: userMembership } = await supabase
			.from("group_members")
			.select("role")
			.eq("group_id", groupId)
			.eq("user_id", requestingUserId)
			.single();

		if (!userMembership || userMembership.role !== "owner") {
			throw new AppError(
				ErrorCode.FORBIDDEN,
				"Only owners can change member roles",
				403,
			);
		}

		// Validate new role
		if (!this.config.defaultRoles.includes(newRole)) {
			throw new AppError(
				ErrorCode.VALIDATION_ERROR,
				`Invalid role: ${newRole}`,
				400,
			);
		}

		// Find the member record by user_id and group_id
		const { data: targetMember } = await supabase
			.from("group_members")
			.select("id, user_id, role")
			.eq("user_id", targetUserId)
			.eq("group_id", groupId)
			.single();

		if (!targetMember) {
			throw createNotFoundError("Member");
		}

		// Check if target is the owner
		const { data: group } = await supabase
			.from("groups")
			.select("owner_id")
			.eq("id", groupId)
			.single();

		if (targetMember.user_id === group?.owner_id) {
			throw new AppError(ErrorCode.FORBIDDEN, "Cannot change owner role", 403);
		}

		// Update role
		const { data: updatedMember, error } = await supabase
			.from("group_members")
			.update({
				role: newRole,
				permissions: this.getRolePermissions(newRole),
			})
			.eq("id", targetMember.id)
			.select()
			.single();

		if (error) throw handleDatabaseError(error, "updating member role");

		// Log the change
		await this.logAuditEvent(groupId, requestingUserId, "member_role_changed", {
			targetUserId,
			oldRole: targetMember.role,
			newRole,
		});

		return updatedMember;
	}

	async removeMember(
		groupId: string,
		targetUserId: string,
		requestingUserId: string,
	): Promise<void> {
		const supabase = await createClient();

		// Get member details
		const { data: member } = await supabase
			.from("group_members")
			.select("id, user_id, role")
			.eq("user_id", targetUserId)
			.eq("group_id", groupId)
			.single();

		if (!member) {
			throw createNotFoundError("Member");
		}

		// Check permissions
		const canRemove =
			requestingUserId === member.user_id || // User can remove themselves
			(await this.canPerformAction(
				requestingUserId,
				groupId,
				"manage_members",
			)); // Or has manage permission

		if (!canRemove) {
			throw new AppError(ErrorCode.FORBIDDEN, "Cannot remove this member", 403);
		}

		// Cannot remove the owner
		const { data: group } = await supabase
			.from("groups")
			.select("owner_id")
			.eq("id", groupId)
			.single();

		if (member.user_id === group?.owner_id) {
			throw new AppError(ErrorCode.FORBIDDEN, "Cannot remove the owner", 403);
		}

		// Remove member
		const { error } = await supabase
			.from("group_members")
			.delete()
			.eq("id", member.id)
			.eq("group_id", groupId);

		if (error) throw handleDatabaseError(error, "removing member");

		// Log the removal
		await this.logAuditEvent(groupId, requestingUserId, "member_removed", {
			removedUserId: member.user_id,
			removedRole: member.role,
		});
	}

	async canPerformAction(
		userId: string,
		groupId: string,
		action: string,
	): Promise<boolean> {
		const supabase = await createClient();

		// Check if user is owner
		const { data: group } = await supabase
			.from("groups")
			.select("owner_id")
			.eq("id", groupId)
			.single();

		if (group?.owner_id === userId) {
			return true; // Owners can do anything
		}

		// Check member permissions
		const { data: membership } = await supabase
			.from("group_members")
			.select("permissions")
			.eq("group_id", groupId)
			.eq("user_id", userId)
			.single();

		const permissions = membership?.permissions;
		if (
			!permissions ||
			typeof permissions !== "object" ||
			Array.isArray(permissions)
		) {
			return false;
		}
		return Boolean((permissions as Record<string, unknown>)[action]);
	}

	private async verifyGroupAccess(
		groupId: string,
		userId: string,
	): Promise<void> {
		const supabase = await createClient();

		const { data: membership } = await supabase
			.from("group_members")
			.select("id")
			.eq("group_id", groupId)
			.eq("user_id", userId)
			.single();

		if (!membership) {
			// Check if user is owner
			const { data: group } = await supabase
				.from("groups")
				.select("owner_id")
				.eq("id", groupId)
				.eq("is_deleted", false)
				.single();

			if (!group || group.owner_id !== userId) {
				throw createNotFoundError(this.config.entityName);
			}
		}
	}

	private getRolePermissions(role: string): Record<string, boolean> {
		const permissions = this.config.rolePermissions[role] || [];
		return permissions.reduce(
			(acc, perm) => {
				acc[perm] = true;
				return acc;
			},
			{} as Record<string, boolean>,
		);
	}

	private async logAuditEvent(
		groupId: string,
		userId: string,
		action: string,
		details: Record<string, unknown>,
	): Promise<void> {
		const supabase = await createClient();

		await supabase.from("group_audit_log").insert({
			action,
			user_id: userId,
			group_id: groupId,
			details: details as any,
		});
	}
}

// Export singleton instance
export const memberService = new GenericMemberService();
