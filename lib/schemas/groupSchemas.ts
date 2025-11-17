import { z } from "zod";
import { groupConfig } from "@/config/groups";

export const createGroupSchema = z.object({
	name: z.string().min(1).max(100),
	slug: z.string().min(1).optional(),
	description: z.string().max(500).optional(),
	group_type: z.string().default(groupConfig.entityName.toLowerCase()),
});

export const updateGroupSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	description: z.string().max(500).optional(),
	settings: z.any().optional(),
});

export const inviteMemberSchema = z.object({
	email: z.string().email(),
	role: z.enum(["owner", "admin", "member"] as const), // Default roles, can be made dynamic
});

export const updateMemberRoleSchema = z.object({
	role: z.enum(["owner", "admin", "member"] as const),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
