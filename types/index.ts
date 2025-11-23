// Database Types (match database schema exactly)
// Database-generated types (auto-generated from schema)
import type { Database } from "./database.types";

export type Group = Database["public"]["Tables"]["groups"]["Row"];
export type GroupInsert = Database["public"]["Tables"]["groups"]["Insert"];
export type GroupUpdate = Database["public"]["Tables"]["groups"]["Update"];

export type GroupMember = Database["public"]["Tables"]["group_members"]["Row"];
export type GroupMemberInsert =
	Database["public"]["Tables"]["group_members"]["Insert"];
export type GroupMemberUpdate =
	Database["public"]["Tables"]["group_members"]["Update"];

export type GroupInvitation =
	Database["public"]["Tables"]["group_invitations"]["Row"];
export type GroupInvitationInsert =
	Database["public"]["Tables"]["group_invitations"]["Insert"];
export type GroupInvitationUpdate =
	Database["public"]["Tables"]["group_invitations"]["Update"];

export type GroupAuditLog =
	Database["public"]["Tables"]["group_audit_log"]["Row"];

export type CreateGroupRequest = {
	name: string;
	slug?: string;
	description?: string;
	group_type?: string;
};

export type UpdateGroupRequest = {
	name?: string;
	description?: string;
	settings?: import("./database.types").Json;
};

export type CreateInvitationRequest = {
	email: string;
	role: string;
};

export type UpdateMemberRequest = {
	role: string;
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

export type InvitationWithGroups = GroupInvitation & {
	groups: Pick<Group, "id" | "name" | "slug" | "description" | "group_type">;
};

export type InvitationSummary = {
	id: string;
	email: string;
	role: string;
	status: string;
	created_at: string | null;
	expires_at: string;
	group: Pick<Group, "id" | "name" | "description" | "group_type" | "slug">;
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
		group_type?: string;
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
	getGroupById(id: string, userId: string): Promise<Group>;
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
	getMember(
		groupId: string,
		memberId: string,
		userId: string,
	): Promise<MemberWithUser>;
	addMember(
		groupId: string,
		userId: string,
		email: string,
		role: string,
	): Promise<GroupInvitation>;
	updateMemberRole(
		groupId: string,
		targetUserId: string,
		newRole: string,
		requestingUserId: string,
	): Promise<GroupMember>;
	removeMember(
		groupId: string,
		targetUserId: string,
		requestingUserId: string,
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
	getInvitationsByEmail(email: string): Promise<InvitationWithGroups[]>;
	acceptInvitation(token: string, userId: string): Promise<{ groupId: string }>;
	rejectInvitation(token: string, userId: string): Promise<void>;
	acceptInvitationById(
		invitationId: string,
		userId: string,
	): Promise<{ groupId: string }>;
	rejectInvitationById(invitationId: string, userId: string): Promise<void>;
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
	currentGroupId?: string;
	currentGroupRole?: string;
};
