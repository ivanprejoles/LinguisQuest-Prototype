import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET() {
  try {
    const topics = await prisma.conversationTopic.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });

    return NextResponse.json({ topics });
  } catch (error) {
    console.error("Failed to fetch conversation topics:", error);

    return NextResponse.json(
      { error: "Failed to fetch conversation topics" },
      { status: 500 }
    );
  }
}