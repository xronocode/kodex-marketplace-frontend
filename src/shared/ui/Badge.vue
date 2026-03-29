<!--
MODULE_CONTRACT: Define the shared badge primitive for compact status and label rendering.
SCOPE: Typed tone/size props with slot-based content only.
DEPENDS: src/shared/ui/index.ts
LINKS: [FrontendSharedUi][render][BLOCK_RENDER_SHARED_UI]

MODULE_MAP:
- Badge - Vue single-file component default export.
COMPONENT_CONTRACT:
PURPOSE: Render the component behavior described by MODULE_CONTRACT.
INPUTS: Declared props, local reactive state, and emitted UI events handled in this file.
OUTPUTS: Rendered markup plus the documented emitted events or route transitions.
SIDE_EFFECTS: DOM updates, local reactive state changes, and any router/API calls declared below.
START_BLOCK_RENDER_SHARED_UI
Render a compact label badge with configurable tone and size variants.
END_BLOCK_RENDER_SHARED_UI
CHANGE_SUMMARY: Adds a reusable badge primitive with semantic tone styling and no domain coupling.
-->
<script setup lang="ts">
type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  size?: BadgeSize;
  tone?: BadgeTone;
}

const props = withDefaults(defineProps<BadgeProps>(), {
  size: 'md',
  tone: 'neutral',
});
</script>

<template>
  <span
    class="badge"
    :class="[`badge--${props.tone}`, `badge--${props.size}`]"
  >
    <slot />
  </span>
</template>

<style scoped>
@import '@/shared/styles/tokens.css';

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: var(--border-width-thin) solid transparent;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.badge--sm {
  min-height: 1.25rem;
  padding: 0 var(--spacing-1);
  font-size: var(--font-size-xs);
}

.badge--md {
  min-height: 1.5rem;
  padding: 0 var(--spacing-2);
  font-size: var(--font-size-sm);
}

.badge--neutral {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-secondary);
  color: var(--color-text-secondary);
}

.badge--info {
  background: #e0f2fe;
  border-color: #bae6fd;
  color: #075985;
}

.badge--success {
  background: var(--color-success-bg);
  border-color: #bbf7d0;
  color: var(--color-success);
}

.badge--warning {
  background: var(--color-warning-bg);
  border-color: #fde68a;
  color: #92400e;
}

.badge--danger {
  background: var(--color-error-bg);
  border-color: #fecaca;
  color: var(--color-error);
}
</style>
