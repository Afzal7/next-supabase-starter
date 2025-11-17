import { groupConfig } from "@/config/groups";
import {
	createLimitExceededError,
	createNotFoundError,
	handleDatabaseError,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import {
	AppError,
	type CreateGroupRequest,
	ErrorCode,
	type Group,
	type GroupService,
	type GroupWithMembers,
	type PaginatedResponse,
	type PaginationOptions,
	type UpdateGroupRequest,
} from "@/types";

export class GenericGroupService implements GroupService {
	constructor(private config = groupConfig) {}

	async create(userId: string, data: CreateGroupRequest): Promise<Group> {
		const supabase = await createClient();

		// Check user limits
		const { count } = await supabase
			.from("groups")
			.select("*", { count: "exact", head: true })
			.eq("owner_id", userId)
			.eq("is_deleted", false);

		if (count && count >= this.config.limits.maxGroupsPerUser) {
			throw createLimitExceededError(
				`${this.config.entityNamePlural.toLowerCase()} per user`,
				this.config.limits.maxGroupsPerUser,
			);
		}

		// Generate unique slug
		const slug = await this.generateUniqueSlug(data.name);

		const groupData = {
			name: data.name,
			slug,
			description: data.description,
			group_type: data.group_type || this.config.defaultGroupType || "default",
			owner_id: userId,
		};

		const { data: group, error } = await supabase
			.from("groups")
			.insert(groupData)
			.select()
			.single();

		if (error) throw handleDatabaseError(error, "group creation");

		// Add owner as member
		const { error: memberError } = await supabase.from("group_members").insert({
			group_id: group.id,
			user_id: userId,
			role: "owner",
			permissions: this.getRolePermissions("owner"),
		});

		if (memberError) {
			// Clean up the created group if member creation fails
			await supabase.from("groups").delete().eq("id", group.id);
			throw handleDatabaseError(memberError, "owner member creation");
		}

		return group;
	}

	async getUserGroups(
		userId: string,
		options: PaginationOptions = {},
	): Promise<PaginatedResponse<Group>> {
		const supabase = await createClient();

		const page = options.page || 1;
		const limit = Math.min(options.limit || 20, 100); // Max 100 per page
		const offset = (page - 1) * limit;

		let query = supabase
			.from("groups")
			.select(
				`
        *,
        group_members!inner(count)
      `,
				{ count: "exact" },
			)
			.eq("group_members.user_id", userId)
			.eq("is_deleted", false)
			.range(offset, offset + limit - 1);

		if (options.search) {
			query = query.or(
				`name.ilike.%${options.search}%,slug.ilike.%${options.search}%`,
			);
		}

		if (options.type) {
			query = query.eq("group_type", options.type);
		}

		if (options.sortBy) {
			const order = options.sortOrder || "desc";
			query = query.order(options.sortBy, { ascending: order === "asc" });
		} else {
			query = query.order("created_at", { ascending: false });
		}

		const { data: groups, error, count } = await query;

		if (error) throw handleDatabaseError(error, "fetching user groups");

		const totalPages = Math.ceil((count || 0) / limit);

		return {
			data: groups || [],
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

	async getGroupById(id: string, userId: string): Promise<GroupWithMembers> {
		const supabase = await createClient();

		// Check if user has access to this group
		const { data: membership } = await supabase
			.from("group_members")
			.select("role")
			.eq("group_id", id)
			.eq("user_id", userId)
			.single();

		if (!membership) {
			// Check if user is owner
			const { data: group } = await supabase
				.from("groups")
				.select("owner_id")
				.eq("id", id)
				.eq("is_deleted", false)
				.single();

			if (!group || group.owner_id !== userId) {
				throw createNotFoundError(this.config.entityName);
			}
		}

		// Fetch group
		const { data: group, error: groupError } = await supabase
			.from("groups")
			.select("*")
			.eq("id", id)
			.eq("is_deleted", false)
			.single();

		if (groupError || !group) {
			throw createNotFoundError(this.config.entityName);
		}

		// Fetch members
		const { data: members, error: membersError } = await supabase
			.from("group_members")
			.select("id, user_id, role, permissions, joined_at")
			.eq("group_id", id);

		if (membersError)
			throw handleDatabaseError(membersError, "fetching group members");

		// Fetch invitations
		const { data: invitations, error: invitationsError } = await supabase
			.from("group_invitations")
			.select("id, email, role, status, expires_at, created_at, invited_by")
			.eq("group_id", id);

		if (invitationsError)
			throw handleDatabaseError(invitationsError, "fetching group invitations");

		// For now, return basic data without full user details
		// User details would require additional queries or different permissions
		const transformedGroup: GroupWithMembers = {
			...group,
			members: (members || []).map((member) => ({
				...member,
				user: {
					id: member.user_id,
					email: "", // Would need separate query to get user emails
					name: undefined,
				},
			})),
			invitations: invitations || [],
		};

		return transformedGroup;
	}

	async update(
		id: string,
		userId: string,
		data: UpdateGroupRequest,
	): Promise<Group> {
		const supabase = await createClient();

		// Verify ownership
		const { data: group } = await supabase
			.from("groups")
			.select("owner_id")
			.eq("id", id)
			.eq("is_deleted", false)
			.single();

		if (!group || group.owner_id !== userId) {
			throw new AppError(
				ErrorCode.FORBIDDEN,
				`Only ${this.config.entityName.toLowerCase()} owners can update`,
				403,
			);
		}

		const { data: updatedGroup, error } = await supabase
			.from("groups")
			.update(data)
			.eq("id", id)
			.select()
			.single();

		if (error) throw handleDatabaseError(error, "group update");

		return updatedGroup;
	}

	async delete(id: string, userId: string): Promise<void> {
		const supabase = await createClient();

		// Verify ownership
		const { data: group } = await supabase
			.from("groups")
			.select("owner_id")
			.eq("id", id)
			.eq("is_deleted", false)
			.single();

		if (!group || group.owner_id !== userId) {
			throw new AppError(
				ErrorCode.FORBIDDEN,
				`Only ${this.config.entityName.toLowerCase()} owners can delete`,
				403,
			);
		}

		// Soft delete
		const { error } = await supabase
			.from("groups")
			.update({
				is_deleted: true,
				deleted_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (error) throw handleDatabaseError(error, "group deletion");
	}

	async transferOwnership(
		groupId: string,
		currentOwnerId: string,
		newOwnerId: string,
	): Promise<void> {
		const supabase = await createClient();

		// Verify current ownership
		const { data: group } = await supabase
			.from("groups")
			.select("owner_id")
			.eq("id", groupId)
			.eq("is_deleted", false)
			.single();

		if (!group || group.owner_id !== currentOwnerId) {
			throw new AppError(
				ErrorCode.FORBIDDEN,
				"Only current owner can transfer ownership",
				403,
			);
		}

		// Verify new owner is a member
		const { data: member } = await supabase
			.from("group_members")
			.select("id")
			.eq("group_id", groupId)
			.eq("user_id", newOwnerId)
			.single();

		if (!member) {
			throw new AppError(
				ErrorCode.VALIDATION_ERROR,
				"New owner must be a current member",
				400,
			);
		}

		// Transfer ownership in a transaction
		const { error: updateError } = await supabase
			.from("groups")
			.update({ owner_id: newOwnerId })
			.eq("id", groupId);

		if (updateError)
			throw handleDatabaseError(updateError, "ownership transfer");

		// Update roles
		await supabase
			.from("group_members")
			.update({
				role: "owner",
				permissions: this.getRolePermissions("owner"),
			})
			.eq("group_id", groupId)
			.eq("user_id", newOwnerId);

		await supabase
			.from("group_members")
			.update({
				role: "admin",
				permissions: this.getRolePermissions("admin"),
			})
			.eq("group_id", groupId)
			.eq("user_id", currentOwnerId);
	}

	private async generateUniqueSlug(name: string): Promise<string> {
		const baseSlug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");

		let slug = baseSlug;
		let counter = 1;

		const supabase = await createClient();

		while (true) {
			const { data: existing } = await supabase
				.from("groups")
				.select("id")
				.eq("slug", slug)
				.single();

			if (!existing) break;
			slug = `${baseSlug}-${counter++}`;
		}

		return slug;
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
}

// Export singleton instance
export const groupService = new GenericGroupService();
