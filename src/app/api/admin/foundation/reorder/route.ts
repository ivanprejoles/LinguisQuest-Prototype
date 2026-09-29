import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { entity, items } = await req.json(); // entity: "language" | "roadmap" | "stage"

  try {
    const updates = items.map((item: { id: string; order: number }) => {
      if (entity === "language") {
        return prisma.language.update({ where: { id: item.id }, data: { order: item.order } });
      }
      if (entity === "roadmap") {
        return prisma.roadmap.update({ where: { id: item.id }, data: { order: item.order } });
      }
      return prisma.stage.update({ where: { id: item.id }, data: { order: item.order } });
    });

    await prisma.$transaction(updates);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}