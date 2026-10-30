
// import { NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import { prisma } from "@/lib/prisma";

// type RouteContext = {
//   params: Promise<{
//     languageId: string;
//     roadmapId: string;
//   }>;
// };

// export async function GET(
//   _req: Request,
//   { params }: RouteContext
// ) {
//   console.log("✅ STAGES API HANDLER REACHED");
//   try {
//     const { userId } = await auth();

//     if (!userId) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { languageId, roadmapId } = await params;

//     if (!languageId || !roadmapId) {
//       return NextResponse.json(
//         { error: "Language ID and roadmap ID are required." },
//         { status: 400 }
//       );
//     }

//     // Fetch the current roadmap and its stages.
//     // Checking both IDs also ensures the roadmap belongs
//     // to the requested language.
//     const roadmap = await prisma.roadmap.findFirst({
//       where: {
//         id: roadmapId,
//         languageId,
//       },
//       select: {
//         id: true,
//         title: true,
//         description: true,
//         imageUrl: true,
//         imageFileId: true,
//         order: true,
//         languageId: true,
//         stages: {
//           orderBy: {
//             order: "asc",
//           },
//           take: 25,
//           select: {
//             id: true,
//             type: true,
//             order: true,
//             question: true,
//             payload: true,
//           },
//         },
//       },
//     });

//     if (!roadmap) {
//       return NextResponse.json(
//         { error: "Roadmap not found for this language." },
//         { status: 404 }
//       );
//     }

//     // Fetch only the next roadmap, not every roadmap.
//     const nextRoadmap = await prisma.roadmap.findFirst({
//       where: {
//         languageId,
//         order: {
//           gt: roadmap.order,
//         },
//       },
//       orderBy: {
//         order: "asc",
//       },
//       select: {
//         id: true,
//         title: true,
//         description: true,
//         imageUrl: true,
//         imageFileId: true,
//         order: true,
//         languageId: true,
//       },
//     });

//     return NextResponse.json({
//       roadmap: {
//         id: roadmap.id,
//         title: roadmap.title,
//         description: roadmap.description,
//         imageUrl: roadmap.imageUrl,
//         imageFileId: roadmap.imageFileId,
//         order: roadmap.order,
//         languageId: roadmap.languageId,
//       },
//       stages: roadmap.stages,
//       nextRoadmap,
//     });
//   } catch (error) {
//     console.error("Failed to fetch roadmap and stages:", error);

//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    languageId: string;
    roadmapId: string;
  }>;
};

export async function GET(
  _req: Request,
  { params }: RouteContext
) {
  try {
    // 1. Authenticate the user.
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Validate route parameters.
    const { languageId, roadmapId } = await params;

    if (!languageId || !roadmapId) {
      return NextResponse.json(
        { error: "Language ID and roadmap ID are required." },
        { status: 400 }
      );
    }

    // 3. Fetch the current roadmap and its stages.
    // Keep the existing limit of 25 stages.
    const roadmap = await prisma.roadmap.findFirst({
      where: {
        id: roadmapId,
        languageId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        imageFileId: true,
        order: true,
        languageId: true,
        stages: {
          orderBy: {
            order: "asc",
          },
          take: 25,
          select: {
            id: true,
            type: true,
            order: true,
            question: true,
            payload: true,
          },
        },
      },
    });

    if (!roadmap) {
      return NextResponse.json(
        { error: "Roadmap not found for this language." },
        { status: 404 }
      );
    }

    // 4. Run lightweight queries in parallel.
    const [previousRoadmaps, nextRoadmap] =
      await Promise.all([
        // Only count stages in roadmaps before this one.
        prisma.roadmap.findMany({
          where: {
            languageId,
            order: {
              lt: roadmap.order,
            },
          },
          select: {
            _count: {
              select: {
                stages: true,
              },
            },
          },
        }),

        // Fetch only the next roadmap's metadata.
        prisma.roadmap.findFirst({
          where: {
            languageId,
            order: {
              gt: roadmap.order,
            },
          },
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            imageFileId: true,
            order: true,
            languageId: true,
          },
        }),
      ]);

    // 5. Sum the actual stage counts.
    const previousStageCount = previousRoadmaps.reduce(
      (total, item) => total + item._count.stages,
      0
    );

    // 6. Return the data needed by the page.
    return NextResponse.json({
      roadmap: {
        id: roadmap.id,
        title: roadmap.title,
        description: roadmap.description,
        imageUrl: roadmap.imageUrl,
        imageFileId: roadmap.imageFileId,
        order: roadmap.order,
        languageId: roadmap.languageId,
      },
      stages: roadmap.stages,
      nextRoadmap,
      previousStageCount,
    });
  } catch (error) {
    console.error(
      "Failed to fetch roadmap and stages:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
