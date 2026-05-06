import { useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { listProducts, type Product } from '../services/product.service';

export const PRODUCTS_QUERY_KEY = 'products' as const;

interface UseProductsOptions {
  /** Server-side search string (debounce in the caller for best UX). */
  search?: string;
  /** Auto-refetch interval in ms. 0 = disabled. */
  pollIntervalMs?: number;
  /** Refetch when the browser window regains focus. Default: true. */
  refreshOnFocus?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { search = '', pollIntervalMs = 0, refreshOnFocus = true } = options;
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    // search is part of the query key so changing it creates a fresh query/cache entry.
    queryKey: [PRODUCTS_QUERY_KEY, { search }],
    queryFn: ({ pageParam }) =>
      listProducts({ page: pageParam as number, page_size: 20, search: search || undefined }),
    getNextPageParam: (lastPage) => (lastPage.has_next ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
    staleTime: 20_000,
    // React Query converts 0 → false automatically, so pollIntervalMs=0 disables polling.
    refetchInterval: pollIntervalMs > 0 ? pollIntervalMs : false,
    refetchOnWindowFocus: refreshOnFocus,
  });

  // Flatten all loaded pages into a single array for consumers.
  const products: Product[] = data?.pages.flatMap((p) => p.results) ?? [];
  const totalCount = data?.pages[0]?.count ?? 0;

  // When an order is placed, stock levels change — invalidate the product cache.
  useEffect(() => {
    const onOrderCreated = () => {
      void queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
    };
    window.addEventListener('order:created', onOrderCreated as EventListener);
    return () => window.removeEventListener('order:created', onOrderCreated as EventListener);
  }, [queryClient]);

  return {
    products,
    loading: isLoading,
    error: error instanceof Error ? error.message : error ? 'โหลดสินค้าไม่สำเร็จ' : '',
    refresh: refetch,
    /** True when there are more pages available — show "Load More" button when true. */
    hasMore: hasNextPage ?? false,
    /** Call to fetch the next page and append to `products`. */
    loadMore: fetchNextPage,
    /** True while the next page is loading (not the initial load). */
    loadingMore: isFetchingNextPage,
    totalCount,
  };
}
