
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    languageId: string;
    roadmapId: string;
    stageId: string;
  }>;
};

// GET: Fetch the current stage and the next stage ID.
export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { languageId, roadmapId, stageId } = await params;

    const stage = await prisma.stage.findFirst({
      where: {
        id: stageId,
        roadmapId,
        roadmap: { is: { languageId } },
      },
      select: {
        id: true,
        type: true,
        order: true,
        question: true,
        payload: true,
        roadmapId: true,
      },
    });

    if (!stage) {
      return NextResponse.json(
        { error: "Stage not found." },
        { status: 404 }
      );
    }

    const nextStage = await prisma.stage.findFirst({
      where: {
        roadmapId,
        order: { gt: stage.order },
      },
      orderBy: { order: "asc" },
      select: { id: true },
    });

    return NextResponse.json({
      stage,
      nextStageId: nextStage?.id ?? null,
    });
  } catch (error) {
    console.error("GET stage error:", error);

    return NextResponse.json(
      { error: "Failed to load stage." },
      { status: 500 }
    );
  }
}

// POST: Save the latest duration and increment play count.
function isValidBody(body: unknown): body is {
  action: "complete";
  durationMs: number;
  wrongAttempts: number;
} {
  if (typeof body !== "object" || body === null) return false;
  if (
    !("action" in body) ||
    !("durationMs" in body) ||
    !("wrongAttempts" in body)
  ) return false;

  return (
    body.action === "complete" &&
    typeof body.durationMs === "number" &&
    Number.isSafeInteger(body.durationMs) &&
    body.durationMs >= 0 &&
    body.durationMs <= 3_600_000 &&
    typeof body.wrongAttempts === "number" &&
    Number.isSafeInteger(body.wrongAttempts) &&
    body.wrongAttempts >= 0 &&
    body.wrongAttempts <= 1000
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { languageId, roadmapId, stageId } = await params;
    const body: unknown = await request.json().catch(() => null);

    if (!isValidBody(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const [user, stage] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkId },
        select: { id: true },
      }),
      prisma.stage.findFirst({
        where: { id: stageId, roadmapId, roadmap: { languageId } },
        select: { id: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!stage) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.userStageScore.findUnique({
        where: {
          userId_stageId: { userId: user.id, stageId: stage.id },
        },
        select: { id: true },
      });

      const score = existing
        ? await tx.userStageScore.update({
            where: { id: existing.id },
            data: {
              durationMs: body.durationMs,
              wrongAttempts: body.wrongAttempts,
              playCount: { increment: 1 },
            },
          })
        : await tx.userStageScore.create({
            data: {
              userId: user.id,
              languageId,
              roadmapId,
              stageId: stage.id,
              durationMs: body.durationMs,
              wrongAttempts: body.wrongAttempts,
              playCount: 1,
            },
          });

      if (!existing) {
        await tx.user.update({
          where: { id: user.id },
          data: { xp: { increment: 10 } },
        });
      }

      return { score, xpAwarded: existing ? 0 : 10 };
    });

    return NextResponse.json({
      success: true,
      score: result.score,
      xpAwarded: result.xpAwarded,
    });
  } catch (error) {
    console.error("Failed to save stage progress:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}