import { useState } from 'react';
import { Trash2, Edit2, ChevronDown } from 'lucide-react';
import type { Product } from '../services/product.service';
import { StockEditor } from './StockEditor';
import { motion, AnimatePresence } from 'motion/react';

interface ProductTableProps {
  products: Product[];
  loading?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (id: number) => Promise<void>;
  onUpdateStock?: (id: number, stock: number) => Promise<void>;
  deletingId?: number | null;
}

export function ProductTable({
  products,
  loading,
  onEdit,
  onDelete,
  onUpdateStock,
  deletingId,
}: ProductTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((k) => (
          <div key={k} className="bg-white rounded-2xl p-4 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center gap-3">
        <span style={{ fontSize: 48 }}>📦</span>
        <p className="text-stone-600" style={{ fontSize: 15, fontWeight: 600 }}>
          ยังไม่มีสินค้า
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Desktop header */}
      <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 bg-stone-50 rounded-2xl" style={{ fontSize: 12, fontWeight: 700, color: '#78716C' }}>
        <div className="col-span-5">สินค้า</div>
        <div className="col-span-2 text-right">ราคา</div>
        <div className="col-span-2 text-center">สต็อก</div>
        <div className="col-span-3 text-right">การกระทำ</div>
      </div>

      {/* Product rows */}
      {products.map((product) => (
        <motion.div
          key={product.id}
          layout
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
        >
          {/* Mobile & Tablet view */}
          <button
            onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
            className="w-full sm:hidden p-4 flex items-center gap-3 hover:bg-stone-50 transition"
          >
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span style={{ fontSize: 24 }}>🥩</span>
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-stone-800 truncate" style={{ fontSize: 14, fontWeight: 700 }}>
                {product.name}
              </p>
              <p className="text-orange-500 text-sm" style={{ fontWeight: 700 }}>
                ฿{parseFloat(product.price).toLocaleString()}/กก.
              </p>
            </div>
            <ChevronDown
              size={16}
              className="text-stone-400 shrink-0 transition"
              style={{
                transform: expandedId === product.id ? 'rotate(180deg)' : 'none',
              }}
            />
          </button>

          {/* Desktop row */}
          <div className="hidden sm:grid grid-cols-12 gap-3 p-4 items-center hover:bg-stone-50 transition">
            <div className="col-span-5 flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span style={{ fontSize: 24 }}>🥩</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-stone-800 truncate" style={{ fontSize: 13, fontWeight: 700 }}>
                  {product.name}
                </p>
                <p className="text-stone-500 text-xs truncate">
                  {typeof product.description === 'string' && product.description
                    ? product.description.substring(0, 30)
                    : 'ไม่มีรายละเอียด'}
                </p>
              </div>
            </div>
            <div className="col-span-2 text-right" style={{ fontSize: 13, fontWeight: 700 }}>
              ฿{parseFloat(product.price).toLocaleString()}
            </div>
            <div className="col-span-2 text-center">
              <StockEditor
                product={product}
                onSave={(stock) => onUpdateStock?.(product.id, stock) ?? Promise.resolve()}
              />
            </div>
            <div className="col-span-3 flex items-center justify-end gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(product)}
                  className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition"
                >
                  <Edit2 size={14} className="text-blue-500" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(product.id)}
                  disabled={deletingId === product.id}
                  className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center disabled:opacity-40 hover:bg-red-100 transition"
                >
                  {deletingId === product.id ? (
                    <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={14} className="text-red-500" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Mobile expanded view */}
          <AnimatePresence>
            {expandedId === product.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="sm:hidden border-t border-stone-100 p-4 bg-stone-50 space-y-3"
              >
                <div className="flex justify-between">
                  <span className="text-stone-500" style={{ fontSize: 12 }}>สต็อก</span>
                  <StockEditor
                    product={product}
                    onSave={(stock) => onUpdateStock?.(product.id, stock) ?? Promise.resolve()}
                  />
                </div>
                {product.description && (
                  <div>
                    <span className="text-stone-500" style={{ fontSize: 12 }}>รายละเอียด</span>
                    <p className="text-stone-700 mt-1" style={{ fontSize: 13 }}>
                      {product.description}
                    </p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(product)}
                      className="flex-1 py-2 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center gap-1.5"
                      style={{ fontSize: 12, fontWeight: 700 }}
                    >
                      <Edit2 size={12} /> แก้ไข
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 flex items-center justify-center gap-1.5 disabled:opacity-40"
                      style={{ fontSize: 12, fontWeight: 700 }}
                    >
                      <Trash2 size={12} /> ลบ
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
