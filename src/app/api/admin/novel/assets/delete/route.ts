// src/app/api/assets/delete/route.ts
import { NextResponse } from 'next/server';
import { imagekit } from '@/lib/imagekit';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request) {
  try {
    const { fileId, sessionId } = await request.json();

    if (!fileId || !sessionId) {
      return NextResponse.json({ error: 'Missing fileId or sessionId' }, { status: 400 });
    }

    // 1. Delete the media asset from ImageKit cloud hosting first
    try {
      await imagekit.deleteFile(fileId);
    } catch (ikError) {
      // Log but don't crash if the file is already missing from ImageKit
      console.warn(`File ${fileId} not found on ImageKit, proceeding with DB sync.`, ikError);
    }

    // 2. Direct deletion in the standalone collection
    await prisma.assetReference.delete({
      where: {
        fileId: fileId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to execute asset deletion:', error);
    return NextResponse.json({ error: 'Delete failed', details: error.message }, { status: 500 });
  }
}