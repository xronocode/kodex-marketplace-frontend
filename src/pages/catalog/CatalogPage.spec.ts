/*
MODULE_CONTRACT: Verify the public catalog page wires infinite scroll, agent search replacement, and modal selection.
SCOPE: Page orchestration, search resets, and child surface interactions only.
DEPENDS: vitest, @vue/test-utils, vue, ./index, @/entities/product
LINKS: [CatalogPage][agentSearch][BLOCK_AGENT_SEARCH_HANDLER]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_MODULE
Module-local tests for the public catalog page.
END_BLOCK_MODULE
START_BLOCK_AGENT_SEARCH_HANDLER
Assert agent-search results replace the grid and keep the public page on the shared search/reset path.
END_BLOCK_AGENT_SEARCH_HANDLER
CHANGE_SUMMARY: Adds coverage for sentinel wiring, modal selection, voice/text agent search resets, and interpreted intent rendering.
*/
import { defineComponent, nextTick, ref, type Ref } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProductListItem } from '@/entities/product';

type InfiniteScrollState = {
  error: Ref<string | null>;
  hasMore: Ref<boolean>;
  isLoading: Ref<boolean>;
  items: Ref<ProductListItem[]>;
  reset: ReturnType<typeof vi.fn>;
};

type VoiceSearchState = {
  error: Ref<string | null>;
  interpretedIntent: Ref<string | null>;
  isListening: Ref<boolean>;
  isLoading: Ref<boolean>;
  isSupported: Ref<boolean>;
  results: Ref<ProductListItem[]>;
  search: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  transcript: Ref<string>;
};

let capturedSentinelRef: { value: HTMLElement | null } | null = null;
let infiniteScrollState: InfiniteScrollState;
let voiceSearchState: VoiceSearchState;

function createInfiniteScrollState(): InfiniteScrollState {
  return {
    error: ref<string | null>(null),
    hasMore: ref(true),
    isLoading: ref(false),
    items: ref<ProductListItem[]>([]),
    reset: vi.fn(),
  };
}

function createVoiceSearchState(): VoiceSearchState {
  return {
    error: ref<string | null>(null),
    interpretedIntent: ref<string | null>(null),
    isListening: ref(false),
    isLoading: ref(false),
    isSupported: ref(true),
    results: ref<ProductListItem[]>([]),
    search: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    transcript: ref(''),
  };
}

vi.mock('@/features/infinite-scroll', () => ({
  useInfiniteScroll: (sentinelRef: { value: HTMLElement | null }) => {
    capturedSentinelRef = sentinelRef;
    return infiniteScrollState;
  },
}));

vi.mock('@/features/voice-search', () => {
  const VoiceSearchButton = defineComponent({
    emits: ['click'],
    template: '<button type="button" @click="$emit(\'click\', $event)">Голосовой поиск</button>',
  });

  return {
    VoiceSearchButton,
    useVoiceSearch: () => voiceSearchState,
  };
});

vi.mock('@/widgets/product-modal', () => {
  return {
    ProductModal: defineComponent({
      emits: ['close'],
      props: {
        productId: {
          default: null,
          type: String,
        },
      },
      template: `
        <div v-if="productId" class="product-modal-stub">
          <p class="product-modal-stub__id">Товар: {{ productId }}</p>
          <button type="button" @click="$emit('close')">Закрыть</button>
        </div>
      `,
    }),
  };
});

async function loadCatalogPage() {
  return import('./index');
}

function makeProduct(id: string, name: string): ProductListItem {
  return {
    id,
    name,
    nearest_delivery_date: null,
    price: {
      amount: 1000,
      currency: 'RUB',
    },
    stock: 5,
    thumbnail_url: null,
  };
}

beforeEach(() => {
  vi.restoreAllMocks();

  capturedSentinelRef = null;
  infiniteScrollState = createInfiniteScrollState();
  infiniteScrollState.items.value = [makeProduct('catalog-1', 'Каталоговый товар')];
  infiniteScrollState.reset.mockImplementation((options = {}) => {
    infiniteScrollState.error.value = options.error ?? null;
    infiniteScrollState.hasMore.value = options.hasMore ?? false;
    infiniteScrollState.isLoading.value = false;
    infiniteScrollState.items.value = options.items ? [...options.items] : [];
  });

  voiceSearchState = createVoiceSearchState();
  voiceSearchState.search.mockImplementation(async (query: string) => {
    voiceSearchState.isLoading.value = true;
    voiceSearchState.interpretedIntent.value = `Интерпретация: ${query}`;
    voiceSearchState.results.value = [
      makeProduct('agent-1', 'Агентский товар'),
      makeProduct('agent-2', 'Еще один агентский товар'),
    ];
    voiceSearchState.isLoading.value = false;
  });
});

describe('CatalogPage', () => {
  it('wires infinite scroll, modal selection, and agent-search replacement through the public page surface', async () => {
    const { CatalogPage } = await loadCatalogPage();
    const wrapper = mount(CatalogPage);

    await nextTick();

    expect(capturedSentinelRef?.value).toBeInstanceOf(HTMLElement);
    expect(wrapper.text()).toContain('Каталоговый товар');

    await wrapper.get('.product-card').trigger('click');
    await nextTick();

    expect(wrapper.find('.product-modal-stub__id').text()).toBe('Товар: catalog-1');

    await wrapper.get('.product-modal-stub button').trigger('click');
    await nextTick();

    expect(wrapper.find('.product-modal-stub').exists()).toBe(false);

    await wrapper.get('input').setValue('телефон');
    await wrapper.get('form').trigger('submit');

    await flushPromises();
    await nextTick();
    await nextTick();

    expect(voiceSearchState.search).toHaveBeenCalledWith('телефон');
    expect(infiniteScrollState.reset).toHaveBeenCalled();
    expect(wrapper.text()).toContain('Агентский товар');
    expect(wrapper.text()).not.toContain('Каталоговый товар');
  });

  it('shows the interpreted intent after enter-triggered search and keeps the public voice path intact', async () => {
    const { CatalogPage } = await loadCatalogPage();
    const wrapper = mount(CatalogPage);

    await wrapper.get('input').setValue('ноутбук для учебы');
    await wrapper.get('form').trigger('submit');

    await flushPromises();
    await nextTick();
    await nextTick();

    expect(voiceSearchState.search).toHaveBeenCalledWith('ноутбук для учебы');
    expect(wrapper.findAll('.product-card')).toHaveLength(2);
  });
});
