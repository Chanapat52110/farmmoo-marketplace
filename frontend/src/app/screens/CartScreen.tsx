import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Trash2, ShoppingCart, ChevronRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function CartScreen() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [removingId, setRemovingId] = useState<number | null>(null);

  const handleRemove = (id: number) => {
    setRemovingId(id);
    setTimeout(() => {
      removeItem(id);
      setRemovingId(null);
    }, 250);
  };

  const handleClearCart = () => {
    clearCart();
  };

  // Group items by seller
  const itemsByFarm = useMemo(() => {
    const grouped: Record<string, typeof items> = {};
    items.forEach(item => {
      if (!grouped[item.farmName]) {
        grouped[item.farmName] = [];
      }
      grouped[item.farmName].push(item);
    });
    return grouped;
  }, [items]);

  const shippingFee = 0;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFF8F0' }}>
      {/* Header */}
      <div className="sticky top-16 z-10 bg-white px-4 pt-3 pb-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center active:bg-stone-200 shrink-0"
            >
              <span style={{ fontSize: 18 }}>←</span>
            </button>
            <div>
              <h1 className="text-stone-800" style={{ fontSize: 18, fontWeight: 700 }}>ตะกร้าสินค้า</h1>
              {items.length > 0 && (
                <p className="text-stone-500" style={{ fontSize: 12 }}>{totalItems} กก. · {items.length} รายการ</p>
              )}
            </div>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-1.5 bg-red-50 text-red-500 px-3 py-2 rounded-xl active:bg-red-100"
              style={{ fontSize: 12, fontWeight: 600 }}
            >
              <Trash2 size={13} />
              ล้างทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="w-28 h-28 bg-stone-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart size={52} className="text-stone-300" />
            </div>
            <p className="text-stone-700" style={{ fontSize: 20, fontWeight: 700 }}>ยังไม่มีสินค้าในตะกร้า</p>
            <p className="text-stone-400 mt-2 mb-6" style={{ fontSize: 14, lineHeight: 1.6 }}>
              เลือกซื้อหมูสดจากฟาร์มคุณภาพ<br />ส่งตรงถึงบ้านคุณ
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-orange-500 text-white px-8 py-4 rounded-2xl active:bg-orange-600 shadow-md shadow-orange-200 flex items-center gap-2"
              style={{ fontSize: 16, fontWeight: 700 }}
            >
              <ShoppingCart size={20} />
              เลือกซื้อสินค้า
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-3 space-y-4 pb-32">
            {/* Cart Items Grouped by Seller */}
            {Object.entries(itemsByFarm).map(([farmName, farmItems]) => (
              <div key={farmName}>
                {/* Seller Header */}
                <div className="px-2 py-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 20 }}>🌾</span>
                    <div>
                      <p className="text-stone-800" style={{ fontSize: 14, fontWeight: 700 }}>{farmName}</p>
                      <p className="text-stone-400" style={{ fontSize: 11 }}>{farmItems.length} สินค้า</p>
                    </div>
                  </div>
                </div>

                {/* Seller's Items */}
                <div className="space-y-2 mb-4">
                  <AnimatePresence>
                    {farmItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl overflow-hidden"
                        style={{
                          boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                          opacity: removingId === item.id ? 0.5 : 1,
                          transition: 'opacity 0.2s',
                        }}
                      >
                        <div className="flex gap-3 p-3">
                          {/* Image */}
                          <button
                            onClick={() => navigate(`/products/${item.id}`)}
                            className="shrink-0 rounded-xl overflow-hidden active:opacity-80"
                            style={{ width: 80, height: 80 }}
                          >
                            <ImageWithFallback
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </button>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-stone-800 truncate" style={{ fontSize: 14, fontWeight: 700 }}>{item.name}</p>
                                <p className="text-stone-400" style={{ fontSize: 11, fontWeight: 500 }}>฿{item.price}/{item.unit}</p>
                              </div>
                              <button
                                onClick={() => handleRemove(item.id)}
                                className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 active:bg-red-100"
                              >
                                <Trash2 size={14} className="text-red-400" />
                              </button>
                            </div>

                            {/* Price + Qty Row */}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-orange-500" style={{ fontSize: 16, fontWeight: 800 }}>
                                ฿{(item.price * item.quantity).toLocaleString()}
                              </span>
                              <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={item.quantity}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value) || 0.1;
                                  updateQuantity(item.id, Math.max(0.1, v));
                                }}
                                style={{
                                  width: 60,
                                  padding: '6px 8px',
                                  borderRadius: '8px',
                                  border: '1.5px solid #E7E5E4',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  color: '#1C1917',
                                  textAlign: 'center',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}

            {/* Free Shipping Banner */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-3">
              <Truck size={20} className="text-green-600 shrink-0" />
              <p className="text-green-700" style={{ fontSize: 13, fontWeight: 600 }}>
                🎉 ยินดีด้วย! ได้รับสิทธิ์จัดส่งฟรีแล้ว
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <p className="text-stone-700 mb-3" style={{ fontSize: 15, fontWeight: 700 }}>สรุปคำสั่งซื้อ</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500" style={{ fontSize: 14 }}>รวมสินค้า ({totalItems} {items[0]?.unit || 'กก.'})</span>
                  <span className="text-stone-700" style={{ fontSize: 14, fontWeight: 600 }}>฿{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500" style={{ fontSize: 14 }}>ค่าจัดส่ง</span>
                  <span className="text-green-600" style={{ fontSize: 14, fontWeight: 600 }}>
                    {shippingFee === 0 ? 'ฟรี 🎁' : `฿${shippingFee}`}
                  </span>
                </div>
                <div className="border-t border-stone-100 pt-2 flex justify-between">
                  <span className="text-stone-700" style={{ fontSize: 15, fontWeight: 700 }}>ยอดรวมทั้งหมด</span>
                  <span className="text-orange-500" style={{ fontSize: 20, fontWeight: 800 }}>฿{(totalPrice + shippingFee).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={{ height: 12 }} />
          </div>
        )}
      </div>

      {/* Sticky Checkout Bar */}
      {items.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-stone-100 px-4 py-3" style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.08)' }}>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-orange-500 text-white rounded-2xl flex items-center justify-between px-5 active:bg-orange-600 shadow-md shadow-orange-200 active:scale-[0.98] transition-all"
            style={{ height: 58, fontFamily: 'Sarabun, sans-serif' }}
          >
            <span style={{ fontSize: 16, fontWeight: 700 }}>ไปชำระเงิน</span>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 18, fontWeight: 800 }}>฿{totalPrice.toLocaleString()}</span>
              <ChevronRight size={20} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
