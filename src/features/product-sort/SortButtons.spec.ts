/*
MODULE_CONTRACT: Verify the product sort buttons emit the public offer sort values.
SCOPE: Vue Test Utils interaction assertions and prop typing only.
DEPENDS: vitest, @vue/test-utils, ./SortButtons.vue
LINKS: [ProductSort][state][BLOCK_SET_SORT]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_SET_SORT_SPEC
Test the sort control without coupling it to a modal or data fetching implementation.
END_BLOCK_SET_SORT_SPEC
CHANGE_SUMMARY: Adds coverage for v-model wiring, active button state, and the emitted offer sort values.
*/
import { mount } from '@vue/test-utils';
import { describe, expect, it, expectTypeOf } from 'vitest';

import SortButtons from './SortButtons.vue';

describe('SortButtons', () => {
  it('exposes the v-model contract for public offer sort values', () => {
    expectTypeOf<InstanceType<typeof SortButtons>['$props']>().toMatchTypeOf<{
      modelValue: 'price' | 'delivery_date';
    }>();
  });

  it('emits public sort values when the buttons are clicked', async () => {
    const wrapper = mount(SortButtons, {
      props: {
        modelValue: 'price',
      },
    });

    const buttons = wrapper.findAll('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].text()).toBe('По цене');
    expect(buttons[1].text()).toBe('По дате доставки');
    expect(buttons[0].attributes('aria-pressed')).toBe('true');
    expect(buttons[1].attributes('aria-pressed')).toBe('false');

    await buttons[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([['delivery_date']]);
  });
});
