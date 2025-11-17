export type SecurityConfig = {
	tokens: {
		invitationSecret: string; // Secret for hashing invitation tokens
		jwtExpiry: string; // JWT expiry time
	};
	audit: {
		enabled: boolean;
		retentionDays: number;
		sensitiveFields: string[]; // Fields to mask in audit logs
	};
	rateLimiting: {
		enabled: boolean;
		maxRequestsPerMinute: number;
		maxInvitationsPerHour: number;
		maxGroupsPerDay: number;
	};
	cors: {
		allowedOrigins: string[];
		allowedMethods: string[];
		allowedHeaders: string[];
	};
	encryption: {
		algorithm: string;
		keyLength: number;
	};
};

// Default security configuration
export const securityConfig: SecurityConfig = {
	tokens: {
		invitationSecret:
			process.env.INVITATION_SECRET || "your-secret-key-change-in-production",
		jwtExpiry: "7d",
	},
	audit: {
		enabled: true,
		retentionDays: 90,
		sensitiveFields: ["password", "token", "api_key"],
	},
	rateLimiting: {
		enabled: false, // Enable in production
		maxRequestsPerMinute: 100,
		maxInvitationsPerHour: 20,
		maxGroupsPerDay: 5,
	},
	cors: {
		allowedOrigins: [
			"http://localhost:3000",
			"https://yourapp.com",
			// Add your production domains
		],
		allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	},
	encryption: {
		algorithm: "sha256",
		keyLength: 32,
	},
};

// Security utilities
export const generateSecureToken = (
	config: SecurityConfig = securityConfig,
): string => {
	const crypto = require("node:crypto");
	return crypto.randomBytes(config.encryption.keyLength).toString("hex");
};

export const hashToken = (
	token: string,
	config: SecurityConfig = securityConfig,
): string => {
	const crypto = require("node:crypto");
	return crypto
		.createHmac(config.encryption.algorithm, config.tokens.invitationSecret)
		.update(token)
		.digest("hex");
};

export const verifyToken = (
	token: string,
	hash: string,
	config: SecurityConfig = securityConfig,
): boolean => {
	const crypto = require("node:crypto");
	const computedHash = crypto
		.createHmac(config.encryption.algorithm, config.tokens.invitationSecret)
		.update(token)
		.digest("hex");
	return crypto.timingSafeEqual(
		Buffer.from(computedHash, "hex"),
		Buffer.from(hash, "hex"),
	);
};

// Audit logging helper
export const createAuditLog = (
	action: string,
	details: Record<string, unknown>,
	config: SecurityConfig = securityConfig,
): Record<string, unknown> => {
	const logEntry = {
		action,
		details: { ...details },
		timestamp: new Date().toISOString(),
	};

	// Mask sensitive fields
	config.audit.sensitiveFields.forEach((field) => {
		if (logEntry.details[field]) {
			logEntry.details[field] = "[REDACTED]";
		}
	});

	return logEntry;
};

// Rate limiting helper (basic implementation)
export const checkRateLimit = (
	key: string,
	_limit: number,
	windowMs: number,
	config: SecurityConfig = securityConfig,
): boolean => {
	if (!config.rateLimiting.enabled) return true;

	// In a real implementation, you'd use Redis or similar
	// This is a basic in-memory implementation for development
	const now = Date.now();
	const _windowKey = `${key}:${Math.floor(now / windowMs)}`;

	// This would need a proper store in production
	return true; // Placeholder
};
