import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Order, OrderStatus } from '../services/order.service';
import { StatusBadge } from './StatusBadge';

interface OrderTableProps {
  orders: Order[];
  loading?: boolean;
  statusFilter?: OrderStatus | 'all';
  onStatusChange?: (statusFilter: OrderStatus | 'all') => void;
  onViewDetails?: (id: number) => void;
  onUpdateStatus?: (id: number, status: OrderStatus) => Promise<void>;
  updatingOrderId?: number | null;
}

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

const STATUS_OPTIONS: (OrderStatus | 'all')[] = ['all', 'pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

export function OrderTable({
  orders,
  loading,
  statusFilter = 'all',
  onStatusChange,
  onViewDetails,
  onUpdateStatus,
  updatingOrderId,
}: OrderTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((k) => (
          <div key={k} className="bg-white rounded-2xl p-4 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center gap-3">
        <span style={{ fontSize: 48 }}>📦</span>
        <p className="text-stone-600" style={{ fontSize: 15, fontWeight: 600 }}>
          ยังไม่มีออเดอร์
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status filter */}
      {onStatusChange && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className="px-3 py-1.5 rounded-full whitespace-nowrap transition"
              style={{
                fontSize: 12,
                fontWeight: 700,
                background: statusFilter === status ? '#F97316' : '#F5F5F4',
                color: statusFilter === status ? '#fff' : '#78716C',
              }}
            >
              {status === 'all' ? 'ทั้งหมด' : status}
            </button>
          ))}
        </div>
      )}

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-stone-500" style={{ fontSize: 14 }}>
            ไม่มีออเดอร์สำหรับสถานะนี้
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredOrders.map((order) => {
            const nextOptions = NEXT_STATUSES[order.status] ?? [];
            const date = new Date(order.created_at).toLocaleDateString('th-TH', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
              >
                {/* Header/Summary */}
                <button
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  className="w-full p-4 flex items-center justify-between gap-3 hover:bg-stone-50 transition"
                >
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-stone-800" style={{ fontSize: 14 }}>
                        #{order.id}
                      </p>
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-stone-500" style={{ fontSize: 12 }}>
                      <span>{order.buyer_username}</span>
                      <span className="hidden sm:inline">·</span>
                      <span>{date}</span>
                    </div>
                    <p className="text-orange-600 font-bold mt-2" style={{ fontSize: 14 }}>
                      ฿{parseFloat(order.total_price).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p style={{ fontSize: 12, color: '#A8A29E' }}>
                      {order.items.length} สินค้า
                    </p>
                    <ChevronDown
                      size={16}
                      className="text-stone-400 shrink-0 transition"
                      style={{
                        transform: expandedId === order.id ? 'rotate(180deg)' : 'none',
                      }}
                    />
                  </div>
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {expandedId === order.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-stone-100 p-4 bg-stone-50 space-y-3"
                    >
                      {/* Items */}
                      <div>
                        <p className="text-stone-600 mb-2" style={{ fontSize: 12, fontWeight: 700 }}>
                          สินค้า
                        </p>
                        <div className="space-y-1.5">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-stone-700"
                              style={{ fontSize: 13 }}
                            >
                              <span>
                                {item.product_name} × {item.quantity} กก.
                              </span>
                              <span className="font-bold">
                                ฿{parseFloat(item.subtotal).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery address */}
                      {order.delivery_address && (
                        <div>
                          <p className="text-stone-600 mb-1" style={{ fontSize: 12, fontWeight: 700 }}>
                            ที่อยู่จัดส่ง
                          </p>
                          <p className="text-stone-700" style={{ fontSize: 12 }}>
                            {order.delivery_address}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t border-stone-200 flex-wrap">
                        {onViewDetails && (
                          <button
                            onClick={() => onViewDetails(order.id)}
                            className="flex-1 py-2 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center gap-1.5"
                            style={{ fontSize: 12, fontWeight: 700, minWidth: '100px' }}
                          >
                            ดูรายละเอียด <ChevronRight size={12} />
                          </button>
                        )}
                        {nextOptions.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {nextOptions.map((s) => (
                              <button
                                key={s}
                                onClick={() => onUpdateStatus?.(order.id, s)}
                                disabled={updatingOrderId === order.id}
                                className="px-3 py-1.5 rounded-lg disabled:opacity-50 transition"
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background:
                                    s === 'cancelled' ? '#FEF2F2' : '#FFF7ED',
                                  color: s === 'cancelled' ? '#B91C1C' : '#C2410C',
                                  border: `1px solid ${
                                    s === 'cancelled' ? '#FECACA' : '#FED7AA'
                                  }`,
                                }}
                              >
                                {updatingOrderId === order.id
                                  ? '…'
                                  : NEXT_STATUS_LABELS[s] ?? s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
