import { enqueueOfflineAction, saveLocalCache, getLocalCache } from './db';

const API_BASE_URL = 'http://localhost:8000/api';

let accessTokenMemory: string | null = localStorage.getItem('manas_access_token');
let refreshTokenMemory: string | null = localStorage.getItem('manas_refresh_token');

export function setAuthTokens(access: string, refresh?: string | null) {
  accessTokenMemory = access;
  localStorage.setItem('manas_access_token', access);
  if (refresh) {
    refreshTokenMemory = refresh;
    localStorage.setItem('manas_refresh_token', refresh);
  }
}

export function clearAuthTokens() {
  accessTokenMemory = null;
  refreshTokenMemory = null;
  localStorage.removeItem('manas_access_token');
  localStorage.removeItem('manas_refresh_token');
}

export function getAccessToken(): string | null {
  return accessTokenMemory || localStorage.getItem('manas_access_token');
}

export function getRefreshToken(): string | null {
  return refreshTokenMemory || localStorage.getItem('manas_refresh_token');
}

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT';
  body?: any;
  isOfflineSimulated?: boolean;
}

export async function fetchApi<T>(endpoint: string, options: ApiOptions = {}, isRetry: boolean = false): Promise<T> {
  const { method = 'GET', body, isOfflineSimulated = false } = options;

  if (isOfflineSimulated || !navigator.onLine) {
    console.log(`[Offline Mode] Intercepted ${method} ${endpoint}`);
    
    if (method === 'POST' || method === 'DELETE' || method === 'PUT') {
      await enqueueOfflineAction(endpoint, body);
    }
    
    const cached = await getLocalCache(endpoint);
    if (cached) {
      return cached as T;
    }
    
    throw new Error('Offline mode: Content available locally in memory fallback.');
  }

  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && !isRetry && !endpoint.startsWith('/auth/')) {
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refresh }),
          });

          if (refreshRes.ok) {
            const tokenData = await refreshRes.json();
            setAuthTokens(tokenData.access_token, tokenData.refresh_token);
            return fetchApi<T>(endpoint, options, true);
          }
        } catch (rErr) {
          console.warn('Silent token refresh failed:', rErr);
        }
      }
      clearAuthTokens();
    }

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
