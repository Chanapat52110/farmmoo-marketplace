import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Home, ClipboardList } from 'lucide-react';
import type { Order as ApiOrder } from '../services/order.service';

export function OrderSuccessScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = (location.state as { order?: ApiOrder } | null)?.order;

  const date = useMemo(
    () => new Date(order?.created_at || Date.now()).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    [order],
  );

  return (
    <div className="min-h-screen" style={{ background: '#FFF8F0' }}>
      <div className="max-w-2xl mx-auto px-5 pt-10 pb-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-4" style={{ boxShadow: '0 0 0 10px #DCFCE7' }}>
            <span style={{ fontSize: 46 }}>✅</span>
          </div>
          <h1 className="text-stone-900" style={{ fontSize: 26, fontWeight: 800 }}>สั่งซื้อสำเร็จแล้ว!</h1>
          <p className="text-stone-500 mt-1" style={{ fontSize: 15 }}>ขอบคุณที่ใช้บริการ FarmMoo</p>

          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3 text-center w-full">
            <p className="text-stone-500" style={{ fontSize: 12 }}>หมายเลขคำสั่งซื้อ</p>
            <p className="text-orange-600" style={{ fontSize: 18, fontWeight: 800 }}>#{order?.id ?? '-'}</p>
            <p className="text-stone-400" style={{ fontSize: 12 }}>{date}</p>
          </div>

          <div className="mt-4 bg-white rounded-2xl p-4 w-full" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <p className="text-stone-700 mb-3" style={{ fontSize: 14, fontWeight: 700 }}>รายการสั่งซื้อ</p>
            <div className="space-y-2">
              {order?.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <p className="text-stone-600 flex-1" style={{ fontSize: 13 }}>
                    {item.product_name} × {item.quantity} กก.
                  </p>
                  <p className="text-stone-700" style={{ fontSize: 13, fontWeight: 600 }}>
                    ฿{parseFloat(item.subtotal).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 mt-3 pt-3 text-right">
              <p className="text-stone-500" style={{ fontSize: 12 }}>ยอดรวม</p>
              <p className="text-orange-500" style={{ fontSize: 20, fontWeight: 800 }}>
                ฿{order ? parseFloat(order.total_price).toLocaleString() : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-white border-t border-stone-100 px-4 py-3" style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.08)' }}>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-orange-500 text-orange-500 rounded-2xl"
            style={{ height: 54, fontSize: 14, fontWeight: 700 }}
          >
            <ClipboardList size={18} /> ดูคำสั่งซื้อ
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white rounded-2xl"
            style={{ height: 54, fontSize: 14, fontWeight: 700 }}
          >
            <Home size={18} /> กลับหน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
}
