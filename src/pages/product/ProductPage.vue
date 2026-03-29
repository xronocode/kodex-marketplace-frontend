<!--
MODULE_CONTRACT: Provide a thin product page fallback over the existing product modal/detail surface.
SCOPE: Route-to-id adaptation and modal close handling only.
DEPENDS: vue, vue-router, @/widgets/product-modal
LINKS: [ProductPage][fallback][BLOCK_PRODUCT_FALLBACK]

MODULE_MAP:
- ProductPage - Vue single-file component default export.
COMPONENT_CONTRACT:
PURPOSE: Render the component behavior described by MODULE_CONTRACT.
INPUTS: Declared props, local reactive state, and emitted UI events handled in this file.
OUTPUTS: Rendered markup plus the documented emitted events or route transitions.
SIDE_EFFECTS: DOM updates, local reactive state changes, and any router/API calls declared below.
START_BLOCK_MODULE
Public product fallback page that delegates detail rendering to the product modal widget.
END_BLOCK_MODULE
START_BLOCK_PRODUCT_FALLBACK
[ProductPage][fallback][BLOCK_PRODUCT_FALLBACK] Pass route context into the existing modal instead of duplicating product data fetching.
END_BLOCK_PRODUCT_FALLBACK
CHANGE_SUMMARY: Adds a thin product page that forwards the route product id to the product modal and leaves data loading to the existing detail widget.
-->
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { ProductModal } from '@/widgets/product-modal';

const route = useRoute();
const router = useRouter();

const productId = computed(() => {
  const rawProductId = route.params.productId ?? route.query.productId;

  if (typeof rawProductId !== 'string' || rawProductId.trim().length === 0) {
    return null;
  }

  return rawProductId;
});

function handleClose(): void {
  void router.back();
}
</script>

<template>
  <main class="product-page">
    <ProductModal
      :product-id="productId"
      @close="handleClose"
    />
  </main>
</template>

<style scoped>
.product-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}
</style>
