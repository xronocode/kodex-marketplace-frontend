/*
MODULE_CONTRACT: Verify the admin login page contract for credential submission and stable error display.
SCOPE: Vue Test Utils render, form submission, and error rendering only.
DEPENDS: ./LoginPage.vue, @/features/admin-auth
LINKS: [LoginPage][submit][BLOCK_SUBMIT_LOGIN]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_MODULE
Module-local tests for the admin login page.
END_BLOCK_MODULE
START_BLOCK_LOGIN_SUBMIT_TEST
Assert the form submits the entered credentials through the admin auth composable.
END_BLOCK_LOGIN_SUBMIT_TEST
START_BLOCK_LOGIN_ERROR_TEST
Assert stable composable failures are rendered without being rewritten by the page.
END_BLOCK_LOGIN_ERROR_TEST
CHANGE_SUMMARY: Adds coverage for the admin login form submission and failure state.
*/
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const loginMock = vi.fn();
let errorRef = ref<string | null>(null);

vi.mock('@/features/admin-auth', () => ({
  useAdminAuth: () => ({
    error: errorRef,
    login: loginMock,
  }),
}));

import LoginPage from './LoginPage.vue';

beforeEach(() => {
  errorRef = ref<string | null>(null);
  loginMock.mockReset();
  loginMock.mockResolvedValue(undefined);
});

describe('LoginPage', () => {
  it('submits entered credentials through useAdminAuth().login', async () => {
    const wrapper = mount(LoginPage);

    await wrapper.get('input[name="username"]').setValue('admin');
    await wrapper.get('input[name="password"]').setValue('secret');
    await wrapper.get('form').trigger('submit.prevent');

    expect(loginMock).toHaveBeenCalledWith('admin', 'secret');
  });

  it('renders the stable failure message from the auth composable', async () => {
    errorRef.value = 'Неверный логин или пароль';

    const wrapper = mount(LoginPage);

    expect(wrapper.text()).toContain('Неверный логин или пароль');
  });
});
