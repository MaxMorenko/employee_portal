import {
  CompleteRegistrationPayload,
  DashboardData,
  DocumentsResponse,
  LoginResponse,
  NewsResponse,
  RegistrationRequest,
  RegistrationRequestResponse,
} from './types';

const DEFAULT_API_BASE = 'http://localhost:4000/api';
const API_BASE = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE).replace(/\/+$/, '');

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
  return fetchJson<LoginResponse>(`${API_BASE}/auth/complete-registration`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
