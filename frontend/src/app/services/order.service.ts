import { apiRequest, withAuth, withJson } from './http';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
  shop_name: string;
}

export interface Order {
  id: number;
  buyer_username: string;
  status: OrderStatus;
  status_label: string;
  delivery_address: string;
  total_price: string;
  notes: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

interface CartItemPayload {
  product_id: number;
  quantity: number;
}

export interface CreateOrderPayload {
  items: CartItemPayload[];
  delivery_address: string;
  notes?: string;
}

export function createOrder(token: string, payload: CreateOrderPayload): Promise<Order> {
  return apiRequest<Order>(
    '/orders/',
    withAuth(token, withJson({ method: 'POST', body: JSON.stringify(payload) })),
  );
}

export function getOrder(token: string, orderId: number): Promise<Order> {
  return apiRequest<Order>(`/orders/${orderId}/`, withAuth(token));
}

export function listMyOrders(token: string): Promise<Order[]> {
  return apiRequest<Order[]>('/my-orders/', withAuth(token));
}

export function listShopOrders(token: string): Promise<Order[]> {
  return apiRequest<Order[]>('/shop-orders/', withAuth(token));
}

export function patchOrderStatus(token: string, orderId: number, status: OrderStatus): Promise<Order> {
  return apiRequest<Order>(
    `/orders/${orderId}/status/`,
    withAuth(token, withJson({ method: 'PATCH', body: JSON.stringify({ status }) })),
  );
}
