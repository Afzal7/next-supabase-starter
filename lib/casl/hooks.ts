import { useContext, useMemo } from "react";
import type { AppAbility, UserRole } from "./abilities";
import { AbilityContext } from "./context";

// Provider component props
export interface AbilityProviderProps {
	children: React.ReactNode;
	ability?: AppAbility | null;
}

// Hook to get the current ability
export function useAbility(): AppAbility | null {
	const ability = useContext(AbilityContext);
	return ability;
}

// Hook to check if user can perform an action
export function useCan() {
	const ability = useAbility();

	return useMemo(
		() => ({
			can: ability?.can.bind(ability) || (() => false),
			cannot: ability?.cannot.bind(ability) || (() => true),
		}),
		[ability],
	);
}

// Hook to check specific permissions with better DX
export function usePermissions() {
	const { can } = useCan();

	return useMemo(
		() => ({
			// Group permissions
			canManageGroup: (groupId?: string) =>
				groupId ? can("manage", "Group") : can("manage", "Group"),

			canViewGroup: (groupId?: string) =>
				groupId ? can("view_content", "Group") : can("view_content", "Group"),

			canUpdateGroup: (groupId?: string) =>
				groupId
					? can("manage_settings", "Group")
					: can("manage_settings", "Group"),

			canDeleteGroup: (groupId?: string) =>
				groupId ? can("delete", "Group") : can("delete", "Group"),

			// Member permissions
			canManageMembers: () => can("manage_members", "Group"),

			canInviteMembers: () => can("invite", "Member"),

			canUpdateMember: (userId?: string) =>
				userId ? can("update", "Member") : can("update", "Member"),

			canRemoveMember: (userId?: string) =>
				userId ? can("delete", "Member") : can("delete", "Member"),

			// Invitation permissions
			canManageInvitations: () => can("manage_invitations", "Invitation"),

			// Generic permission check
			hasPermission: (action: string, subject: string, conditions?: any) =>
				can(action as any, subject as any, conditions),
		}),
		[can],
	);
}

// Hook to get user role context (useful for conditional rendering)
export function useRole(): UserRole | null {
	// This would need to be implemented based on your auth/user context
	// For now, return null - you'll need to integrate with your user context
	return null;
}
