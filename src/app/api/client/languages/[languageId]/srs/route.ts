import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    languageId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { languageId } = await params;

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const scores = await prisma.userStageScore.findMany({
      where: {
        userId: user.id,
        languageId,
      },
      orderBy: {
        updatedAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      scores,
    });
  } catch (error) {
    console.error("GET language SRS scores error:", error);

    return NextResponse.json(
      { error: "Failed to load SRS scores." },
      { status: 500 }
    );
  }
}