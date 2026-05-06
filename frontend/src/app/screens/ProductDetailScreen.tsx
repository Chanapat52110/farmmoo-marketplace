import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ChevronLeft, ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getProduct, type Product } from '../services/product.service';

export function ProductDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(0.1);

  useEffect(() => {
    const productId = Number(id);
    if (!productId) {
      setError('ไม่พบสินค้า');
      setLoading(false);
      return;
    }

    setLoading(true);
    getProduct(productId)
      .then(setProduct)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const outOfStock = !product || parseFloat(product.stock) <= 0 || product.status !== 'available';
  const totalPrice = useMemo(() => (product ? parseFloat(product.price) * quantity : 0), [product, quantity]);

  const handleAddToCart = () => {
    if (!product || outOfStock) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image_url ?? '',
        farmName: product.seller_name,
        unit: 'กก.',
      },
      quantity,
    );
    toast.success(`เพิ่ม ${quantity} กก. ลงตะกร้าแล้ว`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) {
    return <div className="min-h-screen" style={{ background: '#FFF8F0' }} />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-8" style={{ background: '#FFF8F0' }}>
        <p className="text-stone-700" style={{ fontSize: 18, fontWeight: 700 }}>ไม่พบสินค้า</p>
        <p className="text-stone-400 mt-1 mb-5" style={{ fontSize: 14 }}>{error || 'สินค้านี้อาจถูกลบออกแล้ว'}</p>
        <button onClick={() => navigate('/products')} className="bg-orange-500 text-white px-6 py-3 rounded-2xl">
          กลับไปเลือกสินค้า
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFF8F0' }}>
      <div className="relative" style={{ height: 280 }}>
        <ImageWithFallback src={product.image_url ?? ''} alt={product.name} className="w-full h-full object-cover" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-11 h-11 bg-white/90 rounded-full flex items-center justify-center">
          <ChevronLeft size={24} className="text-stone-700" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4 pb-24 space-y-4 w-full">
        <div>
          <h1 className="text-stone-900" style={{ fontSize: 22, fontWeight: 800 }}>{product.name}</h1>
          <p className="text-stone-500" style={{ fontSize: 13 }}>ผู้ขาย: {product.seller_name}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-orange-500" style={{ fontSize: 28, fontWeight: 800 }}>฿{parseFloat(product.price).toLocaleString()}</span>
            <span className="text-stone-400" style={{ fontSize: 14 }}>/ กก.</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <p className="text-stone-600 mb-3" style={{ fontSize: 13, fontWeight: 600 }}>จำนวน (กิโลกรัม)</p>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max={Math.floor((parseFloat(product.stock) || 1) * 10) / 10}
                value={quantity}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0.1;
                  setQuantity(Math.min(Math.max(v, 0.1), parseFloat(product.stock) || 9999));
                }}
                disabled={outOfStock}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #E7E5E4',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1C1917',
                }}
              />
              <p className="text-stone-400 text-center mt-2" style={{ fontSize: 11 }}>
                สต็อกเหลือ: {product.stock} กก.
              </p>
            </div>
            <div className="text-right">
              <p className="text-stone-500" style={{ fontSize: 12 }}>รวมทั้งหมด</p>
              <p className="text-orange-500" style={{ fontSize: 22, fontWeight: 800 }}>฿{totalPrice.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <p className="text-stone-800" style={{ fontSize: 15, fontWeight: 700 }}>รายละเอียดสินค้า</p>
          <p className="text-stone-600 mt-2" style={{ fontSize: 14, lineHeight: 1.7 }}>
            {product.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
          </p>
          <p className="text-stone-500 mt-2" style={{ fontSize: 12 }}>คงเหลือ: {product.stock} กก.</p>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-stone-100 px-4 py-3" style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.08)' }}>
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-orange-500 bg-white text-orange-500 disabled:opacity-40"
            style={{ height: 56, fontSize: 15, fontWeight: 700 }}
          >
            <ShoppingCart size={18} /> ใส่ตะกร้า
          </button>
          <button
            onClick={handleBuyNow}
            disabled={outOfStock}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-orange-500 text-white disabled:opacity-40"
            style={{ height: 56, fontSize: 15, fontWeight: 700 }}
          >
            <Zap size={18} /> ซื้อเลย
          </button>
        </div>
      </div>
    </div>
  );
}
