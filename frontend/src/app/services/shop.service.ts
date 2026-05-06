import { apiRequest, withAuth } from './http';
import type { Product } from './product.service';

export interface Shop {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  owner_username: string;
  created_at: string;
}

export function getMyShop(token: string): Promise<Shop> {
  return apiRequest<Shop>('/my-shop/', withAuth(token));
}

export async function updateMyShop(
  token: string,
  payload: { name?: string; description?: string; image?: File | null },
): Promise<Shop> {
  const formData = new FormData();
  if (payload.name !== undefined) formData.append('name', payload.name);
  if (payload.description !== undefined) formData.append('description', payload.description);
  if (payload.image) formData.append('image', payload.image);

  return apiRequest<Shop>('/my-shop/', withAuth(token, { method: 'PATCH', body: formData }));
}

export function getShopById(id: number): Promise<Shop> {
  return apiRequest<Shop>(`/shops/${id}/`);
}

export function getShopProducts(shopId: number): Promise<Product[]> {
  return apiRequest<Product[]>(`/products/?shop=${shopId}`);
}

export function listShops(): Promise<Shop[]> {
  return apiRequest<Shop[]>('/shops/');
}
