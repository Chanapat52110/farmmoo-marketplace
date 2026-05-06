import { useNavigate, useLocation } from 'react-router';
import { Home, ShoppingCart, User, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ModernBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const routes = [
    { path: '/', icon: Home, label: 'หน้าหลัก' },
    {
      path: '/products',
      icon: ShoppingCart,
      label: 'สินค้า',
    },
    ...(user?.role === 'seller'
      ? [{ path: '/dashboard', icon: LayoutGrid, label: 'แดชบอร์ด' }]
      : []),
    { path: '/profile', icon: User, label: 'โปรไฟล์' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-stone-100 sm:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {routes.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`
                flex-1 py-4 px-2 flex flex-col items-center gap-1 transition-colors
                ${
                  isActive
                    ? 'text-orange-500 border-t-4 border-orange-500'
                    : 'text-stone-500 border-t-4 border-transparent hover:text-orange-400'
                }
              `}
            >
              <Icon size={20} />
              <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
