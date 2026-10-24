
 // src/app/api/assets/upload/route.ts

import { Prisma } from '@prisma/client';
import {
  ApiError,
  apiSuccess,
} from '@/lib/api-response';
import { withApiHandler } from '@/lib/with-api-handler';
import { imagekit } from '@/lib/imagekit';
import { prisma } from '@/lib/prisma';

const MAX_FILE_SIZE = 9 * 1024 * 1024; // 9 MiB
const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10 MiB
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

function getImageKitFolder(assetType: string | null): string {
  const base = '/linguisquest-assets';

  switch (assetType) {
    case 'background_image':
      return `${base}/backgrounds`;
    case 'character_figure':
      return `${base}/characters`;
    case 'background_sound':
      return `${base}/bgm`;
    case 'sound_effect':
      return `${base}/sfx`;
    default:
      return `${base}/uncategorized`;
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export const POST = withApiHandler(
  async (request: Request) => {
    // 1. Check request size before parsing multipart data.
    // This is an early check, not a replacement for the
    // request-body limit configured in Next.js or your host.
    const contentLength = request.headers.get('content-length');

    if (
      contentLength &&
      /^\d+$/.test(contentLength) &&
      Number(contentLength) > MAX_REQUEST_SIZE
    ) {
      throw new ApiError(
        413,
        'PAYLOAD_TOO_LARGE',
        'The upload request is too large. Please choose a file smaller than 9 MiB.',
      );
    }

    // 2. Validate content type.
    const contentType = request.headers.get('content-type') ?? '';

    if (
      !contentType.toLowerCase().startsWith('multipart/form-data;')
    ) {
      throw new ApiError(
        400,
        'INVALID_CONTENT_TYPE',
        'Expected a multipart file upload. Please retry.',
      );
    }

    // 3. Parse FormData separately to handle malformed requests.
    let formData: FormData;

    try {
      formData = await request.formData();
    } catch (error: unknown) {
      console.error(
        '[AssetUpload] Failed to parse multipart request:',
        getErrorMessage(error),
      );

      throw new ApiError(
        400,
        'INVALID_MULTIPART',
        'The upload request is incomplete or invalid. Please retry with a smaller file.',
      );
    }

    const file = formData.get('file');
    const sessionId = formData.get('sessionId');
    const languageId = formData.get('languageId');
    const customName = formData.get('customName');
    const assetType = formData.get('assetType');

    // 4. Validate required parameters.
    if (
      !(file instanceof File) ||
      typeof sessionId !== 'string' ||
      !OBJECT_ID_REGEX.test(sessionId) ||
      typeof languageId !== 'string' ||
      !OBJECT_ID_REGEX.test(languageId)
    ) {
      throw new ApiError(
        400,
        'INVALID_PARAMETERS',
        'A valid file, sessionId, and languageId are required.',
      );
    }

    // 5. Validate file size.
    if (file.size === 0) {
      throw new ApiError(
        400,
        'INVALID_FILE',
        'The selected file is empty.',
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError(
        413,
        'PAYLOAD_TOO_LARGE',
        'The file must be no larger than 9 MiB. Please choose a smaller file.',
      );
    }

    // 6. Validate language and prepare the workspace session.
    try {
      const language = await prisma.language.findUnique({
        where: { id: languageId },
        select: { id: true },
      });

      if (!language) {
        throw new ApiError(
          400,
          'INVALID_LANGUAGE',
          'The selected language was not found. Refresh the page and try again.',
        );
      }

      const session = await prisma.workspaceSession.findUnique({
        where: { id: sessionId },
        select: {
          id: true,
          languageId: true,
        },
      });

      if (session && session.languageId !== languageId) {
        throw new ApiError(
          409,
          'SESSION_LANGUAGE_MISMATCH',
          'This workspace belongs to a different language. Refresh the page and try again.',
        );
      }

      if (!session) {
        await prisma.workspaceSession.create({
          data: {
            id: sessionId,
            languageId,
            nodes: [] as Prisma.InputJsonValue,
          },
        });
      }
    } catch (error: unknown) {
      // Preserve intentional errors instead of treating them
      // as database failures.
      if (error instanceof ApiError) {
        throw error;
      }

      console.error(
        '[AssetUpload] Database validation failed:',
        getErrorMessage(error),
      );

      // Another request may have created the same session
      // between findUnique() and create().
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        try {
          const session = await prisma.workspaceSession.findUnique({
            where: { id: sessionId },
            select: { languageId: true },
          });

          if (!session) {
            throw new ApiError(
              500,
              'DATABASE_ERROR',
              'Could not prepare the workspace for this upload. Please try again.',
            );
          }

          if (session.languageId !== languageId) {
            throw new ApiError(
              409,
              'SESSION_LANGUAGE_MISMATCH',
              'This workspace belongs to a different language. Refresh the page and try again.',
            );
          }

          // The session exists and matches. Continue uploading.
        } catch (verificationError: unknown) {
          if (verificationError instanceof ApiError) {
            throw verificationError;
          }

          console.error(
            '[AssetUpload] Session verification failed:',
            getErrorMessage(verificationError),
          );

          throw new ApiError(
            500,
            'DATABASE_ERROR',
            'Could not verify the workspace. Please try again.',
          );
        }
      } else {
        throw new ApiError(
          500,
          'DATABASE_ERROR',
          'Could not prepare the workspace for this upload.',
        );
      }
    }

    // 7. Upload the file to ImageKit.
    let uploadedFileId = '';
    let uploadedUrl = '';

    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      const imageKitResult = await imagekit.upload({
        file: buffer,
        fileName: file.name,
        folder: getImageKitFolder(
          typeof assetType === 'string' ? assetType : null,
        ),
      });

      uploadedFileId = imageKitResult.fileId;
      uploadedUrl = imageKitResult.url;
    } catch (error: unknown) {
      console.error(
        '[AssetUpload] ImageKit upload failed:',
        getErrorMessage(error),
      );

      throw new ApiError(
        502,
        'IMAGEKIT_ERROR',
        'The file could not be uploaded to storage. Please try again.',
      );
    }

    // 8. Save the asset record in MongoDB.
    try {
      const asset = await prisma.assetReference.create({
        data: {
          name:
            typeof customName === 'string' && customName.trim()
              ? customName.trim()
              : file.name,
          rowType:
            typeof assetType === 'string' && assetType.trim()
              ? assetType.trim()
              : 'uncategorized',
          url: uploadedUrl,
          fileId: uploadedFileId,
          timestamp: Date.now(),
          sessionId,
        },
      });

      return apiSuccess(asset, 201);
    } catch (error: unknown) {
      console.error(
        '[AssetUpload] Asset database insert failed:',
        getErrorMessage(error),
      );

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ApiError(
          409,
          'DUPLICATE_ASSET',
          'This file has already been registered. Refresh your asset list.',
        );
      }

      // ImageKit succeeded, but MongoDB failed. Log the remote
      // file ID so it can be investigated or cleaned up.
      console.error(
        '[AssetUpload] ImageKit file may require cleanup:',
        uploadedFileId,
      );

      throw new ApiError(
        500,
        'DATABASE_ERROR',
        'The file was uploaded, but its asset record could not be saved. Please try again later.',
      );
    }
  },
  'AssetUpload',
);
