import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

async function getUser() {
  const { userId: clerkId } = await auth();

  if (!clerkId) return null;

  return prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
}

export async function POST(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const { sessionId } = await params;

    if (!/^[a-f\d]{24}$/i.test(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 },
      );
    }

    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    const { outcome, endingNodeId } = body ?? {};

    if (
      (outcome !== 'win' && outcome !== 'loss') ||
      typeof endingNodeId !== 'string' ||
      !endingNodeId.trim()
    ) {
      return NextResponse.json(
        { error: 'Invalid outcome payload' },
        { status: 400 },
      );
    }

    const session = await prisma.workspaceSession.findUnique({
      where: { id: sessionId },
      select: {
        graphNodes: {
          select: { nodeId: true, type: true },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 },
      );
    }

    const startingNode =
      session.graphNodes.find((node) => node.type === 'starting') ??
      session.graphNodes[0];

    if (!startingNode) {
      return NextResponse.json(
        { error: 'Story has no starting node' },
        { status: 400 },
      );
    }

    const endingNode = session.graphNodes.find(
      (node) => node.nodeId === endingNodeId,
    );

    const expectedType =
      outcome === 'win' ? 'winning_ending' : 'deadend';

    if (!endingNode || endingNode.type !== expectedType) {
      return NextResponse.json(
        { error: 'Ending node does not match the outcome' },
        { status: 400 },
      );
    }

    const where = {
      userId_sessionId: {
        userId: user.id,
        sessionId,
      },
    };

    const existing = await prisma.userStoryProgress.findUnique({
      where,
      select: {
        currentNodeId: true,
        winCount: true,
        lossCount: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Progress not initialized; reload the story' },
        { status: 409 },
      );
    }

    // A previous request may already have processed this ending.
    if (existing.currentNodeId !== endingNodeId) {
      // Starting means the story has already been reset.
      if (existing.currentNodeId === startingNode.nodeId) {
        return NextResponse.json({
          success: true,
          counted: false,
          sessionId,
          ...existing,
        });
      }

      // The ending checkpoint hasn't reached the database yet,
      // or the client is submitting a stale ending.
      return NextResponse.json(
        {
          error: 'Saved checkpoint is not at this ending',
          currentNodeId: existing.currentNodeId,
        },
        { status: 409 },
      );
    }

    // Atomically match the ending checkpoint, increment the correct
    // counter, and reset the checkpoint.
    const result = await prisma.userStoryProgress.updateMany({
      where: {
        userId: user.id,
        sessionId,
        currentNodeId: endingNodeId,
      },
      data: {
        currentNodeId: startingNode.nodeId,
        ...(outcome === 'win'
          ? { winCount: { increment: 1 } }
          : { lossCount: { increment: 1 } }),
      },
    });

    const progress = await prisma.userStoryProgress.findUnique({
      where,
      select: {
        sessionId: true,
        currentNodeId: true,
        winCount: true,
        lossCount: true,
      },
    });

    if (!progress) {
      return NextResponse.json(
        { error: 'Progress record not found' },
        { status: 404 },
      );
    }

    if (result.count === 0) {
      // Another request may have reset the ending concurrently.
      if (progress.currentNodeId === startingNode.nodeId) {
        return NextResponse.json({
          success: true,
          counted: false,
          ...progress,
        });
      }

      return NextResponse.json(
        { error: 'Checkpoint changed; retry the outcome' },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      counted: true,
      ...progress,
    });
  } catch (error) {
    console.error('POST story outcome failed:', error);

    return NextResponse.json(
      { error: 'Failed to save story outcome' },
      { status: 500 },
    );
  }
}