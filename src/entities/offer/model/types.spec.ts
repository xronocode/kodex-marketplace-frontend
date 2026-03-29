/*
MODULE_CONTRACT: Verify the public offer contract stays stable for consumers.
SCOPE: Runtime sort values and type-level export compatibility.
DEPENDS: vitest, ./types, ../index
LINKS: [OfferEntity][types][BLOCK_DEFINE_OFFER_TYPES]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_DEFINE_OFFER_TYPES_SPEC
Checks the offer contract and sort surface remain stable.
END_BLOCK_DEFINE_OFFER_TYPES_SPEC
CHANGE_SUMMARY: Adds local coverage for the offer entity types and barrel exports.
*/
import { describe, expect, it, expectTypeOf } from 'vitest';

import { OFFER_SORT_VALUES } from './types';
import type { Offer, OfferMoney, OfferSellerSummary, OfferSort } from './types';
import { OFFER_SORT_VALUES as OFFER_SORT_VALUES_FROM_INDEX } from '../index';
import type { Offer as OfferFromIndex, OfferSort as OfferSortFromIndex } from '../index';

describe('offer types', () => {
  it('keeps the runtime sort values stable', () => {
    expect(OFFER_SORT_VALUES).toEqual(['price', 'delivery_date']);
    expect(OFFER_SORT_VALUES_FROM_INDEX).toBe(OFFER_SORT_VALUES);
  });

  it('keeps the exported types stable for consumers', () => {
    expectTypeOf<OfferSort>().toEqualTypeOf<'price' | 'delivery_date'>();
    expectTypeOf<Offer>().toMatchTypeOf<{
      id: string;
      seller: OfferSellerSummary;
      price: OfferMoney;
      delivery_date: string | null;
    }>();
    expectTypeOf<OfferSortFromIndex>().toEqualTypeOf<OfferSort>();
    expectTypeOf<OfferFromIndex>().toEqualTypeOf<Offer>();
  });
});
