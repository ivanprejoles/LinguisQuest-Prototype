// src/app/api/assets/upload/route.ts
import { NextResponse } from 'next/server';
import { imagekit } from '@/lib/imagekit';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Helper to resolve clean, structured folders inside ImageKit
function getImageKitFolder(assetType: string | null): string {
  const base = '/linguisquest-assets';
  if (!assetType) return `${base}/uncategorized`;

  switch (assetType) {
    case 'background_image':
      return `${base}/backgrounds`;
    case 'character_figure':
      return `${base}/characters`;
    case 'background_sound':
      return `${base}/bgm`;
    case 'sound_effect':
      return `${base}/sfx`;
    default:
      return `${base}/uncategorized`;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;
    
    // 1. Capture payload attributes
    const customName = formData.get('customName') as string | null;
    const assetType = formData.get('assetType') as string | null; // "background_image" | "character_figure" | "background_sound" | "sound_effect"

    // Guard rails
    if (!file || !sessionId || sessionId === 'undefined') {
      return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
    }

    // 2. Resolve targeted ImageKit folder based on category type
    const targetFolder = getImageKitFolder(assetType);

    // 3. Upload raw binary buffer to ImageKit
    const buffer = Buffer.from(await file.arrayBuffer());
    const ikRes = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: targetFolder,
    });

    // 4. Ensure the parent WorkspaceSession exists in the database first
    const sessionExists = await prisma.workspaceSession.findUnique({
      where: { id: sessionId },
      select: { id: true }
    });

    if (!sessionExists) {
      await prisma.workspaceSession.create({
        data: {
          id: sessionId,
          nodes: [] as Prisma.InputJsonValue,
        }
      });
    }

    // 5. Build and insert the new standalone AssetReference record linked to the session
    const newAsset = await prisma.assetReference.create({
      data: {
        name: customName || file.name,
        rowType: assetType || 'uncategorized',
        url: ikRes.url,
        fileId: ikRes.fileId,
        timestamp: Date.now(),
        sessionId: sessionId, // Foreign key linking back to parent WorkspaceSession
      }
    });

    return NextResponse.json(newAsset);
  } catch (error: any) {
    console.error('Upload crashed:', error);
    return NextResponse.json({ error: 'Upload failed', details: error.message }, { status: 500 });
  }
}