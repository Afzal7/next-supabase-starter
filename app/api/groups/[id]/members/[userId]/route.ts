import { NextRequest } from 'next/server';
import { memberService } from '@/lib/services/memberService';
import { updateMemberRoleSchema } from '@/lib/schemas/groupSchemas';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { errorHandler } from '@/lib/middleware/errorHandler.middleware';
import { validateRequest } from '@/lib/utils/validators';
import { successResponse } from '@/lib/utils/responses';
import { logger } from '@/lib/utils/logger';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const user = await authenticateRequest(req);
    const input = await validateRequest(req, updateMemberRoleSchema);

    logger.info('Updating member role', {
      userId: user.id,
      groupId: params.id,
      targetUserId: params.userId,
      newRole: input.role
    });

    const member = await memberService.updateMemberRole(params.id, params.userId, input.role, user.id);

    return successResponse(member);
  } catch (error) {
    logger.error('Failed to update member role', error);
    return errorHandler(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const user = await authenticateRequest(req);

    logger.info('Removing member from group', {
      userId: user.id,
      groupId: params.id,
      targetUserId: params.userId
    });

    await memberService.removeMember(params.id, params.userId, user.id);

    return successResponse({ message: 'Member removed successfully' });
  } catch (error) {
    logger.error('Failed to remove member', error);
    return errorHandler(error);
  }
}