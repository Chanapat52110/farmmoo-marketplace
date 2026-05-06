// VITE_API_URL is set in .env.development / .env.production.
// Falls back to localhost:8000 so plain `npm run dev` still works.
// VITE_API_URL already includes /api, so all relative paths like /products/
// will resolve to: {VITE_API_URL}/products/ = {base}/api/products/
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000/api';

function extractErrorMessage(error: unknown): string {
  if (!error) return 'เกิดข้อผิดพลาด';
  if (typeof error === 'string') return error;

  if (Array.isArray(error)) {
    return error.map((x) => extractErrorMessage(x)).join(', ');
  }

  if (typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    // Django REST returns {detail: "error"} or {field: ["error"]}
    if (typeof obj.detail === 'string') return obj.detail;
    if (typeof obj.detail === 'object' && Array.isArray((obj.detail as unknown))) {
      return (obj.detail as string[]).join(', ');
    }
    // Collect all error messages from field errors
    const parts = Object.values(obj)
      .map((v) => extractErrorMessage(v))
      .filter(Boolean);
    if (parts.length) return parts.join(', ');
  }

  return 'เกิดข้อผิดพลาด';
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, options);

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    throw new Error('รูปแบบข้อมูลตอบกลับไม่ถูกต้อง');
  }

  if (!res.ok) {
    throw new Error(extractErrorMessage(payload));
  }

  return payload as T;
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
