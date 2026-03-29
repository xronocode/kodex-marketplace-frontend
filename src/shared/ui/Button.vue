<!--
MODULE_CONTRACT: Define the shared button primitive for frontend actions and triggers.
SCOPE: Typed variant, size, and native button-type props only.
DEPENDS: src/shared/ui/Spinner.vue, src/shared/ui/index.ts
LINKS: [FrontendSharedUi][render][BLOCK_RENDER_SHARED_UI]

MODULE_MAP:
- Button - Vue single-file component default export.
COMPONENT_CONTRACT:
PURPOSE: Render the component behavior described by MODULE_CONTRACT.
INPUTS: Declared props, local reactive state, and emitted UI events handled in this file.
OUTPUTS: Rendered markup plus the documented emitted events or route transitions.
SIDE_EFFECTS: DOM updates, local reactive state changes, and any router/API calls declared below.
START_BLOCK_RENDER_SHARED_UI
Render a native button element with consistent shared UI styling.
END_BLOCK_RENDER_SHARED_UI
CHANGE_SUMMARY: Adds a reusable button primitive with typed variants, native semantics, and no business logic.
-->
<script setup lang="ts">
import { computed } from 'vue';

import Spinner from './Spinner.vue';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonType = 'button' | 'submit' | 'reset';

interface ButtonProps {
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  size?: ButtonSize;
  type?: ButtonType;
  variant?: ButtonVariant;
}

const props = withDefaults(defineProps<ButtonProps>(), {
  block: false,
  disabled: false,
  loading: false,
  size: 'md',
  type: 'button',
  variant: 'primary',
});

const isDisabled = computed(() => props.disabled || props.loading);
</script>

<template>
  <button
    class="button"
    :class="[
      `button--${props.variant}`,
      `button--${props.size}`,
      { 'button--block': props.block, 'button--loading': props.loading },
    ]"
    :disabled="isDisabled"
    :type="props.type"
  >
    <span class="button__content">
      <Spinner
        v-if="props.loading"
        aria-hidden="true"
        class="button__spinner"
        label="Loading"
        size="sm"
      />
      <span class="button__label">
        <slot />
      </span>
    </span>
  </button>
</template>

<style scoped>
@import '@/shared/styles/tokens.css';

.button {
  appearance: none;
  align-items: center;
  border: var(--border-width-thin) solid transparent;
  border-radius: var(--radius-xl);
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-weight: var(--font-weight-semibold);
  justify-content: center;
  line-height: 1;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast),
    opacity var(--transition-fast);
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.button:not(:disabled):active {
  transform: translateY(1px);
}

.button--block {
  width: 100%;
}

.button--sm {
  min-height: 2rem;
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-xs);
}

.button--md {
  min-height: 2.5rem;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-sm);
}

.button--lg {
  min-height: 3rem;
  padding: var(--spacing-4) var(--spacing-5);
  font-size: var(--font-size-base);
}

.button--primary {
  background: var(--color-primary);
  color: #ffffff;
}

.button--primary:not(:disabled):hover {
  background: var(--color-primary-hover);
}

.button--secondary {
  background: var(--color-bg-primary);
  border-color: var(--color-border-secondary);
  color: var(--color-text-primary);
}

.button--secondary:not(:disabled):hover {
  background: var(--color-bg-secondary);
}

.button--ghost {
  background: transparent;
  color: var(--color-text-primary);
}

.button--ghost:not(:disabled):hover {
  background: var(--color-bg-tertiary);
}

.button--danger {
  background: var(--color-error);
  color: #ffffff;
}

.button--danger:not(:disabled):hover {
  background: #b91c1c;
}

.button__content {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.button__spinner {
  flex: none;
}
</style>
