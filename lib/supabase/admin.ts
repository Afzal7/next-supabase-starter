import { createClient } from "@supabase/supabase-js";

type UserDetails = {
	id: string;
	email: string;
	name: string;
	avatar_url?: string;
	created_at: string;
};

// Simple in-memory cache for user details (expires in 5 minutes)
const userDetailsCache = new Map<
	string,
	{ data: UserDetails; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Creates a Supabase admin client for server-side operations
 * This client has elevated permissions to access auth.users table
 */
export const createAdminClient = () => {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !supabaseServiceKey) {
		throw new Error("Missing Supabase admin credentials");
	}

	return createClient(supabaseUrl, supabaseServiceKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
};

/**
 * Fetches user details from auth.users table using admin client (with caching)
 */
export const getUserDetails = async (
	userId: string,
): Promise<UserDetails | null> => {
	if (!userId || typeof userId !== "string") return null;

	// Check cache first
	const cached = userDetailsCache.get(userId);
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return cached.data;
	}

	const adminClient = createAdminClient();

	const { data: user, error } =
		await adminClient.auth.admin.getUserById(userId);

	if (error || !user) {
		return null;
	}

	const userDetails = {
		id: user.user.id,
		email: user.user.email || "",
		name:
			user.user.user_metadata?.name ||
			user.user.user_metadata?.full_name ||
			user.user.email?.split("@")[0] ||
			"",
		avatar_url: user.user.user_metadata?.avatar_url,
		created_at: user.user.created_at,
	};

	// Cache the result
	userDetailsCache.set(userId, { data: userDetails, timestamp: Date.now() });

	return userDetails;
};

/**
 * Batch fetch user details for multiple user IDs
 * Optimized with caching to reduce API calls and improve performance
 */
export const getUsersDetails = async (
	userIds: string[],
): Promise<UserDetails[]> => {
	if (!Array.isArray(userIds) || !userIds.length) return [];

	// Remove duplicates
	const uniqueUserIds = [...new Set(userIds)];

	// Check cache for existing data
	const now = Date.now();
	const cachedUsers: UserDetails[] = [];
	const uncachedUserIds: string[] = [];

	for (const userId of uniqueUserIds) {
		const cached = userDetailsCache.get(userId);
		if (cached && now - cached.timestamp < CACHE_TTL) {
			cachedUsers.push(cached.data);
		} else {
			uncachedUserIds.push(userId);
		}
	}

	// Fetch uncached users
	if (uncachedUserIds.length > 0) {
		const adminClient = createAdminClient();

		// Limit batch size for performance
		const batchSize = 20; // Reduced from 50 for better performance
		const batches = [];
		for (let i = 0; i < uncachedUserIds.length; i += batchSize) {
			batches.push(uncachedUserIds.slice(i, i + batchSize));
		}

		for (const batch of batches) {
			const results = await Promise.allSettled(
				batch.map((id) => adminClient.auth.admin.getUserById(id)),
			);

			for (const result of results) {
				if (result.status === "fulfilled" && result.value.data?.user) {
					const user = result.value.data.user;
					const userDetails = {
						id: user.id,
						email: user.email || "",
						name:
							user.user_metadata?.name ||
							user.user_metadata?.full_name ||
							user.email?.split("@")[0] ||
							"",
						avatar_url: user.user_metadata?.avatar_url,
						created_at: user.created_at,
					};

					cachedUsers.push(userDetails);
					// Cache the result
					userDetailsCache.set(user.id, { data: userDetails, timestamp: now });
				}
			}
		}
	}

	return cachedUsers;
};
