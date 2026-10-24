import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

function validId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  const { workspaceId } = await params;

  if (!validId(workspaceId)) {
    return NextResponse.json(
      { error: 'Invalid workspace ID' },
      { status: 400 }
    );
  }

  try {
    const workspace = await prisma.workspaceSession.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.error('Workspace fetch error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch workspace' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  const { workspaceId } = await params;

  if (!validId(workspaceId)) {
    return NextResponse.json(
      { error: 'Invalid workspace ID' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const data: Prisma.WorkspaceSessionUpdateInput = {};

    if (typeof body.title === 'string') {
      const title = body.title.trim();

      if (!title || title.length > 120) {
        return NextResponse.json(
          { error: 'Title must be 1–120 characters' },
          { status: 400 }
        );
      }

      data.title = title;
    }

    if (typeof body.description === 'string') {
      if (body.description.length > 2000) {
        return NextResponse.json(
          { error: 'Description cannot exceed 2000 characters' },
          { status: 400 }
        );
      }

      data.description = body.description;
    }

    if (typeof body.imageUrl === 'string') {
      try {
        const url = new URL(body.imageUrl);

        if (
          url.protocol !== 'https:' ||
          url.hostname !== new URL(
            process.env.IMAGEKIT_URL_ENDPOINT!
          ).hostname
        ) {
          return NextResponse.json(
            { error: 'Invalid workspace image URL' },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid workspace image URL' },
          { status: 400 }
        );
      }

      data.imageUrl = body.imageUrl;
    } else if (body.imageUrl === null) {
      data.imageUrl = null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspaceSession.update({
      where: { id: workspaceId },
      data,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        languageId: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(workspace);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    console.error('Workspace update error:', error);

    return NextResponse.json(
      { error: 'Failed to update workspace' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  const { workspaceId } = await params;

  if (!validId(workspaceId)) {
    return NextResponse.json(
      { error: 'Invalid workspace ID' },
      { status: 400 }
    );
  }

  try {
    // Only delete the parent if your child relations permit it.
    // See the deletion note below.
    await prisma.workspaceSession.delete({
      where: { id: workspaceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    console.error('Workspace deletion error:', error);

    return NextResponse.json(
      { error: 'Failed to delete workspace. Check related records.' },
      { status: 500 }
    );
  }
}