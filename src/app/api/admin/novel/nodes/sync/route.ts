import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { sessionId, upsertNodes, deleteNodeIds } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId parameter" }, { status: 400 });
    }

    const executionQueue = [];

    // Process client-side deletions
    if (deleteNodeIds && deleteNodeIds.length > 0) {
      executionQueue.push(
        prisma.graphNode.deleteMany({
          where: {
            sessionId,
            nodeId: { in: deleteNodeIds }
          }
        })
      );
    }

    // Process modified/created nodes
    if (upsertNodes && upsertNodes.length > 0) {
      upsertNodes.forEach((node: any) => {
        executionQueue.push(
          prisma.graphNode.upsert({
            where: {
              sessionId_nodeId: { sessionId, nodeId: node.id }
            },
            update: {
              title: node.title,
              type: node.type,
              bgImage: node.bgImage,
              characterImage: node.characterImage,
              bgMusic: node.bgMusic,
              sfx: node.sfx,
              dialogue: node.dialogue,
              x: node.x,
              y: node.y,
              choices: node.choices
            },
            create: {
              sessionId,
              nodeId: node.id,
              title: node.title,
              type: node.type,
              bgImage: node.bgImage,
              characterImage: node.characterImage,
              bgMusic: node.bgMusic,
              sfx: node.sfx,
              dialogue: node.dialogue,
              x: node.x,
              y: node.y,
              choices: node.choices
            }
          })
        );
      });
    }

    if (executionQueue.length > 0) {
      await prisma.$transaction(executionQueue);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}