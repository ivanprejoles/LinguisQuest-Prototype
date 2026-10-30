import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 30;
const MAX_OFFSET = 5_000;

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
 * Return only fields needed for a stage preview.
 * Correct-answer fields, validation flags, and File objects
 * are deliberately excluded from the response.
 */
function makePayloadPreview(
  stageType: string,
  stageQuestion: string,
  rawPayload: unknown
): Record<string, unknown> {
  const payload = asRecord(rawPayload);

  const question =
    readString(payload, "question") ||
    stageQuestion ||
    "";

  switch (stageType) {
    case "sentenceBuilder":
      return {
        question,
        scrambledWordBank: readStringArray(
          payload.scrambledWordBank
        ),
        audioType: readString(payload, "audioType"),
      };

    case "tracing":
      return {
        question,
        targetLetter: readString(payload, "targetLetter"),
      };

    case "fillInTheBlank": {
      const options = Array.isArray(payload.options)
        ? payload.options.slice(0, 20).map((value) => {
            const option = asRecord(value);

            return {
              id: readString(option, "id"),
              word: readString(option, "word"),
            };
          })
        : [];

      return {
        question,
        fullSentence: readString(payload, "fullSentence"),
        blankedWordIndex:
          typeof payload.blankedWordIndex === "number"
            ? payload.blankedWordIndex
            : null,
        options,
      };
    }

    case "tapWhatYouHear":
      return {
        question,
        wordBank: readStringArray(payload.wordBank),
        audioType: readString(payload, "audioType"),
      };

    case "multipleChoice": {
      const options = Array.isArray(payload.options)
        ? payload.options.slice(0, 12).map((value) => {
            const option = asRecord(value);
            const imageUrl = option.imageUrl;

            return {
              id: readString(option, "id"),
              text: readString(option, "text"),
              imageUrl:
                typeof imageUrl === "string" ? imageUrl : null,
            };
          })
        : [];

      return {
        question,
        options,
      };
    }

    case "matching": {
      const pairs = Array.isArray(payload.pairs)
        ? payload.pairs.slice(0, 30).map((value) => {
            const pair = asRecord(value);

            return {
              id: readString(pair, "id"),
              sourceText: readString(pair, "sourceText"),
              targetText: readString(pair, "targetText"),
            };
          })
        : [];

      return {
        question,
        pairs,
      };
    }

    default:
      return { question };
  }
}

function parsePageParams(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const rawLimit = Number(
    params.get("limit") ?? DEFAULT_PAGE_SIZE
  );

  const rawOffset = Number(params.get("offset") ?? 0);

  if (
    !Number.isFinite(rawLimit) ||
    !Number.isInteger(rawLimit) ||
    rawLimit < 1
  ) {
    return {
      error: "limit must be a positive integer.",
    } as const;
  }

  if (
    !Number.isFinite(rawOffset) ||
    !Number.isInteger(rawOffset) ||
    rawOffset < 0 ||
    rawOffset > MAX_OFFSET
  ) {
    return {
      error: `offset must be between 0 and ${MAX_OFFSET}.`,
    } as const;
  }

  return {
    limit: Math.min(rawLimit, MAX_PAGE_SIZE),
    offset: rawOffset,
  } as const;
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate the signed-in Clerk user.
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return json({ error: "Unauthorized." }, 401);
    }

    // Do not accept another user's ID from the URL.
    const user = await prisma.user.findUnique({
      where: { clerkId },
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
      return json({ error: "Profile not found." }, 404);
    }

    const params = request.nextUrl.searchParams;
    const section = params.get("section") ?? "summary";

    /*
     * SUMMARY
     *
     * Returns the basic user information, roadmap information,
     * and counts. XP medal calculations happen on the client.
     */
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

        // Count the user's records by roadmap in the database.
        prisma.userStageScore.groupBy({
          by: ["roadmapId"],
          where: {
            userId: user.id,
          },
          _count: {
            _all: true,
          },
        }),
      ]);

      const countByRoadmap = new Map<string, number>(
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

    /*
     * FOUNDATION AND STORY
     *
     * Both sections use bounded pagination.
     */
    const page = parsePageParams(request);

    if ("error" in page) {
      return json({ error: page.error }, 400);
    }

    /*
     * FOUNDATION
     */
    if (section === "foundation") {
      const roadmapId = params.get("roadmapId") ?? "";

      // MongoDB ObjectId validation.
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
            select: {
              stages: true,
            },
          },
        },
      });

      if (!roadmap) {
        return json({ error: "Roadmap not found." }, 404);
      }

      const [totalCount, pageWithExtra] = await Promise.all([
        prisma.userStageScore.count({
          where: {
            userId: user.id,
            roadmapId,
          },
        }),

        prisma.userStageScore.findMany({
          where: {
            userId: user.id,
            roadmapId,
          },

          orderBy: [
            { stage: { order: "asc" } },
            { id: "asc" },
          ],

          skip: page.offset,
          take: page.limit + 1,

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

      // Fetch one extra record to determine whether another page exists.
      const hasMore = pageWithExtra.length > page.limit;

      const records = pageWithExtra
        .slice(0, page.limit)
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
        limit: page.limit,
        offset: page.offset,
        hasMore,
        nextOffset: hasMore
          ? page.offset + records.length
          : null,
      });
    }

    /*
     * STORY
     */
    if (section === "story") {
      const [totalCount, pageWithExtra] = await Promise.all([
        prisma.userStoryProgress.count({
          where: {
            userId: user.id,
          },
        }),

        prisma.userStoryProgress.findMany({
          where: {
            userId: user.id,
          },

          orderBy: [
            { updatedAt: "desc" },
            { id: "desc" },
          ],

          skip: page.offset,
          take: page.limit + 1,

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

      const hasMore = pageWithExtra.length > page.limit;

      const records = pageWithExtra
        .slice(0, page.limit)
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
        limit: page.limit,
        offset: page.offset,
        hasMore,
        nextOffset: hasMore
          ? page.offset + records.length
          : null,
      });
    }

    return json(
      {
        error: "section must be summary, foundation, or story.",
      },
      400
    );
  } catch (error) {
    console.error("GET /api/client/profile failed", error);

    return json(
      {
        error: "Unable to load your profile right now.",
      },
      500
    );
  }
}