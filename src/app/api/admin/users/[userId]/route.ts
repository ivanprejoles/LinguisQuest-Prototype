
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getMedalProgress } from "@/lib/exp-converter";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 30;
const MAX_OFFSET = 5000;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(
  record: Record<string, unknown>,
  key: string
): string {
  return typeof record[key] === "string"
    ? (record[key] as string)
    : "";
}

function readStringArray(value: unknown, max = 50): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .slice(0, max);
}

/**
 * Only expose fields required to display an activity preview.
 * Never expose answer keys or validation internals.
 */
function makePayloadPreview(
  type: string,
  stageQuestion: string,
  rawPayload: unknown
): Record<string, unknown> {
  const payload = asRecord(rawPayload);

  const question =
    readString(payload, "question") ||
    stageQuestion ||
    "";

  switch (type) {
    case "sentenceBuilder":
      return {
        question,
        scrambledWordBank: readStringArray(
          payload.scrambledWordBank
        ),
      };

    case "tracing":
      return {
        question,
        targetLetter: readString(payload, "targetLetter"),
      };

    case "fillInTheBlank":
      return {
        question,
        fullSentence: readString(payload, "fullSentence"),
        options: Array.isArray(payload.options)
          ? payload.options.slice(0, 20).map((item) => ({
              word: readString(asRecord(item), "word"),
            }))
          : [],
      };

    case "tapWhatYouHear":
      return {
        question,
        wordBank: readStringArray(payload.wordBank),
      };

    case "multipleChoice":
      return {
        question,
        options: Array.isArray(payload.options)
          ? payload.options.slice(0, 12).map((item) => {
              const option = asRecord(item);

              return {
                id: readString(option, "id"),
                text: readString(option, "text"),
                imageUrl:
                  typeof option.imageUrl === "string"
                    ? option.imageUrl
                    : null,
              };
            })
          : [],
      };

    case "matching":
      return {
        question,
        pairs: Array.isArray(payload.pairs)
          ? payload.pairs.slice(0, 30).map((item) => {
              const pair = asRecord(item);

              return {
                sourceText: readString(pair, "sourceText"),
                targetText: readString(pair, "targetText"),
              };
            })
          : [],
      };

    default:
      return { question };
  }
}

function parsePagination(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const rawLimit = Number(
    params.get("limit") ?? DEFAULT_LIMIT
  );

  const rawOffset = Number(
    params.get("offset") ?? 0
  );

  if (
    !Number.isSafeInteger(rawLimit) ||
    rawLimit < 1 ||
    !Number.isSafeInteger(rawOffset) ||
    rawOffset < 0 ||
    rawOffset > MAX_OFFSET
  ) {
    return null;
  }

  return {
    limit: Math.min(rawLimit, MAX_LIMIT),
    offset: rawOffset,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // ========================================
    // 1. ADMIN AUTHORIZATION
    // ========================================

    const { userId: clerkId, sessionClaims } = await auth();

    if (!clerkId) {
      return json({ error: "Unauthorized." }, 401);
    }

    const claims = sessionClaims as {
      metadata?: { role?: string };
    } | null;

    if (claims?.metadata?.role !== "admin") {
      return json({ error: "Forbidden." }, 403);
    }

    // ========================================
    // 2. TARGET USER
    // ========================================

    const { userId } = await params;

    if (!/^[a-f\d]{24}$/i.test(userId)) {
      return json({ error: "Invalid user ID." }, 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        xp: true,
        createdAt: true,
        _count: {
          select: {
            stageScores: true,
            storyProgress: true,
          },
        },
      },
    });

    if (!user) {
      return json({ error: "User not found." }, 404);
    }

    const paramsQuery = request.nextUrl.searchParams;
    const section = paramsQuery.get("section") ?? "summary";

    // ========================================
    // 3. SUMMARY
    // ========================================

    if (section === "summary") {
      const [roadmaps, scoresByRoadmap] = await Promise.all([
        prisma.roadmap.findMany({
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            order: true,
            languageId: true,
            language: {
              select: {
                id: true,
                name: true,
                countryCode: true,
              },
            },
            _count: {
              select: {
                stages: true,
              },
            },
          },
          orderBy: [
            { languageId: "asc" },
            { order: "asc" },
          ],
        }),

        prisma.userStageScore.groupBy({
          by: ["roadmapId"],
          where: { userId: user.id },
          _count: { _all: true },
        }),
      ]);

      const countByRoadmap = new Map(
        scoresByRoadmap.map((item) => [
          item.roadmapId,
          item._count._all,
        ])
      );

      return json({
        profile: {
          id: user.id,
          name: user.name?.trim() || "Learner",
          imageUrl: user.imageUrl,
          xp: Math.max(0, user.xp),
          ...getMedalProgress(user.xp),
          joinedAt: user.createdAt,
          foundationStageRecordCount: user._count.stageScores,
          storySessionCount: user._count.storyProgress,
        },

        roadmaps: roadmaps.map(({ _count, ...roadmap }) => ({
          ...roadmap,
          totalStages: _count.stages,
          stagesWithRecords:
            countByRoadmap.get(roadmap.id) ?? 0,
        })),
      });
    }

    // ========================================
    // 4. PAGINATION
    // ========================================

    const pagination = parsePagination(request);

    if (!pagination) {
      return json(
        { error: "Invalid pagination parameters." },
        400
      );
    }

    const { limit, offset } = pagination;

    // ========================================
    // 5. FOUNDATION HISTORY
    // ========================================

    if (section === "foundation") {
      const roadmapId = paramsQuery.get("roadmapId") ?? "";

      if (!/^[a-f\d]{24}$/i.test(roadmapId)) {
        return json(
          { error: "A valid roadmapId is required." },
          400
        );
      }

      const roadmap = await prisma.roadmap.findUnique({
        where: { id: roadmapId },
        select: {
          id: true,
          title: true,
          description: true,
          order: true,
          language: {
            select: {
              name: true,
              countryCode: true,
            },
          },
          _count: {
            select: { stages: true },
          },
        },
      });

      if (!roadmap) {
        return json({ error: "Roadmap not found." }, 404);
      }

      const where = {
        userId: user.id,
        roadmapId,
      };

      const [totalCount, pageWithExtra] = await Promise.all([
        prisma.userStageScore.count({ where }),

        prisma.userStageScore.findMany({
          where,
          orderBy: [
            { stage: { order: "asc" } },
            { id: "asc" },
          ],
          skip: offset,
          take: limit + 1,
          select: {
            id: true,
            durationMs: true,
            playCount: true,
            wrongAttempts: true,
            createdAt: true,
            updatedAt: true,
            stage: {
              select: {
                id: true,
                type: true,
                order: true,
                question: true,
                payload: true,
              },
            },
          },
        }),
      ]);

      const hasMore = pageWithExtra.length > limit;

      const records = pageWithExtra
        .slice(0, limit)
        .map((record) => ({
          id: record.id,
          durationMs: Math.max(0, record.durationMs),
          playCount: Math.max(0, record.playCount),
          wrongAttempts: Math.max(0, record.wrongAttempts),
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          stage: {
            id: record.stage.id,
            type: record.stage.type,
            order: record.stage.order,
            question: record.stage.question,
            payloadPreview: makePayloadPreview(
              record.stage.type,
              record.stage.question,
              record.stage.payload
            ),
          },
        }));

      return json({
        roadmap: {
          id: roadmap.id,
          title: roadmap.title,
          description: roadmap.description,
          order: roadmap.order,
          language: roadmap.language,
          totalStages: roadmap._count.stages,
        },
        records,
        totalCount,
        limit,
        offset,
        hasMore,
        nextOffset: hasMore ? offset + records.length : null,
      });
    }

    // ========================================
    // 6. STORY HISTORY
    // ========================================

    if (section === "story") {
      const where = { userId: user.id };

      const [totalCount, pageWithExtra] = await Promise.all([
        prisma.userStoryProgress.count({ where }),

        prisma.userStoryProgress.findMany({
          where,
          orderBy: [
            { updatedAt: "desc" },
            { id: "desc" },
          ],
          skip: offset,
          take: limit + 1,
          select: {
            id: true,
            currentNodeId: true,
            winCount: true,
            lossCount: true,
            updatedAt: true,
            session: {
              select: {
                id: true,
                title: true,
                description: true,
                imageUrl: true,
                language: {
                  select: {
                    id: true,
                    name: true,
                    countryCode: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      const hasMore = pageWithExtra.length > limit;

      const records = pageWithExtra
        .slice(0, limit)
        .map((record) => ({
          id: record.id,
          currentNodeId: record.currentNodeId,
          wins: Math.max(0, record.winCount),
          losses: Math.max(0, record.lossCount),
          updatedAt: record.updatedAt,
          session: record.session,
        }));

      return json({
        records,
        totalCount,
        limit,
        offset,
        hasMore,
        nextOffset: hasMore ? offset + records.length : null,
      });
    }

    return json(
      {
        error: "section must be summary, foundation, or story.",
      },
      400
    );
  } catch (error) {
    console.error(
      "GET /api/admin/users/[userId]/profile failed:",
      error
    );

    return json(
      { error: "Unable to load this user's profile." },
      500
    );
  }
}
