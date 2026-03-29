/*
MODULE_CONTRACT: Verify the root app shell renders the active route outlet only.
SCOPE: RouterView rendering through the root shell and bootstrap integration only.
DEPENDS: ./App.vue, ./index, @vue/test-utils, vue-router
LINKS: [FrontendApp][bootstrap][BLOCK_BOOTSTRAP_APP]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_MODULE
Module-local tests for the root application shell.
END_BLOCK_MODULE
START_BLOCK_BOOTSTRAP_APP_TEST
Assert the app shell exposes the route outlet that the bootstrap wires into.
END_BLOCK_BOOTSTRAP_APP_TEST
CHANGE_SUMMARY: Adds coverage for the root shell rendering contract.
*/
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();

  return {
    ...actual,
    RouterView: defineComponent({
      name: 'RouterView',
      template: '<div class="router-view-stub">Route outlet</div>',
    }),
  };
});

import App from './App.vue';
import { createAppPinia } from './index';

describe('App', () => {
  it('renders the router view shell used by the bootstrap entrypoint', () => {
    const wrapper = mount(App);

    expect(wrapper.find('.router-view-stub').exists()).toBe(true);
    expect(wrapper.text()).toContain('Route outlet');
  });

  it('exposes a Pinia factory for the bootstrap setup surface', () => {
    const pinia = createAppPinia();

    expect(pinia).toBeTruthy();
  });
});
