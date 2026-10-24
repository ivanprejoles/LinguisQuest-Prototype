
import { create } from 'zustand';
import { toast } from 'sonner';

export interface Asset {
  fileId: string;
  name: string;
  rowType:
    | 'background_image'
    | 'background_sound'
    | 'sound_effect'
    | 'character_figure';
  url: string;
  timestamp: number;
}

interface AssetState {
  assets: Asset[];
  isLoading: boolean;
  setAssets: (assets: Asset[]) => void;
  fetchAssets: (sessionId: string) => Promise<void>;
  addAsset: (
    file: File,
    sessionId: string,
    assetType: string,
    customName: string,
    languageId: string,
  ) => Promise<boolean>;
  updateAssetFile: (
    fileId: string,
    file: File,
    sessionId: string,
    assetType: string,
  ) => Promise<boolean>;
  updateAssetName: (
    fileId: string,
    newName: string,
    sessionId: string,
  ) => Promise<boolean>;
  deleteAsset: (fileId: string, sessionId: string) => Promise<boolean>;
};

// Supports both legacy responses and the shared API envelope.
async function apiRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, options);

  let body: unknown;

  try {
    body = await res.json();
  } catch {
    throw new Error('The server returned an invalid response.');
  }

  if (!res.ok) {
    const message =
      typeof body === 'object' &&
      body !== null &&
      'error' in body
        ? typeof body.error === 'string'
          ? body.error
          : typeof body.error === 'object' &&
              body.error !== null &&
              'message' in body.error &&
              typeof body.error.message === 'string'
            ? body.error.message
            : null
        : null;

    throw new Error(message ?? `Request failed (${res.status}).`);
  }

  // Shared API response: { success: true, data: ... }
  if (
    typeof body === 'object' &&
    body !== null &&
    'success' in body
  ) {
    const response = body as {
      success: boolean;
      data?: T;
      error?: { message?: string };
    };

    if (!response.success) {
      throw new Error(
        response.error?.message ?? 'The request failed.',
      );
    }

    if ('data' in response) {
      return response.data as T;
    }

    // Successful actions such as DELETE may not return data.
    return undefined as T;
  }

  // Legacy APIs may return the asset or asset array directly.
  return body as T;
}

function showError(action: string, error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : 'Something went wrong. Please try again.';

  toast.error(`${action}: ${message}`);
}

export const useAssetStore = create<AssetState>((set) => ({
  assets: [],
  isLoading: false,

  setAssets: (assets) => set({ assets }),

  // 1. READ ASSETS
  fetchAssets: async (sessionId) => {
    if (!sessionId || ['undefined', 'null'].includes(sessionId)) {
      set({ assets: [], isLoading: false });
      return;
    }

    set({ isLoading: true });

    try {
      const assets = await apiRequest<Asset[]>(
        `/api/admin/novel/assets/get?sessionId=${encodeURIComponent(sessionId)}`,
      );

      set({ assets: Array.isArray(assets) ? assets : [] });
    } catch (error) {
      // Background page loads should not spam notifications.
      console.error('Failed to fetch workspace assets:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // 2. ADD ASSET
  addAsset: async (file, sessionId, assetType, customName, languageId) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);
      formData.append('languageId', languageId);
      formData.append('assetType', assetType);
      formData.append('customName', customName);

      const savedAsset = await apiRequest<Asset>(
        '/api/admin/novel/assets/upload',
        { method: 'POST', body: formData },
      );

      set((state) => ({
        assets: [...state.assets, savedAsset],
      }));

      toast.success('Asset uploaded successfully.');
      return true;
    } catch (error) {
      showError('Upload failed', error);
      return false;
    }
  },

  // 3. UPDATE FILE
  updateAssetFile: async (fileId, file, sessionId, assetType) => {
    try {
      const formData = new FormData();
      formData.append('fileId', fileId);
      formData.append('file', file);
      formData.append('sessionId', sessionId);
      formData.append('assetType', assetType);

      const updatedAsset = await apiRequest<Asset>(
        '/api/admin/novel/assets/update',
        { method: 'PUT', body: formData },
      );

      set((state) => ({
        assets: state.assets.map((asset) =>
          asset.fileId === fileId ? updatedAsset : asset,
        ),
      }));

      toast.success('Asset file updated successfully.');
      return true;
    } catch (error) {
      showError('File update failed', error);
      return false;
    }
  },

  // 4. UPDATE NAME
  updateAssetName: async (fileId, newName, sessionId) => {
    try {
      const formData = new FormData();
      formData.append('fileId', fileId);
      formData.append('newName', newName);
      formData.append('sessionId', sessionId);

      const updatedAsset = await apiRequest<Asset>(
        '/api/admin/novel/assets/update',
        { method: 'PUT', body: formData },
      );

      set((state) => ({
        assets: state.assets.map((asset) =>
          asset.fileId === fileId ? updatedAsset : asset,
        ),
      }));

      toast.success('Asset name updated successfully.');
      return true;
    } catch (error) {
      showError('Name update failed', error);
      return false;
    }
  },

  // 5. DELETE ASSET
  deleteAsset: async (fileId, sessionId) => {
    try {
      await apiRequest<unknown>(
        '/api/admin/novel/assets/delete',
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId, sessionId }),
        },
      );

      set((state) => ({
        assets: state.assets.filter((asset) => asset.fileId !== fileId),
      }));

      toast.success('Asset deleted successfully.');
      return true;
    } catch (error) {
      showError('Delete failed', error);
      return false;
    }
  },
}));
