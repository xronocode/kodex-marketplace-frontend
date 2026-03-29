/*
MODULE_CONTRACT: Expose the public admin page surface for the frontend app router.
SCOPE: Admin login page and authenticated admin catalog page exports only.
DEPENDS: ./LoginPage.vue, ./AdminPage.vue
LINKS: [AdminPage][loadProducts][BLOCK_LOAD_PRODUCTS]

MODULE_MAP:
- AdminPage - Public export declared in this module.
- LoginPage - Public export declared in this module.
CONTRACT:
PURPOSE: Re-export the governed public surface for this slice or layer.
INPUTS: Internal exports referenced by the barrel statements below.
OUTPUTS: Stable named exports for upstream consumers.
SIDE_EFFECTS: none.
START_BLOCK_MODULE
Public entrypoint for the admin page module.
END_BLOCK_MODULE
CHANGE_SUMMARY: Adds the admin page barrel export for login and catalog pages.
*/
export { default as AdminPage } from './AdminPage.vue';
export { default as LoginPage } from './LoginPage.vue';
