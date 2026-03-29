/*
MODULE_CONTRACT: Expose the public catalog page entrypoint for the frontend router.
SCOPE: Re-export the catalog page component only.
DEPENDS: ./CatalogPage.vue
LINKS: [CatalogPage][agentSearch][BLOCK_AGENT_SEARCH_HANDLER]

MODULE_MAP:
- CatalogPage - Public export declared in this module.
CONTRACT:
PURPOSE: Re-export the governed public surface for this slice or layer.
INPUTS: Internal exports referenced by the barrel statements below.
OUTPUTS: Stable named exports for upstream consumers.
SIDE_EFFECTS: none.
START_BLOCK_MODULE
Public barrel for the catalog page surface.
END_BLOCK_MODULE
CHANGE_SUMMARY: Adds a narrow page barrel that only exports the public catalog page component.
*/
export { default as CatalogPage } from './CatalogPage.vue';
