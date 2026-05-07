import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Package, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMyOrders } from '../hooks/useOrders';
import { ModernOrderCard } from '../components/ModernOrderCard';
import { Skeleton } from '../components/ui/skeleton';
import { motion } from 'motion/react';
import type { Order as ApiOrder } from '../services/order.service';

export function OrdersScreen() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { orders, loading, error, refresh } = useMyOrders(accessToken);

  useEffect(() => {
    if (!accessToken) navigate('/login');
  }, [accessToken, navigate]);

  // Polling is handled by useMyOrders (refetchInterval: 5_000).
  // No manual setInterval needed here.

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-orange-50 to-stone-50">
      {/* Modern Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-stone-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="w-10 h-10 rounded-2xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
              >
                <ArrowLeft size={18} className="text-stone-600" />
              </button>
              <div>
                <h1 className="text-stone-900 font-bold" style={{ fontSize: 18 }}>
                  คำสั่งซื้อของฉัน
                </h1>
                <p className="text-stone-400" style={{ fontSize: 11 }}>
                  ประวัติการสั่งซื้อทั้งหมด
                </p>
              </div>
            </div>
            {!loading && (
              <motion.button
                whileTap={{ rotate: 360 }}
                onClick={() => void refresh()}
                className="w-10 h-10 rounded-2xl bg-orange-50 hover:bg-orange-100 flex items-center justify-center transition-colors"
              >
                <RefreshCw size={18} className="text-orange-500" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {loading && (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-full h-[140px] rounded-3xl" />
            ))}
          </>
        )}

        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white border-2 border-red-200 p-8 text-center"
          >
            <p className="text-red-500 font-bold mb-3" style={{ fontSize: 14 }}>
              {error}
            </p>
            <button
              onClick={() => void refresh()}
              className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
              style={{ fontSize: 13 }}
            >
              ลองอีกครั้ง
            </button>
          </motion.div>
        )}

        {!loading && !error && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white border-2 border-stone-200 p-12 text-center"
          >
            <Package size={56} className="text-stone-300 mx-auto mb-4" />
            <h3
              className="text-stone-800 font-bold mb-2"
              style={{ fontSize: 17 }}
            >
              ยังไม่มีคำสั่งซื้อ
            </h3>
            <p className="text-stone-500 mb-6" style={{ fontSize: 13 }}>
              เริ่มสั่งซื้อหมูสดจากฟาร์มได้เลย
            </p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
              style={{ fontSize: 14 }}
            >
              เลือกซื้อสินค้า
            </button>
          </motion.div>
        )}

        {!loading && !error && orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {orders.map((order) => (
              <ModernOrderCard
                key={order.id}
                id={order.id}
                buyerName={order.buyer_username}
                items={Array.isArray(order.items)
                  ? order.items.map((item) => ({
                      name: item.product_name,
                      qty: item.quantity,
                    }))
                  : (console.error('[OrdersScreen] order.items is not an array for order', order.id, order.items), [])
                }
                total={parseFloat(order.total_price)}
                status={order.status}
                date={new Date(order.created_at)}
                address={order.delivery_address}
                onClick={() => navigate(`/orders/${order.id}`)}
                nextActions={getNextActions(order.status)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function getNextActions(status: ApiOrder['status']): string[] {
  const nextMap: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    paid: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };
  return nextMap[status] || [];
}
