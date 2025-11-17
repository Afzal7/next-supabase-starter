import type { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/middleware/auth.middleware";
import { errorHandler } from "@/lib/middleware/errorHandler.middleware";
import { invitationService } from "@/lib/services/invitationService";
import { logger } from "@/lib/utils/logger";
import { successResponse } from "@/lib/utils/responses";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ token: string }> },
) {
	try {
		const { token } = await params;
		const user = await authenticateRequest(req);

		logger.info("Accepting invitation", { userId: user.id, token });

		const result = await invitationService.acceptInvitation(token, user.id);

		return successResponse({
			message: "Invitation accepted successfully",
			groupId: result.groupId,
		});
	} catch (error) {
		logger.error("Failed to accept invitation", error);
		return errorHandler(error);
	}
}
