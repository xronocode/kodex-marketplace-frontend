<!--
MODULE_CONTRACT: Assemble the public catalog page with infinite scroll, agent search, and product selection.
SCOPE: Search form orchestration, result replacement, selection state, and catalog grid rendering only.
DEPENDS: @/features/infinite-scroll, @/features/voice-search, @/widgets/product-card, @/widgets/product-modal, @/entities/product
LINKS: [CatalogPage][agentSearch][BLOCK_AGENT_SEARCH_HANDLER]

MODULE_MAP:
- CatalogPage - Vue single-file component default export.
COMPONENT_CONTRACT:
PURPOSE: Render the component behavior described by MODULE_CONTRACT.
INPUTS: Declared props, local reactive state, and emitted UI events handled in this file.
OUTPUTS: Rendered markup plus the documented emitted events or route transitions.
SIDE_EFFECTS: DOM updates, local reactive state changes, and any router/API calls declared below.
START_BLOCK_MODULE
Public catalog page for product discovery and agent search orchestration.
END_BLOCK_MODULE
CHANGE_SUMMARY: Adds the public catalog page with infinite scrolling, voice and text agent search, Russian intent hints, and modal-backed product selection. Fix: replace auto-fit with auto-fill to prevent card stretching when few products; remove min-height 100vh to avoid empty-space stretching; fix missing --spacing-16 token in empty state.
-->
<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';

import type { ProductListItem } from '@/entities/product';
import { useInfiniteScroll } from '@/features/infinite-scroll';
import { VoiceSearchButton, useVoiceSearch } from '@/features/voice-search';
import { ProductCard } from '@/widgets/product-card';
import { ProductModal } from '@/widgets/product-modal';

const sentinelRef = ref<HTMLElement | null>(null);
const selectedProductId = ref<string | null>(null);
const searchQuery = ref('');

const {
  error,
  hasMore,
  isLoading,
  items,
  reset,
} = useInfiniteScroll(sentinelRef);

const voiceSearch = useVoiceSearch();

let lastSyncedAgentResults: ProductListItem[] | null = null;

// START_BLOCK_AGENT_SEARCH_HANDLER
// [CatalogPage][agentSearch][BLOCK_AGENT_SEARCH_HANDLER] Replace the infinite-scroll grid with agent-search results when a text or voice search finishes.
function syncAgentSearchResults(results: ProductListItem[]): void {
  if (results === lastSyncedAgentResults) {
    return;
  }

  lastSyncedAgentResults = results;
  selectedProductId.value = null;
  reset({
    error: null,
    hasMore: false,
    items: results,
  });
}
// END_BLOCK_AGENT_SEARCH_HANDLER

watch(
  () => voiceSearch.transcript.value,
  (newTranscript) => {
    if (newTranscript) {
      searchQuery.value = newTranscript;
    }
  }
);

watch(
  () => voiceSearch.results.value,
  async (results) => {
    // Only sync if we have explicitly returned search results (ignore null initialization)
    if (results === null) {
      return;
    }
    await nextTick();
    syncAgentSearchResults(results);
  },
);

async function handleSearchSubmit(): Promise<void> {
  // Clear the UI aggressively to provide visual feedback that the new search started
  lastSyncedAgentResults = null;
  reset({ error: null, hasMore: false, items: [] });
  await voiceSearch.search(searchQuery.value);
}

function handleVoiceSearchStart(): void {
  if (voiceSearch.isListening.value) {
    voiceSearch.stop();
    return;
  }

  voiceSearch.start();
}

function handleProductSelect(productId: string): void {
  selectedProductId.value = productId;
}

function handleModalClose(): void {
  selectedProductId.value = null;
}
</script>

<template>
  <main class="catalog-page">
    <section class="catalog-page__search" aria-labelledby="catalog-page-search-title">
      <div class="catalog-page__search-copy">
        <p class="catalog-page__eyebrow">Каталог</p>
        <h1 id="catalog-page-search-title" class="catalog-page__title">
          Найдите товар голосом или текстом
        </h1>
        <p class="catalog-page__description">
          Поиск можно запустить кнопкой, Enter или голосовой командой.
        </p>
      </div>

      <!-- Intent display removed per UX request -->
      <p
        v-if="voiceSearch.error"
        class="catalog-page__message catalog-page__message--error"
      >
        {{ voiceSearch.error }}
      </p>
    </section>

    <section class="catalog-page__grid-section" aria-labelledby="catalog-page-grid-title">
      <div class="catalog-page__grid-header">
        <h2 id="catalog-page-grid-title" class="catalog-page__section-title">
          Товары
        </h2>
        <p class="catalog-page__section-note">
          {{ items.length }} карточек
        </p>
      </div>

      <div v-if="items.length === 0 && !isLoading && !voiceSearch.isLoading.value" class="catalog-page__empty">
        <p class="catalog-page__empty-text">По такому запросу не смогли найти товар в каталоге.</p>
      </div>

      <div v-else class="catalog-page__grid">
        <ProductCard
          v-for="product in items"
          :key="product.id"
          :product="product"
          @select="handleProductSelect"
        />
      </div>

      <div class="catalog-page__sentinel-wrap">
        <div ref="sentinelRef" class="catalog-page__sentinel" />
        <p class="catalog-page__sentinel-status">
          <span v-if="error">
            {{ error }}
          </span>
          <span v-else-if="isLoading">
            Подгружаем еще товары...
          </span>
          <span v-else-if="hasMore">
            Прокрутите ниже, чтобы загрузить следующую страницу.
          </span>
          <span v-else>
            Показаны все товары.
          </span>
        </p>
      </div>
    </section>

    <div class="catalog-page__bottom-bar">
      <form class="catalog-page__form" @submit.prevent="handleSearchSubmit">
        <div class="catalog-page__controls">
          <input
            id="catalog-page-query"
            v-model="searchQuery"
            class="catalog-page__input"
            name="query"
            type="search"
            aria-label="Поиск товаров"
            placeholder="Например: ноутбук для работы"
          >
          <button class="catalog-page__submit" type="submit">
            Искать
          </button>
          <VoiceSearchButton
            class="catalog-page__voice"
            :class="{ 'catalog-page__voice--active': voiceSearch.isListening.value }"
            @click="handleVoiceSearchStart"
          >
            {{ voiceSearch.isListening.value ? 'Слушаю...' : 'Голосовой поиск' }}
          </VoiceSearchButton>
        </div>
      </form>
    </div>

    <ProductModal
      :product-id="selectedProductId"
      @close="handleModalClose"
    />
  </main>
</template>

<style scoped>
@import '@/shared/styles/tokens.css';

.catalog-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  padding: var(--spacing-8) var(--spacing-8) 140px;
  background:
    radial-gradient(circle at top left, rgba(148, 163, 184, 0.14), transparent 28%),
    linear-gradient(180deg, var(--color-bg-secondary) 0%, #eef2ff 100%);
  color: var(--color-text-primary);
}

.catalog-page__search,
.catalog-page__grid-section {
  display: grid;
  gap: var(--spacing-5);
}

.catalog-page__eyebrow {
  margin: 0 0 6px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.catalog-page__title {
  margin: 0;
  font-size: clamp(30px, 4vw, 52px);
  line-height: 1;
}

.catalog-page__description,
.catalog-page__section-note,
.catalog-page__sentinel-status,
.catalog-page__message,
.catalog-page__intent {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.catalog-page__bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-5) var(--spacing-8);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid var(--color-border-primary);
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
  z-index: 50;
  display: flex;
  justify-content: center;
}

.catalog-page__form {
  display: grid;
  gap: var(--spacing-3);
  width: 100%;
  max-width: 800px;
}

.catalog-page__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.catalog-page__controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: var(--spacing-3);
}

.catalog-page__input {
  min-width: 0;
  padding: var(--spacing-4);
  border: var(--border-width-thin) solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  background: var(--color-bg-primary);
  font: inherit;
}

.catalog-page__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.catalog-page__submit,
.catalog-page__voice {
  padding: var(--spacing-4) var(--spacing-5);
  border: 0;
  border-radius: var(--radius-xl);
  background: var(--color-text-primary);
  color: #fff;
  font: inherit;
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.catalog-page__submit:hover {
  background: #1e293b;
}

.catalog-page__voice {
  background: var(--color-text-secondary);
}

.catalog-page__voice:hover {
  background: #475569;
}

.catalog-page__voice--active {
  background: var(--color-primary);
  animation: pulse-recording 1.5s infinite;
}

@keyframes pulse-recording {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.02); }
  100% { opacity: 1; transform: scale(1); }
}

.catalog-page__grid-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-3);
}

.catalog-page__section-title {
  margin: 0;
  font-size: var(--font-size-xl);
}

.catalog-page__empty {
  padding: var(--spacing-12);
  text-align: center;
  background: var(--color-bg-base);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px dashed var(--color-border-dark);
}

.catalog-page__empty-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.catalog-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-4);
}

.catalog-page__sentinel-wrap {
  display: grid;
  gap: var(--spacing-2);
  justify-items: center;
  padding: var(--spacing-3) 0 0;
}

.catalog-page__sentinel {
  width: 100%;
  height: 1px;
}

.catalog-page__message--error {
  color: var(--color-error);
}

@media (max-width: 720px) {
  .catalog-page {
    padding: var(--spacing-5);
  }

  .catalog-page__controls {
    grid-template-columns: 1fr;
  }

  .catalog-page__grid-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
