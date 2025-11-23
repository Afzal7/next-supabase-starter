import type { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/middleware/auth.middleware";
import { errorHandler } from "@/lib/middleware/errorHandler.middleware";
import { invitationService } from "@/lib/services/invitationService";
import { successResponse } from "@/lib/utils/responses";
import type { InvitationWithGroups } from "@/types";

export async function GET(req: NextRequest) {
	try {
		const user = await authenticateRequest(req);

		// Get user's email from the authenticated user
		const userEmail = user.email;
		if (!userEmail) {
			return new Response("User email not found", { status: 400 });
		}

		// Get pending invitations for this user's email
		const invitations =
			await invitationService.getInvitationsByEmail(userEmail);

		// Format the response with proper group details
		const formattedInvitations = (invitations as InvitationWithGroups[]).map(
			(invitation) => ({
				id: invitation.id,
				email: invitation.email,
				role: invitation.role,
				status: invitation.status,
				created_at: invitation.created_at,
				expires_at: invitation.expires_at,
				group: {
					id: invitation.group_id,
					name: invitation.groups?.name,
					description: invitation.groups?.description,
					group_type: invitation.groups?.group_type,
					slug: invitation.groups?.slug,
				},
			}),
		);

		return successResponse({ invitations: formattedInvitations });
	} catch (error) {
		return errorHandler(error);
	}
}
