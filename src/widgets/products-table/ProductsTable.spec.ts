/*
MODULE_CONTRACT: Verify the admin products table widget render contract and action emits.
SCOPE: Vue Test Utils render and emit assertions only.
DEPENDS: ./ProductsTable.vue, @/entities/product
LINKS: [ProductsTable][actions][BLOCK_TABLE_ACTIONS]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_TABLE_ACTIONS
Test the admin products table without introducing external API or routing logic.
END_BLOCK_TABLE_ACTIONS
CHANGE_SUMMARY: Adds coverage for the admin table headers, Russian labels, and row action emits.
*/
import { mount } from '@vue/test-utils';
import { describe, expect, expectTypeOf, it } from 'vitest';

import type { AdminProduct } from '@/entities/product';

import ProductsTable from './ProductsTable.vue';

describe('ProductsTable', () => {
  it('renders columns and emits row actions with the product id', async () => {
    expectTypeOf<InstanceType<typeof ProductsTable>['$props']>().toMatchTypeOf<{
      products: AdminProduct[];
    }>();

    const wrapper = mount(ProductsTable, {
      props: {
        products: [
          {
            id: 'product-1',
            name: 'Ноутбук',
            price: {
              amount: 129990,
              currency: 'RUB',
            },
            stock: 4,
            image_url: 'https://example.com/product-1.jpg',
            thumbnail_url: null,
            attributes: [],
          },
          {
            id: 'product-2',
            name: 'Монитор',
            price: {
              amount: 34990,
              currency: 'RUB',
            },
            stock: 0,
            image_url: null,
            thumbnail_url: null,
            attributes: [],
          },
        ],
      },
    });

    expect(wrapper.text()).toContain('Название');
    expect(wrapper.text()).toContain('Цена');
    expect(wrapper.text()).toContain('Остаток');
    expect(wrapper.text()).toContain('Изображение');
    expect(wrapper.text()).toContain('Действия');
    expect(wrapper.text()).toContain('Да');
    expect(wrapper.text()).toContain('Нет');

    const firstRow = wrapper.findAll('tbody tr')[0];

    expect(firstRow.exists()).toBe(true);

    const firstRowButtons = firstRow.findAll('button');

    expect(firstRowButtons).toHaveLength(4);

    await firstRowButtons[0].trigger('click');
    await firstRowButtons[1].trigger('click');
    await firstRowButtons[2].trigger('click');
    await firstRowButtons[3].trigger('click');

    const expectedProduct = {
      id: 'product-1',
      name: 'Ноутбук',
      price: {
        amount: 129990,
        currency: 'RUB',
      },
      stock: 4,
      image_url: 'https://example.com/product-1.jpg',
      thumbnail_url: null,
      attributes: [],
    };

    expect(wrapper.emitted('edit')).toEqual([[expectedProduct]]);
    expect(wrapper.emitted('manageOffers')).toEqual([[expectedProduct]]);
    expect(wrapper.emitted('uploadImage')).toEqual([['product-1']]);
    expect(wrapper.emitted('delete')).toEqual([['product-1']]);
  });
});
