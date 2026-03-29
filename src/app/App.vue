<!--
MODULE_CONTRACT: Render the root Vue application shell and host the active route view.
SCOPE: Root shell container and RouterView mounting only.
DEPENDS: vue-router
LINKS: [FrontendApp][bootstrap][BLOCK_BOOTSTRAP_APP]

MODULE_MAP:
- App - Vue single-file component default export.
COMPONENT_CONTRACT:
PURPOSE: Render the component behavior described by MODULE_CONTRACT.
INPUTS: Declared props, local reactive state, and emitted UI events handled in this file.
OUTPUTS: Rendered markup plus the documented emitted events or route transitions.
SIDE_EFFECTS: DOM updates, local reactive state changes, and any router/API calls declared below.
START_BLOCK_MODULE
Application shell boundary for the Vue root component.
END_BLOCK_MODULE
CHANGE_SUMMARY: Adds the minimal root shell that renders the active route outlet.
-->
<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <RouterView />
</template>
