/*
MODULE_CONTRACT: Verify the app router surface, route guard, and route wiring.
SCOPE: Guard behavior, route registration, and admin redirect flow only.
DEPENDS: ./router, @/pages/catalog, @/pages/admin, vue-router, @vue/test-utils
LINKS: [FrontendApp][router][BLOCK_ROUTE_GUARDS]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_MODULE
Module-local tests for the application router.
END_BLOCK_MODULE
START_BLOCK_ROUTE_GUARDS_TEST
Assert the explicit admin guard blocks unauthenticated access before the admin page mounts.
END_BLOCK_ROUTE_GUARDS_TEST
CHANGE_SUMMARY: Adds coverage for the public catalog route, the admin login route, and the guarded admin redirect.
*/
import { createMemoryHistory } from 'vue-router';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  adminMounted: vi.fn(),
  catalogMounted: vi.fn(),
  loginMounted: vi.fn(),
}));

vi.mock('@/pages/catalog', () => ({
  CatalogPage: {
    name: 'CatalogPage',
    setup: () => {
      mocks.catalogMounted();
      return () => null;
    },
  },
}));

vi.mock('@/pages/admin', () => ({
  AdminPage: {
    name: 'AdminPage',
    setup: () => {
      mocks.adminMounted();
      return () => null;
    },
  },
  LoginPage: {
    name: 'LoginPage',
    setup: () => {
      mocks.loginMounted();
      return () => null;
    },
  },
}));

import { adminRouteGuard, createAppRouter, routes } from './router';

const ADMIN_TOKEN_KEY = 'kodex_admin_token';

function setAdminToken(value: string | null): void {
  if (value === null) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    return;
  }

  localStorage.setItem(ADMIN_TOKEN_KEY, value);
}

beforeEach(() => {
  mocks.adminMounted.mockReset();
  mocks.catalogMounted.mockReset();
  mocks.loginMounted.mockReset();
  setAdminToken(null);
});

describe('app router', () => {
  it('registers the catalog, admin login, and guarded admin routes', () => {
    expect(routes).toHaveLength(3);
    expect(routes.map((route) => route.path)).toEqual(['/', '/admin/login', '/admin']);
  });

  it('redirects unauthenticated admin access through the explicit guard before the admin page mounts', async () => {
    expect(adminRouteGuard({} as never, {} as never, () => undefined)).toBe('/admin/login');

    const router = createAppRouter(createMemoryHistory());

    const wrapper = mount({
      template: '<router-view />',
    }, {
      global: {
        plugins: [router],
      },
    });

    await router.push('/admin');
    await router.isReady();
    await flushPromises();

    expect(router.currentRoute.value.fullPath).toBe('/admin/login');
    expect(mocks.adminMounted).not.toHaveBeenCalled();
    expect(mocks.loginMounted).toHaveBeenCalledTimes(1);
    expect(wrapper.exists()).toBe(true);
  });
});
