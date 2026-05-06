import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Bell, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { Skeleton } from '../components/ui/skeleton';
import { ModernProductCard } from '../components/ModernProductCard';
import { motion } from 'motion/react';
import { listShops, type Shop } from '../services/shop.service';

export function HomeScreen() {
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const { products, loading, error } = useProducts({ pollIntervalMs: 20000, refreshOnFocus: true });

  useEffect(() => {
    listShops()
      .then(setShops)
      .finally(() => setShopsLoading(false));
  }, []);

  const [addingId, setAddingId] = useState<number | null>(null);

  const newest = useMemo(() => products.slice(0, 6), [products]);

  const handleAddCart = (id: number) => {
    setAddingId(id);
    setTimeout(() => setAddingId(null), 700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-stone-50 pb-24">
      {/* Modern Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-stone-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <span style={{ fontSize: 24 }}>🐷</span>
              </div>
              <div>
                <p className="text-orange-600 font-bold" style={{ fontSize: 10 }}>ตลาดออนไลน์</p>
                <p className="text-stone-900 font-bold" style={{ fontSize: 18 }}>FarmMoo</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-2xl bg-orange-50 hover:bg-orange-100 flex items-center justify-center transition-colors">
                <Bell size={20} className="text-orange-600" />
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center hover:shadow-lg transition-shadow"
              >
                <span style={{ fontSize: 18 }}>👤</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Hero Banner */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/products')}
          className="w-full rounded-3xl bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 shadow-xl hover:shadow-2xl transition-shadow overflow-hidden group"
        >
          <div className="relative p-6 sm:p-8 flex items-center justify-between gap-4">
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-white" />
                <p className="text-orange-100 font-bold" style={{ fontSize: 12 }}>
                  ค้นหาสินค้า
                </p>
              </div>
              <h2 className="text-white font-bold leading-tight" style={{ fontSize: 26 }}>
                สั่งซื้อหมูสด
                <br />
                <span style={{ fontSize: 16 }} className="font-normal text-orange-100">
                  จากไร่ไก่ไทยทั่วประเทศ
                </span>
              </h2>
            </div>
            <div
              className="flex-shrink-0 text-6xl group-hover:scale-110 transition-transform duration-300"
            >
              🛒
            </div>
          </div>
        </motion.button>

        {/* Featured Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-orange-600" />
              <h3 className="text-stone-900 font-bold" style={{ fontSize: 18 }}>
                สินค้าใหม่ล่าสุด
              </h3>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-1 text-orange-600 font-bold hover:text-orange-700 transition-colors"
              style={{ fontSize: 13 }}
            >
              ดูทั้งหมด <ChevronRight size={16} />
            </button>
          </div>

          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((k) => (
                <div key={k} className="bg-white rounded-3xl overflow-hidden">
                  <Skeleton className="w-full h-[150px]" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-white rounded-3xl p-8 text-center border-2 border-red-200">
              <p className="text-red-600 font-bold" style={{ fontSize: 14 }}>
                {error}
              </p>
            </div>
          )}

          {!loading && !error && newest.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-stone-200">
              <p className="text-stone-500 font-bold" style={{ fontSize: 16 }}>
                ยังไม่มีสินค้าในระบบ
              </p>
            </div>
          )}

          {!loading && !error && newest.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {newest.map((p) => (
                <ModernProductCard
                  key={p.id}
                  id={p.id}
                  image={p.image_url}
                  name={p.name}
                  price={parseFloat(p.price)}
                  stock={p.stock}
                  seller={p.seller_name}
                  onClick={() => navigate(`/products/${p.id}`)}
                  onAddCart={(e) => {
                    e.stopPropagation();
                    handleAddCart(p.id);
                  }}
                  adding={addingId === p.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Section - Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {[
            { icon: '🥩', title: 'หมูสดทุกวัน', desc: 'จาก ไร่ทั่วไทย' },
            { icon: '✅', title: 'รับประกันคุณภาพ', desc: 'ตรวจสอบเข้มงวด' },
            { icon: '🚚', title: 'จัดส่งเร็ว', desc: 'ถึง 24 ชั่วโมง' },
            { icon: '💰', title: 'ราคายุติธรรม', desc: 'ตรงจากผู้ผลิต' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl bg-white border-2 border-stone-100 p-4 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
            >
              <p style={{ fontSize: 28 }} className="mb-2">
                {item.icon}
              </p>
              <p className="text-stone-800 font-bold" style={{ fontSize: 13 }}>
                {item.title}
              </p>
              <p className="text-stone-500" style={{ fontSize: 11 }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured Sellers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 22 }}>🌟</span>
              <h3 className="text-stone-900 font-bold" style={{ fontSize: 18 }}>
                ร้านค้าคัดสรร
              </h3>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="text-orange-600 font-bold hover:text-orange-700 transition-colors active:scale-95"
              style={{ fontSize: 13 }}
            >
              เยี่ยมชมทั้งหมด →
            </button>
          </div>

          {shopsLoading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((k) => (
                <Skeleton key={k} className="h-[160px] rounded-2xl" />
              ))}
            </div>
          )}

          {!shopsLoading && shops.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center border-2 border-stone-100">
              <p className="text-stone-500" style={{ fontSize: 14 }}>
                ยังไม่มีร้านค้า
              </p>
            </div>
          )}

          {!shopsLoading && shops.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {shops.slice(0, 4).map((shop, idx) => (
                <motion.button
                  key={shop.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/shop/${shop.id}`)}
                  className="rounded-2xl bg-white border-2 border-stone-100 p-4 text-center hover:border-orange-300 hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                    <span style={{ fontSize: 24 }}>🏪</span>
                  </div>
                  <p className="text-stone-800 font-bold mb-1 line-clamp-2" style={{ fontSize: 13 }}>
                    {shop.name}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-stone-500" style={{ fontSize: 11 }}>
                    <span>⭐ 4.8</span>
                    <span>•</span>
                    <span>{shop.owner_username}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 p-6"
        >
          <h3 className="text-stone-900 font-bold mb-5" style={{ fontSize: 18 }}>
            🎯 วิธีการสั่งซื้อ
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { num: '1', title: 'เลือกสินค้า', icon: '🛍️' },
              { num: '2', title: 'เพิ่มลงตะกร้า', icon: '🛒' },
              { num: '3', title: 'ชำระเงิน', icon: '💳' },
              { num: '4', title: 'รับสินค้า', icon: '📦' },
            ].map((step, idx) => (
              <div
                key={idx}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-white border-3 border-orange-400 flex items-center justify-center mx-auto mb-2 font-bold text-orange-600">
                  {step.num}
                </div>
                <p style={{ fontSize: 24 }} className="mb-1">{step.icon}</p>
                <p className="text-stone-700 font-bold" style={{ fontSize: 12 }}>
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
