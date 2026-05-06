import { ShoppingCart, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface ModernProductCardProps {
  id: number;
  image: string | null;
  name: string;
  price: number;
  stock: number | string;
  seller: string;
  rating?: number;
  reviews?: number;
  onClick?: () => void;
  onAddCart?: (e: React.MouseEvent) => void;
  adding?: boolean;
}

export function ModernProductCard({
  id: _id,
  image,
  name,
  price,
  stock,
  seller,
  rating = 4.5,
  reviews = 0,
  onClick,
  onAddCart,
  adding = false,
}: ModernProductCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group h-full"
    >
      <div
        className="h-full rounded-3xl overflow-hidden bg-white border-2 border-stone-100 transition-all duration-300 hover:border-orange-300 hover:shadow-lg flex flex-col cursor-pointer"
        onClick={onClick}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-stone-100 flex-shrink-0">
          <div
            className="aspect-square overflow-hidden"
            style={{ position: 'relative' }}
          >
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">
                🥩
              </div>
            )}
          </div>

          {/* Stock Badge */}
          {(typeof stock === 'string' ? parseFloat(stock) : stock) === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span
                className="text-white font-bold"
                style={{ fontSize: 14 }}
              >
                หมดสต็อก
              </span>
            </div>
          )}

          {/* Trending Badge */}
          {(reviews ?? 0) > 10 && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
              <TrendingUp size={12} />
              <span style={{ fontSize: 11, fontWeight: 700 }}>ฮิต</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Seller */}
          <p
            className="text-orange-600 font-bold mb-1"
            style={{ fontSize: 11 }}
          >
            {seller}
          </p>

          {/* Product Name */}
          <h3
            className="text-stone-800 font-bold line-clamp-2 flex-1 mb-2"
            style={{ fontSize: 14, lineHeight: 1.3 }}
          >
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <span style={{ fontSize: 12, color: '#F97316' }}>⭐</span>
            <span
              className="text-stone-600 font-bold"
              style={{ fontSize: 11 }}
            >
              {rating?.toFixed(1)}
            </span>
            {reviews !== undefined && reviews > 0 && (
              <span
                className="text-stone-400"
                style={{ fontSize: 10 }}
              >
                ({reviews})
              </span>
            )}
          </div>

          {/* Price */}
          <p className="text-orange-600 font-bold mb-3" style={{ fontSize: 16 }}>
            ฿{price.toLocaleString()}
            <span
              className="text-stone-400 font-normal"
              style={{ fontSize: 12 }}
            >
              {' '}
              /กก.
            </span>
          </p>

          {/* Add to Cart Button */}
          <button
            onClick={onAddCart}
            disabled={(typeof stock === 'string' ? parseFloat(stock) : stock) === 0 || adding}
            className={`
              w-full py-2.5 rounded-xl font-bold transition-all duration-200
              flex items-center justify-center gap-2 active:scale-95
              ${
                (typeof stock === 'string' ? parseFloat(stock) : stock) === 0 || adding
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:shadow-lg hover:shadow-orange-200'
              }
            `}
            style={{ fontSize: 12 }}
          >
            {adding ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>กำลังเพิ่ม...</span>
              </>
            ) : (
              <>
                <ShoppingCart size={14} />
                <span>เพิ่มตะกร้า</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
