import {
  CompleteRegistrationPayload,
  DashboardData,
  DocumentsResponse,
  LoginResponse,
  NewsResponse,
  RegistrationRequest,
  RegistrationRequestResponse,
} from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const rawText = await response.text();
    try {
      const errorJson = JSON.parse(rawText);
      throw new Error(errorJson.message || 'Request failed');
    } catch {
      throw new Error(rawText || 'Request failed');
    }
  }

  return response.json();
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
