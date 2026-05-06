import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ChevronLeft, MapPin, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ModernProductCard } from '../components/ModernProductCard';
import { getShopById, getShopProducts, type Shop } from '../services/shop.service';
import type { Product } from '../services/product.service';
import { Skeleton } from '../components/ui/skeleton';
import { motion } from 'motion/react';

export function ShopDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState<number | null>(null);
  const [stickyHeader, setStickyHeader] = useState(false);

  useEffect(() => {
    const shopId = Number(id);
    if (!shopId) {
      setError('ไม่พบร้านค้า');
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([getShopById(shopId), getShopProducts(shopId)])
      .then(([shopData, productsData]) => {
        setShop(shopData);
        setProducts(productsData);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setStickyHeader(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddCart = (product: Product) => {
    if (parseFloat(product.stock) === 0) return;
    setAddingId(product.id);
    setTimeout(() => setAddingId(null), 700);
    addItem(
      {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image_url ?? '',
        farmName: product.seller_name,
        unit: 'กก.',
      },
      0.1,
    );
    toast.success(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#FFF8F0' }}>
        <Skeleton className="w-full h-[180px]" />
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            {[1, 2, 3, 4, 5, 6].map((k) => (
              <Skeleton key={k} className="w-full h-[220px] rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-8" style={{ background: '#FFF8F0' }}>
        <p className="text-stone-700" style={{ fontSize: 18, fontWeight: 700 }}>ไม่พบร้านค้า</p>
        <p className="text-stone-400 mt-1 mb-5" style={{ fontSize: 14 }}>{error || 'ร้านค้านี้อาจถูกลบออกแล้ว'}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold transition-colors hover:bg-orange-600 active:scale-95"
        >
          กลับหน้าแรก
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFF8F0' }}>
      {/* Sticky Header for Mobile */}
      {stickyHeader && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-stone-100 px-4 py-3"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-orange-600 font-bold text-sm">{shop.name}</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-stone-500 hover:text-stone-700 transition-colors"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Shop Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
        {/* Banner */}
        <div className="relative" style={{ height: 200, background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}>
          {shop.image_url ? (
            <ImageWithFallback
              src={shop.image_url}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFEDD5 0%, #FEE2E4 100%)' }}>
              <span style={{ fontSize: 64 }}>🏪</span>
            </div>
          )}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-11 h-11 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
          >
            <ChevronLeft size={24} className="text-stone-700" />
          </button>
        </div>

        {/* Shop Info Card */}
        <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 shadow-lg"
            style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
          >
            <div className="flex items-start gap-4">
              {/* Shop Logo */}
              <div
                className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md"
              >
                <span style={{ fontSize: 40 }}>🏪</span>
              </div>

              {/* Shop Details */}
              <div className="flex-1 min-w-0">
                <h1 className="text-stone-900 font-bold truncate" style={{ fontSize: 20 }}>{shop.name}</h1>
                <p className="text-stone-500 text-sm mt-1 line-clamp-2">{shop.description || 'ร้านค้าออนไลน์บน FarmMoo'}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={16} className="text-orange-500" />
                    <span className="text-stone-700 font-bold text-sm">{products.length} สินค้า</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-yellow-500" />
                    <span className="text-stone-700 font-bold text-sm">4.8</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-orange-600" />
                    <span className="text-stone-600 text-sm">ทั่วไทย</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-12 text-center border-2 border-stone-200"
          >
            <p style={{ fontSize: 48 }} className="mb-3">📦</p>
            <p className="text-stone-700 font-bold" style={{ fontSize: 16 }}>ร้านค้าไม่มีสินค้า</p>
            <p className="text-stone-400 mt-2 mb-5" style={{ fontSize: 14 }}>ร้านค้านี้ยังไม่ได้เพิ่มสินค้า</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold transition-colors hover:bg-orange-600 active:scale-95"
            >
              ดูสินค้าอื่น
            </button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6">
              <ShoppingBag size={20} className="text-orange-600" />
              <h2 className="text-stone-900 font-bold" style={{ fontSize: 18 }}>
                สินค้าของ {shop.name}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {products.map((product) => (
                <ModernProductCard
                  key={product.id}
                  id={product.id}
                  image={product.image_url}
                  name={product.name}
                  price={parseFloat(product.price)}
                  stock={product.stock}
                  seller={product.seller_name}
                  onClick={() => navigate(`/products/${product.id}`)}
                  onAddCart={(e) => {
                    e.stopPropagation();
                    handleAddCart(product);
                  }}
                  adding={addingId === product.id}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
