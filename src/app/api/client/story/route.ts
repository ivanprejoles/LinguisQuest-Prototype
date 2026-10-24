
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const languageId = searchParams.get('languageId');

    if (!languageId || !/^[a-f\d]{24}$/i.test(languageId)) {
      return NextResponse.json(
        { error: 'A valid languageId is required' },
        { status: 400 }
      );
    }

    const stories = await prisma.workspaceSession.findMany({
      where: {
        languageId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        updatedAt: true,
        languageId: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error('Failed to fetch stories catalog:', error);

    return NextResponse.json(
      { error: 'Failed to load the story library' },
      { status: 500 }
    );
  }
}
