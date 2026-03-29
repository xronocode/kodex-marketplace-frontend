/*
MODULE_CONTRACT: Tests for the shared date formatting helper.
SCOPE: Today/tomorrow labels and ru-RU day-month output.
DEPENDS: vitest, ./formatDate
LINKS: [FrontendSharedLib][format][BLOCK_FORMAT_OUTPUT]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_FORMAT_OUTPUT
Verifies calendar-relative labels and day-month formatting for representative inputs.
END_BLOCK_FORMAT_OUTPUT
CHANGE_SUMMARY: Adds module-local coverage for deterministic date formatting.
*/
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { formatDate } from './formatDate';

describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-28T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns Сегодня for the current calendar day', () => {
    expect(formatDate('2026-03-28')).toBe('Сегодня');
  });

  it('returns Завтра for the next calendar day', () => {
    expect(formatDate('2026-03-29')).toBe('Завтра');
  });

  it('formats other dates as day and month in ru-RU', () => {
    expect(formatDate('2026-04-02')).toBe('2 апр.');
  });
});
