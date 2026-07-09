// src/hooks/useIndexedDB.ts
'use client';
import { useEffect, useState } from 'react';
import { AssetRecord } from '@/types/scenario';

const DB_NAME = "CanvaStorageRepositoryDB";
const STORE_NAME = "assets";

export function useIndexedDB() {
  const [db, setDb] = useState<IDBDatabase | null>(null);

  useEffect(() => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      e.target.result.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
    };
    request.onsuccess = (e: any) => setDb(e.target.result);
  }, []);

  const getAssetsByRow = (rowType: string): Promise<AssetRecord[]> => {
    return new Promise((resolve) => {
      if (!db) return resolve([]);
      const tx = db.transaction([STORE_NAME], "readonly");
      const store = tx.objectStore(STORE_NAME);
      const results: AssetRecord[] = [];

      store.openCursor().onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.rowType === rowType) results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
    });
  };

  const addAsset = (asset: Omit<AssetRecord, 'id'>): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!db) return resolve(false);
      const tx = db.transaction([STORE_NAME], "readwrite");
      const req = tx.objectStore(STORE_NAME).add(asset);
      req.onsuccess = () => resolve(true);
    });
  };

  return { getAssetsByRow, addAsset, isReady: !!db };
}