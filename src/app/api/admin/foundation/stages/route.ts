import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteImageKitFiles } from "@/lib/imagekit";

// Helper function to handle internal uploads
async function uploadFile(req: NextRequest, file: File, subfolder: string) {
  const uploadFormData = new FormData();
  uploadFormData.append("file", file);
  uploadFormData.append("subfolder", subfolder);

  const res = await fetch(`${req.nextUrl.origin}/api/admin/foundation/upload`, {
    method: "POST",
    body: uploadFormData,
  });

  if (!res.ok) {
    throw new Error(`Failed to upload ${subfolder} asset`);
  }

  return await res.json(); // Expected response: { url: string, fileId?: string }
}

// ----------------------------------------------------------------------
// GET: Fetch all stages for a specific roadmap
// ----------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roadmapId = searchParams.get("roadmapId");

    if (!roadmapId) return NextResponse.json([]);

    const stages = await prisma.stage.findMany({
      where: { roadmapId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(stages);
  } catch (error: any) {
    console.error("GET Stages Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ----------------------------------------------------------------------
// POST: Create a new stage level
// ----------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const roadmapId = formData.get("roadmapId") as string;
    const rawPayload = formData.get("payload") as string;

    if (!roadmapId || !rawPayload) {
      return NextResponse.json(
        { error: "Missing roadmapId or payload data" },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawPayload);
    const { type, ...activityFields } = payload;

    // 1. Process main audio asset
    const audioFile = formData.get("audioFile") as File | null;
    let audioData: { audioUrl?: string; audioFileId?: string } = {};

    if (audioFile && audioFile instanceof File) {
      const uploadRes = await uploadFile(req, audioFile, "audio");
      audioData = {
        audioUrl: uploadRes.url,
        audioFileId: uploadRes.fileId || null,
      };
    }

    // 2. Process option images if multipleChoice
    if (type === "multipleChoice" && Array.isArray(activityFields.options)) {
      activityFields.options = await Promise.all(
        activityFields.options.map(async (option: any, index: number) => {
          const optionImageFile = formData.get(`option_image_${index}`) as File | null;

          if (optionImageFile && optionImageFile instanceof File) {
            const uploadRes = await uploadFile(req, optionImageFile, "images");
            return {
              ...option,
              imageUrl: uploadRes.url,
              imageFileId: uploadRes.fileId || null,
            };
          }
          return option;
        })
      );
    }

    // 3. Compute order sequence & save
    const count = await prisma.stage.count({ where: { roadmapId } });

    const newStage = await prisma.stage.create({
      data: {
        roadmapId,
        order: count,
        type,
        question:
          activityFields.question ||
          activityFields.targetSentence ||
          "Complete the task",
        payload: {
          ...activityFields,
          ...audioData,
        },
      },
    });

    return NextResponse.json(newStage, { status: 201 });
  } catch (error: any) {
    console.error("POST Stage Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ----------------------------------------------------------------------
// PUT: Update an existing stage level
// ----------------------------------------------------------------------
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing Stage ID" }, { status: 400 });
    }

    const formData = await req.formData();
    const rawPayload = formData.get("payload") as string;

    if (!rawPayload) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    const payload = JSON.parse(rawPayload);
    const { type, ...activityFields } = payload;

    // Fetch existing stage record
    const existingStage = await prisma.stage.findUnique({ where: { id } });
    if (!existingStage) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    }

    const existingPayload = (existingStage.payload as Record<string, any>) || {};
    const filesToDelete: string[] = [];

    // 1. Process main audio
    const audioFile = formData.get("audioFile") as File | null;
    let audioData = {
      audioUrl: existingPayload.audioUrl || null,
      audioFileId: existingPayload.audioFileId || null,
    };

    if (audioFile && audioFile instanceof File) {
      if (existingPayload.audioFileId) {
        filesToDelete.push(existingPayload.audioFileId);
      }

      const uploadRes = await uploadFile(req, audioFile, "audio");
      audioData = {
        audioUrl: uploadRes.url,
        audioFileId: uploadRes.fileId || null,
      };
    }

    // 2. Process option images if multipleChoice
    if (type === "multipleChoice" && Array.isArray(activityFields.options)) {
      const existingOptions = existingPayload.options || [];

      activityFields.options = await Promise.all(
        activityFields.options.map(async (option: any, index: number) => {
          const optionImageFile = formData.get(`option_image_${index}`) as File | null;

          if (optionImageFile && optionImageFile instanceof File) {
            if (existingOptions[index]?.imageFileId) {
              filesToDelete.push(existingOptions[index].imageFileId);
            }

            const uploadRes = await uploadFile(req, optionImageFile, "images");
            return {
              ...option,
              imageUrl: uploadRes.url,
              imageFileId: uploadRes.fileId || null,
            };
          }

          // Preserve existing metadata if no new image is provided
          return {
            ...option,
            imageUrl: option.imageUrl || existingOptions[index]?.imageUrl || null,
            imageFileId: option.imageFileId || existingOptions[index]?.imageFileId || null,
          };
        })
      );
    }

    // 3. Delete replaced files from ImageKit
    if (filesToDelete.length > 0) {
      await deleteImageKitFiles(filesToDelete);
    }

    // 4. Update database record
    const updatedStage = await prisma.stage.update({
      where: { id },
      data: {
        type,
        question:
          activityFields.question ||
          activityFields.targetSentence ||
          "Complete the task",
        payload: {
          ...activityFields,
          ...audioData,
        },
      },
    });

    return NextResponse.json(updatedStage);
  } catch (error: any) {
    console.error("PUT Stage Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ----------------------------------------------------------------------
// DELETE: Remove stage level AND all associated ImageKit files
// ----------------------------------------------------------------------
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const stageToDelete = await prisma.stage.findUnique({ where: { id } });

    if (stageToDelete && stageToDelete.payload) {
      const payload = stageToDelete.payload as Record<string, any>;
      const filesToDelete: string[] = [];

      if (payload.audioFileId) {
        filesToDelete.push(payload.audioFileId);
      }

      if (Array.isArray(payload.options)) {
        payload.options.forEach((opt: any) => {
          if (opt.imageFileId) {
            filesToDelete.push(opt.imageFileId);
          }
        });
      }

      if (filesToDelete.length > 0) {
        await deleteImageKitFiles(filesToDelete);
      }
    }

    await prisma.stage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Stage Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}