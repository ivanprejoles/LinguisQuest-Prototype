
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

const MAX_TEXT_LENGTH = 10000;

async function authorizeAdmin() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const claims = sessionClaims as
    | { metadata?: { role?: string } }
    | null;

  if (claims?.metadata?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }

  return null;
}

function validateTopic(body: Record<string, unknown>) {
  const fields = [
    "title",
    "description",
    "aiOpeningMessage",
    "coachingInstructions",
  ] as const;

  for (const field of fields) {
    const value = body[field];

    if (typeof value !== "string" || !value.trim()) {
      return `${field} is required`;
    }

    if (value.trim().length > MAX_TEXT_LENGTH) {
      return `${field} must be ${MAX_TEXT_LENGTH} characters or fewer`;
    }
  }

  return null;
}

function getTopicData(body: Record<string, unknown>) {
  return {
    title: (body.title as string).trim(),
    description: (body.description as string).trim(),
    aiOpeningMessage: (body.aiOpeningMessage as string).trim(),
    coachingInstructions: (
      body.coachingInstructions as string
    ).trim(),
  };
}

function isValidObjectId(id: unknown): id is string {
  return (
    typeof id === "string" &&
    /^[a-f\d]{24}$/i.test(id)
  );
}

// GET /api/admin/conversation
export async function GET() {
  const denied = await authorizeAdmin();
  if (denied) return denied;

  try {
    const topics = await prisma.conversationTopic.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ topics });
  } catch (error) {
    console.error("Failed to fetch conversation topics:", error);

    return NextResponse.json(
      { error: "Failed to fetch conversation topics" },
      { status: 500 }
    );
  }
}

// POST /api/admin/conversation
export async function POST(request: NextRequest) {
  const denied = await authorizeAdmin();
  if (denied) return denied;

  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;
    const validationError = validateTopic(data);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const topic = await prisma.conversationTopic.create({
      data: getTopicData(data),
    });

    return NextResponse.json({ topic }, { status: 201 });
  } catch (error) {
    console.error("Failed to create conversation topic:", error);

    return NextResponse.json(
      { error: "Failed to create conversation topic" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/conversation
export async function PUT(request: NextRequest) {
  const denied = await authorizeAdmin();
  if (denied) return denied;

  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    if (!isValidObjectId(data.id)) {
      return NextResponse.json(
        { error: "A valid topic ID is required" },
        { status: 400 }
      );
    }

    const validationError = validateTopic(data);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const existing = await prisma.conversationTopic.findUnique({
      where: { id: data.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Conversation topic not found" },
        { status: 404 }
      );
    }

    const topic = await prisma.conversationTopic.update({
      where: { id: data.id },
      data: getTopicData(data),
    });

    return NextResponse.json({ topic });
  } catch (error) {
    console.error("Failed to update conversation topic:", error);

    return NextResponse.json(
      { error: "Failed to update conversation topic" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/conversation?id=<topicId>
export async function DELETE(request: NextRequest) {
  const denied = await authorizeAdmin();
  if (denied) return denied;

  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "A valid topic ID is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.conversationTopic.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Conversation topic not found" },
        { status: 404 }
      );
    }

    await prisma.conversationTopic.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Conversation topic deleted",
    });
  } catch (error) {
    console.error("Failed to delete conversation topic:", error);

    return NextResponse.json(
      { error: "Failed to delete conversation topic" },
      { status: 500 }
    );
  }
}
