import { NextResponse } from 'next/server';
import { imagekit } from '@/lib/imagekit';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: 'Please select an image' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Maximum image size is 5 MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploaded = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: '/linguisquest-assets/workspace',
    });

    return NextResponse.json({
      url: uploaded.url,
      fileId: uploaded.fileId,
    });
  } catch (error) {
    console.error('Workspace cover upload error:', error);

    return NextResponse.json(
      { error: 'Failed to upload workspace cover' },
      { status: 500 }
    );
  }
}