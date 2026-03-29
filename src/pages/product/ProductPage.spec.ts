/*
MODULE_CONTRACT: Verify the public product page stays thin and delegates to the existing modal surface.
SCOPE: Route adaptation and modal close forwarding only.
DEPENDS: vitest, @vue/test-utils, vue, vue-router, ./index
LINKS: [ProductPage][fallback][BLOCK_PRODUCT_FALLBACK]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_MODULE
Module-local tests for the thin product fallback page.
END_BLOCK_MODULE
START_BLOCK_PRODUCT_FALLBACK
Assert the page forwards the route product id into the modal instead of creating a second product data flow.
END_BLOCK_PRODUCT_FALLBACK
CHANGE_SUMMARY: Adds coverage for route-to-modal delegation and close-to-router forwarding.
*/
import { defineComponent, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const routeState = reactive({
  params: {
    productId: 'product-42',
  },
  query: {},
});

const routerState = {
  back: vi.fn(),
};

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => routerState,
}));

vi.mock('@/widgets/product-modal', () => {
  return {
    ProductModal: defineComponent({
      emits: ['close'],
      props: {
        productId: {
          default: null,
          type: String,
        },
      },
      template: `
        <section v-if="productId" class="product-modal-stub">
          <p class="product-modal-stub__id">{{ productId }}</p>
          <button type="button" @click="$emit('close')">Закрыть</button>
        </section>
      `,
    }),
  };
});

async function loadProductPage() {
  return import('./index');
}

beforeEach(() => {
  routerState.back.mockReset();
  routeState.params.productId = 'product-42';
  routeState.query = {};
});

describe('ProductPage', () => {
  it('delegates detail rendering to the existing modal and forwards close back to the router', async () => {
    const { ProductPage } = await loadProductPage();
    const wrapper = mount(ProductPage);

    expect(wrapper.text()).toContain('product-42');
    expect(wrapper.find('.product-modal-stub').exists()).toBe(true);

    await wrapper.get('button').trigger('click');

    expect(routerState.back).toHaveBeenCalledTimes(1);
  });

  it('hides the modal surface when no product id is present', async () => {
    routeState.params.productId = '';
    routeState.query = {};

    const { ProductPage } = await loadProductPage();
    const wrapper = mount(ProductPage);

    expect(wrapper.find('.product-modal-stub').exists()).toBe(false);
    expect(wrapper.text()).toBe('');
  });
});
