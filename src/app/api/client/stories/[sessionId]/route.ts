import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const session = await prisma.workspaceSession.findUnique({
      where: { id: sessionId },
      include: {
        graphNodes: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Story session not found' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Failed to fetch story session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}