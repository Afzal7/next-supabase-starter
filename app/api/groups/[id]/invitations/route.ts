import type { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/middleware/auth.middleware";
import { errorHandler } from "@/lib/middleware/errorHandler.middleware";
import { invitationService } from "@/lib/services/invitationService";
import { logger } from "@/lib/utils/logger";
import { successResponse } from "@/lib/utils/responses";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const user = await authenticateRequest(req);

		logger.info("Fetching group invitations", { userId: user.id, groupId: id });

		const invitations = await invitationService.getPendingInvitations(
			id,
			user.id,
		);

		return successResponse(invitations);
	} catch (error) {
		logger.error("Failed to fetch group invitations", error);
		return errorHandler(error);
	}
}
