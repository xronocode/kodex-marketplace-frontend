/*
MODULE_CONTRACT: Provide IntersectionObserver-driven infinite scroll state for the public catalog.
SCOPE: Local page loading, observer wiring, deterministic reset handling, and state exposure only.
DEPENDS: vue, @/entities/product
LINKS: [InfiniteScroll][loadPage][BLOCK_LOAD_PAGE] [InfiniteScroll][observer][BLOCK_OBSERVER_SETUP]

MODULE_MAP:
- useInfiniteScroll - Public export declared in this module.
- InfiniteScrollState - Public export declared in this module.
- InfiniteScrollResetOptions - Public export declared in this module.
CONTRACT:
PURPOSE: Execute the composable behavior described by MODULE_CONTRACT.
INPUTS: Function parameters plus reactive, browser, or transport dependencies declared in this module.
OUTPUTS: Reactive state objects and helper functions returned by the composable.
SIDE_EFFECTS: Reactive state mutation, browser API access, and optional HTTP calls.
START_BLOCK_MODULE
Public infinite-scroll composable contract for catalog pagination.
END_BLOCK_MODULE
START_BLOCK_LOAD_PAGE
[InfiniteScroll][loadPage][BLOCK_LOAD_PAGE] Load the next catalog page and merge it into local state.
END_BLOCK_LOAD_PAGE
START_BLOCK_OBSERVER_SETUP
[InfiniteScroll][observer][BLOCK_OBSERVER_SETUP] Wire the sentinel ref to intersection-driven loading.
END_BLOCK_OBSERVER_SETUP
CHANGE_SUMMARY: Adds a catalog infinite-scroll composable with guarded paging, observer lifecycle management, and deterministic reset behavior.
*/
import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';

import { fetchProducts, type ProductListItem } from '@/entities/product';

export type InfiniteScrollResetOptions = {
  cursor?: string | null;
  error?: string | null;
  hasMore?: boolean;
  items?: ProductListItem[];
};

export interface InfiniteScrollState {
  error: Ref<string | null>;
  hasMore: Ref<boolean>;
  isLoading: Ref<boolean>;
  items: Ref<ProductListItem[]>;
  reset: (options?: InfiniteScrollResetOptions) => void;
}

const DEFAULT_PAGE_SIZE = 20;

export function useInfiniteScroll(sentinelRef: Ref<HTMLElement | null>): InfiniteScrollState {
  const items = ref<ProductListItem[]>([]);
  const isLoading = ref(false);
  const hasMore = ref(true);
  const error = ref<string | null>(null);
  const cursor = ref<string | undefined>(undefined);
  const observer = ref<IntersectionObserver | null>(null);
  let requestToken = 0;

  function teardownObserver(): void {
    observer.value?.disconnect();
    observer.value = null;
  }

  function syncObserver(): void {
    // [InfiniteScroll][observer][BLOCK_OBSERVER_SETUP]
    teardownObserver();

    if (!hasMore.value) {
      return;
    }

    const sentinel = sentinelRef.value;
    if (!sentinel || typeof IntersectionObserver === 'undefined') {
      return;
    }

    observer.value = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        void loadPage();
      }
    });
    observer.value.observe(sentinel);
  }

  async function loadPage(): Promise<void> {
    // [InfiniteScroll][loadPage][BLOCK_LOAD_PAGE]
    if (isLoading.value || !hasMore.value) {
      return;
    }

    const token = requestToken;
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetchProducts(cursor.value, DEFAULT_PAGE_SIZE);

      if (token !== requestToken) {
        return;
      }

      items.value = [...items.value, ...response.data.items];
      cursor.value = response.data.next_cursor ?? undefined;
      hasMore.value = response.data.next_cursor !== null;
    } catch {
      if (token !== requestToken) {
        return;
      }

      error.value = 'Не удалось загрузить товары';
    } finally {
      if (token === requestToken) {
        isLoading.value = false;
      }
    }
  }

  function reset(options: InfiniteScrollResetOptions = {}): void {
    // External replacement results clear pagination and stop paging by default.
    requestToken += 1;
    items.value = options.items ? [...options.items] : [];
    cursor.value = options.cursor === undefined ? undefined : options.cursor ?? undefined;
    hasMore.value = options.hasMore ?? false;
    error.value = options.error ?? null;
    isLoading.value = false;
    syncObserver();
  }

  watch([sentinelRef, hasMore], syncObserver, { immediate: true });

  onMounted(() => {
    console.log('[useInfiniteScroll] onMounted - loading first page');
    void loadPage();
  });

  onBeforeUnmount(() => {
    requestToken += 1;
    teardownObserver();
  });

  return {
    error,
    hasMore,
    isLoading,
    items,
    reset,
  };
}
