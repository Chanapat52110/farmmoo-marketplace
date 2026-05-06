import { useState, useEffect } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploader } from './ImageUploader';
import type { Product, CreateProductPayload, UpdateProductPayload } from '../services/product.service';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (payload: CreateProductPayload | UpdateProductPayload) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ProductForm({
  product,
  onSubmit,
  onCancel,
  loading = false,
}: ProductFormProps) {
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        price: String(product.price),
        stock: String(product.stock),
        description: product.description || '',
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const price = parseFloat(form.price);
    const stock = parseFloat(form.stock);

    if (!form.name.trim()) return setError('กรุณากรอกชื่อสินค้า');
    if (isNaN(price) || price < 0) return setError('ราคาต้องเป็นตัวเลขที่ถูกต้อง');
    if (isNaN(stock) || stock < 0) return setError('สต็อกต้องเป็นตัวเลขที่ถูกต้อง');

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        price,
        stock,
        description: form.description.trim(),
        ...(image && { image }),
      };
      await onSubmit(payload);
      toast.success(
        product ? 'อัพเดทสินค้าสำเร็จ!' : 'เพิ่มสินค้าสำเร็จ!',
      );
      onCancel();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="bg-white rounded-3xl p-5 mb-5"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-stone-900" style={{ fontSize: 16, fontWeight: 700 }}>
          {product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
        </h2>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition"
        >
          <X size={16} className="text-stone-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <ImageUploader
          value={image}
          previewUrl={product?.image_url || undefined}
          onChange={setImage}
          label="รูปสินค้า"
          placeholder={
            product
              ? 'คลิกเพื่ออัพโหลดรูปใหม่'
              : 'คลิกเพื่ออัพโหลดรูปสินค้า'
          }
        />

        <div>
          <label
            className="block text-stone-700 mb-1.5"
            style={{ fontSize: 13, fontWeight: 600 }}
          >
            ชื่อสินค้า *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
            placeholder="เช่น สันคอหมูสด"
            className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 outline-none focus:border-orange-400 text-stone-800 transition"
            style={{ fontSize: 15 }}
            disabled={loading || isSubmitting}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="block text-stone-700 mb-1.5"
              style={{ fontSize: 13, fontWeight: 600 }}
            >
              ราคา (฿/กก.) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              placeholder="150"
              className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 outline-none focus:border-orange-400 text-stone-800 transition"
              style={{ fontSize: 15 }}
              disabled={loading || isSubmitting}
            />
          </div>
          <div>
            <label
              className="block text-stone-700 mb-1.5"
              style={{ fontSize: 13, fontWeight: 600 }}
            >
              สต็อก (กก.) *
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.stock}
              onChange={(e) =>
                setForm((f) => ({ ...f, stock: e.target.value }))
              }
              placeholder="10"
              className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 outline-none focus:border-orange-400 text-stone-800 transition"
              style={{ fontSize: 15 }}
              disabled={loading || isSubmitting}
            />
          </div>
        </div>

        <div>
          <label
            className="block text-stone-700 mb-1.5"
            style={{ fontSize: 13, fontWeight: 600 }}
          >
            รายละเอียด{' '}
            <span className="text-stone-400 font-normal">(ไม่บังคับ)</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="รายละเอียดสินค้า เช่น ส่วนประกอบ ประโยชน์ วิธีจัดเก็บ ฯลฯ"
            rows={3}
            className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 outline-none focus:border-orange-400 text-stone-800 resize-none transition"
            style={{ fontSize: 14 }}
            disabled={loading || isSubmitting}
          />
        </div>

        {error && (
          <p
            className="bg-red-50 text-red-600 rounded-xl px-4 py-2.5"
            style={{ fontSize: 13 }}
          >
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || isSubmitting}
            className="flex-1 bg-orange-500 text-white rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-orange-600 active:bg-orange-700 transition"
            style={{ height: 52, fontSize: 15, fontWeight: 700 }}
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <PlusCircle size={17} />
                {product ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มสินค้า'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading || isSubmitting}
            className="px-6 bg-stone-100 text-stone-600 rounded-2xl hover:bg-stone-200 transition disabled:opacity-60"
            style={{ fontSize: 15, fontWeight: 700 }}
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}
