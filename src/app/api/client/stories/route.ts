import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const stories = await prisma.workspaceSession.findMany({
      select: {
        id: true,
        // title: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    console.log(stories)

    return NextResponse.json(stories);
  } catch (error) {
    console.error('Failed to fetch stories catalog:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}