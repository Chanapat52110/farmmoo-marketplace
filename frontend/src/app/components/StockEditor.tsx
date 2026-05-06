import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../services/product.service';

interface StockEditorProps {
  product: Product;
  onSave: (stock: number) => Promise<void>;
}

export function StockEditor({ product, onSave }: StockEditorProps) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(product.stock));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const n = parseFloat(val);
    if (isNaN(n) || n < 0) return;
    setSaving(true);
    try {
      await onSave(n);
      setEditing(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    const stockVal = parseFloat(product.stock);
    return (
      <button
        onClick={() => {
          setVal(String(product.stock));
          setEditing(true);
        }}
        className="flex items-center gap-1 rounded-xl px-2 py-1 active:bg-stone-100 transition"
        style={{
          fontSize: 11,
          fontWeight: 600,
          color:
            stockVal === 0
              ? '#B91C1C'
              : stockVal <= 5
                ? '#EA580C'
                : '#166534',
          background:
            stockVal === 0
              ? '#FEF2F2'
              : stockVal <= 5
                ? '#FFEDD5'
                : '#F0FDF4',
        }}
      >
        {stockVal === 0 ? 'หมด' : `${product.stock} กก.`}
        <Pencil size={10} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={0}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-16 bg-stone-50 border border-stone-300 rounded-lg px-2 py-1 outline-none focus:border-orange-400"
        style={{ fontSize: 13 }}
        autoFocus
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center hover:bg-green-200 transition disabled:opacity-40"
      >
        {saving ? (
          <span className="w-3 h-3 border-2 border-green-400 border-t-green-700 rounded-full animate-spin" />
        ) : (
          <Check size={13} className="text-green-700" />
        )}
      </button>
      <button
        onClick={() => setEditing(false)}
        className="w-7 h-7 bg-stone-100 rounded-lg flex items-center justify-center hover:bg-stone-200 transition"
      >
        <X size={13} className="text-stone-500" />
      </button>
    </div>
  );
}
