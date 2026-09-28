const PRIMARY_TOKEN_KEY = 'poq_auth_token';
const FALLBACK_TOKEN_KEY = 'token';
const USER_KEY = 'poq_auth_user';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(PRIMARY_TOKEN_KEY) || localStorage.getItem(FALLBACK_TOKEN_KEY);
    if (!raw || raw === 'null' || raw === 'undefined' || raw.trim() === '') {
      return null;
    }
    return raw.trim();
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: any) {
  try {
    if (token) {
      localStorage.setItem(PRIMARY_TOKEN_KEY, token);
      localStorage.setItem(FALLBACK_TOKEN_KEY, token);
    }
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch (err) {
    console.error('Failed to store auth:', err);
  }
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem(PRIMARY_TOKEN_KEY);
    localStorage.removeItem(FALLBACK_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error('Failed to clear auth:', err);
  }
}

export function getStoredUser(): any | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw || raw === 'null' || raw === 'undefined') return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export interface ApiFetchResult<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiFetchResult<T>> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(endpoint, config);
    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
      return {
        ok: false,
        status: response.status,
        data,
        error: errorMsg,
      };
    }

    return {
      ok: true,
      status: response.status,
      data: data as T,
    };
  } catch (netErr: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: netErr?.message || 'Network error occurred. Please check your connection.',
    };
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await apiFetch<T>(endpoint, options);
  if (!res.ok) {
    throw new ApiError(res.error || 'Request failed', res.status, res.data);
  }
  return res.data as T;
}
