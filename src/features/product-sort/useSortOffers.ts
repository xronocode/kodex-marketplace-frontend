/*
MODULE_CONTRACT: Define the product sort state helper for offer ordering controls.
SCOPE: Local reactive sort state and deterministic setter only.
DEPENDS: vue, @/entities/offer
LINKS: [ProductSort][state][BLOCK_SET_SORT]

MODULE_MAP:
- useSortOffers - Public export declared in this module.
CONTRACT:
PURPOSE: Execute the composable behavior described by MODULE_CONTRACT.
INPUTS: Function parameters plus reactive, browser, or transport dependencies declared in this module.
OUTPUTS: Reactive state objects and helper functions returned by the composable.
SIDE_EFFECTS: Reactive state mutation, browser API access, and optional HTTP calls.
START_BLOCK_SET_SORT
Manage the active offer sort value for the product modal.
END_BLOCK_SET_SORT
CHANGE_SUMMARY: Adds a small composable that owns the current offer sort value and a typed setter.
*/
import { ref, type Ref } from 'vue';

import type { OfferSort } from '@/entities/offer';

export function useSortOffers(initialSort: OfferSort = 'price'): {
  currentSort: Ref<OfferSort>;
  setSort: (sort: OfferSort) => void;
} {
  const currentSort = ref<OfferSort>(initialSort);

  const setSort = (sort: OfferSort): void => {
    currentSort.value = sort;
  };

  return {
    currentSort,
    setSort,
  };
}
