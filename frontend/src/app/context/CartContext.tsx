import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  farmName: string;
  unit: string;
}

// Bump CART_VERSION whenever CartItem shape changes to clear stale data on deploy.
const CART_STORAGE_KEY = 'farmmoo_cart';
const CART_VERSION = 1;

interface PersistedCart {
  version: number;
  items: CartItem[];
}

function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PersistedCart;
    // Version mismatch → discard stale cart rather than crash
    if (parsed.version !== CART_VERSION) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    // Corrupted JSON → start fresh
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
}

function saveCartToStorage(items: CartItem[]): void {
  try {
    const data: PersistedCart = { version: CART_VERSION, items };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage quota exceeded — fail silently; in-memory cart still works
  }
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, qty: number) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer reads from localStorage once on mount — no second render.
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());

  // Keep localStorage in sync whenever items change.
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  // Cross-tab sync: when another tab writes to CART_STORAGE_KEY, mirror the change here.
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        setItems(loadCartFromStorage());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, qty: number) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.id !== id));
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalPrice, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
