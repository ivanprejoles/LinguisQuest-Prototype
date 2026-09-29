// src/types/canvas.ts

export interface AssetRecord {
  id?: number;
  name: string;
  rowType: 'background_image' | 'character_figure' | 'background_sound' | 'sound_effect';
  fileBlob: File;
  timestamp: number;
  objectUrl?: string; // Local runtime cache pointer for horizontal row previews
}

export interface StorageAsset {
  id?: number;
  name: string;
  rowType: 'background' | 'character' | 'ui' | 'audio';
  fileType: 'image' | 'audio';
  fileBlob: Blob;
  objectUrl?: string;
}