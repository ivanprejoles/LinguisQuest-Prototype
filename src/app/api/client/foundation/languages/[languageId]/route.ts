import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ languageId: string }> }
) {
  try {
    const { languageId } = await params;

    const languageData = await prisma.language.findUnique({
      where: { id: languageId },
      include: {
        roadmaps: {
          orderBy: { order: "asc" },
          include: {
            stages: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!languageData) {
      return NextResponse.json(
        { error: "Language not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(languageData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}