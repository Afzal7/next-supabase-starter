import { z } from 'zod';
import { AppError, ErrorCode } from '@/types';

export async function validateRequest<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      'Invalid request body',
      400
    );
  }
}