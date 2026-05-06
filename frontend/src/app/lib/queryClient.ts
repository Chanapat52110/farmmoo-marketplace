import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient — single instance for the entire app.
 *
 * Defaults:
 *   staleTime  30s  — data is "fresh" for 30s; no background refetch inside this window
 *   gcTime     5min — inactive query data is kept in memory for 5 minutes (avoids
 *                     redundant requests when user navigates back to a page)
 *   retry      1    — retry once on failure before surfacing the error
 *   refetchOnWindowFocus true (React Query default) — refresh data when tab regains focus
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});
