import { AppError } from "@/types";

export function errorHandler(error: unknown) {
	if (error instanceof AppError) {
		return new Response(
			JSON.stringify({
				success: false,
				error: {
					code: error.code,
					message: error.message,
					statusCode: error.statusCode,
					timestamp: new Date().toISOString(),
					details: error.details,
				},
			}),
			{ status: error.statusCode },
		);
	}

	// Unknown error
	console.error("Unhandled error:", error);
	return new Response(
		JSON.stringify({
			success: false,
			error: {
				code: "INTERNAL_SERVER_ERROR",
				message: "An unexpected error occurred",
				statusCode: 500,
				timestamp: new Date().toISOString(),
			},
		}),
		{ status: 500 },
	);
}
