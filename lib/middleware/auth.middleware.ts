import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AppError, ErrorCode } from '@/types';

export async function authenticateRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Missing auth token', 401);
  }

  const token = authHeader.substring(7);

  // Verify token with Supabase
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid token', 401);
  }

  return user;
}