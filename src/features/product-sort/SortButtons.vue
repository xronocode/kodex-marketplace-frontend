<!--
MODULE_CONTRACT: Define the offer sort toggle buttons used by the product modal.
SCOPE: v-model contract and user-triggered sort selection only.
DEPENDS: @/entities/offer, @/shared/ui
LINKS: [ProductSort][state][BLOCK_SET_SORT]

MODULE_MAP:
- SortButtons - Vue single-file component default export.
COMPONENT_CONTRACT:
PURPOSE: Render the component behavior described by MODULE_CONTRACT.
INPUTS: Declared props, local reactive state, and emitted UI events handled in this file.
OUTPUTS: Rendered markup plus the documented emitted events or route transitions.
SIDE_EFFECTS: DOM updates, local reactive state changes, and any router/API calls declared below.
START_BLOCK_SET_SORT
Render the public offer sort values as toggle buttons.
END_BLOCK_SET_SORT
CHANGE_SUMMARY: Adds a v-model-driven sort button control that emits the public offer sort literals.
-->
<script setup lang="ts">
import { computed } from 'vue';

import { Button } from '@/shared/ui';
import type { OfferSort } from '@/entities/offer';

interface SortButtonsProps {
  modelValue: OfferSort;
}

const props = defineProps<SortButtonsProps>();
const emit = defineEmits<{
  'update:modelValue': [value: OfferSort];
}>();

const options = [
  { label: 'По цене', value: 'price' as const },
  { label: 'По дате доставки', value: 'delivery_date' as const },
];

const activeSort = computed(() => props.modelValue);

const selectSort = (sort: OfferSort): void => {
  if (sort !== activeSort.value) {
    emit('update:modelValue', sort);
  }
};
</script>

<template>
  <div class="sort-buttons" role="group" aria-label="Сортировка предложений">
    <Button
      v-for="option in options"
      :key="option.value"
      class="sort-buttons__button"
      :variant="activeSort === option.value ? 'primary' : 'secondary'"
      size="sm"
      type="button"
      :aria-pressed="activeSort === option.value"
      @click="selectSort(option.value)"
    >
      {{ option.label }}
    </Button>
  </div>
</template>

<style scoped>
.sort-buttons {
  display: inline-flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sort-buttons__button {
  min-width: 0;
}
</style>
