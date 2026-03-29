/*
MODULE_CONTRACT: Expose the product card widget public surface for catalog consumers.
SCOPE: Re-export the product card component only.
DEPENDS: ./ProductCard.vue
LINKS: [ProductCard][render][BLOCK_RENDER_CARD]

MODULE_MAP:
- ProductCard - Public export declared in this module.
CONTRACT:
PURPOSE: Re-export the governed public surface for this slice or layer.
INPUTS: Internal exports referenced by the barrel statements below.
OUTPUTS: Stable named exports for upstream consumers.
SIDE_EFFECTS: none.
START_BLOCK_RENDER_CARD
Public entrypoint for the product card widget.
END_BLOCK_RENDER_CARD
CHANGE_SUMMARY: Adds a narrow barrel for the product card widget without leaking internal implementation details.
*/
export { default as ProductCard } from './ProductCard.vue';
