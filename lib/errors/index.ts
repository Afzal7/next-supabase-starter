import { ErrorCode, AppError, ApiResponse } from '@/types';

// Error class is already defined in types/index.ts
// Export it from here for convenience
export { AppError, ErrorCode };

// Error response utilities
export const createErrorResponse = (
  code: ErrorCode,
  message: string,
  statusCode: number = 400,
  details?: Record<string, string>
): ApiResponse<never> => ({
  success: false,
  error: {
    code,
    message,
    details,
  },
});

export const createSuccessResponse = <T>(
  data: T,
  message?: string
): ApiResponse<T> => ({
  success: true,
  data,
  ...(message && { message }),
});

// Error handler middleware
export const handleApiError = (error: unknown): Response => {
  if (error instanceof AppError) {
    const statusCode = error.statusCode;
    const errorResponse = createErrorResponse(
      error.code,
      error.message,
      statusCode,
      error.details
    );

    return new Response(JSON.stringify(errorResponse), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Handle unexpected errors
  console.error('Unexpected error:', error);

  const errorResponse = createErrorResponse(
    ErrorCode.INTERNAL_SERVER_ERROR,
    'An unexpected error occurred',
    500
  );

  return new Response(JSON.stringify(errorResponse), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
};

// Validation error helper
export const createValidationError = (
  field: string,
  message: string
): AppError => {
  return new AppError(
    ErrorCode.VALIDATION_ERROR,
    `Validation failed: ${message}`,
    400,
    { [field]: message }
  );
};

// Permission error helpers
export const createUnauthorizedError = (message: string = 'Authentication required'): AppError => {
  return new AppError(ErrorCode.UNAUTHORIZED, message, 401);
};

export const createForbiddenError = (message: string = 'Insufficient permissions'): AppError => {
  return new AppError(ErrorCode.FORBIDDEN, message, 403);
};

export const createNotFoundError = (resource: string): AppError => {
  const code = resource.toUpperCase().replace(' ', '_') + '_NOT_FOUND' as ErrorCode;
  return new AppError(code, `${resource} not found`, 404);
};

// Business logic error helpers
export const createLimitExceededError = (resource: string, limit: number): AppError => {
  return new AppError(
    ErrorCode.LIMIT_EXCEEDED,
    `Maximum ${resource} limit exceeded (${limit})`,
    400,
    { limit: limit.toString() }
  );
};

export const createConflictError = (message: string): AppError => {
  return new AppError(ErrorCode.CONFLICT, message, 409);
};

// Database error wrapper
export const handleDatabaseError = (error: any, operation: string): AppError => {
  console.error(`Database error during ${operation}:`, error);

  // Check for specific PostgreSQL errors
  if (error.code === '23505') { // Unique constraint violation
    return new AppError(
      ErrorCode.CONFLICT,
      'A resource with this identifier already exists',
      409
    );
  }

  if (error.code === '23503') { // Foreign key constraint violation
    return new AppError(
      ErrorCode.VALIDATION_ERROR,
      'Referenced resource does not exist',
      400
    );
  }

  return new AppError(
    ErrorCode.DATABASE_ERROR,
    `Database operation failed: ${operation}`,
    500
  );
};

// Async error wrapper for API routes
export const withErrorHandler = (
  handler: (request: Request, context?: any) => Promise<Response>
) => {
  return async (request: Request, context?: any): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
};

// Logging helper
export const logError = (error: AppError, context?: Record<string, any>) => {
  const logData = {
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    details: error.details,
    context,
    timestamp: new Date().toISOString(),
  };

  if (error.statusCode >= 500) {
    console.error('Server Error:', logData);
  } else {
    console.warn('Client Error:', logData);
  }
};