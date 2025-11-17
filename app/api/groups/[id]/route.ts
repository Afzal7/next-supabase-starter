import type { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/middleware/auth.middleware";
import { errorHandler } from "@/lib/middleware/errorHandler.middleware";
import { updateGroupSchema } from "@/lib/schemas/groupSchemas";
import { groupService } from "@/lib/services/groupService";
import { logger } from "@/lib/utils/logger";
import { successResponse } from "@/lib/utils/responses";
import { validateRequest } from "@/lib/utils/validators";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const user = await authenticateRequest(req);

		logger.info("Fetching group details", { userId: user.id, groupId: id });

		const group = await groupService.getGroupById(id, user.id);

		return successResponse(group);
	} catch (error) {
		logger.error("Failed to fetch group", error);
		return errorHandler(error);
	}
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const user = await authenticateRequest(req);
		const input = await validateRequest(req, updateGroupSchema);

		logger.info("Updating group", { userId: user.id, groupId: id });

		const group = await groupService.update(id, user.id, input);

		return successResponse(group);
	} catch (error) {
		logger.error("Failed to update group", error);
		return errorHandler(error);
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const user = await authenticateRequest(req);

		logger.info("Deleting group", { userId: user.id, groupId: id });

		await groupService.delete(id, user.id);

		return successResponse({ message: "Group deleted successfully" });
	} catch (error) {
		logger.error("Failed to delete group", error);
		return errorHandler(error);
	}
}
