/*
MODULE_CONTRACT: Expose the public admin products table widget surface.
SCOPE: ProductsTable component export only.
DEPENDS: ./ProductsTable.vue
LINKS: [ProductsTable][actions][BLOCK_TABLE_ACTIONS]

MODULE_MAP:
- ProductsTable - Public export declared in this module.
CONTRACT:
PURPOSE: Re-export the governed public surface for this slice or layer.
INPUTS: Internal exports referenced by the barrel statements below.
OUTPUTS: Stable named exports for upstream consumers.
SIDE_EFFECTS: none.
START_BLOCK_TABLE_ACTIONS
Re-export the admin products table widget as the widget module public API.
END_BLOCK_TABLE_ACTIONS
CHANGE_SUMMARY: Adds the widget barrel for the admin products table.
*/
export { default as ProductsTable } from './ProductsTable.vue';
