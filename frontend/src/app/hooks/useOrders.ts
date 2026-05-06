import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listMyOrders,
  listShopOrders,
  patchOrderStatus,
  type Order,
  type OrderStatus,
} from '../services/order.service';

export function useMyOrders(token: string | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', 'my', token],
    queryFn: () => listMyOrders(token!),
    enabled: !!token,
    // Short staleTime: order status changes frequently
    staleTime: 5_000,
    // React Query handles background refetches without flipping isLoading to true,
    // so the order list never flickers during the 5-second poll in OrdersScreen.
    refetchInterval: 5_000,
  });

  return {
    orders: data ?? [],
    loading: isLoading,
    error: error instanceof Error ? error.message : error ? 'โหลดข้อมูลไม่สำเร็จ' : '',
    refresh: refetch,
  };
}

export function useShopOrders(token: string | null) {
  const queryClient = useQueryClient();
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const queryKey = ['orders', 'shop', token];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => listShopOrders(token!),
    enabled: !!token,
    staleTime: 5_000,
    refetchInterval: 10_000,
  });

  const updateStatus = useCallback(
    async (orderId: number, status: OrderStatus) => {
      if (!token) return;
      setUpdatingOrderId(orderId);
      try {
        const updated = await patchOrderStatus(token, orderId, status);
        // Optimistic-style update: mutate the cache directly so the UI reflects
        // the change immediately, then the next background refetch confirms it.
        queryClient.setQueryData<Order[]>(queryKey, (old) =>
          old ? old.map((o) => (o.id === updated.id ? updated : o)) : [updated],
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'อัปเดตสถานะไม่สำเร็จ');
      } finally {
        setUpdatingOrderId(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, queryClient],
  );

  return {
    orders: data ?? [],
    loading: isLoading,
    error: error instanceof Error ? error.message : error ? 'โหลดข้อมูลไม่สำเร็จ' : '',
    refresh: refetch,
    updateStatus,
    updatingOrderId,
  };
}
