import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ModernOrderCardProps {
  id: number;
  buyerName: string;
  items: Array<{ name: string; qty: number }>;
  total: number;
  status: string;
  date: Date;
  address?: string;
  onClick?: () => void;
  onStatusUpdate?: (status: string) => void;
  nextActions?: string[];
}

const statusColors = {
  pending: { bg: '#FFFBEB', text: '#B45309', label: 'รอชำระ' },
  paid: { bg: '#FEF3C7', text: '#B45309', label: 'ชำระแล้ว' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF', label: 'ยืนยัน' },
  preparing: { bg: '#FEF9C3', text: '#B45309', label: 'เตรียมสินค้า' },
  shipped: { bg: '#EDE9FE', text: '#6D28D9', label: 'จัดส่ง' },
  delivered: { bg: '#DCFCE7', text: '#166534', label: 'ได้รับแล้ว' },
  cancelled: { bg: '#FECACA', text: '#991B1B', label: 'ยกเลิก' },
};

const TIMELINE_STEPS: Array<{ key: string; label: string }> = [
  { key: 'pending',   label: 'สั่งซื้อ' },
  { key: 'confirmed', label: 'ยืนยัน' },
  { key: 'preparing', label: 'เตรียม' },
  { key: 'shipped',   label: 'จัดส่ง' },
  { key: 'delivered', label: 'ได้รับ' },
];

export function ModernOrderCard({
  id,
  buyerName,
  items,
  total,
  status,
  date,
  address,
  onClick,
  onStatusUpdate,
  nextActions = [],
}: ModernOrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const statusColor = statusColors[status as keyof typeof statusColors] || statusColors.pending;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl bg-white border-2 border-stone-100 overflow-hidden hover:border-orange-300 transition-colors"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-stone-50 transition"
      >
        <div className="text-left flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-bold text-stone-800" style={{ fontSize: 14 }}>
              ออเดอร์ #{id}
            </p>
            <div
              className="px-2.5 py-1 rounded-full font-bold"
              style={{
                fontSize: 11,
                backgroundColor: statusColor.bg,
                color: statusColor.text,
              }}
            >
              {statusColor.label}
            </div>
          </div>
          <p
            className="text-stone-500 mb-2"
            style={{ fontSize: 12 }}
          >
            {buyerName} · {date.toLocaleDateString('th-TH')}
          </p>
          <p className="font-bold text-orange-600" style={{ fontSize: 15 }}>
            ฿{total.toLocaleString()}
          </p>
        </div>
        <ChevronDown
          size={18}
          className="text-stone-400 transition-transform duration-300"
          style={{
            transform: expanded ? 'rotate(180deg)' : 'none',
          }}
        />
      </button>

      {/* Expandable Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t-2 border-stone-100 bg-stone-50"
          >
            <div className="p-4 sm:p-5 space-y-4">
              {/* Status Timeline */}
              {status !== 'cancelled' && (
                <div>
                  <p className="text-stone-600 font-bold mb-3" style={{ fontSize: 12 }}>
                    สถานะออเดอร์
                  </p>
                  <div className="flex items-center gap-0">
                    {TIMELINE_STEPS.map((step, idx) => {
                      const stepIndex = TIMELINE_STEPS.findIndex((s) => s.key === status);
                      const isCompleted = idx < stepIndex;
                      const isCurrent = idx === stepIndex;
                      const isLast = idx === TIMELINE_STEPS.length - 1;
                      return (
                        <div key={step.key} className="flex items-center" style={{ flex: isLast ? 'none' : 1 }}>
                          <div className="flex flex-col items-center gap-1">
                            <div
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 10,
                                fontWeight: 700,
                                background: isCurrent ? '#F97316' : isCompleted ? '#22C55E' : '#E7E5E4',
                                color: isCurrent || isCompleted ? '#fff' : '#A8A29E',
                                flexShrink: 0,
                              }}
                            >
                              {isCompleted ? '✓' : idx + 1}
                            </div>
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: isCurrent ? 700 : 500,
                                color: isCurrent ? '#F97316' : isCompleted ? '#16A34A' : '#A8A29E',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {step.label}
                            </span>
                          </div>
                          {!isLast && (
                            <div
                              style={{
                                flex: 1,
                                height: 2,
                                background: isCompleted ? '#22C55E' : '#E7E5E4',
                                marginBottom: 14,
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <p
                  className="text-stone-600 font-bold mb-2"
                  style={{ fontSize: 12 }}
                >
                  สินค้า
                </p>
                <div className="space-y-1.5">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-stone-700"
                      style={{ fontSize: 13 }}
                    >
                      <span>{item.name}</span>
                      <span className="font-bold">× {item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              {address && (
                <div>
                  <p
                    className="text-stone-600 font-bold mb-1"
                    style={{ fontSize: 12 }}
                  >
                    ที่อยู่จัดส่ง
                  </p>
                  <p
                    className="text-stone-700"
                    style={{ fontSize: 12 }}
                  >
                    {address}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 border-t-2 border-stone-200 space-y-2">
                <button
                  onClick={onClick}
                  className="w-full py-2 rounded-xl bg-blue-50 text-blue-600 font-bold transition-colors hover:bg-blue-100"
                  style={{ fontSize: 12 }}
                >
                  ดูรายละเอียด
                </button>
                {nextActions.length > 0 && (
                  <div className="flex gap-2">
                    {nextActions.map((action) => (
                      <button
                        key={action}
                        onClick={() => onStatusUpdate?.(action)}
                        className={`
                          flex-1 py-2 rounded-lg font-bold transition-colors
                          ${
                            action === 'cancelled'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                          }
                        `}
                        style={{ fontSize: 11 }}
                      >
                        {action === 'confirmed' && 'ยืนยัน'}
                        {action === 'preparing' && 'เตรียมสินค้า'}
                        {action === 'shipped' && 'จัดส่ง'}
                        {action === 'delivered' && 'ได้รับ'}
                        {action === 'cancelled' && 'ยกเลิก'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
