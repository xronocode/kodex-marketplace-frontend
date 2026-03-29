/*
MODULE_CONTRACT: Shared formatting library barrel for frontend callers.
SCOPE: Re-export price and date helpers from the shared lib module.
DEPENDS: ./formatPrice, ./formatDate
LINKS: [FrontendSharedLib][format][BLOCK_FORMAT_OUTPUT]

MODULE_MAP:
- formatDate - Public export declared in this module.
- formatPrice - Public export declared in this module.
CONTRACT:
PURPOSE: Re-export the governed public surface for this slice or layer.
INPUTS: Internal exports referenced by the barrel statements below.
OUTPUTS: Stable named exports for upstream consumers.
SIDE_EFFECTS: none.
START_BLOCK_FORMAT_OUTPUT
Public entrypoint for shared formatting helpers.
END_BLOCK_FORMAT_OUTPUT
CHANGE_SUMMARY: Exposes the shared formatting helpers through a single barrel.
*/
export { formatDate } from './formatDate';
export { formatPrice } from './formatPrice';
