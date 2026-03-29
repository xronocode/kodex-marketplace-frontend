/*
MODULE_CONTRACT: Expose the public product page entrypoint for the frontend router.
SCOPE: Re-export the product page component only.
DEPENDS: ./ProductPage.vue
LINKS: [ProductPage][fallback][BLOCK_PRODUCT_FALLBACK]

MODULE_MAP:
- ProductPage - Public export declared in this module.
CONTRACT:
PURPOSE: Re-export the governed public surface for this slice or layer.
INPUTS: Internal exports referenced by the barrel statements below.
OUTPUTS: Stable named exports for upstream consumers.
SIDE_EFFECTS: none.
START_BLOCK_MODULE
Public barrel for the product page surface.
END_BLOCK_MODULE
CHANGE_SUMMARY: Adds a narrow page barrel that only exports the thin product fallback page component.
*/
export { default as ProductPage } from './ProductPage.vue';
