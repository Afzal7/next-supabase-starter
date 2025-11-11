import { NextRequest } from 'next/server';
import { invitationService } from '@/lib/services/invitationService';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { errorHandler } from '@/lib/middleware/errorHandler.middleware';
import { successResponse } from '@/lib/utils/responses';
import { logger } from '@/lib/utils/logger';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; invitationId: string }> }
) {
  try {
    const { id: groupId, invitationId } = await params;
    const user = await authenticateRequest(req);

    logger.info('Cancelling invitation', {
      userId: user.id,
      groupId,
      invitationId
    });

    await invitationService.cancelInvitation(invitationId, user.id);

    return successResponse({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    logger.error('Failed to cancel invitation', error);
    return errorHandler(error);
  }
}