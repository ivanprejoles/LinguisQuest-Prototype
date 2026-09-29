import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

  export async function GET() {
    try {
      const languages = await prisma.language.findMany({
        orderBy: { order: "asc" },
      });
      return NextResponse.json(languages);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch languages" },
        { status: 500 }
      );
    }
  }

  export async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const { name, countryCode, voiceLanguage } = body;

      if (!name || typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { error: "Language name is required" },
          { status: 400 }
        );
      }

      const count = await prisma.language.count();

      const newLang = await prisma.language.create({
        data: {
          name: name.trim(),
          countryCode: countryCode ? countryCode.toLowerCase().trim() : "us",
          voiceLanguage: voiceLanguage ? voiceLanguage.trim() : "en-US",
          order: count,
        },
      });

      return NextResponse.json(newLang, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to create language" },
        { status: 500 }
      );
    }
  }

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, countryCode, voiceLanguage } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Language ID is required for updates" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Language name is required" },
        { status: 400 }
      );
    }

    const updatedLang = await prisma.language.update({
      where: { id },
      data: {
        name: name.trim(),
        countryCode: countryCode ? countryCode.toLowerCase().trim() : "us",
        voiceLanguage: voiceLanguage ? voiceLanguage.trim() : "en-US",
      },
    });

    return NextResponse.json(updatedLang, { status: 200 });
  } catch (error) {
    console.error("[LANGUAGE_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update language" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await prisma.language.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete language" },
      { status: 500 }
    );
  }
}