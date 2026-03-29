/*
MODULE_CONTRACT: Tests for the shared price formatting helper.
SCOPE: Representative ru-RU currency outputs.
DEPENDS: vitest, ./formatPrice
LINKS: [FrontendSharedLib][format][BLOCK_FORMAT_OUTPUT]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_FORMAT_OUTPUT
Verifies price formatting is stable for representative amounts and currencies.
END_BLOCK_FORMAT_OUTPUT
CHANGE_SUMMARY: Adds module-local coverage for ru-RU currency formatting.
*/
import { describe, expect, it } from 'vitest';

import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('formats ruble values with ru-RU currency rules', () => {
    expect(formatPrice(1200, 'RUB')).toBe('1 200 ₽');
  });

  it('formats zero-fraction foreign currency values', () => {
    expect(formatPrice(1999.6, 'USD')).toBe('2 000 $');
  });
});
