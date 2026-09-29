import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { imagekit } from "@/lib/imagekit"; // Shared ImageKit instance

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const languageId = searchParams.get("languageId");
    if (!languageId) return NextResponse.json([]);

    const roadmaps = await prisma.roadmap.findMany({
      where: { languageId },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(roadmaps);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch roadmaps" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, languageId, imageUrl, imageFileId } =
      await req.json();

    if (!title || !languageId) {
      return NextResponse.json(
        { error: "Title and Language ID are required" },
        { status: 400 }
      );
    }

    const count = await prisma.roadmap.count({ where: { languageId } });

    const newRoadmap = await prisma.roadmap.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : "",
        languageId,
        imageUrl: imageUrl || null,
        imageFileId: imageFileId || null,
        order: count,
      },
    });

    return NextResponse.json(newRoadmap, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create roadmap" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, title, description, imageUrl, imageFileId } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Roadmap ID is required" },
        { status: 400 }
      );
    }

    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { id },
    });

    if (!existingRoadmap) {
      return NextResponse.json(
        { error: "Roadmap not found" },
        { status: 404 }
      );
    }

    // Delete old ImageKit image if a new imageFileId is provided and differs
    if (
      existingRoadmap.imageFileId &&
      imageFileId &&
      existingRoadmap.imageFileId !== imageFileId
    ) {
      try {
        await imagekit.deleteFile(existingRoadmap.imageFileId);
      } catch (imgError) {
        console.error("Failed to delete old image from ImageKit:", imgError);
      }
    }

    const updatedRoadmap = await prisma.roadmap.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description ? description.trim() : "",
        imageUrl,
        imageFileId,
      },
    });

    return NextResponse.json(updatedRoadmap, { status: 200 });
  } catch (error) {
    console.error("[ROADMAP_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update roadmap" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { id },
    });

    // Clean up file in ImageKit prior to deleting database record
    if (existingRoadmap?.imageFileId) {
      try {
        await imagekit.deleteFile(existingRoadmap.imageFileId);
      } catch (imgError) {
        console.error("Failed to delete image from ImageKit:", imgError);
      }
    }

    await prisma.roadmap.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete roadmap" },
      { status: 500 }
    );
  }
}