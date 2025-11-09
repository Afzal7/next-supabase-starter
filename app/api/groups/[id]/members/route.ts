import { NextRequest } from 'next/server';
import { memberService } from '@/lib/services/memberService';
import { inviteMemberSchema } from '@/lib/schemas/groupSchemas';
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
    const url = new URL(req.url);

    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const search = url.searchParams.get('search') || undefined;

    logger.info('Fetching group members', { userId: user.id, groupId: params.id, page, limit });

    const result = await memberService.getGroupMembers(params.id, user.id, { page, limit, search });

    return successResponse(result);
  } catch (error) {
    logger.error('Failed to fetch group members', error);
    return errorHandler(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(req);
    const input = await validateRequest(req, inviteMemberSchema);

    logger.info('Inviting member to group', { userId: user.id, groupId: params.id, email: input.email });

    const invitation = await memberService.addMember(params.id, user.id, input.email, input.role);

    return successResponse(invitation, 201);
  } catch (error) {
    logger.error('Failed to invite member', error);
    return errorHandler(error);
  }
}