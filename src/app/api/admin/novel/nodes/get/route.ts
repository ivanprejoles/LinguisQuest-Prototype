import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId parameter" }, { status: 400 });
    }

    const dbNodes = await prisma.graphNode.findMany({
      where: { sessionId }
    });

    const nodesMap: Record<string, any> = {};
    dbNodes.forEach((node) => {
      nodesMap[node.nodeId] = {
        id: node.nodeId,
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
      };
    });

    return NextResponse.json({ nodes: nodesMap });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}