export type GroupConfig = {
	entityName: string; // 'Organization', 'Team', 'Workspace' - used in UI and API responses
	entityNamePlural: string; // 'Organizations', 'Teams', 'Workspaces'
	defaultGroupType?: string; // Optional: default value for group_type column
	supportedGroupTypes?: string[]; // Optional: allowed group types for multi-tenant apps
	defaultRoles: string[];
	rolePermissions: Record<string, string[]>; // role -> permissions array
	limits: {
		maxGroupsPerUser: number;
		maxMembersPerGroup: number;
		maxInvitationsPerGroup: number;
		invitationExpiryDays: number;
	};
	features: {
		invitations: boolean;
		auditLog: boolean;
		customRoles: boolean;
		softDeletes: boolean;
		multiTenant: boolean; // Enable group_type support
	};
};

// Default configuration for generic group management
export const groupConfig: GroupConfig = {
	entityName: "Team", // Display name in UI
	entityNamePlural: "Teams",
	defaultGroupType: "organization", // Optional: for group_type column
	supportedGroupTypes: ["organization"], // Optional: for validation
	defaultRoles: ["owner", "admin", "member"],
	rolePermissions: {
		owner: ["*"], // All permissions
		admin: [
			"manage_members",
			"manage_settings",
			"view_content",
			"invite_members",
			"manage_invitations",
		],
		member: ["view_content", "edit_own_content"],
	},
	limits: {
		maxGroupsPerUser: 10,
		maxMembersPerGroup: 100,
		maxInvitationsPerGroup: 20,
		invitationExpiryDays: 7,
	},
	features: {
		invitations: true,
		auditLog: true,
		customRoles: false,
		softDeletes: true,
		multiTenant: false, // Set to true to enable group_type support
	},
};

// Helper function to get role permissions
export const getRolePermissions = (
	role: string,
	config: GroupConfig = groupConfig,
): Record<string, boolean> => {
	const permissions = config.rolePermissions[role] || [];
	return permissions.reduce(
		(acc, perm) => {
			acc[perm] = true;
			return acc;
		},
		{} as Record<string, boolean>,
	);
};

// Helper function to check if user has permission
export const hasPermission = (
	userPermissions: Record<string, boolean>,
	permission: string,
): boolean => {
	return userPermissions["*"] === true || userPermissions[permission] === true;
};

// Helper function to validate role
export const isValidRole = (
	role: string,
	config: GroupConfig = groupConfig,
): boolean => {
	return config.defaultRoles.includes(role);
};
