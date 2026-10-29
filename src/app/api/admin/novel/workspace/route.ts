// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { Prisma } from '@prisma/client';

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const languageId = searchParams.get('languageId');

//     if (!languageId || !/^[a-f\d]{24}$/i.test(languageId)) {
//       return NextResponse.json(
//         { error: 'A valid languageId is required' },
//         { status: 400 }
//       );
//     }

//     const workspaces = await prisma.workspaceSession.findMany({
//       where: { languageId },
//       orderBy: { updatedAt: 'desc' },
//       select: {
//         id: true,
//         title: true,
//         description: true,
//         imageUrl: true,
//         languageId: true,
//         updatedAt: true,
//       },
//     });

//     return NextResponse.json(workspaces);
//   } catch (error) {
//     console.error('Workspace list error:', error);

//     return NextResponse.json(
//       { error: 'Failed to fetch workspaces' },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     const title =
//       typeof body.title === 'string' ? body.title.trim() : '';
//     const description =
//       typeof body.description === 'string' ? body.description.trim() : '';
//     const languageId =
//       typeof body.languageId === 'string' ? body.languageId : '';

//     if (!title || title.length > 120) {
//       return NextResponse.json(
//         { error: 'A title of 1–120 characters is required' },
//         { status: 400 }
//       );
//     }

//     if (description.length > 2000) {
//       return NextResponse.json(
//         { error: 'Description cannot exceed 2000 characters' },
//         { status: 400 }
//       );
//     }

//     if (!/^[a-f\d]{24}$/i.test(languageId)) {
//       return NextResponse.json(
//         { error: 'Invalid languageId' },
//         { status: 400 }
//       );
//     }

//     const language = await prisma.language.findUnique({
//       where: { id: languageId },
//       select: { id: true },
//     });

//     if (!language) {
//       return NextResponse.json(
//         { error: 'Language not found' },
//         { status: 404 }
//       );
//     }

//     const workspace = await prisma.workspaceSession.create({
//       data: {
//         title,
//         description,
//         nodes: [] as Prisma.InputJsonValue,
//         languageId,
//       },
//       select: {
//         id: true,
//         title: true,
//         description: true,
//         imageUrl: true,
//         languageId: true,
//         updatedAt: true,
//       },
//     });

//     return NextResponse.json(workspace, { status: 201 });
//   } catch (error) {
//     console.error('Workspace creation error:', error);

//     return NextResponse.json(
//       { error: 'Failed to create workspace' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function isValidImageKitUrl(value: string): boolean {
  const endpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!endpoint) {
    console.error("IMAGEKIT_URL_ENDPOINT is not configured.");
    return false;
  }

  try {
    const imageUrl = new URL(value);
    const imageKitEndpoint = new URL(endpoint);

    return (
      imageUrl.protocol === "https:" &&
      imageUrl.hostname === imageKitEndpoint.hostname
    );
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const languageId = searchParams.get("languageId");

    if (!languageId || !/^[a-f\d]{24}$/i.test(languageId)) {
      return NextResponse.json(
        { error: "A valid languageId is required" },
        { status: 400 },
      );
    }

    const workspaces = await prisma.workspaceSession.findMany({
      where: { languageId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        languageId: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Workspace list error:", error);

    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const languageId =
      typeof body.languageId === "string" ? body.languageId : "";

    if (!title || title.length > 120) {
      return NextResponse.json(
        { error: "A title of 1–120 characters is required" },
        { status: 400 },
      );
    }

    if (description.length > 2000) {
      return NextResponse.json(
        { error: "Description cannot exceed 2000 characters" },
        { status: 400 },
      );
    }

    if (!/^[a-f\d]{24}$/i.test(languageId)) {
      return NextResponse.json(
        { error: "Invalid languageId" },
        { status: 400 },
      );
    }

    // Validate the optional cover image URL.
    let imageUrl: string | null = null;

    if (
      body.imageUrl !== undefined &&
      body.imageUrl !== null &&
      body.imageUrl !== ""
    ) {
      if (
        typeof body.imageUrl !== "string" ||
        !isValidImageKitUrl(body.imageUrl.trim())
      ) {
        return NextResponse.json(
          { error: "Invalid workspace image URL" },
          { status: 400 },
        );
      }

      imageUrl = body.imageUrl.trim();
    }

    const language = await prisma.language.findUnique({
      where: { id: languageId },
      select: { id: true },
    });

    if (!language) {
      return NextResponse.json(
        { error: "Language not found" },
        { status: 404 },
      );
    }

    const workspace = await prisma.workspaceSession.create({
      data: {
        title,
        description,
        imageUrl, // This was missing from your original POST API.
        nodes: [] as Prisma.InputJsonValue,
        languageId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        languageId: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error("Workspace creation error:", error);

    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 },
    );
  }
}
