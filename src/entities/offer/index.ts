/*
MODULE_CONTRACT: Expose the public offer entity surface for frontend consumers.
SCOPE: Re-export the stable offer types and sort constants only.
DEPENDS: ./model/types
LINKS: [OfferEntity][types][BLOCK_DEFINE_OFFER_TYPES]

MODULE_MAP:
- OFFER_SORT_VALUES - Public export declared in this module.
- Offer - Public export declared in this module.
- OfferSort - Public export declared in this module.
CONTRACT:
PURPOSE: Re-export the governed public surface for this slice or layer.
INPUTS: Internal exports referenced by the barrel statements below.
OUTPUTS: Stable named exports for upstream consumers.
SIDE_EFFECTS: none.
START_BLOCK_DEFINE_OFFER_INDEX
Public entrypoint for the offer entity slice.
END_BLOCK_DEFINE_OFFER_INDEX
CHANGE_SUMMARY: Adds a narrow barrel that exposes the offer contract and sort semantics.
*/
export { OFFER_SORT_VALUES } from './model/types';
export type { Offer, OfferSort } from './model/types';

