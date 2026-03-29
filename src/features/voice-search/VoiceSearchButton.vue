<!--
MODULE_CONTRACT: Render a support-aware voice search trigger that disappears when speech capture is unavailable.
SCOPE: Unsupported-browser hiding, click event forwarding, and local composable support state only.
DEPENDS: ./useVoiceSearch
LINKS: [VoiceSearch][support][BLOCK_SUPPORT_CHECK]

MODULE_MAP:
- VoiceSearchButton - Vue single-file component default export.
COMPONENT_CONTRACT:
PURPOSE: Render the component behavior described by MODULE_CONTRACT.
INPUTS: Declared props, local reactive state, and emitted UI events handled in this file.
OUTPUTS: Rendered markup plus the documented emitted events or route transitions.
SIDE_EFFECTS: DOM updates, local reactive state changes, and any router/API calls declared below.
START_BLOCK_MODULE
Voice-search trigger button that only renders when browser speech recognition is available.
END_BLOCK_MODULE
START_BLOCK_SUPPORT_CHECK
[VoiceSearch][support][BLOCK_SUPPORT_CHECK] Hide the trigger when the browser cannot provide speech recognition support.
END_BLOCK_SUPPORT_CHECK
CHANGE_SUMMARY: Adds a support-aware voice search button that emits click events and hides itself in unsupported browsers.
-->
<script setup lang="ts">
import { computed } from 'vue';

import { useVoiceSearch } from './useVoiceSearch';

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const { isSupported } = useVoiceSearch();

const shouldRender = computed(() => isSupported.value);
</script>

<template>
  <button
    v-if="shouldRender"
    type="button"
    @click="emit('click', $event)"
  >
    <slot>Voice search</slot>
  </button>
</template>
