import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{
    languageId: string
    roadmapId: string
  }>
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { languageId, roadmapId } = await params
    const requestedStageId = new URL(request.url).searchParams.get("stageId")

    // Subsequent requests: fetch only the requested stage.
    if (requestedStageId) {
      const stage = await prisma.stage.findFirst({
        where: {
          id: requestedStageId,
          roadmapId,
          roadmap: {
            is: { languageId },
          },
        },
        select: {
          id: true,
          type: true,
          order: true,
          payload: true,
          roadmapId: true,
          roadmap: {
            select: {
              language: {
                select: {
                  voiceLanguage: true,
                },
              },
            },
          },
        },
      })

      if (!stage) {
        return NextResponse.json(
          { error: "Stage not found." },
          { status: 404 },
        )
      }

      return NextResponse.json({ stage })
    }

    // Initial request: fetch only IDs, not all stage payloads.
    const stageIds = await prisma.stage.findMany({
      where: {
        roadmapId,
        roadmap: {
          is: { languageId },
        },
      },
      select: { id: true },
    })

    if (stageIds.length === 0) {
      return NextResponse.json(
        { error: "No stages available for evaluation." },
        { status: 404 },
      )
    }

    const randomId =
      stageIds[Math.floor(Math.random() * stageIds.length)].id

    const stage = await prisma.stage.findFirst({
      where: {
        id: randomId,
        roadmapId,
      },
      select: {
        id: true,
        type: true,
        order: true,
        payload: true,
        roadmapId: true,
        roadmap: {
          select: {
            language: {
              select: {
                voiceLanguage: true,
              },
            },
          },
        },
      },
    })

    if (!stage) {
      return NextResponse.json(
        { error: "Stage not found." },
        { status: 404 },
      )
    }

    return NextResponse.json({ stage, stageIds })
  } catch (error) {
    console.error("GET evaluation error:", error)

    return NextResponse.json(
      { error: "Failed to load evaluation." },
      { status: 500 },
    )
  }
}