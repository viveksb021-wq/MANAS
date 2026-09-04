import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPendingSyncItems, clearSyncedItems, SyncItem } from '../utils/db';
import { fetchApi } from '../utils/api';

interface OfflineContextType {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
  pendingSyncCount: number;
  toggleSimulatedOffline: () => void;
  triggerManualSync: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  const effectiveOnline = isBrowserOnline && !isSimulatedOffline;

  const checkPendingQueue = async () => {
    try {
      const items = await getPendingSyncItems();
      setPendingSyncCount(items.length);
      if (!effectiveOnline) {
        setSyncStatus('offline');
      } else if (items.length > 0) {
        setSyncStatus('syncing');
      } else {
        setSyncStatus('synced');
      }
    } catch (e) {
      console.warn('Queue check error', e);
    }
  };

  const triggerManualSync = async () => {
    if (!effectiveOnline) return;
    setSyncStatus('syncing');
    try {
      const items: SyncItem[] = await getPendingSyncItems();
      if (items.length === 0) {
        setSyncStatus('synced');
        return;
      }

      const syncPayload = items.map(item => ({
        client_tx_id: item.client_tx_id,
        entity_type: item.entity_type,
        payload: item.payload
      }));

      const result = await fetchApi<{ synced_ids: string[] }>('/sync', {
        method: 'POST',
        body: syncPayload
      });

      if (result && result.synced_ids) {
        await clearSyncedItems(result.synced_ids);
      }

      await checkPendingQueue();
    } catch (err) {
      console.warn('Sync failed', err);
      setSyncStatus('offline');
    }
  };

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline(prev => {
      const nextState = !prev;
      if (!nextState) {
        // Turning internet back ON -> trigger automatic sync!
        setTimeout(() => triggerManualSync(), 500);
      }
      return nextState;
    });
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsBrowserOnline(true);
      triggerManualSync();
    };
    const handleOffline = () => {
      setIsBrowserOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkPendingQueue();
    const interval = setInterval(() => checkPendingQueue(), 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [effectiveOnline]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline: effectiveOnline,
        isSimulatedOffline,
        syncStatus,
        pendingSyncCount,
        toggleSimulatedOffline,
        triggerManualSync
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOffline must be used within an OfflineProvider');
  return context;
};
