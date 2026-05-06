import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  CircleDot,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOrder, patchOrderStatus } from '../services/order.service';
import type { Order, OrderStatus } from '../services/order.service';
import { motion } from 'motion/react';

const TIMELINE_STEPS: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'pending', label: 'รอชำระเงิน', icon: <CircleDot size={18} /> },
  { status: 'paid', label: 'ชำระเงินแล้ว', icon: <CheckCircle size={18} /> },
  { status: 'confirmed', label: 'ยืนยันแล้ว', icon: <CheckCircle size={18} /> },
  { status: 'shipped', label: 'จัดส่งแล้ว', icon: <Truck size={18} /> },
  { status: 'delivered', label: 'ได้รับสินค้า', icon: <CheckCircle size={18} /> },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  pending: 0,
  paid: 1,
  confirmed: 2,
  preparing: 3,
  shipped: 4,
  delivered: 5,
  cancelled: -1,
};

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: '#FFFBEB', text: '#B45309' },
  paid: { bg: '#FEF3C7', text: '#B45309' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
  preparing: { bg: '#FEF9C3', text: '#B45309' },
  shipped: { bg: '#EDE9FE', text: '#6D28D9' },
  delivered: { bg: '#DCFCE7', text: '#166534' },
  cancelled: { bg: '#FECACA', text: '#991B1B' },
};

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending: ['confirmed', 'cancelled'],
  paid: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
};

const NEXT_STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  confirmed: 'ยืนยัน',
  preparing: 'เตรียมสินค้า',
  shipped: 'จัดส่ง',
  delivered: 'ได้รับแล้ว',
  cancelled: 'ยกเลิก',
};

export function OrderDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<OrderStatus | null>(null);

  useEffect(() => {
    if (!accessToken || !id) return;
    setLoading(true);
    getOrder(accessToken, Number(id))
      .then(setOrder)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [accessToken, id]);

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!accessToken || !order) return;
    setUpdatingStatus(newStatus);
    try {
      const updated = await patchOrderStatus(accessToken, order.id, newStatus);
      setOrder(updated);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const isSeller = user?.role === 'seller';
  const nextStatuses = order ? NEXT_STATUSES[order.status] ?? [] : [];

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF0E6 100%)' }}
      >
        <motion.div
          animate={{ scale: [0.8, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <Package size={28} className="text-white" />
          </div>
          <p className="text-stone-400 font-bold" style={{ fontSize: 14 }}>
            กำลังโหลดออเดอร์…
          </p>
        </motion.div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF0E6 100%)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm w-full"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <h2 className="text-stone-800 font-bold mb-2" style={{ fontSize: 18 }}>
            ไม่พบออเดอร์
          </h2>
          <p className="text-stone-500 mb-6" style={{ fontSize: 14 }}>
            {error || 'ออเดอร์นี้ไม่พบในระบบ'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-3 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
            style={{ fontSize: 14 }}
          >
            กลับไป
          </button>
        </motion.div>
      </div>
    );
  }

  const currentStep = STATUS_ORDER[order.status];
  const isCancelled = order.status === 'cancelled';
  const statusColor = STATUS_COLORS[order.status];

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF0E6 100%)' }}>
      {/* Modern Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-stone-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-2xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
              >
                <ArrowLeft size={18} className="text-stone-600" />
              </button>
              <div>
                <h1 className="text-stone-900 font-bold" style={{ fontSize: 18 }}>
                  ออเดอร์ #{order.id}
                </h1>
                <p className="text-stone-400" style={{ fontSize: 11 }}>
                  {new Date(order.created_at).toLocaleDateString('th-TH')}
                </p>
              </div>
            </div>
            <div
              className="px-3 py-1.5 rounded-full font-bold"
              style={{
                fontSize: 12,
                backgroundColor: statusColor.bg,
                color: statusColor.text,
              }}
            >
              {order.status_label}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Status Timeline */}
        {!isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 border-2 border-stone-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-orange-500" />
              <p className="text-stone-600 font-bold" style={{ fontSize: 12 }}>
                สถานะออเดอร์
              </p>
            </div>
            <div className="flex items-start gap-0">
              {TIMELINE_STEPS.map((step, idx) => {
                const stepIndex = STATUS_ORDER[step.status];
                const isDone = currentStep >= stepIndex;
                const isActive = currentStep === stepIndex;
                const isLast = idx === TIMELINE_STEPS.length - 1;

                return (
                  <div key={step.status} className="flex-1 flex flex-col items-center">
                    <div className="flex items-center w-full">
                      {idx > 0 && (
                        <div
                          className="flex-1 h-1"
                          style={{
                            background: currentStep >= stepIndex ? '#F97316' : '#E7E5E4',
                            transition: 'background 0.3s',
                          }}
                        />
                      )}
                      <motion.div
                        animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: isDone
                            ? 'linear-gradient(135deg, #F97316, #EA580C)'
                            : '#F5F5F4',
                          color: isDone ? '#fff' : '#A8A29E',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: isActive
                            ? '0 0 0 4px rgba(249,115,22,0.2)'
                            : 'none',
                        }}
                      >
                        {step.icon}
                      </motion.div>
                      {!isLast && (
                        <div
                          className="flex-1 h-1"
                          style={{
                            background: currentStep > stepIndex ? '#F97316' : '#E7E5E4',
                            transition: 'background 0.3s',
                          }}
                        />
                      )}
                    </div>
                    <p
                      className="text-center mt-2"
                      style={{
                        fontSize: 10,
                        fontWeight: isActive ? 700 : 500,
                        color: isDone ? '#C2410C' : '#A8A29E',
                        lineHeight: 1.3,
                      }}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Cancelled Banner */}
        {isCancelled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl px-5 py-4 border-2 border-red-200 bg-red-50 flex items-start gap-3"
          >
            <XCircle size={22} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-bold" style={{ fontSize: 14 }}>
                ออเดอร์ถูกยกเลิก
              </p>
              <p className="text-red-500" style={{ fontSize: 12 }}>
                ออเดอร์นี้ได้รับการยกเลิกแล้ว
              </p>
            </div>
          </motion.div>
        )}

        {/* Seller Status Controls */}
        {isSeller && nextStatuses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 border-2 border-orange-100"
          >
            <p className="text-stone-600 font-bold mb-3" style={{ fontSize: 12 }}>
              อัพเดทสถานะ
            </p>
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((st) => {
                const isCancel = st === 'cancelled';
                return (
                  <motion.button
                    key={st}
                    whileTap={{ scale: 0.95 }}
                    disabled={updatingStatus !== null}
                    onClick={() => handleUpdateStatus(st)}
                    className="px-4 py-2 rounded-xl font-bold transition-all"
                    style={{
                      fontSize: 12,
                      background: isCancel ? '#FEE2E2' : '#FEF3C7',
                      color: isCancel ? '#B91C1C' : '#B45309',
                      border: `1px solid ${isCancel ? '#FECACA' : '#FCD34D'}`,
                      opacity: updatingStatus !== null ? 0.6 : 1,
                    }}
                  >
                    {updatingStatus === st
                      ? '…'
                      : (NEXT_STATUS_LABELS[st] ?? st)}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl overflow-hidden border-2 border-stone-100"
        >
          <div className="px-5 pt-5 pb-3 flex items-center gap-2">
            <Package size={18} className="text-orange-500" />
            <p className="text-stone-800 font-bold" style={{ fontSize: 15 }}>
              รายการสินค้า
            </p>
          </div>
          {order.items.map((item, idx) => (
            <div
              key={item.id}
              className="px-5 py-4"
              style={{
                borderTop: idx > 0 ? '1px solid #F5F5F4' : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-stone-800 font-bold mb-1" style={{ fontSize: 14 }}>
                    {item.product_name}
                  </p>
                  <p className="text-stone-500" style={{ fontSize: 12 }}>
                    {item.shop_name} · {item.quantity} กก. × ฿
                    {parseFloat(item.unit_price).toLocaleString()}
                  </p>
                </div>
                <p className="text-orange-600 font-bold shrink-0" style={{ fontSize: 15 }}>
                  ฿{parseFloat(item.subtotal).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{
              borderTop: '2px solid #F5F5F4',
              background: '#FAFAF9',
            }}
          >
            <p className="text-stone-600 font-bold" style={{ fontSize: 13 }}>
              ยอดรวม
            </p>
            <p className="text-orange-600" style={{ fontSize: 20, fontWeight: 800 }}>
              ฿{parseFloat(order.total_price).toLocaleString()}
            </p>
          </div>
        </motion.div>

        {/* Delivery Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-5 border-2 border-stone-100"
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-orange-500" />
            <p className="text-stone-800 font-bold" style={{ fontSize: 15 }}>
              ที่อยู่จัดส่ง
            </p>
          </div>
          <p className="text-stone-700" style={{ fontSize: 14, lineHeight: 1.7 }}>
            {order.delivery_address}
          </p>
        </motion.div>

        {/* Notes (if any) */}
        {order.notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 border-2 border-stone-100"
          >
            <p className="text-stone-600 font-bold mb-2" style={{ fontSize: 12 }}>
              หมายเหตุ
            </p>
            <p className="text-stone-700" style={{ fontSize: 14 }}>
              {order.notes}
            </p>
          </motion.div>
        )}

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-3xl p-5 border-2 border-blue-200"
        >
          <p className="text-blue-700 font-bold mb-1" style={{ fontSize: 13 }}>
            💡 ข้อมูล
          </p>
          <p className="text-blue-600" style={{ fontSize: 12, lineHeight: 1.6 }}>
            ผู้ขายจะติดต่อกลับเพื่อนัดหมายจัดส่งและแจ้งช่องทางชำระเงินภายใน 24 ชั่วโมง
          </p>
        </motion.div>
      </div>
    </div>
  );
}
