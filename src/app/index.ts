/*
MODULE_CONTRACT: Expose the app bootstrap setup surface for router and Pinia wiring.
SCOPE: Router instance, Pinia factory, and shared bootstrap instances only.
DEPENDS: pinia, ./router
LINKS: [FrontendApp][bootstrap][BLOCK_BOOTSTRAP_APP]

MODULE_MAP:
- createAppPinia - Public export declared in this module.
- pinia - Public export declared in this module.
- createAppRouter - Public export declared in this module.
- router - Public export declared in this module.
CONTRACT:
PURPOSE: Re-export the governed public surface for this slice or layer.
INPUTS: Internal exports referenced by the barrel statements below.
OUTPUTS: Stable named exports for upstream consumers.
SIDE_EFFECTS: none.
START_BLOCK_MODULE
Application setup surface for the Vue root bootstrap.
END_BLOCK_MODULE
CHANGE_SUMMARY: Adds the shared router export and Pinia setup surface for app bootstrap.
*/
import { createPinia } from 'pinia';

import { createAppRouter, router } from './router';

export function createAppPinia() {
  return createPinia();
}

export { createAppRouter, router };

export const pinia = createAppPinia();
