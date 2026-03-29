/*
MODULE_CONTRACT: Define the public entrypoint for the product modal widget.
SCOPE: Re-export the product modal component only.
DEPENDS: ./ProductModal.vue
LINKS: [ProductModal][watchProductId][BLOCK_FETCH_ON_ID_CHANGE]

MODULE_MAP:
- ProductModal - Public export declared in this module.
CONTRACT:
PURPOSE: Re-export the governed public surface for this slice or layer.
INPUTS: Internal exports referenced by the barrel statements below.
OUTPUTS: Stable named exports for upstream consumers.
SIDE_EFFECTS: none.
START_BLOCK_MODULE
Public product modal widget barrel for frontend consumers.
END_BLOCK_MODULE
CHANGE_SUMMARY: Adds a narrow widget barrel for the product modal surface.
*/
export { default as ProductModal } from './ProductModal.vue';
