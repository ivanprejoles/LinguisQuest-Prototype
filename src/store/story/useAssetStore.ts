// store/useAssetStore.ts
import { create } from 'zustand';

export interface Asset {
  fileId: string;
  name: string;
  rowType: 'background_image' | 'background_sound' | 'sound_effect' | 'character_figure';
  url: string;
  timestamp: number;
}

interface AssetState {
  assets: Asset[];
  isLoading: boolean;
  setAssets: (assets: Asset[]) => void;
  
  // 1. READ (Sync state from MongoDB)
  fetchAssets: (sessionId: string) => Promise<void>;
  
  // 2. CREATE (Optimized Upload via ImageKit + MongoDB)
  addAsset: (file: File, sessionId: string, assetType: string, customName: string) => Promise<boolean>;
  
  // 3. UPDATE File Binary (Upload new to ImageKit, update Mongo, delete old)
  updateAssetFile: (fileId: string, file: File, sessionId: string, assetType: string) => Promise<boolean>;
  
  // 4. UPDATE Name Only (Fast MongoDB modification)
  updateAssetName: (fileId: string, newName: string, sessionId: string) => Promise<boolean>;
  
  // 5. DELETE (Remove from ImageKit and MongoDB)
  deleteAsset: (fileId: string, sessionId: string) => Promise<boolean>;
}

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  isLoading: false,

  // Direct manual setter helper
  setAssets: (assets) => set({ assets }),

  fetchAssets: async (sessionId) => {
    if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
      set({ assets: [], isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const res = await fetch(`/api/admin/novel/assets/get?sessionId=${sessionId}`);
      
      // 1. Parse the JSON body exactly ONCE up front
      const data = await res.json().catch(() => ({}));

      // 2. If the response status is not 2xx, handle the error gracefully
      if (!res.ok) {
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }
      
      // 3. The data is already parsed, safe to assign directly!
      set({ assets: data as Asset[], isLoading: false });
    } catch (error: any) {
      console.error('Error fetching workspace assets:', error.message);
      set({ isLoading: false });
    }
  },

  // 2. ADD ASSET
  addAsset: async (file, sessionId, assetType, customName) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);
      formData.append('assetType', assetType);
      formData.append('customName', customName);

      const res = await fetch('/api/admin/novel/assets/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload request failed');

      const savedAsset: Asset = await res.json();

      // Strict Update: State only updates if ImageKit + Mongo successfully persist
      set((state) => ({
        assets: [...state.assets, savedAsset],
      }));
      return true;
    } catch (error) {
      console.error('Error saving asset:', error);
      return false; // Tells the UI component the action was rejected/failed
    }
  },

  // 3. UPDATE FILE BINARY
  updateAssetFile: async (fileId, file, sessionId, assetType) => {
    try {
      const formData = new FormData();
      formData.append('fileId', fileId);
      formData.append('file', file);
      formData.append('sessionId', sessionId);
      formData.append('assetType', assetType);

      const res = await fetch('/api/admin/novel/assets/update', {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) throw new Error('File update request failed');

      const updatedAsset: Asset = await res.json();

      // Swaps old metadata with new ImageKit URI data strictly on success
      set((state) => ({
        assets: state.assets.map((a) => (a.fileId === fileId ? updatedAsset : a)),
      }));
      return true;
    } catch (error) {
      console.error('Error updating asset file:', error);
      return false;
    }
  },

  // 4. UPDATE ASSET NAME ONLY
  updateAssetName: async (fileId, newName, sessionId) => {
    try {
      const formData = new FormData();
      formData.append('fileId', fileId);
      formData.append('newName', newName);
      formData.append('sessionId', sessionId);

      const res = await fetch('/api/admin/novel/assets/update', {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) throw new Error('Name update request failed');

      const updatedAsset: Asset = await res.json();

      // Updates target's metadata strictly on database validation success
      set((state) => ({
        assets: state.assets.map((a) => (a.fileId === fileId ? updatedAsset : a)),
      }));
      return true;
    } catch (error) {
      console.error('Error updating asset name:', error);
      return false;
    }
  },

  // 5. DELETE ASSET
  deleteAsset: async (fileId, sessionId) => {
    try {
      const res = await fetch('/api/admin/novel/assets/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId, sessionId }),
      });

      if (!res.ok) throw new Error('Deletion request failed');

      // Purge from client UI only after storage verification succeeds
      set((state) => ({
        assets: state.assets.filter((a) => a.fileId !== fileId),
      }));
      return true;
    } catch (error) {
      console.error('Error deleting asset:', error);
      return false;
    }
  },
}));