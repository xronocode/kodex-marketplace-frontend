/*
MODULE_CONTRACT: Verify the product card widget render behavior and select emission.
SCOPE: Vue Test Utils render and click assertions only.
DEPENDS: ./ProductCard.vue, vitest, @vue/test-utils
LINKS: [ProductCard][render][BLOCK_RENDER_CARD]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_RENDER_CARD
Test the product card rendering and selection contract without introducing catalog orchestration.
END_BLOCK_RENDER_CARD
CHANGE_SUMMARY: Adds coverage for product summary rendering, thumbnail fallback, and select emission with the product id.
*/
import { mount } from '@vue/test-utils';
import { describe, expect, it, expectTypeOf } from 'vitest';

import { formatDate, formatPrice } from '@/shared/lib';
import type { ProductListItem } from '@/entities/product';

import ProductCard from './ProductCard.vue';

describe('ProductCard', () => {
  it('exposes the product prop contract', () => {
    expectTypeOf<InstanceType<typeof ProductCard>['$props']>().toMatchTypeOf<{
      product: ProductListItem;
    }>();
  });

  it('renders price, stock, nearest delivery, and emits the product id on click', async () => {
    const product: ProductListItem = {
      id: 'prod-42',
      name: 'Беспроводные наушники',
      nearest_delivery_date: '2026-04-15',
      price: {
        amount: 15990,
        currency: 'RUB',
      },
      stock: 7,
      thumbnail_url: null,
    };

    const wrapper = mount(ProductCard, {
      props: {
        product,
      },
    });

    expect(wrapper.text()).toContain('Беспроводные наушники');
    expect(wrapper.text()).toContain(formatPrice(15990, 'RUB'));
    expect(wrapper.text()).toContain('В наличии: 7 шт.');
    expect(wrapper.text()).toContain(`Ближайшая доставка: ${formatDate('2026-04-15')}`);
    expect(wrapper.text()).toContain('Нет изображения');
    expect(wrapper.find('img').exists()).toBe(false);

    await wrapper.get('button').trigger('click');

    expect(wrapper.emitted('select')).toEqual([['prod-42']]);
  });
});
