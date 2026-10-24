
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export type ApiErrorCode =
  // General request errors
  | 'BAD_REQUEST'
  | 'INVALID_CONTENT_TYPE'
  | 'INVALID_MULTIPART'
  | 'INVALID_PARAMETERS'
  | 'VALIDATION_ERROR'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'

  // Access and resource errors
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'DUPLICATE_ASSET'

  // Database errors
  | 'DATABASE_ERROR'
  | 'RECORD_NOT_FOUND'

  // External services and uploads
  | 'EXTERNAL_SERVICE_ERROR'
  | 'IMAGEKIT_ERROR'
  | 'UPLOAD_FAILED'

  // Asset/workspace-specific errors
  | 'INVALID_FILE'
  | 'INVALID_LANGUAGE'
  | 'SESSION_LANGUAGE_MISMATCH'

  // Fallback
  | 'INTERNAL_ERROR';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data },
    { status },
  );
}

export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: unknown,
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status },
  );
}

export function handleApiError(
  error: unknown,
  context = 'API',
): Response {
  if (error instanceof ApiError) {
    return apiError(
      error.status,
      error.code,
      error.message,
      error.details,
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Log the technical error on the server, not in the response.
    console.error(`[${context}] Prisma error`, {
      code: error.code,
      message: error.message,
    });

    switch (error.code) {
      case 'P2002':
        return apiError(
          409,
          'CONFLICT',
          'A record with this information already exists.',
        );

      case 'P2003':
        return apiError(
          400,
          'BAD_REQUEST',
          'A related record could not be found or referenced.',
        );

      case 'P2025':
        return apiError(
          404,
          'NOT_FOUND',
          'The requested record could not be found.',
        );

      default:
        return apiError(
          500,
          'DATABASE_ERROR',
          'A database operation failed. Please try again.',
        );
    }
  }

  console.error(`[${context}] Unexpected error`, error);

  return apiError(
    500,
    'INTERNAL_ERROR',
    'An unexpected server error occurred. Please try again.',
  );
}
