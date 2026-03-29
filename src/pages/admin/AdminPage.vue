<!--
MODULE_CONTRACT: Render the authenticated admin catalog page and manage product actions.
SCOPE: Token gate, product loading, table rendering, logout, and basic edit/delete/upload actions only.
DEPENDS: @/entities/product, @/features/admin-auth, @/widgets/products-table, vue-router, vue
LINKS: [AdminPage][loadProducts][BLOCK_LOAD_PRODUCTS]

MODULE_MAP:
- AdminPage - Vue single-file component default export.
COMPONENT_CONTRACT:
PURPOSE: Render the component behavior described by MODULE_CONTRACT.
INPUTS: Declared props, local reactive state, and emitted UI events handled in this file.
OUTPUTS: Rendered markup plus the documented emitted events or route transitions.
SIDE_EFFECTS: DOM updates, local reactive state changes, and any router/API calls declared below.
START_BLOCK_MODULE
Admin catalog page boundary for the frontend admin area.
END_BLOCK_MODULE
START_BLOCK_LOAD_PRODUCTS
Load admin products on mount when an admin token is available, then render the table.
END_BLOCK_LOAD_PRODUCTS
CHANGE_SUMMARY: Adds the Russian-language admin catalog page with product management actions.
-->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { adminDeleteProduct, adminListProducts, adminUpdateProduct, adminUploadImage, adminCreateProduct } from '@/entities/product';
import { adminListSellers, adminCreateSeller, adminCreateOffer, adminUpdateOffer, adminDeleteOffer } from '@/entities/product/api/adminCatalogApi';
import { useAdminAuth } from '@/features/admin-auth';
import { ProductsTable } from '@/widgets/products-table';

import type { AdminProduct, ProductAttribute, Money, Seller, Offer } from '@/entities/product';

const router = useRouter();
const auth = useAdminAuth();
const { isAuthenticated } = auth;

const products = ref<AdminProduct[]>([]);
const sellers = ref<Seller[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const actionMessage = ref<string | null>(null);
const uploadTargetId = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

// Modal state
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showOfferModal = ref(false);
const editingProduct = ref<AdminProduct | null>(null);
const managingOffersProduct = ref<AdminProduct | null>(null);

// Create/Edit form state
const formName = ref('');
const formPrice = ref('');
const formStock = ref('');
const formAttributes = ref<ProductAttribute[]>([]);

// Offer form state
const formSellerId = ref('');
const formOfferPrice = ref('');
const formOfferDelivery = ref('');
const formOfferStock = ref('');

const productCount = computed(() => products.value.length);

function setError(message: string): void {
  error.value = message;
  actionMessage.value = null;
}

function clearStatus(): void {
  error.value = null;
  actionMessage.value = null;
}

async function loadProducts(): Promise<void> {
  isLoading.value = true;
  clearStatus();

  try {
    products.value = await adminListProducts();
  } catch {
    setError('Не удалось загрузить товары');
  } finally {
    isLoading.value = false;
  }
}

async function loadSellers(): Promise<void> {
  try {
    sellers.value = await adminListSellers();
  } catch {
    // Sellers load failure is non-fatal
  }
}

function findProduct(id: string): AdminProduct | undefined {
  return products.value.find((product) => product.id === id);
}

function openCreateModal(): void {
  formName.value = '';
  formPrice.value = '';
  formStock.value = '';
  formAttributes.value = [{ key: '', value: '' }];
  showCreateModal.value = true;
}

function openEditModal(product: AdminProduct): void {
  editingProduct.value = product;
  formName.value = product.name;
  formPrice.value = String(product.price.amount);
  formStock.value = String(product.stock);
  formAttributes.value = product.attributes.length ? [...product.attributes] : [{ key: '', value: '' }];
  showEditModal.value = true;
}

function closeCreateModal(): void {
  showCreateModal.value = false;
  editingProduct.value = null;
}

function closeEditModal(): void {
  showEditModal.value = false;
  editingProduct.value = null;
}

function addAttributeField(): void {
  formAttributes.value.push({ key: '', value: '' });
}

function removeAttributeField(index: number): void {
  if (formAttributes.value.length > 1) {
    formAttributes.value.splice(index, 1);
  }
}

async function handleCreateSubmit(): Promise<void> {
  const trimmedName = formName.value.trim();
  const priceAmount = Number(formPrice.value.replace(',', '.'));
  const stockAmount = Number(formStock.value);

  if (!trimmedName) {
    setError('Название товара не может быть пустым');
    return;
  }

  if (!Number.isFinite(priceAmount) || !Number.isFinite(stockAmount)) {
    setError('Цена и остаток должны быть числами');
    return;
  }

  const attributes = formAttributes.value.filter((a) => a.key.trim() && a.value.trim());

  try {
    clearStatus();
    await adminCreateProduct({
      name: trimmedName,
      price: { amount: priceAmount, currency: 'RUB' },
      stock: Math.trunc(stockAmount),
      attributes,
    });
    actionMessage.value = 'Товар создан';
    closeCreateModal();
    await loadProducts();
  } catch {
    setError('Не удалось создать товар');
  }
}

async function handleEditSubmit(): Promise<void> {
  const product = editingProduct.value;
  if (!product) return;

  const trimmedName = formName.value.trim();
  const priceAmount = Number(formPrice.value.replace(',', '.'));
  const stockAmount = Number(formStock.value);

  if (!trimmedName) {
    setError('Название товара не может быть пустым');
    return;
  }

  if (!Number.isFinite(priceAmount) || !Number.isFinite(stockAmount)) {
    setError('Цена и остаток должны быть числами');
    return;
  }

  const attributes = formAttributes.value.filter((a) => a.key.trim() && a.value.trim());

  try {
    clearStatus();
    await adminUpdateProduct(product.id, {
      name: trimmedName,
      price: { amount: priceAmount, currency: product.price.currency },
      stock: Math.trunc(stockAmount),
      attributes,
    });
    actionMessage.value = 'Товар обновлён';
    closeEditModal();
    await loadProducts();
  } catch {
    setError('Не удалось обновить товар');
  }
}

function openOfferModal(product: AdminProduct): void {
  managingOffersProduct.value = product;
  formSellerId.value = '';
  formOfferPrice.value = '';
  formOfferDelivery.value = '';
  formOfferStock.value = '';
  showOfferModal.value = true;
}

function closeOfferModal(): void {
  showOfferModal.value = false;
  managingOffersProduct.value = null;
}

async function handleCreateOffer(): Promise<void> {
  const product = managingOffersProduct.value;
  if (!product) return;

  const priceAmount = Number(formOfferPrice.value.replace(',', '.'));
  const stockAmount = Number(formOfferStock.value);

  if (!formSellerId.value) {
    setError('Выберите продавца');
    return;
  }

  if (!Number.isFinite(priceAmount) || !Number.isFinite(stockAmount)) {
    setError('Цена и остаток должны быть числами');
    return;
  }

  try {
    clearStatus();
    await adminCreateOffer({
      product_id: product.id,
      seller_id: formSellerId.value,
      price: { amount: priceAmount, currency: 'RUB' },
      delivery_date: formOfferDelivery.value || new Date().toISOString().split('T')[0],
      stock: Math.trunc(stockAmount),
    });
    actionMessage.value = 'Предложение добавлено';
    closeOfferModal();
  } catch {
    setError('Не удалось добавить предложение');
  }
}

async function handleDelete(id: string): Promise<void> {
  const product = findProduct(id);
  if (!product) {
    setError('Товар не найден');
    return;
  }

  if (!window.confirm(`Удалить товар «${product.name}»?`)) {
    return;
  }

  try {
    clearStatus();
    await adminDeleteProduct(id);
    actionMessage.value = 'Товар удалён';
    await loadProducts();
  } catch {
    setError('Не удалось удалить товар');
  }
}

function handleUploadImage(id: string): void {
  uploadTargetId.value = id;
  fileInput.value?.click();
}

async function handleFileChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  const productId = uploadTargetId.value;

  uploadTargetId.value = null;
  input.value = '';

  if (!file || !productId) {
    return;
  }

  try {
    clearStatus();
    await adminUploadImage(productId, file);
    actionMessage.value = 'Изображение загружено';
    await loadProducts();
  } catch {
    setError('Не удалось загрузить изображение');
  }
}

async function handleLogout(): Promise<void> {
  await auth.logout();
}

onMounted(async () => {
  if (!isAuthenticated.value) {
    await router.push('/admin/login');
    return;
  }

  await loadProducts();
});
</script>

<template>
  <main class="admin-page">
    <header class="admin-page__header">
      <div>
        <p class="admin-page__eyebrow">Админ-панель</p>
        <h1 class="admin-page__title">Каталог товаров</h1>
        <p class="admin-page__subtitle">
          Всего товаров: {{ productCount }}
        </p>
      </div>

      <div class="admin-page__actions">
        <button
          class="admin-page__create"
          type="button"
          @click="openCreateModal"
        >
          + Создать товар
        </button>
        <button
          class="admin-page__logout"
          type="button"
          @click="handleLogout"
        >
          Выйти
        </button>
      </div>
    </header>

    <section class="admin-page__content">
      <p
        v-if="error"
        class="admin-page__alert admin-page__alert--error"
        role="alert"
      >
        {{ error }}
      </p>

      <p
        v-if="actionMessage"
        class="admin-page__alert admin-page__alert--success"
        role="status"
      >
        {{ actionMessage }}
      </p>

      <p
        v-if="isLoading"
        class="admin-page__state"
      >
        Загружаем товары...
      </p>

      <p
        v-else-if="!products.length"
        class="admin-page__state"
      >
        Товары не найдены.
      </p>

      <ProductsTable
        v-else
        :products="products"
        @delete="handleDelete"
        @edit="openEditModal"
        @upload-image="handleUploadImage"
        @manage-offers="openOfferModal"
      />
    </section>

    <input
      ref="fileInput"
      accept="image/*"
      class="admin-page__file-input"
      type="file"
      @change="handleFileChange"
    >

    <!-- Create Product Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal" @click.stop>
        <h2 class="modal__title">Создать товар</h2>
        <div class="modal__form">
          <label class="modal__label">
            Название
            <input v-model="formName" class="modal__input" type="text" placeholder="Например: Ноутбук">
          </label>
          <label class="modal__label">
            Цена (₽)
            <input v-model="formPrice" class="modal__input" type="text" placeholder="1000">
          </label>
          <label class="modal__label">
            Остаток
            <input v-model="formStock" class="modal__input" type="number" placeholder="10">
          </label>
          <div class="modal__attributes">
            <p class="modal__label">Атрибуты</p>
            <div v-for="(attr, index) in formAttributes" :key="index" class="modal__attr-row">
              <input v-model="attr.key" class="modal__input modal__input--small" placeholder="Ключ" type="text">
              <input v-model="attr.value" class="modal__input modal__input--small" placeholder="Значение" type="text">
              <button class="modal__btn-remove" type="button" @click="removeAttributeField(index)">×</button>
            </div>
            <button class="modal__btn-add" type="button" @click="addAttributeField">+ Добавить атрибут</button>
          </div>
        </div>
        <div class="modal__actions">
          <button class="modal__btn modal__btn--secondary" type="button" @click="closeCreateModal">Отмена</button>
          <button class="modal__btn modal__btn--primary" type="button" @click="handleCreateSubmit">Создать</button>
        </div>
      </div>
    </div>

    <!-- Edit Product Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal" @click.stop>
        <h2 class="modal__title">Редактировать товар</h2>
        <div class="modal__form">
          <label class="modal__label">
            Название
            <input v-model="formName" class="modal__input" type="text">
          </label>
          <label class="modal__label">
            Цена (₽)
            <input v-model="formPrice" class="modal__input" type="text">
          </label>
          <label class="modal__label">
            Остаток
            <input v-model="formStock" class="modal__input" type="number">
          </label>
          <div class="modal__attributes">
            <p class="modal__label">Атрибуты</p>
            <div v-for="(attr, index) in formAttributes" :key="index" class="modal__attr-row">
              <input v-model="attr.key" class="modal__input modal__input--small" placeholder="Ключ" type="text">
              <input v-model="attr.value" class="modal__input modal__input--small" placeholder="Значение" type="text">
              <button class="modal__btn-remove" type="button" @click="removeAttributeField(index)">×</button>
            </div>
            <button class="modal__btn-add" type="button" @click="addAttributeField">+ Добавить атрибут</button>
          </div>
        </div>
        <div class="modal__actions">
          <button class="modal__btn modal__btn--secondary" type="button" @click="closeEditModal">Отмена</button>
          <button class="modal__btn modal__btn--primary" type="button" @click="handleEditSubmit">Сохранить</button>
        </div>
      </div>
    </div>

    <!-- Manage Offers Modal -->
    <div v-if="showOfferModal" class="modal-overlay" @click="closeOfferModal">
      <div class="modal modal--wide" @click.stop>
        <h2 class="modal__title">Добавить предложение</h2>
        <p v-if="managingOffersProduct" class="modal__subtitle">
          Товар: {{ managingOffersProduct.name }}
        </p>
        <div class="modal__form">
          <label class="modal__label">
            Продавец
            <select v-model="formSellerId" class="modal__input">
              <option value="">Выберите продавца</option>
              <option v-for="seller in sellers" :key="seller.id" :value="seller.id">
                {{ seller.name }} (рейтинг: {{ seller.rating }})
              </option>
            </select>
          </label>
          <label class="modal__label">
            Цена (₽)
            <input v-model="formOfferPrice" class="modal__input" type="text" placeholder="1000">
          </label>
          <label class="modal__label">
            Дата доставки
            <input v-model="formOfferDelivery" class="modal__input" type="date">
          </label>
          <label class="modal__label">
            Остаток
            <input v-model="formOfferStock" class="modal__input" type="number" placeholder="10">
          </label>
        </div>
        <div class="modal__actions">
          <button class="modal__btn modal__btn--secondary" type="button" @click="closeOfferModal">Отмена</button>
          <button class="modal__btn modal__btn--primary" type="button" @click="handleCreateOffer">Добавить</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.admin-page {
  background:
    radial-gradient(circle at top right, rgba(15, 23, 42, 0.08), transparent 36%),
    linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  min-height: 100vh;
  padding: 1.5rem;
}

.admin-page__header,
.admin-page__content {
  margin: 0 auto;
  max-width: 72rem;
}

.admin-page__header {
  align-items: end;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.admin-page__eyebrow {
  color: #64748b;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin: 0 0 0.35rem;
  text-transform: uppercase;
}

.admin-page__title {
  color: #0f172a;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  line-height: 1.05;
  margin: 0;
}

.admin-page__subtitle {
  color: #475569;
  margin: 0.45rem 0 0;
}

.admin-page__logout {
  background: #0f172a;
  border: 0;
  border-radius: 0.875rem;
  color: #fff;
  font-weight: 700;
  padding: 0.8rem 1rem;
}

.admin-page__content {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);
  padding: 1rem;
}

.admin-page__alert,
.admin-page__state {
  border-radius: 0.875rem;
  margin: 0 0 1rem;
  padding: 0.875rem 1rem;
}

.admin-page__alert--error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.admin-page__alert--success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.admin-page__state {
  background: #f8fafc;
  color: #475569;
}

.admin-page__file-input {
  display: none;
}

.admin-page__actions {
  display: flex;
  gap: 0.75rem;
}

.admin-page__create {
  background: #16a34a;
  border: 0;
  border-radius: 0.875rem;
  color: #fff;
  font-weight: 700;
  padding: 0.8rem 1.25rem;
}

.admin-page__create:hover {
  background: #15803d;
}

/* Modal Styles */
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  bottom: 0;
  display: flex;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal {
  background: #fff;
  border-radius: 1rem;
  max-width: 32rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal--wide {
  max-width: 40rem;
}

.modal__title {
  color: #0f172a;
  font-size: 1.5rem;
  margin: 0 0 0.25rem;
}

.modal__subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0 0 1rem;
}

.modal__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.modal__label {
  color: #334155;
  display: flex;
  flex-direction: column;
  font-size: 0.875rem;
  font-weight: 600;
  gap: 0.35rem;
}

.modal__input {
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 1rem;
  padding: 0.625rem 0.75rem;
}

.modal__input--small {
  flex: 1;
}

.modal__attributes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modal__attr-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.modal__btn-remove {
  background: #ef4444;
  border: 0;
  border-radius: 0.375rem;
  color: #fff;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  padding: 0.35rem 0.625rem;
}

.modal__btn-remove:hover {
  background: #dc2626;
}

.modal__btn-add {
  background: #3b82f6;
  border: 0;
  border-radius: 0.5rem;
  color: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.modal__btn-add:hover {
  background: #2563eb;
}

.modal__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.modal__btn {
  border: 0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.625rem 1.25rem;
  cursor: pointer;
}

.modal__btn--secondary {
  background: #f1f5f9;
  color: #475569;
}

.modal__btn--secondary:hover {
  background: #e2e8f0;
}

.modal__btn--primary {
  background: #0f172a;
  color: #fff;
}

.modal__btn--primary:hover {
  background: #1e293b;
}
</style>
