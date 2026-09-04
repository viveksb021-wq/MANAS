import { enqueueOfflineAction, saveLocalCache, getLocalCache } from './db';

const API_BASE_URL = 'http://localhost:8000/api';

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT';
  body?: any;
  isOfflineSimulated?: boolean;
}

export async function fetchApi<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, isOfflineSimulated = false } = options;

  // If simulated offline or browser offline, trigger offline engine
  if (isOfflineSimulated || !navigator.onLine) {
    console.log(`[Offline Mode] Intercepted ${method} ${endpoint}`);
    
    if (method === 'POST' || method === 'DELETE' || method === 'PUT') {
      await enqueueOfflineAction(endpoint, body);
    }
    
    // Attempt reading cached data
    const cached = await getLocalCache(endpoint);
    if (cached) {
      return cached as T;
    }
    
    throw new Error('Offline mode: Content available locally in memory fallback.');
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'API Error' }));
      throw new Error(err.detail || 'Server error');
    }

    const data = await res.json();
    if (method === 'GET') {
      await saveLocalCache(endpoint, data);
    }
    return data as T;
  } catch (error) {
    console.warn(`API call failed to ${endpoint}, using cache fallback.`, error);
    const cached = await getLocalCache(endpoint);
    if (cached) return cached as T;
    throw error;
  }
}
