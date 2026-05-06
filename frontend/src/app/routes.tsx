import { createBrowserRouter, Outlet } from 'react-router';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { ProductListScreen } from './screens/ProductListScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { CartScreen } from './screens/CartScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { OrderSuccessScreen } from './screens/OrderSuccessScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { OrderDetailScreen } from './screens/OrderDetailScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ShopDetailScreen } from './screens/ShopDetailScreen';

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFF8F0' }}>
      <BottomNav />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginScreen,
  },
  {
    path: '/register',
    Component: RegisterScreen,
  },
  {
    path: '/checkout',
    Component: CheckoutScreen,
  },
  {
    path: '/order-success',
    Component: OrderSuccessScreen,
  },
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomeScreen },
      { path: 'products', Component: ProductListScreen },
      { path: 'products/:id', Component: ProductDetailScreen },
      { path: 'shop/:id', Component: ShopDetailScreen },
      { path: 'cart', Component: CartScreen },
      { path: 'orders', Component: OrdersScreen },
      { path: 'orders/:id', Component: OrderDetailScreen },
      { path: 'profile', Component: ProfileScreen },
      { path: 'dashboard', Component: DashboardScreen },
    ],
  },
]);
