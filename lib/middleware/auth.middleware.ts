import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { AppError, ErrorCode } from "@/types";

export async function authenticateRequest(req: NextRequest) {
	// Create server client with request cookies (same pattern as middleware)
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

	if (!supabaseUrl || !supabaseKey) {
		throw new AppError(
			ErrorCode.INTERNAL_SERVER_ERROR,
			"Missing Supabase environment variables",
		);
	}

	const supabase = createServerClient(supabaseUrl, supabaseKey, {
		cookies: {
			getAll() {
				return req.cookies.getAll();
			},
			setAll() {
				// API routes don't set cookies, middleware handles this
				return;
			},
		},
	});

	// Get user from session (cookies) - this can be slow
	// Since RLS is disabled, consider if authentication is needed for all endpoints
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		throw new AppError(ErrorCode.UNAUTHORIZED, "Authentication required", 401);
	}

	return user;
}
