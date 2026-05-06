import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, Package, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { ModernProductCard } from '../components/ModernProductCard';
import { motion, AnimatePresence } from 'motion/react';
import type { Product } from '../services/product.service';
import { useProducts } from '../hooks/useProducts';

/** Debounce a value by `delay` ms. */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function ProductListScreen() {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const { products, loading, error, refresh, hasMore, loadMore, loadingMore, totalCount } =
    useProducts({ search: debouncedSearch, refreshOnFocus: true });

  const [addingId, setAddingId] = useState<number | null>(null);
  // keep input ref so clearing is instant
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
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
      1,
    );
    toast.success(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว 🛒`, {
      duration: 2000,
      style: { fontFamily: 'Sarabun, sans-serif', fontSize: 14 },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-stone-50 pb-24">
      {/* Modern Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-stone-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-2xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
            >
              <ArrowLeft size={18} className="text-stone-600" />
            </button>
            <div>
              <h1 className="text-stone-900 font-bold" style={{ fontSize: 20 }}>
                เลือกซื้อหมูสด
              </h1>
              <p className="text-stone-500" style={{ fontSize: 11 }}>
                {loading ? 'กำลังโหลด…' : `สินค้าทั้งหมด ${totalCount} รายการ`}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ค้นหาสินค้าหรือชื่อร้าน..."
              className="w-full bg-stone-100 border-2 border-transparent rounded-2xl px-4 pl-11 py-3 outline-none transition-all focus:bg-white focus:border-orange-400 focus:shadow-sm text-stone-800 placeholder:text-stone-400"
              style={{ fontSize: 14, fontFamily: 'Sarabun, sans-serif' }}
            />
            <AnimatePresence>
              {searchInput && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => { setSearchInput(''); inputRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-colors"
                >
                  <X size={14} className="text-stone-600" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
              <div key={k} className="bg-white rounded-3xl overflow-hidden">
                <Skeleton className="w-full h-[150px]" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white border-2 border-red-200 p-8 text-center"
          >
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-stone-800 font-bold mb-2" style={{ fontSize: 16 }}>
              โหลดสินค้าไม่สำเร็จ
            </h3>
            <p className="text-stone-500 mb-6" style={{ fontSize: 13 }}>
              {error}
            </p>
            <button
              onClick={() => { void refresh(); }}
              className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
              style={{ fontSize: 13 }}
            >
              ลองใหม่
            </button>
          </motion.div>
        )}

        {!loading && !error && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white border-2 border-stone-200 p-8 sm:p-12 text-center"
          >
            <Package size={56} className="text-stone-300 mx-auto mb-4" />
            <h3 className="text-stone-800 font-bold mb-2" style={{ fontSize: 18 }}>
              ไม่พบสินค้า
            </h3>
            <p className="text-stone-500 mb-6" style={{ fontSize: 13 }}>
              {debouncedSearch ? `ไม่พบ "${debouncedSearch}" ในระบบ` : 'ยังไม่มีสินค้าในขณะนี้'}
            </p>
            {debouncedSearch && (
              <button
                onClick={() => setSearchInput('')}
                className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
                style={{ fontSize: 13 }}
              >
                ดูสินค้าทั้งหมด
              </button>
            )}
          </motion.div>
        )}

        {!loading && !error && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <p className="text-stone-600 font-bold" style={{ fontSize: 13 }}>
              แสดง {products.length} / {totalCount} รายการ
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                  onAddCart={(e) => handleAddToCart(e, product)}
                  adding={addingId === product.id}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => { void loadMore(); }}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 disabled:opacity-60 transition-colors"
                  style={{ fontSize: 14, fontFamily: 'Sarabun, sans-serif' }}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      กำลังโหลด…
                    </>
                  ) : (
                    'โหลดเพิ่มเติม'
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
