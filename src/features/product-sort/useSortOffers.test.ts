/*
MODULE_CONTRACT: Verify the product sort composable keeps deterministic offer sort state.
SCOPE: Ref state updates and public OfferSort typing only.
DEPENDS: vitest, vue, ./useSortOffers, @/entities/offer
LINKS: [ProductSort][state][BLOCK_SET_SORT]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_SET_SORT_SPEC
Test the sort state helper without UI or fetching concerns.
END_BLOCK_SET_SORT_SPEC
CHANGE_SUMMARY: Adds coverage for the default sort value and direct toggles between the public offer sort literals.
*/
import { describe, expect, it, expectTypeOf } from 'vitest';

import type { OfferSort } from '@/entities/offer';

import { useSortOffers } from './useSortOffers';

describe('useSortOffers', () => {
  it('starts on price and toggles between public sort values', () => {
    const sortState = useSortOffers();

    expectTypeOf(sortState.currentSort.value).toEqualTypeOf<OfferSort>();
    expect(sortState.currentSort.value).toBe('price');

    sortState.setSort('delivery_date');
    expect(sortState.currentSort.value).toBe('delivery_date');

    sortState.setSort('price');
    expect(sortState.currentSort.value).toBe('price');
  });

  it('respects an explicit initial sort', () => {
    const sortState = useSortOffers('delivery_date');

    expect(sortState.currentSort.value).toBe('delivery_date');
  });
});
