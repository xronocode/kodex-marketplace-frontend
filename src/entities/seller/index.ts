/*
MODULE_CONTRACT: Expose the public seller entity surface for frontend consumers.
SCOPE: Re-export the stable seller types only.
DEPENDS: ./model/types
LINKS: [SellerEntity][types][BLOCK_DEFINE_SELLER_TYPES]

MODULE_MAP:
- index - Module-local surface declared in this file.
CONTRACT:
PURPOSE: Re-export the governed public surface for this slice or layer.
INPUTS: Internal exports referenced by the barrel statements below.
OUTPUTS: Stable named exports for upstream consumers.
SIDE_EFFECTS: none.
START_BLOCK_DEFINE_SELLER_INDEX
Public entrypoint for the seller entity slice.
END_BLOCK_DEFINE_SELLER_INDEX
CHANGE_SUMMARY: Adds a narrow barrel that exposes the seller contract without shared API or product coupling.
*/
export type { Seller } from './model/types';
