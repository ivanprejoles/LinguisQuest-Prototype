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

export async function GET(
  _request: Request,
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
      return NextResponse.json({
        sessionId,
        currentNodeId: '',
        winCount: 0,
        lossCount: 0,
      });
    }

    let progress = await prisma.userStoryProgress.upsert({
      where: {
        userId_sessionId: {
          userId: user.id,
          sessionId,
        },
      },
      create: {
        userId: user.id,
        sessionId,
        currentNodeId: startingNode.nodeId,
      },
      update: {},
      select: {
        sessionId: true,
        currentNodeId: true,
        winCount: true,
        lossCount: true,
      },
    });

    // Repair a checkpoint that references a deleted node.
    if (
      !session.graphNodes.some(
        (node) => node.nodeId === progress.currentNodeId,
      )
    ) {
      progress = await prisma.userStoryProgress.update({
        where: {
          userId_sessionId: {
            userId: user.id,
            sessionId,
          },
        },
        data: {
          currentNodeId: startingNode.nodeId,
        },
        select: {
          sessionId: true,
          currentNodeId: true,
          winCount: true,
          lossCount: true,
        },
      });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('GET story progress failed:', error);

    return NextResponse.json(
      { error: 'Failed to load story progress' },
      { status: 500 },
    );
  }
}

export async function PUT(
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
    const currentNodeId = body?.currentNodeId;

    if (
      typeof currentNodeId !== 'string' ||
      !currentNodeId.trim()
    ) {
      return NextResponse.json(
        { error: 'currentNodeId is required' },
        { status: 400 },
      );
    }

    const session = await prisma.workspaceSession.findUnique({
      where: { id: sessionId },
      select: { id: true },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 },
      );
    }

    const node = await prisma.graphNode.findUnique({
      where: {
        sessionId_nodeId: {
          sessionId,
          nodeId: currentNodeId,
        },
      },
      select: { nodeId: true },
    });

    if (!node) {
      return NextResponse.json(
        { error: 'Node does not belong to this story' },
        { status: 400 },
      );
    }

    const progress = await prisma.userStoryProgress.upsert({
      where: {
        userId_sessionId: {
          userId: user.id,
          sessionId,
        },
      },
      create: {
        userId: user.id,
        sessionId,
        currentNodeId,
      },
      update: {
        currentNodeId,
      },
      select: {
        sessionId: true,
        currentNodeId: true,
        winCount: true,
        lossCount: true,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('PUT story progress failed:', error);

    return NextResponse.json(
      { error: 'Failed to save story progress' },
      { status: 500 },
    );
  }
}