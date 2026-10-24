
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ languageId: string }>
}

export async function GET(
  _req: Request,
  { params }: RouteContext
) {
  try {
    // 1. Verify authentication
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 2. Get the language ID from the route
    const { languageId } = await params

    if (!languageId) {
      return NextResponse.json(
        { error: "Language ID is required" },
        { status: 400 }
      )
    }

    // 3. Verify that the language exists
    const language = await prisma.language.findUnique({
      where: { id: languageId },
      select: { id: true },
    })

    if (!language) {
      return NextResponse.json(
        { error: "Language not found" },
        { status: 404 }
      )
    }

    // 4. Fetch roadmaps belonging to this language
  const roadmaps = await prisma.roadmap.findMany({
    where: { languageId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      imageFileId: true,
      order: true,
      languageId: true,
      stages: {
        orderBy: { order: "asc" },
        take: 25,
        select: { id: true },
      },
    },
  })

  return NextResponse.json({
    roadmaps: roadmaps.map(({ stages, ...roadmap }) => ({
      ...roadmap,
      stageCount: stages.length,
    })),
  })

  } catch (error) {
    console.error("Failed to fetch roadmaps:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
