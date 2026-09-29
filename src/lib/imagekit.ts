// lib/imagekit.ts
import ImageKit from 'imagekit';

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function deleteImageKitFiles(fileIds: (string | undefined | null)[]) {
  const validFileIds = fileIds.filter((id): id is string => Boolean(id));
  if (validFileIds.length === 0) return;

  try {
    await Promise.all(
      validFileIds.map((id) => imagekit.deleteFile(id))
    );
  } catch (error) {
    console.error("Failed to delete files from ImageKit:", error);
  }
}