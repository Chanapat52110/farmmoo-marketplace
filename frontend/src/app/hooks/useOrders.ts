import { useCallback, useEffect, useState } from 'react';
import {
  listMyOrders,
  listShopOrders,
  patchOrderStatus,
  type Order,
  type OrderStatus,
} from '../services/order.service';

export function useMyOrders(token: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!token) return;
    setError('');
    setLoading(true);
    try {
      setOrders(await listMyOrders(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { orders, loading, error, refresh };
}

export function useShopOrders(token: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      setOrders(await listShopOrders(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateStatus = useCallback(
    async (orderId: number, status: OrderStatus) => {
      if (!token) return;
      setUpdatingOrderId(orderId);
      try {
        const updated = await patchOrderStatus(token, orderId, status);
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [token],
  );

  return { orders, loading, error, refresh, updateStatus, updatingOrderId };
}
