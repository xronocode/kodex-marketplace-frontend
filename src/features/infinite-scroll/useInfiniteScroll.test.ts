/*
MODULE_CONTRACT: Verify the infinite-scroll composable contract for catalog pagination.
SCOPE: First-page loading, intersection-triggered paging, concurrency suppression, and reset determinism.
DEPENDS: vue, @vue/test-utils, vitest, ./useInfiniteScroll
LINKS: [InfiniteScroll][loadPage][BLOCK_LOAD_PAGE] [InfiniteScroll][observer][BLOCK_OBSERVER_SETUP]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_MODULE
Module-local tests for the infinite-scroll composable.
END_BLOCK_MODULE
START_BLOCK_FIRST_PAGE
Assert the first page is loaded on mount.
END_BLOCK_FIRST_PAGE
START_BLOCK_INTERSECTION
Assert later pages only load after the sentinel intersects.
END_BLOCK_INTERSECTION
START_BLOCK_CONCURRENCY
Assert concurrent load attempts are suppressed while a request is in flight.
END_BLOCK_CONCURRENCY
START_BLOCK_RESET
Assert reset clears state deterministically and invalidates stale responses.
END_BLOCK_RESET
CHANGE_SUMMARY: Adds composable coverage for mount-time loading, observer-driven paging, in-flight request suppression, and reset handling.
*/
import { defineComponent, nextTick, ref } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchProducts: vi.fn(),
}));

vi.mock('@/entities/product', () => ({
  fetchProducts: mocks.fetchProducts,
}));

type ProductListItem = {
  id: string;
  name: string;
  nearest_delivery_date: string | null;
  price: {
    amount: number;
    currency: string;
  };
  stock: number;
  thumbnail_url: string | null;
};

type LoadResponse = {
  data: {
    items: ProductListItem[];
    next_cursor: string | null;
  };
  totalCount: number;
};

type ScrollVm = {
  error: string | null;
  hasMore: boolean;
  isLoading: boolean;
  items: ProductListItem[];
  reset: (options?: {
    cursor?: string | null;
    error?: string | null;
    hasMore?: boolean;
    items?: ProductListItem[];
  }) => void;
};

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly callback: IntersectionObserverCallback;

  observed = new Set<Element>();

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  disconnect = vi.fn(() => {
    this.observed.clear();
  });

  observe = vi.fn((element: Element) => {
    this.observed.add(element);
  });

  unobserve = vi.fn((element: Element) => {
    this.observed.delete(element);
  });

  trigger(isIntersecting = true): void {
    const target = this.observed.values().next().value ?? document.createElement('div');

    this.callback([
      {
        isIntersecting,
        target,
      } as IntersectionObserverEntry,
    ], this as unknown as IntersectionObserver);
  }
}

async function loadModule() {
  return import('./useInfiniteScroll');
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

async function mountHarness(sentinelRef = ref<HTMLElement | null>(document.createElement('div'))) {
  const { useInfiniteScroll } = await loadModule();

  const Harness = defineComponent({
    setup() {
      return useInfiniteScroll(sentinelRef);
    },
    template: '<div />',
  });

  const wrapper = mount(Harness);
  return { sentinelRef, wrapper };
}

beforeEach(() => {
  mocks.fetchProducts.mockReset();
  MockIntersectionObserver.instances = [];
  vi.unstubAllGlobals();
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver as unknown as typeof IntersectionObserver);
});

describe('useInfiniteScroll', () => {
  it('loads the first page on mount', async () => {
    mocks.fetchProducts.mockResolvedValue({
      data: {
        items: [
          {
            id: 'product-1',
            name: 'Alpha',
            nearest_delivery_date: null,
            price: { amount: 100, currency: 'RUB' },
            stock: 3,
            thumbnail_url: null,
          },
        ],
        next_cursor: 'cursor-2',
      },
      totalCount: 1,
    } satisfies LoadResponse);

    const sentinelRef = ref<HTMLElement | null>(document.createElement('div'));
    const { wrapper } = await mountHarness(sentinelRef);
    const vm = wrapper.vm as unknown as ScrollVm;

    await flushPromises();
    await nextTick();

    expect(mocks.fetchProducts).toHaveBeenCalledTimes(1);
    expect(mocks.fetchProducts).toHaveBeenNthCalledWith(1, undefined, 20);
    expect(vm.items).toEqual([
      {
        id: 'product-1',
        name: 'Alpha',
        nearest_delivery_date: null,
        price: { amount: 100, currency: 'RUB' },
        stock: 3,
        thumbnail_url: null,
      },
    ]);
    expect(vm.isLoading).toBe(false);
    expect(vm.hasMore).toBe(true);
    expect(vm.error).toBeNull();
  });

  it('exposes a stable user-renderable error message on request failure', async () => {
    mocks.fetchProducts.mockRejectedValueOnce(new Error('network down'));

    const { wrapper } = await mountHarness();
    const vm = wrapper.vm as unknown as ScrollVm;

    await flushPromises();
    await nextTick();

    expect(vm.error).toBe('Не удалось загрузить товары');
    expect(vm.isLoading).toBe(false);
  });

  it('loads later pages only when the sentinel intersects', async () => {
    mocks.fetchProducts
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              id: 'product-1',
              name: 'Alpha',
              nearest_delivery_date: null,
              price: { amount: 100, currency: 'RUB' },
              stock: 3,
              thumbnail_url: null,
            },
          ],
          next_cursor: 'cursor-2',
        },
        totalCount: 2,
      } satisfies LoadResponse)
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              id: 'product-2',
              name: 'Beta',
              nearest_delivery_date: null,
              price: { amount: 150, currency: 'RUB' },
              stock: 4,
              thumbnail_url: null,
            },
          ],
          next_cursor: null,
        },
        totalCount: 2,
      } satisfies LoadResponse);

    const { wrapper } = await mountHarness();
    const vm = wrapper.vm as unknown as ScrollVm;

    await flushPromises();
    await nextTick();

    expect(mocks.fetchProducts).toHaveBeenCalledTimes(1);

    const observer = MockIntersectionObserver.instances[0];
    expect(observer).toBeDefined();
    expect(observer.observe).toHaveBeenCalledTimes(1);

    observer.trigger(true);
    await flushPromises();
    await nextTick();

    expect(mocks.fetchProducts).toHaveBeenCalledTimes(2);
    expect(mocks.fetchProducts).toHaveBeenNthCalledWith(2, 'cursor-2', 20);
    expect(vm.items).toHaveLength(2);
    expect(vm.hasMore).toBe(false);
  });

  it('suppresses concurrent load attempts while a request is in flight', async () => {
    const firstPage = deferred<LoadResponse>();

    mocks.fetchProducts
      .mockReturnValueOnce(firstPage.promise);

    await mountHarness();
    const observer = MockIntersectionObserver.instances[0];

    observer.trigger(true);
    expect(mocks.fetchProducts).toHaveBeenCalledTimes(1);

    firstPage.resolve({
      data: {
        items: [
          {
            id: 'product-1',
            name: 'Alpha',
            nearest_delivery_date: null,
            price: { amount: 100, currency: 'RUB' },
            stock: 3,
            thumbnail_url: null,
          },
        ],
        next_cursor: 'cursor-2',
      },
      totalCount: 2,
    });

    await flushPromises();
    await nextTick();

    expect(mocks.fetchProducts).toHaveBeenCalledTimes(1);
  });

  it('resets deterministically and ignores stale responses', async () => {
    const firstPage = deferred<LoadResponse>();
    mocks.fetchProducts.mockReturnValueOnce(firstPage.promise);

    const { wrapper } = await mountHarness();
    const vm = wrapper.vm as unknown as ScrollVm;

    expect(vm.isLoading).toBe(true);
    vm.reset();

    expect(vm.items).toEqual([]);
    expect(vm.hasMore).toBe(false);
    expect(vm.isLoading).toBe(false);
    expect(vm.error).toBeNull();

    firstPage.resolve({
      data: {
        items: [
          {
            id: 'product-1',
            name: 'Alpha',
            nearest_delivery_date: null,
            price: { amount: 100, currency: 'RUB' },
            stock: 3,
            thumbnail_url: null,
          },
        ],
        next_cursor: 'cursor-2',
      },
      totalCount: 1,
    });

    await flushPromises();
    await nextTick();

    expect(vm.items).toEqual([]);
    expect(vm.hasMore).toBe(false);
    expect(vm.isLoading).toBe(false);
    expect(mocks.fetchProducts).toHaveBeenCalledTimes(1);
  });
});
