import { useCallback, useEffect, useState } from 'react';
import {
  listMyProducts,
  createProduct,
  updateProduct,
  removeProduct,
  type Product,
  type CreateProductPayload,
  type UpdateProductPayload,
} from '../services/product.service';

export function useSellerProducts(token: string | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      setProducts(await listMyProducts(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => void refresh();
    const onOrderCreated = () => void refresh();
    window.addEventListener('focus', onFocus);
    window.addEventListener('order:created', onOrderCreated as EventListener);
    const timer = setInterval(() => {
      void refresh();
    }, 15000);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('order:created', onOrderCreated as EventListener);
      clearInterval(timer);
    };
  }, [refresh]);

  const addProduct = useCallback(
    async (payload: CreateProductPayload) => {
      if (!token) throw new Error('กรุณาเข้าสู่ระบบ');
      const created = await createProduct(token, payload);
      setProducts((prev) => [created, ...prev]);
      return created;
    },
    [token],
  );

  const updateProductById = useCallback(
    async (id: number, payload: UpdateProductPayload) => {
      if (!token) throw new Error('กรุณาเข้าสู่ระบบ');
      const updated = await updateProduct(token, id, payload);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    },
    [token],
  );

  const deleteProductById = useCallback(
    async (id: number) => {
      if (!token) return;
      setDeletingId(id);
      try {
        await removeProduct(token, id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } finally {
        setDeletingId(null);
      }
    },
    [token],
  );

  return {
    products,
    loading,
    error,
    refresh,
    addProduct,
    updateProductById,
    deleteProductById,
    deletingId,
  };
}
