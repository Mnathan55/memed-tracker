const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export type Role = 'brand' | 'creator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Target {
  views: number;
  payout: number;
}

// what GET /api/campaigns/mine returns (brand)
export interface BrandCampaign {
  id: string;
  name: string;
  platform: string;
  totalBudget: number;
  spent: number;
  remaining: number;
  targets: Target[];
  status: string;
}

// what GET /api/campaigns returns (creator)
export interface LiveCampaign {
  _id: string;
  name: string;
  platform: string;
  targets: Target[];
}

export interface MySubmission {
  _id: string;
  campaign: { _id: string; name: string; platform: string } | null;
  postUrl: string;
  views: number;
  paidAmount: number;
}

export function saveLogin(token: string, user: User) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  return raw ? (JSON.parse(raw) as User) : null;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

interface Options {
  method?: string;
  body?: unknown;
}

// one function for every api call
export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // token is old or fake, send the user back to login
    if (res.status === 401 && token) {
      logout();
      window.location.href = '/login';
    }
    throw new Error(data.error || 'Request failed');
  }

  return data as T;
}

export function rupees(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}