// src/app/api/assets/update-asset/route.ts
import { NextResponse } from 'next/server';
import { imagekit } from '@/lib/imagekit';
import { prisma } from '@/lib/prisma';

// Helper to keep our ImageKit file structures identical to upload
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

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const sessionId = formData.get('sessionId') as string;
    const fileId = formData.get('fileId') as string; // Target ID of the asset being edited
    const newName = formData.get('newName') as string | null;
    const file = formData.get('file') as File | null;

    if (!sessionId || !fileId) {
      return NextResponse.json({ error: 'Missing identification keys' }, { status: 400 });
    }

    // 1. Fetch current asset details to verify existence and preserve category mapping
    const existingAsset = await prisma.assetReference.findUnique({
      where: { fileId: fileId },
    });

    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // SCENARIO 1: Update Name Only (Simple, Direct MongoDB write)
    if (newName && !file) {
      const updatedAsset = await prisma.assetReference.update({
        where: { fileId: fileId },
        data: { name: newName },
      });

      return NextResponse.json(updatedAsset);
    }

    // SCENARIO 2: Update Raw Binary File (File swap & clean up)
    if (file) {
      // Resolve which folder path to direct the file based on its original model category
      const targetFolder = getImageKitFolder(existingAsset.rowType);

      // 2. Upload the new file to the correct category folder
      const buffer = Buffer.from(await file.arrayBuffer());
      const ikRes = await imagekit.upload({
        file: buffer,
        fileName: file.name,
        folder: targetFolder,
      });

      // 3. Directly update the asset record with its new URLs and metadata
      const updatedAsset = await prisma.assetReference.update({
        where: { fileId: fileId },
        data: {
          name: newName || file.name,
          url: ikRes.url,
          fileId: ikRes.fileId, // Assigning the newly generated ImageKit fileId
          timestamp: Date.now(),
        },
      });

      // 4. Clean up the deprecated resource from ImageKit storage in the background
      // Use the original fileId we kept prior to updating the database
      imagekit.deleteFile(existingAsset.fileId)
        .catch((err) => console.error('Background ImageKit cleanup failed:', err));

      return NextResponse.json(updatedAsset);
    }

    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  } catch (error: any) {
    console.error('Update operation crashed:', error);
    return NextResponse.json({ error: 'Update failed', details: error.message }, { status: 500 });
  }
}