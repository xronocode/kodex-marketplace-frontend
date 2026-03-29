/*
MODULE_CONTRACT: Verify the admin auth composable contract for login, logout, and error handling.
SCOPE: Successful login redirect, failed login stability, and logout cleanup behavior.
DEPENDS: ./useAdminAuth, @/shared/api, vue-router, vitest
LINKS: [AdminAuthFeature][login][BLOCK_SUBMIT_LOGIN]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_MODULE
Module-local tests for the admin auth feature.
END_BLOCK_MODULE
START_BLOCK_SUCCESSFUL_LOGIN_TEST
Assert a successful login stores the token and redirects to the admin shell.
END_BLOCK_SUCCESSFUL_LOGIN_TEST
START_BLOCK_FAILED_LOGIN_TEST
Assert a failed login leaves no token behind and exposes the stable error message.
END_BLOCK_FAILED_LOGIN_TEST
START_BLOCK_LOGOUT_TEST
Assert logout clears the stored token and returns to the admin login screen.
END_BLOCK_LOGOUT_TEST
CHANGE_SUMMARY: Adds targeted coverage for admin login/logout behavior.
*/
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  postMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  client: {
    post: mocks.postMock,
  },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.pushMock,
  }),
}));

async function loadAdminAuth() {
  vi.resetModules();
  return import('./useAdminAuth');
}

beforeEach(() => {
  localStorage.clear();
  mocks.postMock.mockReset();
  mocks.pushMock.mockReset();
  mocks.pushMock.mockResolvedValue(undefined);
});

describe('useAdminAuth', () => {
  it('successful login stores token and redirects to /admin', async () => {
    mocks.postMock.mockResolvedValue({
      data: {
        access_token: 'admin-token-123',
      },
    });

    const { useAdminAuth } = await loadAdminAuth();
    const auth = useAdminAuth();

    await auth.login('admin', 'secret');

    expect(localStorage.getItem('kodex_admin_token')).toBe('admin-token-123');
    expect(auth.isAuthenticated.value).toBe(true);
    expect(auth.error.value).toBeNull();
    expect(mocks.pushMock).toHaveBeenCalledWith('/admin');
  });

  it('failed login keeps token empty and exposes stable error', async () => {
    localStorage.setItem('kodex_admin_token', 'stale-token');
    mocks.postMock.mockRejectedValue(new Error('unauthorized'));

    const { useAdminAuth } = await loadAdminAuth();
    const auth = useAdminAuth();

    await auth.login('admin', 'wrong');

    expect(localStorage.getItem('kodex_admin_token')).toBeNull();
    expect(auth.isAuthenticated.value).toBe(false);
    expect(auth.error.value).toBe('Неверный логин или пароль');
    expect(mocks.pushMock).not.toHaveBeenCalled();
  });

  it('logout clears token and redirects to /admin/login', async () => {
    localStorage.setItem('kodex_admin_token', 'admin-token-123');

    const { useAdminAuth } = await loadAdminAuth();
    const auth = useAdminAuth();

    await auth.logout();

    expect(localStorage.getItem('kodex_admin_token')).toBeNull();
    expect(auth.isAuthenticated.value).toBe(false);
    expect(auth.error.value).toBeNull();
    expect(mocks.pushMock).toHaveBeenCalledWith('/admin/login');
  });
});
