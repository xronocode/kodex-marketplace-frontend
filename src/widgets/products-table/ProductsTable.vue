<!--
MODULE_CONTRACT: Render the admin products table and emit row actions for product management.
SCOPE: Read-only product rows with edit, delete, and upload-image emits only.
DEPENDS: @/entities/product, @/shared/ui
LINKS: [ProductsTable][actions][BLOCK_TABLE_ACTIONS]

MODULE_MAP:
- ProductsTable - Vue single-file component default export.
COMPONENT_CONTRACT:
PURPOSE: Render the component behavior described by MODULE_CONTRACT.
INPUTS: Declared props, local reactive state, and emitted UI events handled in this file.
OUTPUTS: Rendered markup plus the documented emitted events or route transitions.
SIDE_EFFECTS: DOM updates, local reactive state changes, and any router/API calls declared below.
START_BLOCK_TABLE_ACTIONS
Render the admin product table with Russian labels and row-level action emits.
END_BLOCK_TABLE_ACTIONS
CHANGE_SUMMARY: Adds the admin products table widget with typed emits, shared UI primitives, and stable row rendering.
-->
<script setup lang="ts">
import { Badge, Button } from '@/shared/ui';
import type { AdminProduct } from '@/entities/product';

interface ProductsTableProps {
  products: AdminProduct[];
}

const props = defineProps<ProductsTableProps>();

const emit = defineEmits<{
  edit: [product: AdminProduct];
  delete: [id: string];
  uploadImage: [id: string];
  manageOffers: [product: AdminProduct];
}>();

const formatPrice = (amount: number, currency: string): string => {
  const formattedAmount = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formattedAmount} ${currency}`;
};

const hasImage = (product: AdminProduct): boolean =>
  Boolean(product.image_url || product.thumbnail_url);
</script>

<template>
  <div class="products-table">
    <table class="products-table__table">
      <thead>
        <tr>
          <th scope="col">Название</th>
          <th scope="col">Цена</th>
          <th scope="col">Остаток</th>
          <th scope="col">Изображение</th>
          <th scope="col">Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="product in props.products"
          :key="product.id"
        >
          <td class="products-table__name">{{ product.name }}</td>
          <td>{{ formatPrice(product.price.amount, product.price.currency) }}</td>
          <td>{{ product.stock }}</td>
          <td>
            <Badge :tone="hasImage(product) ? 'success' : 'neutral'">
              {{ hasImage(product) ? 'Да' : 'Нет' }}
            </Badge>
          </td>
          <td>
            <div class="products-table__actions">
              <Button
                size="sm"
                type="button"
                variant="secondary"
                @click="emit('edit', product)"
              >
                Редактировать
              </Button>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                @click="emit('manageOffers', product)"
              >
                Предложения
              </Button>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                @click="emit('uploadImage', product.id)"
              >
                Загрузить изображение
              </Button>
              <Button
                size="sm"
                type="button"
                variant="danger"
                @click="emit('delete', product.id)"
              >
                Удалить
              </Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.products-table {
  overflow-x: auto;
}

.products-table__table {
  border-collapse: collapse;
  width: 100%;
  min-width: 760px;
}

.products-table__table th,
.products-table__table td {
  border-bottom: 1px solid #e2e8f0;
  padding: 0.875rem 1rem;
  text-align: left;
  vertical-align: middle;
}

.products-table__table th {
  background: #f8fafc;
  color: #334155;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.products-table__name {
  font-weight: 600;
  color: #0f172a;
}

.products-table__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
