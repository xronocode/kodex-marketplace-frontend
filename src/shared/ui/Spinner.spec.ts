/*
MODULE_CONTRACT: Verify the shared spinner primitive render behavior and typed props.
SCOPE: Vue Test Utils render assertions and prop shape checks only.
DEPENDS: src/shared/ui/Spinner.vue
LINKS: [FrontendSharedUi][render][BLOCK_RENDER_SHARED_UI]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_RENDER_SHARED_UI
Test the spinner primitive without introducing feature or domain logic.
END_BLOCK_RENDER_SHARED_UI
CHANGE_SUMMARY: Adds module-local coverage for spinner label, size, and accessibility output.
*/
import { mount } from '@vue/test-utils';
import { expectTypeOf, describe, expect, it } from 'vitest';

import Spinner from './Spinner.vue';

describe('Spinner', () => {
  it('renders accessible loading markup with typed props', () => {
    expectTypeOf<InstanceType<typeof Spinner>['$props']>().toMatchTypeOf<{
      label?: string;
      size?: 'sm' | 'md' | 'lg';
    }>();

    const wrapper = mount(Spinner, {
      props: {
        label: 'Fetching data',
        size: 'lg',
      },
    });

    expect(wrapper.attributes('role')).toBe('status');
    expect(wrapper.attributes('aria-label')).toBe('Fetching data');
    expect(wrapper.find('svg').attributes('width')).toBe('32');
    expect(wrapper.find('svg').attributes('height')).toBe('32');
  });
});
