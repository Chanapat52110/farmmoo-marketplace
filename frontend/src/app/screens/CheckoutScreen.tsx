import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, MapPin, ClipboardList, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/order.service';

export function CheckoutScreen() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { accessToken } = useAuth();

  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Prevent the "empty cart → /cart" guard from firing when we've just placed an order
  const orderPlaced = useRef(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
    }
  }, [accessToken, navigate]);

  // Redirect empty cart — but not when we've just successfully placed an order
  useEffect(() => {
    if (items.length === 0 && !orderPlaced.current) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  const handleConfirm = async () => {
    if (!address.trim()) {
      setError('กรุณากรอกที่อยู่จัดส่ง');
      return;
    }
    if (!accessToken) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const createdOrder = await createOrder(accessToken, {
        items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
        delivery_address: address.trim(),
        notes: notes.trim(),
      });
      window.dispatchEvent(new Event('order:created'));
      orderPlaced.current = true;
      clearCart();
      navigate('/order-success', { state: { order: createdOrder } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFF8F0' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 bg-white px-4 pt-3 pb-3"
        style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/cart')}
            className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center active:bg-stone-200"
          >
            <ChevronLeft size={22} className="text-stone-600" />
          </button>
          <h1 className="text-stone-800" style={{ fontSize: 18, fontWeight: 700 }}>
            ยืนยันคำสั่งซื้อ
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto w-full px-4 py-4 space-y-4 flex-1">

        {/* Order Summary */}
        <div
          className="bg-white rounded-2xl p-4"
          style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={18} className="text-orange-500" />
            <p className="text-stone-700" style={{ fontSize: 14, fontWeight: 700 }}>
              สรุปคำสั่งซื้อ
            </p>
          </div>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-stone-700 truncate" style={{ fontSize: 13, fontWeight: 600 }}>
                    {item.name}
                  </p>
                  <p className="text-stone-400" style={{ fontSize: 11 }}>
                    {`฿${item.price.toLocaleString()} × ${item.quantity} ${item.unit}`}
                  </p>
                </div>
                <p className="text-stone-700 shrink-0" style={{ fontSize: 13, fontWeight: 600 }}>
                  {`฿${(item.price * item.quantity).toLocaleString()}`}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-100 pt-3 mt-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-stone-500" style={{ fontSize: 13 }}>
                {`รวมสินค้า (${totalItems} กก.)`}
              </span>
              <span className="text-stone-700" style={{ fontSize: 13, fontWeight: 600 }}>
                {`฿${totalPrice.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500" style={{ fontSize: 13 }}>ค่าจัดส่ง</span>
              <span className="text-green-600" style={{ fontSize: 13, fontWeight: 600 }}>
                ฟรี
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-stone-700" style={{ fontSize: 15, fontWeight: 700 }}>
                ยอดรวมทั้งหมด
              </span>
              <span className="text-orange-500" style={{ fontSize: 18, fontWeight: 800 }}>
                {`฿${totalPrice.toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div
          className="bg-white rounded-2xl p-4"
          style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-orange-500" />
            <p className="text-stone-700" style={{ fontSize: 14, fontWeight: 700 }}>
              ที่อยู่จัดส่ง
            </p>
          </div>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="กรอกที่อยู่จัดส่ง บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
            rows={4}
            className="w-full border border-stone-200 rounded-xl px-3 py-3 text-stone-700 focus:outline-none focus:border-orange-400 resize-none"
            style={{ fontSize: 14, fontFamily: 'Sarabun, sans-serif', lineHeight: 1.7 }}
          />
        </div>

        {/* Notes (optional) */}
        <div
          className="bg-white rounded-2xl p-4"
          style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
        >
          <p className="text-stone-700 mb-2" style={{ fontSize: 14, fontWeight: 700 }}>
            หมายเหตุ (ถ้ามี)
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="เช่น ส่งช่วงเช้า, ติดต่อก่อนส่ง"
            rows={2}
            className="w-full border border-stone-200 rounded-xl px-3 py-3 text-stone-600 focus:outline-none focus:border-orange-400 resize-none"
            style={{ fontSize: 13, fontFamily: 'Sarabun, sans-serif', lineHeight: 1.7 }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-2">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-600" style={{ fontSize: 13, fontWeight: 500 }}>
              {error}
            </p>
          </div>
        )}

        {/* Payment note */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
          <p className="text-blue-700" style={{ fontSize: 13, fontWeight: 600 }}>
            ชำระเงินปลายทาง / โอนหลังยืนยันออเดอร์
          </p>
          <p className="text-blue-600" style={{ fontSize: 12, marginTop: 4 }}>
            ผู้ขายจะติดต่อกลับเพื่อนัดหมายจัดส่งและแจ้งช่องทางชำระเงิน
          </p>
        </div>

        <div style={{ height: 100 }} />
      </div>

      {/* Sticky Confirm Bar */}
      <div
        className="sticky bottom-0 bg-white border-t border-stone-100 px-4 py-3"
        style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.08)' }}
      >
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-orange-500 text-white rounded-2xl flex items-center justify-between px-5 active:bg-orange-600 shadow-md shadow-orange-200 active:scale-[0.98] transition-all disabled:opacity-60 disabled:active:scale-100"
          style={{ height: 58, fontFamily: 'Sarabun, sans-serif' }}
        >
          <span style={{ fontSize: 17, fontWeight: 700 }}>
            {loading ? 'กำลังส่งคำสั่งซื้อ...' : 'ยืนยันคำสั่งซื้อ'}
          </span>
          <div className="text-right">
            <p style={{ fontSize: 18, fontWeight: 800 }}>
              {`฿${totalPrice.toLocaleString()}`}
            </p>
            <p className="text-orange-100" style={{ fontSize: 11 }}>
              {`${items.length} รายการ · ฟรีค่าส่ง`}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
