/*
MODULE_CONTRACT: Verify the admin catalog page contract for redirect and product loading behavior.
SCOPE: Router redirect, admin auth gating, and product loading on mount only.
DEPENDS: ./AdminPage.vue, @/features/admin-auth, @/entities/product, vue-router
LINKS: [AdminPage][loadProducts][BLOCK_LOAD_PRODUCTS]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_MODULE
Module-local tests for the admin catalog page.
END_BLOCK_MODULE
START_BLOCK_ADMIN_REDIRECT_TEST
Assert unauthenticated users are redirected to the admin login page.
END_BLOCK_ADMIN_REDIRECT_TEST
START_BLOCK_ADMIN_LOAD_TEST
Assert authenticated users load products on mount and render the table.
END_BLOCK_ADMIN_LOAD_TEST
CHANGE_SUMMARY: Adds coverage for auth gating and initial product loading.
*/
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  adminListProductsMock: vi.fn(),
  logoutMock: vi.fn(),
  pushMock: vi.fn(),
}));
let isAuthenticatedRef = ref(false);

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.pushMock,
  }),
}));

vi.mock('@/features/admin-auth', () => ({
  useAdminAuth: () => ({
    isAuthenticated: isAuthenticatedRef,
    logout: mocks.logoutMock,
  }),
}));

vi.mock('@/entities/product', async () => {
  const actual = await vi.importActual<typeof import('@/entities/product')>('@/entities/product');

  return {
    ...actual,
    adminListProducts: mocks.adminListProductsMock,
  };
});

import AdminPage from './AdminPage.vue';

beforeEach(() => {
  mocks.adminListProductsMock.mockReset();
  mocks.adminListProductsMock.mockResolvedValue([
    {
      id: 'product-1',
      name: 'Ноутбук',
      price: {
        amount: 129990,
        currency: 'RUB',
      },
      stock: 4,
      image_url: 'https://cdn.test/product-1.jpg',
      thumbnail_url: null,
      attributes: [],
    },
  ]);
  isAuthenticatedRef = ref(false);
  mocks.logoutMock.mockReset();
  mocks.pushMock.mockReset();
});

describe('AdminPage', () => {
  it('redirects unauthenticated users to /admin/login', async () => {
    mount(AdminPage);

    await flushPromises();

    expect(mocks.pushMock).toHaveBeenCalledWith('/admin/login');
    expect(mocks.adminListProductsMock).not.toHaveBeenCalled();
  });

  it('loads products when an admin token is present', async () => {
    isAuthenticatedRef = ref(true);

    const wrapper = mount(AdminPage);

    await flushPromises();

    expect(mocks.adminListProductsMock).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain('Ноутбук');
    expect(wrapper.text()).toContain('Каталог товаров');
  });
});
