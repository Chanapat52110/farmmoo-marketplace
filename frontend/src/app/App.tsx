import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Sarabun, sans-serif',
              fontSize: 14,
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}
