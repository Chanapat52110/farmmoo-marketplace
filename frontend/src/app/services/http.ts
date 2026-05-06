// VITE_API_URL is set in .env.development / .env.production.
// Falls back to localhost:8000 so plain `npm run dev` still works.
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000/api';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: unknown;
}

function extractErrorMessage(error: unknown): string {
  if (!error) return 'เกิดข้อผิดพลาด';
  if (typeof error === 'string') return error;

  if (Array.isArray(error)) {
    return error.map((x) => extractErrorMessage(x)).join(', ');
  }

  if (typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    if (typeof obj.detail === 'string') return obj.detail;
    const parts = Object.values(obj).map((v) => extractErrorMessage(v)).filter(Boolean);
    if (parts.length) return parts.join(', ');
  }

  return 'เกิดข้อผิดพลาด';
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await res.json()) as ApiEnvelope<T>;
  } catch {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    throw new Error('รูปแบบข้อมูลตอบกลับไม่ถูกต้อง');
  }

  if (!res.ok || !payload.success) {
    throw new Error(extractErrorMessage(payload.error));
  }

  return payload.data;
}

export function withAuth(token: string, init: RequestInit = {}): RequestInit {
  return {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  };
}

export function withJson(init: RequestInit = {}): RequestInit {
  return {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  };
}
