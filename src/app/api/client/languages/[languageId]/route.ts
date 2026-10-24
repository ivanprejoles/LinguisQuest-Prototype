
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ languageId: string }> },
) {
  try {
    const { languageId } = await params

    const language = await prisma.language.findUnique({
      where: { id: languageId },
      select: {
        id: true,
        name: true,
        countryCode: true,
        voiceLanguage: true,
        order: true,
      },
    })

    if (!language) {
      return NextResponse.json(
        { error: "Language not found" },
        { status: 404 },
      )
    }

    return NextResponse.json(language)
  } catch (error) {
    console.error("Failed to fetch language:", error)

    return NextResponse.json(
      { error: "Failed to fetch language" },
      { status: 500 },
    )
  }
}
