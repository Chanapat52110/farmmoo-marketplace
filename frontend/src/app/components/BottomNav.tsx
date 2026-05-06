import { useNavigate, useLocation } from 'react-router';
import { Home, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

const NAV_ITEMS = [
  { path: '/', label: 'หน้าหลัก', Icon: Home },
  { path: '/cart', label: 'ตะกร้า', Icon: ShoppingCart },
  { path: '/orders', label: 'คำสั่งซื้อ', Icon: ClipboardList },
  { path: '/profile', label: 'โปรไฟล์', Icon: User },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useCart();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-stone-200"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.08)' }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        {/* Brand */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 shrink-0 transition-opacity active:opacity-70"
        >
          <span style={{ fontSize: 26 }}>🐷</span>
          <span
            className="hidden sm:inline font-bold text-stone-800"
            style={{ fontSize: 17, fontFamily: 'Sarabun, sans-serif' }}
          >
            หมูไทยมาร์เก็ต
          </span>
        </button>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5">
          {NAV_ITEMS.map(({ path, label, Icon }) => {
            const isActive = path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path);
            const isCart = path === '/cart';

            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl relative transition-colors duration-150 active:scale-95 ${
                  isActive
                    ? 'text-orange-500 bg-orange-50'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  {isCart && cartCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white rounded-full min-w-4 h-4 flex items-center justify-center px-0.5"
                      style={{ fontSize: 10, fontWeight: 700, lineHeight: 1 }}
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <span
                  className="hidden sm:inline"
                  style={{ fontSize: 14, fontWeight: isActive ? 700 : 500, fontFamily: 'Sarabun, sans-serif' }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
