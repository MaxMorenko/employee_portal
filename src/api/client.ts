import {
  CompleteRegistrationPayload,
  DashboardData,
  DocumentsResponse,
  LoginResponse,
  NewsResponse,
  AdminOverview,
  Project,
  RegistrationRequest,
  RegistrationRequestResponse,
  User,
} from './types';

const DEFAULT_API_BASE = 'http://localhost:4000/api';
const API_BASE = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE).replace(/\/+$/, '');

function normalizeTokenInput(rawToken: string) {
  if (!rawToken) return '';
  const trimmed = rawToken.trim();

  try {
    const parsedUrl = new URL(trimmed);
    const fromQuery = parsedUrl.searchParams.get('token');
    if (fromQuery) return fromQuery;
  } catch (_err) {
    // not a URL, continue
  }

  const match = trimmed.match(/token=([^&]+)/i);
  if (match?.[1]) {
    try {
      return decodeURIComponent(match[1]);
    } catch (_err) {
      return match[1];
    }
  }

  return trimmed;
}

class ApiError extends Error {
  status?: number;
  body?: unknown;

  constructor(message: string, status?: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const rawText = await response.text();

  if (!response.ok) {
    let body: unknown;
    let message = rawText || 'Request failed';

    try {
      if (rawText && contentType.includes('application/json')) {
        body = JSON.parse(rawText);
        message = (body as { message?: string }).message || message;
      }
    } catch {
      // ignore parse errors and fall back to raw text
    }

    throw new ApiError(message, response.status, body ?? rawText);
  }

  if (!rawText) {
    return {} as T;
  }

  if (contentType.includes('application/json')) {
    return JSON.parse(rawText) as T;
  }

  // Fallback for unexpected non-JSON success responses
  return rawText as unknown as T;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return fetchJson<LoginResponse>(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getDashboard(): Promise<DashboardData> {
  return fetchJson<DashboardData>(`${API_BASE}/dashboard`);
}

export async function getNews(): Promise<NewsResponse> {
  return fetchJson<NewsResponse>(`${API_BASE}/news`);
}

export async function getDocuments(): Promise<DocumentsResponse> {
  return fetchJson<DocumentsResponse>(`${API_BASE}/documents`);
}

export async function requestRegistration(
  payload: RegistrationRequest
): Promise<RegistrationRequestResponse> {
  return fetchJson<RegistrationRequestResponse>(`${API_BASE}/auth/register-request`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function completeRegistration(
  payload: CompleteRegistrationPayload
): Promise<LoginResponse> {
  const sanitized = { ...payload, token: normalizeTokenInput(payload.token) };
  return fetchJson<LoginResponse>(`${API_BASE}/auth/complete-registration`, {
    method: 'POST',
    body: JSON.stringify(sanitized),
  });
}

export async function logout(token: string): Promise<{ message: string; revoked: boolean }> {
  return fetchJson<{ message: string; revoked: boolean }>(`${API_BASE}/auth/logout`, {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function getAdminOverview(token: string): Promise<AdminOverview> {
  return fetchJson<AdminOverview>(`${API_BASE}/admin/overview`, {
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': token,
    },
  });
}

export async function getAdminUsers(token: string): Promise<User[]> {
  return fetchJson<User[]>(`${API_BASE}/admin/users`, {
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': token,
    },
  });
}

export async function createUser(token: string, payload: Partial<User> & { password: string }): Promise<User> {
  return fetchJson<User>(`${API_BASE}/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': token,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateUser(token: string, id: number, payload: Partial<User> & { password?: string }): Promise<User> {
  return fetchJson<User>(`${API_BASE}/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': token,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(token: string, id: number): Promise<{ deleted: boolean }> {
  return fetchJson<{ deleted: boolean }>(`${API_BASE}/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': token,
    },
  });
}

export async function createProject(token: string, payload: Omit<Project, 'id' | 'dueDate'> & { dueDate: string }): Promise<Project> {
  return fetchJson<Project>(`${API_BASE}/admin/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': token,
    },
    body: JSON.stringify(payload),
  });
}

export async function createNews(
  token: string,
  payload: { title: string; excerpt: string; category: string; author: string; image?: string; featured?: boolean },
): Promise<NewsResponse['items'][number]> {
  return fetchJson<NewsResponse['items'][number]>(`${API_BASE}/admin/news`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': token,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateNews(
  token: string,
  id: number,
  payload: { title: string; excerpt: string; category: string; author: string; image?: string; featured?: boolean },
): Promise<NewsResponse['items'][number]> {
  return fetchJson<NewsResponse['items'][number]>(`${API_BASE}/admin/news/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': token,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteNews(token: string, id: number): Promise<{ deleted: boolean }> {
  return fetchJson<{ deleted: boolean }>(`${API_BASE}/admin/news/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': token,
    },
  });
}

export async function getProfile(token: string): Promise<User> {
  return fetchJson<User>(`${API_BASE}/profile`, {
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': token,
    },
  });
}

export async function updateProfileStatus(token: string, status: string): Promise<User> {
  return fetchJson<User>(`${API_BASE}/profile/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': token,
    },
    body: JSON.stringify({ status }),
  });
}
