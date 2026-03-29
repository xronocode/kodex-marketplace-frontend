/*
MODULE_CONTRACT: Verify the shared badge primitive render behavior and typed props.
SCOPE: Vue Test Utils render assertions and prop shape checks only.
DEPENDS: src/shared/ui/Badge.vue
LINKS: [FrontendSharedUi][render][BLOCK_RENDER_SHARED_UI]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_RENDER_SHARED_UI
Test the badge primitive without introducing feature or domain logic.
END_BLOCK_RENDER_SHARED_UI
CHANGE_SUMMARY: Adds module-local coverage for badge tones, sizes, and slot rendering.
*/
import { mount } from '@vue/test-utils';
import { expectTypeOf, describe, expect, it } from 'vitest';

import Badge from './Badge.vue';

describe('Badge', () => {
  it('renders slot content with tone and size classes', () => {
    expectTypeOf<InstanceType<typeof Badge>['$props']>().toMatchTypeOf<{
      size?: 'sm' | 'md';
      tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
    }>();

    const wrapper = mount(Badge, {
      props: {
        size: 'sm',
        tone: 'success',
      },
      slots: {
        default: 'Online',
      },
    });

    expect(wrapper.text()).toBe('Online');
    expect(wrapper.classes()).toContain('badge');
    expect(wrapper.classes()).toContain('badge--sm');
    expect(wrapper.classes()).toContain('badge--success');
  });
});
