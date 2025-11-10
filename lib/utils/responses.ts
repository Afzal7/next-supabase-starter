export function successResponse<T>(data: T, status: number = 200) {
  return new Response(JSON.stringify(data), { status });
}

export function errorResponse(
  code: string,
  message: string,
  statusCode: number
) {
  return new Response(
    JSON.stringify({
      code,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    }),
    { status: statusCode }
  );
}
