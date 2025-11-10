import { NextRequest } from "next/server";
import { groupService } from "@/lib/services/groupService";
import { createGroupSchema } from "@/lib/schemas/groupSchemas";
import { authenticateRequest } from "@/lib/middleware/auth.middleware";
import { errorHandler } from "@/lib/middleware/errorHandler.middleware";
import { validateRequest } from "@/lib/utils/validators";
import { successResponse } from "@/lib/utils/responses";
import { logger } from "@/lib/utils/logger";

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const url = new URL(req.url);

    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "20"),
      100
    );
    const search = url.searchParams.get("search") || undefined;
    const type = url.searchParams.get("type") || undefined;

    logger.info("Fetching user groups", {
      userId: user.id,
      page,
      limit,
      search,
      type,
    });

    const result = await groupService.getUserGroups(user.id, {
      page,
      limit,
      search,
      type,
    });

    return successResponse(result);
  } catch (error) {
    logger.error("Failed to fetch groups", error);
    return errorHandler(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const input = await validateRequest(req, createGroupSchema);

    logger.info("Creating group", { userId: user.id, name: input.name });

    const group = await groupService.create(user.id, input);

    return successResponse(group, 201);
  } catch (error) {
    logger.error("Failed to create group", error);
    return errorHandler(error);
  }
}
