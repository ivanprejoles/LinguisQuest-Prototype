import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ stageId: string }> }
) {
  try {
    const { stageId } = await params;

    const stage = await prisma.stage.findUnique({
      where: { id: stageId },
      include: {
        roadmap: {
          include: {
            language: true,
          },
        },
      },
    });

    if (!stage) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    }

    return NextResponse.json(stage);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}