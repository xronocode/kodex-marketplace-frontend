/*
MODULE_CONTRACT: Verify the public seller contract stays stable for consumers.
SCOPE: Type-level export compatibility only.
DEPENDS: vitest, ./types, ../index
LINKS: [SellerEntity][types][BLOCK_DEFINE_SELLER_TYPES]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_DEFINE_SELLER_TYPES_SPEC
Checks the seller contract remains a pure typed surface.
END_BLOCK_DEFINE_SELLER_TYPES_SPEC
CHANGE_SUMMARY: Adds local coverage for the seller entity types and barrel export.
*/
import { describe, expectTypeOf, it } from 'vitest';

import type { Seller } from './types';
import type { Seller as SellerFromIndex } from '../index';

describe('seller types', () => {
  it('keeps the exported types stable for consumers', () => {
    expectTypeOf<Seller>().toEqualTypeOf<{
      id: string;
      name: string;
      rating: number;
    }>();
    expectTypeOf<SellerFromIndex>().toEqualTypeOf<Seller>();
  });
});
