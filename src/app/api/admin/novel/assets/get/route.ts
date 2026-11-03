import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');
    const languageId = request.nextUrl.searchParams.get('languageId');

    if (
      !sessionId ||
      !languageId ||
      sessionId === 'undefined' ||
      sessionId === 'null' ||
      languageId === 'undefined' ||
      languageId === 'null'
    ) {
      return NextResponse.json(
        {
          error: 'INVALID_PARAMETERS',
          message: 'sessionId and languageId are required.',
        },
        { status: 400 },
      );
    }

    // Verify that the language exists.
    const languageExists = await prisma.language.findUnique({
      where: { id: languageId },
      select: { id: true },
    });

    if (!languageExists) {
      return NextResponse.json(
        {
          error: 'LANGUAGE_NOT_FOUND',
          message: 'The specified language does not exist.',
        },
        { status: 404 },
      );
    }

    // Check whether the workspace session already exists.
    const sessionExists = await prisma.workspaceSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        languageId: true,
      },
    });

    if (!sessionExists) {
      try {
        await prisma.workspaceSession.create({
          data: {
            id: sessionId,
            languageId,
            nodes: [] as Prisma.JsonArray,
          },
        });
      } catch (createError: unknown) {
        // Another request may have created the session simultaneously.
        const existingSession = await prisma.workspaceSession.findUnique({
          where: { id: sessionId },
          select: {
            id: true,
            languageId: true,
          },
        });

        if (!existingSession) {
          throw createError;
        }

        if (existingSession.languageId !== languageId) {
          return NextResponse.json(
            {
              error: 'SESSION_LANGUAGE_MISMATCH',
              message: 'This session belongs to a different language.',
            },
            { status: 409 },
          );
        }
      }
    } else if (sessionExists.languageId !== languageId) {
      return NextResponse.json(
        {
          error: 'SESSION_LANGUAGE_MISMATCH',
          message: 'This session belongs to a different language.',
        },
        { status: 409 },
      );
    }

    // Fetch assets belonging to this session.
    const assets = await prisma.assetReference.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json(assets);
  } catch (error: unknown) {
    console.error('Fetch assets error in backend API:', error);

    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';

    return NextResponse.json(
      {
        error: 'Failed to fetch assets',
        details: message,
      },
      { status: 500 },
    );
  }
}