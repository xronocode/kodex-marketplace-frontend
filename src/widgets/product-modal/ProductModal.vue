<!--
MODULE_CONTRACT: Render a product detail modal, fetch product data by id, and refresh offers when sorting changes.
SCOPE: Product id watching, detail fetching, close emission, and product detail rendering only.
DEPENDS: @/entities/product, @/features/product-sort, @/shared/lib
LINKS: [ProductModal][watchProductId][BLOCK_FETCH_ON_ID_CHANGE]

MODULE_MAP:
- ProductModal - Vue single-file component default export.
COMPONENT_CONTRACT:
PURPOSE: Render the component behavior described by MODULE_CONTRACT.
INPUTS: Declared props, local reactive state, and emitted UI events handled in this file.
OUTPUTS: Rendered markup plus the documented emitted events or route transitions.
SIDE_EFFECTS: DOM updates, local reactive state changes, and any router/API calls declared below.
START_BLOCK_MODULE
Public product modal widget for catalog detail viewing.
END_BLOCK_MODULE
CHANGE_SUMMARY: Adds a modal widget that loads product details by id, refetches on sort changes, and renders offer metadata in Russian.
-->
<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { fetchProductById, type ProductDetails } from '@/entities/product';
import { SortButtons, useSortOffers } from '@/features/product-sort';
import { formatDate, formatPrice } from '@/shared/lib';

interface ProductModalProps {
  productId: string | null;
}

const props = defineProps<ProductModalProps>();

const emit = defineEmits<{
  close: [];
}>();

const { currentSort, setSort } = useSortOffers();

const product = ref<ProductDetails | null>(null);
const isLoading = ref(false);
const error = ref('');
const activeProductId = ref<string | null>(null);

let requestToken = 0;

async function loadProduct(id: string): Promise<void> {
  const token = ++requestToken;

  isLoading.value = true;
  error.value = '';

  try {
    const details = await fetchProductById(id, currentSort.value);

    if (token !== requestToken) {
      return;
    }

    product.value = details;
    activeProductId.value = id;
  } catch {
    if (token !== requestToken) {
      return;
    }

    product.value = null;
    error.value = 'Не удалось загрузить товар';
  } finally {
    if (token === requestToken) {
      isLoading.value = false;
    }
  }
}

// START_BLOCK_FETCH_ON_ID_CHANGE
watch(
  () => props.productId,
  (nextProductId) => {
    requestToken += 1;

    if (!nextProductId) {
      activeProductId.value = null;
      product.value = null;
      error.value = '';
      isLoading.value = false;
      return;
    }

    activeProductId.value = nextProductId;
    void loadProduct(nextProductId);
  },
  { immediate: true },
);
// END_BLOCK_FETCH_ON_ID_CHANGE

watch(currentSort, () => {
  if (!activeProductId.value) {
    return;
  }

  void loadProduct(activeProductId.value);
});

const isOpen = computed(() => props.productId !== null);

function closeModal(): void {
  emit('close');
}
</script>

<template>
  <div
    v-if="isOpen"
    class="product-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="product-modal-title"
  >
    <button
      class="product-modal__backdrop"
      type="button"
      aria-label="Закрыть окно товара"
      @click="closeModal"
    />

    <section class="product-modal__panel">
      <header class="product-modal__header">
        <div class="product-modal__title-group">
          <p class="product-modal__eyebrow">Карточка товара</p>
          <h2 id="product-modal-title" class="product-modal__title">
            {{ product?.name ?? 'Загрузка товара' }}
          </h2>
        </div>

        <button class="product-modal__close" type="button" @click="closeModal">
          Закрыть
        </button>
      </header>

      <div v-if="isLoading && !product" class="product-modal__state">
        <div class="product-modal__loader" aria-hidden="true" />
        <p>Загружаем данные товара...</p>
      </div>

      <div v-else-if="error" class="product-modal__state">
        <p>{{ error }}</p>
      </div>

      <div v-else-if="product" class="product-modal__content">
        <div class="product-modal__hero">
          <div class="product-modal__image-wrap">
            <img
              v-if="product.image_url"
              class="product-modal__image"
              :alt="product.name"
              :src="product.image_url"
            >
            <div v-else class="product-modal__placeholder">
              Изображение отсутствует
            </div>
          </div>

          <div class="product-modal__controls">
            <SortButtons
              :model-value="currentSort"
              @update:modelValue="setSort"
            />
          </div>
        </div>

        <section class="product-modal__section">
          <h3 class="product-modal__section-title">Характеристики</h3>

          <dl class="product-modal__attributes">
            <div
              v-for="attribute in product.attributes"
              :key="`${attribute.key}-${attribute.value}`"
              class="product-modal__attribute"
            >
              <dt class="product-modal__attribute-key">
                {{ attribute.key }}
              </dt>
              <dd class="product-modal__attribute-value">
                {{ attribute.value }}
              </dd>
            </div>
          </dl>
        </section>

        <section class="product-modal__section">
          <h3 class="product-modal__section-title">Предложения продавцов</h3>

          <ul class="product-modal__offers">
            <li
              v-for="offer in product.offers"
              :key="offer.id"
              class="product-modal__offer"
            >
              <div class="product-modal__offer-main">
                <div>
                  <p class="product-modal__offer-seller">
                    {{ offer.seller.name }}
                  </p>
                  <p class="product-modal__offer-rating">
                    Рейтинг {{ offer.seller.rating.toFixed(1) }}
                  </p>
                </div>

                <div class="product-modal__offer-price">
                  {{ formatPrice(offer.price.amount, offer.price.currency) }}
                </div>
              </div>

              <p class="product-modal__offer-date">
                Доставка: {{ formatDate(offer.delivery_date) }}
              </p>
            </li>
          </ul>
        </section>
      </div>

      <div v-else class="product-modal__state">
        <p>Товар не найден</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.product-modal {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 1.25rem;
}

.product-modal__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(15, 23, 42, 0.55);
  cursor: pointer;
}

.product-modal__panel {
  position: relative;
  z-index: 1;
  width: min(56rem, 100%);
  max-height: min(90vh, 56rem);
  overflow: auto;
  border: 1px solid #d8e0ea;
  border-radius: 1.25rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.22);
}

.product-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.25rem 0;
}

.product-modal__close {
  appearance: none;
  border: 1px solid #cbd5e1;
  border-radius: 0.875rem;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  min-height: 2.5rem;
  padding: 0 0.95rem;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease;
}

.product-modal__close:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.product-modal__close:active {
  transform: translateY(1px);
}

.product-modal__title-group {
  min-width: 0;
}

.product-modal__eyebrow {
  margin: 0 0 0.25rem;
  color: #64748b;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.product-modal__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.35rem;
  line-height: 1.15;
}

.product-modal__content {
  display: grid;
  gap: 1.25rem;
  padding: 1.25rem;
}

.product-modal__state {
  display: grid;
  place-items: center;
  gap: 0.75rem;
  padding: 2rem 1.25rem 2.25rem;
  color: #334155;
}

.product-modal__loader {
  width: 2rem;
  height: 2rem;
  border: 2px solid #cbd5e1;
  border-top-color: #0f172a;
  border-radius: 50%;
  animation: product-modal-spin 0.8s linear infinite;
}

.product-modal__hero {
  display: grid;
  grid-template-columns: minmax(0, 18rem) minmax(0, 1fr);
  gap: 1rem;
}

.product-modal__image-wrap {
  overflow: hidden;
  border: 1px solid #d8e0ea;
  border-radius: 1rem;
  background: #eef4fb;
  min-height: 18rem;
}

.product-modal__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-modal__placeholder {
  display: grid;
  place-items: center;
  min-height: 18rem;
  padding: 1rem;
  color: #475569;
  text-align: center;
}

.product-modal__controls {
  align-self: start;
  padding-top: 0.25rem;
}

.product-modal__section {
  display: grid;
  gap: 0.75rem;
}

.product-modal__section-title {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  line-height: 1.25;
}

.product-modal__attributes {
  display: grid;
  gap: 0.625rem;
  margin: 0;
}

.product-modal__attribute {
  display: grid;
  grid-template-columns: minmax(8rem, 1fr) minmax(0, 2fr);
  gap: 1rem;
  padding: 0.75rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.875rem;
  background: #ffffff;
}

.product-modal__attribute-key,
.product-modal__attribute-value {
  margin: 0;
}

.product-modal__attribute-key {
  color: #475569;
  font-weight: 600;
  text-transform: capitalize;
}

.product-modal__attribute-value {
  color: #0f172a;
}

.product-modal__offers {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.product-modal__offer {
  display: grid;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.95rem;
  background: #ffffff;
}

.product-modal__offer-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.product-modal__offer-seller,
.product-modal__offer-rating,
.product-modal__offer-date {
  margin: 0;
}

.product-modal__offer-seller {
  color: #0f172a;
  font-weight: 700;
}

.product-modal__offer-rating,
.product-modal__offer-date {
  color: #64748b;
  font-size: 0.875rem;
}

.product-modal__offer-price {
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 700;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .product-modal {
    padding: 0.75rem;
  }

  .product-modal__panel {
    max-height: calc(100vh - 1.5rem);
    border-radius: 1rem;
  }

  .product-modal__hero {
    grid-template-columns: 1fr;
  }

  .product-modal__attribute {
    grid-template-columns: 1fr;
    gap: 0.375rem;
  }

  .product-modal__offer-main {
    flex-direction: column;
  }
}

@keyframes product-modal-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
