/*
MODULE_CONTRACT: Bootstrap the Vue application with the shared router and Pinia instances.
SCOPE: App creation, plugin registration, and mounting to #app only.
DEPENDS: vue, ./app, ./app/App.vue
LINKS: [FrontendApp][bootstrap][BLOCK_BOOTSTRAP_APP]

MODULE_MAP:
- main - Module-local surface declared in this file.
CONTRACT:
PURPOSE: Provide the governed module behavior described by MODULE_CONTRACT.
INPUTS: Module-local parameters, props, or declarations referenced below.
OUTPUTS: The exported component, helper, or typed surface declared in this file.
SIDE_EFFECTS: Local state changes and explicitly declared router, browser, or transport interactions only.
START_BLOCK_MODULE
Application entrypoint for the frontend runtime.
END_BLOCK_MODULE
CHANGE_SUMMARY: Mounts the Vue root component with router and Pinia plugins.
*/
import { createApp } from 'vue';

import App from '@/app/App.vue';
import { pinia, router } from '@/app';

createApp(App).use(router).use(pinia).mount('#app');
