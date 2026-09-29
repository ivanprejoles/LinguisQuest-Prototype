import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(languages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}