
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") ?? "foundation";
    const languageId = searchParams.get("languageId");

    if (type !== "foundation" && type !== "story") {
      return NextResponse.json(
        { error: "Invalid leaderboard type." },
        { status: 400 }
      );
    }

    const [languages, roadmaps] = await Promise.all([
      prisma.language.findMany({
        select: {
          id: true,
          name: true,
          countryCode: true,
          order: true,
        },
      }),

      prisma.roadmap.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          order: true,
          languageId: true,
        },
      }),
    ]);

    // Return language and roadmap options even before a language is selected.
    if (!languageId) {
      return NextResponse.json({
        languages,
        roadmaps,
        sessions: [],
        scores: [],
        progress: [],
      });
    }

    const [sessions, scores, progress] = await Promise.all([
      prisma.workspaceSession.findMany({
        where: { languageId },
        select: {
          id: true,
          title: true,
          languageId: true,
        },
      }),

      type === "foundation"
        ? prisma.userStageScore.findMany({
            where: {
              languageId,
              user: { role: "user" },
            },
            select: {
              id: true,
              userId: true,
              languageId: true,
              roadmapId: true,
              stageId: true,
              durationMs: true,
              wrongAttempts: true,
              playCount: true,
              createdAt: true,
              updatedAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  xp: true,
                },
              },
              stage: {
                select: {
                  id: true,
                  order: true,
                  roadmapId: true,
                  roadmap: {
                    select: {
                      id: true,
                      title: true,
                      order: true,
                      languageId: true,
                    },
                  },
                },
              },
            },
          })
        : Promise.resolve([]),

      type === "story"
        ? prisma.userStoryProgress.findMany({
            where: {
              session: { languageId },
              user: { role: "user" },
            },
            select: {
              id: true,
              userId: true,
              sessionId: true,
              currentNodeId: true,
              winCount: true,
              lossCount: true,
              updatedAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
              session: {
                select: {
                  id: true,
                  title: true,
                  languageId: true,
                },
              },
            },
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      languages,
      roadmaps,
      sessions,
      scores,
      progress,
    });
  } catch (error) {
    console.error("Failed to load leaderboard data:", error);

    return NextResponse.json(
      { error: "Failed to load leaderboard data." },
      { status: 500 }
    );
  }
}
