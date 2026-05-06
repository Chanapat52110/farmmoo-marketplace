import { apiRequest, withAuth } from './http';

export interface Product {
  id: number;
  name: string;
  price: string;
  stock: string;
  description: string;
  status: 'available' | 'out_of_stock' | 'discontinued';
  seller_name: string;
  image_url: string | null;
  created_at: string;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  stock: number;
  description?: string;
  image?: File;
}

export interface UpdateProductPayload {
  name?: string;
  price?: number;
  stock?: number;
  description?: string;
  status?: 'available' | 'out_of_stock' | 'discontinued';
  image?: File;
}

/** Paginated envelope returned by GET /products/ */
export interface PaginatedProducts {
  count: number;
  total_pages: number;
  page: number;
  page_size: number;
  has_next: boolean;
  results: Product[];
}

export interface ProductListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  ordering?: string;
  shop?: number;
}

export function listProducts(params?: ProductListParams): Promise<PaginatedProducts> {
  const qs = new URLSearchParams();
  if (params?.page)      qs.set('page', String(params.page));
  if (params?.page_size) qs.set('page_size', String(params.page_size));
  if (params?.search)    qs.set('search', params.search);
  if (params?.status)    qs.set('status', params.status);
  if (params?.ordering)  qs.set('ordering', params.ordering);
  if (params?.shop)      qs.set('shop', String(params.shop));
  const query = qs.toString();
  return apiRequest<PaginatedProducts>(`/products/${query ? `?${query}` : ''}`);
}

export function getProduct(id: number): Promise<Product> {
  return apiRequest<Product>(`/products/${id}/`);
}

export function listMyProducts(token: string): Promise<Product[]> {
  return apiRequest<Product[]>('/my-products/', withAuth(token));
}

export function createProduct(token: string, payload: CreateProductPayload): Promise<Product> {
  const form = new FormData();
  form.append('name', payload.name);
  form.append('price', String(payload.price));
  form.append('stock', String(payload.stock));
  if (payload.description) form.append('description', payload.description);
  if (payload.image) form.append('image', payload.image);

  return apiRequest<Product>(
    '/products/',
    withAuth(token, { method: 'POST', body: form }),
  );
}

export function updateProduct(token: string, id: number, payload: UpdateProductPayload): Promise<Product> {
  const form = new FormData();
  if (payload.name !== undefined) form.append('name', payload.name);
  if (payload.price !== undefined) form.append('price', String(payload.price));
  if (payload.stock !== undefined) form.append('stock', String(payload.stock));
  if (payload.description !== undefined) form.append('description', payload.description);
  if (payload.status !== undefined) form.append('status', payload.status);
  if (payload.image !== undefined) form.append('image', payload.image);

  return apiRequest<Product>(
    `/products/${id}/`,
    withAuth(token, { method: 'PATCH', body: form }),
  );
}

export function removeProduct(token: string, id: number): Promise<null> {
  return apiRequest<null>(`/products/${id}/`, withAuth(token, { method: 'DELETE' }));
}
