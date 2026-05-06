import { apiRequest, withAuth, withJson } from './http';

export interface AuthUser {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: 'customer' | 'seller' | 'farmer' | 'buyer' | 'admin';
  phone: string;
  address?: string;
  image_url?: string | null;
}

export interface AuthTokens {
  user: AuthUser;
  access: string;
  refresh: string;
}

export async function register(payload: {
  username: string;
  password: string;
  role: 'customer' | 'seller';
  phone?: string;
}): Promise<AuthTokens> {
  return apiRequest<AuthTokens>(
    '/register/',
    withJson({ method: 'POST', body: JSON.stringify(payload) }),
  );
}

export async function login(payload: {
  username: string;
  password: string;
}): Promise<AuthTokens> {
  return apiRequest<AuthTokens>(
    '/login/',
    withJson({ method: 'POST', body: JSON.stringify(payload) }),
  );
}

export async function me(token: string): Promise<AuthUser> {
  return apiRequest<AuthUser>('/me/', withAuth(token));
}

export async function updateProfile(
  token: string,
  payload: { phone?: string; address?: string; image?: File | null },
): Promise<AuthUser> {
  const formData = new FormData();
  if (payload.phone !== undefined) formData.append('phone', payload.phone);
  if (payload.address !== undefined) formData.append('address', payload.address);
  if (payload.image) formData.append('image', payload.image);

  return apiRequest<AuthUser>('/profile/', withAuth(token, { method: 'PATCH', body: formData }));
}
