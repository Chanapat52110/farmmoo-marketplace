import { useCallback, useEffect, useState } from 'react';
import { listProducts, type Product } from '../services/product.service';

interface UseProductsOptions {
  pollIntervalMs?: number;
  refreshOnFocus?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { pollIntervalMs = 0, refreshOnFocus = true } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    try {
      const data = await listProducts();
      setProducts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'โหลดสินค้าไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (pollIntervalMs <= 0) return;
    const timer = setInterval(() => {
      void refresh();
    }, pollIntervalMs);
    return () => clearInterval(timer);
  }, [pollIntervalMs, refresh]);

  useEffect(() => {
    if (!refreshOnFocus) return;

    const onFocus = () => void refresh();
    const onVisibility = () => {
      if (!document.hidden) void refresh();
    };
    const onOrderCreated = () => void refresh();

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('order:created', onOrderCreated as EventListener);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('order:created', onOrderCreated as EventListener);
    };
  }, [refreshOnFocus, refresh]);

  return { products, loading, error, refresh };
}
