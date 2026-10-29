import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    console.log(sessionId)

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await prisma.workspaceSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        title: true,
        graphNodes: {
          select: {
            nodeId: true,
            title: true,
            type: true,
            bgImage: true,
            characterImage: true,
            bgMusic: true,
            sfx: true,
            dialogue: true,
            choices: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 }
      );
    }

    console.log(session)

    return NextResponse.json(session);
  } catch (error) {
    console.error('Failed to fetch story graph:', error);

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}