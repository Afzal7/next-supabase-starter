import { NextRequest } from 'next/server';
import { invitationService } from '@/lib/services/invitationService';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { errorHandler } from '@/lib/middleware/errorHandler.middleware';
import { successResponse } from '@/lib/utils/responses';
import { logger } from '@/lib/utils/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const user = await authenticateRequest(req);

    logger.info('Accepting invitation', { userId: user.id, token: params.token });

    await invitationService.acceptInvitation(params.token, user.id);

    return successResponse({ message: 'Invitation accepted successfully' });
  } catch (error) {
    logger.error('Failed to accept invitation', error);
    return errorHandler(error);
  }
}