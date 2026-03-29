/*
MODULE_CONTRACT: Verify the product modal fetches, refetches, and stays idle when no product id is provided.
SCOPE: Vue Test Utils rendering, fetch mocking, and sort interaction coverage only.
DEPENDS: vitest, @vue/test-utils, vue, ./ProductModal.vue, @/entities/product
LINKS: [ProductModal][watchProductId][BLOCK_FETCH_ON_ID_CHANGE]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_MODULE
Module-local tests for the product modal widget.
END_BLOCK_MODULE
START_BLOCK_FETCH_ON_ID_CHANGE
Verify the product id watcher does not fetch on null ids and does fetch when a product id appears.
END_BLOCK_FETCH_ON_ID_CHANGE
CHANGE_SUMMARY: Adds coverage for the null-id guard, the initial detail fetch, and refetching after sort changes.
*/
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchProductById: vi.fn(),
}));

vi.mock('@/entities/product', () => ({
  fetchProductById: mocks.fetchProductById,
}));

import { ProductModal } from './index';

beforeEach(() => {
  mocks.fetchProductById.mockReset();
  vi.restoreAllMocks();
});

describe('ProductModal', () => {
  it('sends no request when productId is null', async () => {
    const wrapper = mount(ProductModal, {
      props: {
        productId: null,
      },
    });

    await flushPromises();

    expect(mocks.fetchProductById).not.toHaveBeenCalled();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it('fetches details when productId is set', async () => {
    mocks.fetchProductById.mockResolvedValueOnce({
      id: 'product-1',
      name: 'Alpha',
      image_url: null,
      attributes: [
        { key: 'material', value: 'steel' },
      ],
      offers: [
        {
          id: 'offer-1',
          seller: {
            name: 'Поставщик 1',
            rating: 4.9,
          },
          price: {
            amount: 1899,
            currency: 'RUB',
          },
          delivery_date: '2026-04-05',
        },
      ],
    });

    const wrapper = mount(ProductModal, {
      props: {
        productId: null,
      },
    });

    await wrapper.setProps({
      productId: 'product-1',
    });
    await flushPromises();

    expect(mocks.fetchProductById).toHaveBeenCalledTimes(1);
    expect(mocks.fetchProductById).toHaveBeenCalledWith('product-1', 'price');
    expect(wrapper.text()).toContain('Alpha');
    expect(wrapper.text()).toContain('Изображение отсутствует');
    expect(wrapper.text()).toContain('material');
    expect(wrapper.text()).toContain('steel');
    expect(wrapper.text()).toContain('Поставщик 1');
  });

  it('re-fetches on sort changes', async () => {
    mocks.fetchProductById
      .mockResolvedValueOnce({
        id: 'product-1',
        name: 'Alpha',
        image_url: 'https://cdn.test/image.jpg',
        attributes: [],
        offers: [
          {
            id: 'offer-1',
            seller: {
              name: 'Поставщик 1',
              rating: 4.9,
            },
            price: {
              amount: 1899,
              currency: 'RUB',
            },
            delivery_date: '2026-04-05',
          },
        ],
      })
      .mockResolvedValueOnce({
        id: 'product-1',
        name: 'Alpha',
        image_url: 'https://cdn.test/image.jpg',
        attributes: [],
        offers: [
          {
            id: 'offer-2',
            seller: {
              name: 'Поставщик 2',
              rating: 4.7,
            },
            price: {
              amount: 1799,
              currency: 'RUB',
            },
            delivery_date: '2026-04-06',
          },
        ],
      });

    const wrapper = mount(ProductModal, {
      props: {
        productId: 'product-1',
      },
    });

    await flushPromises();
    expect(mocks.fetchProductById).toHaveBeenCalledTimes(1);

    const sortButtons = wrapper.findAll('button').filter((button) => {
      return button.text() === 'По дате доставки';
    });

    expect(sortButtons).toHaveLength(1);

    await sortButtons[0].trigger('click');
    await flushPromises();

    expect(mocks.fetchProductById).toHaveBeenCalledTimes(2);
    expect(mocks.fetchProductById).toHaveBeenNthCalledWith(1, 'product-1', 'price');
    expect(mocks.fetchProductById).toHaveBeenNthCalledWith(2, 'product-1', 'delivery_date');
    expect(wrapper.text()).toContain('Поставщик 2');
  });
});
