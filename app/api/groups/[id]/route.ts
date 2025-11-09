import { NextRequest } from 'next/server';
import { groupService } from '@/lib/services/groupService';
import { updateGroupSchema } from '@/lib/schemas/groupSchemas';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { errorHandler } from '@/lib/middleware/errorHandler.middleware';
import { validateRequest } from '@/lib/utils/validators';
import { successResponse } from '@/lib/utils/responses';
import { logger } from '@/lib/utils/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(req);

    logger.info('Fetching group details', { userId: user.id, groupId: params.id });

    const group = await groupService.getGroupById(params.id, user.id);

    return successResponse(group);
  } catch (error) {
    logger.error('Failed to fetch group', error);
    return errorHandler(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(req);
    const input = await validateRequest(req, updateGroupSchema);

    logger.info('Updating group', { userId: user.id, groupId: params.id });

    const group = await groupService.update(params.id, user.id, input);

    return successResponse(group);
  } catch (error) {
    logger.error('Failed to update group', error);
    return errorHandler(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(req);

    logger.info('Deleting group', { userId: user.id, groupId: params.id });

    await groupService.delete(params.id, user.id);

    return successResponse({ message: 'Group deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete group', error);
    return errorHandler(error);
  }
}