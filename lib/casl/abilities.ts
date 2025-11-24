import { AbilityBuilder, PureAbility } from "@casl/ability";
import type { Group, GroupInvitation, GroupMember } from "@/types";

// Define subjects (entities that can be acted upon)
export type Subjects =
	| "all"
	| "Group"
	| "Member"
	| "Invitation"
	| Group
	| GroupMember
	| GroupInvitation;

// Define actions (what can be done)
export type Actions =
	| "manage" // Full control
	| "create"
	| "read"
	| "update"
	| "delete"
	| "invite"
	| "manage_members"
	| "manage_settings"
	| "view_content"
	| "edit_own_content"
	| "manage_invitations";

// Define the ability type
export type AppAbility = PureAbility<[Actions, Subjects]>;

// Define role types
export type UserRole = "owner" | "admin" | "member";

// Context for ability building
export interface AbilityContext {
	userId: string;
	userRole: UserRole;
	groupId?: string;
	isGroupOwner?: boolean;
}

// Create ability instance
export function createAbilityFor(context: AbilityContext): AppAbility {
	const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility);

	const { userId, userRole, groupId, isGroupOwner } = context;

	// Owner has all permissions
	if (userRole === "owner" || isGroupOwner) {
		can("manage", "all");
		return build();
	}

	// Admin permissions
	if (userRole === "admin") {
		can("manage_members", "Group", { id: groupId });
		can("manage_settings", "Group", { id: groupId });
		can("view_content", "Group", { id: groupId });
		can("invite", "Member");
		can("manage_invitations", "Invitation");
		can("read", "Member");
		can("update", "Member");
		can("delete", "Member");
	}

	// Member permissions
	if (userRole === "member") {
		can("view_content", "Group", { id: groupId });
		can("edit_own_content", "Member", { user_id: userId });
		can("read", "Member", { user_id: userId });
	}

	// Common restrictions
	cannot("delete", "Group"); // Only owners can delete groups
	cannot("manage", "Group", { owner_id: { $ne: userId } }); // Cannot manage groups they don't own

	return build();
}

// Helper function to create ability from user membership
export function createAbilityFromMembership(
	userId: string,
	membership: GroupMember,
	group: Group,
): AppAbility {
	const context: AbilityContext = {
		userId,
		userRole: membership.role as UserRole,
		groupId: group.id,
		isGroupOwner: group.owner_id === userId,
	};

	return createAbilityFor(context);
}
