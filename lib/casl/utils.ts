import type { AppAbility } from "./abilities";

// Utility function to check permissions in services
export function checkPermission(
	ability: AppAbility,
	action: string,
	subject: string,
	conditions?: any,
): boolean {
	return ability.can(action as any, subject as any, conditions);
}

// Utility function to assert permissions (throws error if not allowed)
export function assertPermission(
	ability: AppAbility,
	action: string,
	subject: string,
	conditions?: any,
	errorMessage?: string,
): void {
	if (!checkPermission(ability, action, subject, conditions)) {
		throw new Error(
			errorMessage || `Permission denied: cannot ${action} ${subject}`,
		);
	}
}

// Common permission checks for groups
export const groupPermissions = {
	canManageGroup: (ability: AppAbility, groupId: string) =>
		checkPermission(ability, "manage", "Group", { id: groupId }),

	canViewGroup: (ability: AppAbility, groupId: string) =>
		checkPermission(ability, "view_content", "Group", { id: groupId }),

	canUpdateGroup: (ability: AppAbility, groupId: string) =>
		checkPermission(ability, "manage_settings", "Group", { id: groupId }),

	canDeleteGroup: (ability: AppAbility, groupId: string) =>
		checkPermission(ability, "delete", "Group", { id: groupId }),

	canManageMembers: (ability: AppAbility) =>
		checkPermission(ability, "manage_members", "Group"),

	canInviteMembers: (ability: AppAbility) =>
		checkPermission(ability, "invite", "Member"),

	canManageInvitations: (ability: AppAbility) =>
		checkPermission(ability, "manage_invitations", "Invitation"),
};
