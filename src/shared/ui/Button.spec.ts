/*
MODULE_CONTRACT: Verify the shared button primitive render behavior and typed props.
SCOPE: Vue Test Utils render assertions and prop shape checks only.
DEPENDS: src/shared/ui/Button.vue
LINKS: [FrontendSharedUi][render][BLOCK_RENDER_SHARED_UI]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_RENDER_SHARED_UI
Test the button primitive without introducing feature or domain logic.
END_BLOCK_RENDER_SHARED_UI
CHANGE_SUMMARY: Adds module-local coverage for button variants, type semantics, and loading state output.
*/
import { mount } from '@vue/test-utils';
import { expectTypeOf, describe, expect, it } from 'vitest';

import Button from './Button.vue';

describe('Button', () => {
  it('renders a native button with typed action props', () => {
    expectTypeOf<InstanceType<typeof Button>['$props']>().toMatchTypeOf<{
      block?: boolean;
      disabled?: boolean;
      loading?: boolean;
      size?: 'sm' | 'md' | 'lg';
      type?: 'button' | 'submit' | 'reset';
      variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    }>();

    const wrapper = mount(Button, {
      props: {
        block: true,
        loading: true,
        size: 'lg',
        type: 'submit',
        variant: 'secondary',
      },
      slots: {
        default: 'Save changes',
      },
    });

    expect(wrapper.attributes('type')).toBe('submit');
    expect(wrapper.attributes('disabled')).toBeDefined();
    expect(wrapper.classes()).toContain('button--secondary');
    expect(wrapper.classes()).toContain('button--lg');
    expect(wrapper.classes()).toContain('button--block');
    expect(wrapper.find('svg').exists()).toBe(true);
  });
});
