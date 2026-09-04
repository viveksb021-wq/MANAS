// IndexedDB storage for MANAS Offline-First Architecture

const DB_NAME = 'MANAS_Offline_DB';
const DB_VERSION = 1;
const STORE_QUEUE = 'sync_queue';
const STORE_LOCAL_CACHE = 'local_cache';

export interface SyncItem {
  id?: number;
  client_tx_id: string;
  entity_type: string;
  payload: any;
  timestamp: string;
}

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        db.createObjectStore(STORE_QUEUE, { keyPath: 'client_tx_id' });
      }
      if (!db.objectStoreNames.contains(STORE_LOCAL_CACHE)) {
        db.createObjectStore(STORE_LOCAL_CACHE, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
  });
};

export const enqueueOfflineAction = async (entity_type: string, payload: any): Promise<SyncItem> => {
  const db = await openDB();
  const tx_id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const item: SyncItem = {
    client_tx_id: tx_id,
    entity_type,
    payload,
    timestamp: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_QUEUE, 'readwrite');
    const store = transaction.objectStore(STORE_QUEUE);
    const req = store.put(item);
    req.onsuccess = () => resolve(item);
    req.onerror = () => reject(req.error);
  });
};

export const getPendingSyncItems = async (): Promise<SyncItem[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_QUEUE, 'readonly');
    const store = transaction.objectStore(STORE_QUEUE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
};

export const clearSyncedItems = async (client_tx_ids: string[]): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_QUEUE, 'readwrite');
  const store = transaction.objectStore(STORE_QUEUE);
  client_tx_ids.forEach(id => store.delete(id));
};

export const saveLocalCache = async (key: string, value: any): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_LOCAL_CACHE, 'readwrite');
  const store = transaction.objectStore(STORE_LOCAL_CACHE);
  store.put({ key, value, cachedAt: new Date().toISOString() });
};

export const getLocalCache = async (key: string): Promise<any | null> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_LOCAL_CACHE, 'readonly');
    const store = transaction.objectStore(STORE_LOCAL_CACHE);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : null);
    req.onerror = () => resolve(null);
  });
};
