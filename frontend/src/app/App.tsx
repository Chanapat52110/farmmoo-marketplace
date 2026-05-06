import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { queryClient } from './lib/queryClient';
import { router } from './routes';

export default function App() {
  return (
    // ErrorBoundary is outermost: catches any crash in the entire tree and shows
    // a graceful fallback instead of a blank white screen.
    <ErrorBoundary>
      {/* QueryClientProvider must wrap AuthProvider/CartProvider so hooks like
          useQuery work in all contexts and components. */}
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
