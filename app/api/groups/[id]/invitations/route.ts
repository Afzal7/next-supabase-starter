import { NextRequest } from 'next/server';
import { invitationService } from '@/lib/services/invitationService';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { errorHandler } from '@/lib/middleware/errorHandler.middleware';
import { successResponse } from '@/lib/utils/responses';
import { logger } from '@/lib/utils/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(req);

    logger.info('Fetching group invitations', { userId: user.id, groupId: params.id });

    const invitations = await invitationService.getPendingInvitations(params.id, user.id);

    return successResponse(invitations);
  } catch (error) {
    logger.error('Failed to fetch group invitations', error);
    return errorHandler(error);
  }
}