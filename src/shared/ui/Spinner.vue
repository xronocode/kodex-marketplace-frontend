<!--
MODULE_CONTRACT: Define the shared spinner primitive for frontend loading states.
SCOPE: Accessible inline SVG rendering and typed visual props only.
DEPENDS: src/shared/ui/index.ts
LINKS: [FrontendSharedUi][render][BLOCK_RENDER_SHARED_UI]

MODULE_MAP:
- Spinner - Vue single-file component default export.
COMPONENT_CONTRACT:
PURPOSE: Render the component behavior described by MODULE_CONTRACT.
INPUTS: Declared props, local reactive state, and emitted UI events handled in this file.
OUTPUTS: Rendered markup plus the documented emitted events or route transitions.
SIDE_EFFECTS: DOM updates, local reactive state changes, and any router/API calls declared below.
START_BLOCK_RENDER_SHARED_UI
Render a self-contained, animated spinner with typed size and label props.
END_BLOCK_RENDER_SHARED_UI
CHANGE_SUMMARY: Adds a reusable spinner primitive with no business logic or external dependencies.
-->
<script setup lang="ts">
type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  label?: string;
  size?: SpinnerSize;
}

const props = withDefaults(defineProps<SpinnerProps>(), {
  label: 'Loading',
  size: 'md',
});

const sizeMap: Record<SpinnerSize, number> = {
  lg: 32,
  md: 24,
  sm: 16,
};
</script>

<template>
  <span
    class="spinner"
    :class="[`spinner--${props.size}`]"
    role="status"
    :aria-label="props.label"
  >
    <svg
      aria-hidden="true"
      class="spinner__icon"
      fill="none"
      :height="sizeMap[props.size]"
      viewBox="0 0 24 24"
      :width="sizeMap[props.size]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        class="spinner__track"
        cx="12"
        cy="12"
        r="9"
      />
      <path
        class="spinner__indicator"
        d="M21 12a9 9 0 0 0-9-9"
      />
    </svg>
  </span>
</template>

<style scoped>
.spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  line-height: 0;
}

.spinner__icon {
  animation: spinner-rotate 0.8s linear infinite;
}

.spinner__track,
.spinner__indicator {
  stroke: currentColor;
  stroke-width: 2.25;
  stroke-linecap: round;
}

.spinner__track {
  opacity: 0.2;
}

.spinner__indicator {
  opacity: 0.95;
}

.spinner--sm .spinner__icon {
  animation-duration: 0.7s;
}

.spinner--lg .spinner__icon {
  animation-duration: 0.95s;
}

@keyframes spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
