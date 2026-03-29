<!--
MODULE_CONTRACT: Render a catalog product card with thumbnail, pricing, stock, and nearest delivery data.
SCOPE: Display-only product card rendering and select emission on click.
DEPENDS: @/entities/product, @/shared/lib
LINKS: [ProductCard][render][BLOCK_RENDER_CARD]

MODULE_MAP:
- ProductCard - Vue single-file component default export.
COMPONENT_CONTRACT:
PURPOSE: Render the component behavior described by MODULE_CONTRACT.
INPUTS: Declared props, local reactive state, and emitted UI events handled in this file.
OUTPUTS: Rendered markup plus the documented emitted events or route transitions.
SIDE_EFFECTS: DOM updates, local reactive state changes, and any router/API calls declared below.
START_BLOCK_RENDER_CARD
Render a clickable product card with a thumbnail fallback and Russian status labels.
END_BLOCK_RENDER_CARD
CHANGE_SUMMARY: Adds a catalog card that renders the public product summary and emits the selected product id.
-->
<script setup lang="ts">
import { formatDate, formatPrice } from '@/shared/lib';
import type { ProductListItem } from '@/entities/product';

const props = defineProps<{
  product: ProductListItem;
}>();

const emit = defineEmits<{
  select: [id: string];
}>();

function handleSelect() {
  emit('select', props.product.id);
}
</script>

<template>
  <button class="product-card" type="button" @click="handleSelect">
    <div class="product-card__media">
      <img
        v-if="product.thumbnail_url"
        :alt="product.name"
        class="product-card__image"
        :src="product.thumbnail_url"
      >
      <div v-else class="product-card__placeholder">
        Нет изображения
      </div>
    </div>

    <div class="product-card__body">
      <h3 class="product-card__name">
        {{ product.name }}
      </h3>

      <p class="product-card__price">
        {{ formatPrice(product.price.amount, product.price.currency) }}
      </p>

      <p class="product-card__meta">
        В наличии: {{ product.stock }} шт.
      </p>

      <p class="product-card__meta">
        Ближайшая доставка:
        <span v-if="product.nearest_delivery_date">{{ formatDate(product.nearest_delivery_date) }}</span>
        <span v-else>Дата уточняется</span>
      </p>
    </div>
  </button>
</template>

<style scoped>
@import '@/shared/styles/tokens.css';

.product-card {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: var(--spacing-4);
  width: 100%;
  padding: var(--spacing-4);
  border: var(--border-width-thin) solid var(--color-border-primary);
  border-radius: var(--radius-2xl);
  background: var(--color-bg-primary);
  color: inherit;
  text-align: left;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition:
    transform var(--transition-normal),
    box-shadow var(--transition-normal),
    border-color var(--transition-normal);
}

.product-card:hover {
  transform: translateY(-1px);
  border-color: var(--color-border-secondary);
  box-shadow: var(--shadow-xl);
}

.product-card__media {
  overflow: hidden;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--color-bg-tertiary), var(--color-border-primary));
  aspect-ratio: 1 / 1;
}

.product-card__image,
.product-card__placeholder {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card__placeholder {
  display: grid;
  place-items: center;
  padding: var(--spacing-3);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-normal);
  text-align: center;
}

.product-card__body {
  min-width: 0;
  display: grid;
  gap: var(--spacing-2);
  align-content: start;
}

.product-card__name {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

.product-card__price {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-xl);
  font-weight: 800;
  line-height: var(--line-height-tight);
}

.product-card__meta {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}
</style>
