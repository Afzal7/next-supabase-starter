import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { AppError, ErrorCode } from '@/types';

export async function authenticateRequest(req: NextRequest) {
  // Create server client with request cookies (same pattern as middleware)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {
          // API routes don't set cookies, middleware handles this
          return;
        },
      },
    },
  );

  // Get user from session (cookies)
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  }

  return user;
}