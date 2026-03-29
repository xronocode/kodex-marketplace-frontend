/*
MODULE_CONTRACT: Define the public entrypoint for product sort state and controls.
SCOPE: Sort composable, sort buttons, and the public offer sort type only.
DEPENDS: ./useSortOffers, ./SortButtons.vue, @/entities/offer
LINKS: [ProductSort][state][BLOCK_SET_SORT]

MODULE_MAP:
- SortButtons - Public export declared in this module.
- useSortOffers - Public export declared in this module.
- OfferSort - DEPENDS: @/entities/offer, re-exported type.
CONTRACT:
PURPOSE: Re-export the governed public surface for this slice or layer.
INPUTS: Internal exports referenced by the barrel statements below.
OUTPUTS: Stable named exports for upstream consumers.
SIDE_EFFECTS: none.
START_BLOCK_SET_SORT
Expose the product sort module API for modal consumers.
END_BLOCK_SET_SORT
CHANGE_SUMMARY: Adds a narrow barrel for the product sort feature surface.
*/
export { default as SortButtons } from './SortButtons.vue';
export { useSortOffers } from './useSortOffers';
export type { OfferSort } from '@/entities/offer';
