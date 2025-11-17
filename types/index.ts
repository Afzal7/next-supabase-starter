// Database Types (match database schema exactly)
export type Group = {
	id: string;
	name: string;
	slug: string;
	description?: string;
	owner_id: string;
	group_type: string;
	settings?: Record<string, unknown>;
	is_deleted: boolean;
	deleted_at?: string;
	created_at: string;
	updated_at: string;
};

export type GroupMember = {
	id: string;
	group_id: string;
	user_id: string;
	role: string; // Configurable, not hard-coded
	permissions?: Record<string, boolean>;
	joined_at: string;
};

export type GroupInvitation = {
	id: string;
	group_id: string;
	email: string;
	role: string; // Configurable
	invited_by: string;
	token: string;
	status: "pending" | "accepted" | "rejected" | "expired";
	expires_at: string;
	created_at: string;
	accepted_at?: string;
	details?: Record<string, unknown>; // Additional data like inviter_name
};

export type GroupAuditLog = {
	id: string;
	group_id: string;
	user_id?: string;
	action: string;
	details?: Record<string, unknown>;
	ip_address?: string;
	user_agent?: string;
	created_at: string;
};

// API Request/Response Types
export type CreateGroupRequest = {
	name: string;
	slug?: string;
	description?: string;
	group_type?: string;
};

export type UpdateGroupRequest = {
	name?: string;
	description?: string;
	settings?: Record<string, unknown>;
};

export type CreateInvitationRequest = {
	email: string;
	role: string;
};

export type UpdateMemberRequest = {
	role: string;
};

export type GetGroupsParams = {
	page?: number;
	limit?: number;
	search?: string;
	type?: string;
};

export type GetMembersParams = {
	page?: number;
	limit?: number;
	search?: string;
};

// Extended Types for API Responses
export type GroupWithMembers = Group & {
	members: (GroupMember & { user: { email: string; name?: string } })[];
	invitations: GroupInvitation[];
};

export type MemberWithUser = GroupMember & {
	user: {
		id: string;
		email: string;
		name?: string;
		avatar_url?: string;
	};
};

export type InvitationWithGroup = GroupInvitation & {
	group: Pick<Group, "id" | "name" | "slug">;
	invited_by_user: {
		id: string;
		email: string;
		name?: string;
	};
};

export type InvitationDetails = {
	id: string;
	email: string;
	role: string;
	status: string;
	created_at: string;
	expires_at: string;
	group: {
		id: string;
		name: string;
		description?: string;
		group_type: string;
		slug: string;
	};
};

export type InvitationResponse = {
	invitation: InvitationDetails;
};

// Pagination Types
export type PaginatedResponse<T> = {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		total_pages: number;
		has_next: boolean;
		has_prev: boolean;
	};
};

// API Response Envelope
export type ApiResponse<T> =
	| {
			success: true;
			data: T;
			message?: string;
	  }
	| {
			success: false;
			error: {
				code: string;
				message: string;
				details?: Record<string, string>;
			};
	  };

// Error Types
export enum ErrorCode {
	// Validation errors
	VALIDATION_ERROR = "VALIDATION_ERROR",
	INVALID_SLUG = "INVALID_SLUG",
	DUPLICATE_SLUG = "DUPLICATE_SLUG",
	INVALID_EMAIL = "INVALID_EMAIL",

	// Permission errors
	UNAUTHORIZED = "UNAUTHORIZED",
	FORBIDDEN = "FORBIDDEN",
	INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

	// Resource errors
	GROUP_NOT_FOUND = "GROUP_NOT_FOUND",
	MEMBER_NOT_FOUND = "MEMBER_NOT_FOUND",
	INVITATION_NOT_FOUND = "INVITATION_NOT_FOUND",
	USER_NOT_FOUND = "USER_NOT_FOUND",

	// Business logic errors
	LIMIT_EXCEEDED = "LIMIT_EXCEEDED",
	CANNOT_LEAVE_GROUP = "CANNOT_LEAVE_GROUP",
	INVITATION_EXPIRED = "INVITATION_EXPIRED",
	CONFLICT = "CONFLICT",
	ALREADY_MEMBER = "ALREADY_MEMBER",
	PENDING_INVITATION = "PENDING_INVITATION",

	// System errors
	DATABASE_ERROR = "DATABASE_ERROR",
	EMAIL_SEND_FAILED = "EMAIL_SEND_FAILED",
	EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
	INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
	RATE_LIMITED = "RATE_LIMITED",
}

export class AppError extends Error {
	constructor(
		public code: ErrorCode,
		public message: string,
		public statusCode: number = 400,
		public details?: Record<string, string>,
	) {
		super(message);
		this.name = "AppError";
	}
}

// Plugin Types
export interface GroupPlugin {
	name: string;
	version: string;

	// Lifecycle hooks
	onGroupCreated?: (group: Group) => Promise<void>;
	onMemberAdded?: (member: GroupMember) => Promise<void>;
	onInvitationSent?: (invitation: GroupInvitation) => Promise<void>;
	onInvitationAccepted?: (
		invitation: GroupInvitation,
		member: GroupMember,
	) => Promise<void>;

	// Custom validation
	validateGroupCreation?: (
		data: CreateGroupRequest,
	) => Promise<ValidationResult>;
	validateInvitation?: (
		data: CreateInvitationRequest,
	) => Promise<ValidationResult>;

	// Custom business logic
	getCustomPermissions?: (role: string) => string[];
	getCustomEmailTemplate?: (
		type: string,
		data: Record<string, unknown>,
	) => string;

	// Custom API endpoints
	customRoutes?: (router: unknown) => void;
}

export type ValidationResult = {
	valid: boolean;
	errors?: Record<string, string>;
};

// Service Interface Types
export interface GroupService {
	create(userId: string, data: CreateGroupRequest): Promise<Group>;
	getUserGroups(
		userId: string,
		options: PaginationOptions,
	): Promise<PaginatedResponse<Group>>;
	getGroupById(id: string, userId: string): Promise<GroupWithMembers>;
	update(id: string, userId: string, data: UpdateGroupRequest): Promise<Group>;
	delete(id: string, userId: string): Promise<void>;
	transferOwnership(
		groupId: string,
		currentOwnerId: string,
		newOwnerId: string,
	): Promise<void>;
}

export interface MemberService {
	getGroupMembers(
		groupId: string,
		userId: string,
		options?: PaginationOptions,
	): Promise<PaginatedResponse<MemberWithUser>>;
	addMember(
		groupId: string,
		userId: string,
		email: string,
		role: string,
	): Promise<GroupInvitation>;
	updateMemberRole(
		groupId: string,
		memberId: string,
		newRole: string,
		userId: string,
	): Promise<GroupMember>;
	removeMember(
		groupId: string,
		memberId: string,
		userId: string,
	): Promise<void>;
	canPerformAction(
		userId: string,
		groupId: string,
		action: string,
	): Promise<boolean>;
}

export interface InvitationService {
	createInvitation(
		groupId: string,
		email: string,
		role: string,
		invitedBy: string,
	): Promise<GroupInvitation>;
	getPendingInvitations(
		groupId: string,
		userId: string,
	): Promise<GroupInvitation[]>;
	getInvitationByToken(token: string): Promise<GroupInvitation | null>;
	acceptInvitation(token: string, userId: string): Promise<{ groupId: string }>;
	rejectInvitation(token: string, userId: string): Promise<void>;
	cancelInvitation(invitationId: string, userId: string): Promise<void>;
	resendInvitation(invitationId: string, userId: string): Promise<void>;
	cleanupExpiredInvitations(): Promise<number>;
}

// Utility Types
export type PaginationOptions = {
	page?: number;
	limit?: number;
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	type?: string; // For filtering by group type
};

// Context Types for Middleware
export type GroupContext = {
	groupId: string;
	userId: string;
	role: string;
	permissions: Record<string, boolean>;
};

export type RequestContext = {
	userId?: string;
	groupContext?: GroupContext;
	requestId: string;
	ipAddress: string;
	userAgent?: string;
};
