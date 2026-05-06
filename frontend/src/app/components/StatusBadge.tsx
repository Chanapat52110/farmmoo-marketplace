import type { OrderStatus } from '../services/order.service';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: 'รอชำระเงิน',   color: '#92400E', bg: '#FEF3C7' },
  paid:      { label: 'ชำระเงินแล้ว', color: '#065F46', bg: '#D1FAE5' },
  confirmed: { label: 'ยืนยันแล้ว',   color: '#1E40AF', bg: '#DBEAFE' },
  preparing: { label: 'กำลังเตรียม',  color: '#B45309', bg: '#FEF9C3' },
  shipped:   { label: 'จัดส่งแล้ว',   color: '#6D28D9', bg: '#EDE9FE' },
  delivered: { label: 'ได้รับสินค้า',  color: '#166534', bg: '#DCFCE7' },
  cancelled: { label: 'ยกเลิก',        color: '#991B1B', bg: '#FEE2E2' },
};

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: '#374151', bg: '#F3F4F6' };
  const fontSize = size === 'sm' ? 11 : 12;
  const px = size === 'sm' ? '8px' : '12px';
  const py = size === 'sm' ? '2px' : '4px';

  return (
    <span
      style={{
        fontSize,
        fontWeight: 700,
        color: cfg.color,
        background: cfg.bg,
        borderRadius: 999,
        padding: `${py} ${px}`,
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {cfg.label}
    </span>
  );
}
