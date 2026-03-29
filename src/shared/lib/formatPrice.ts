/*
MODULE_CONTRACT: Shared price formatting helper for frontend display strings.
SCOPE: ru-RU currency formatting with zero fractional digits.
DEPENDS: Intl.NumberFormat
LINKS: [FrontendSharedLib][format][BLOCK_FORMAT_OUTPUT]

MODULE_MAP:
- formatPrice - Public export declared in this module.
CONTRACT:
PURPOSE: Provide the governed module behavior described by MODULE_CONTRACT.
INPUTS: Module-local parameters, props, or declarations referenced below.
OUTPUTS: The exported component, helper, or typed surface declared in this file.
SIDE_EFFECTS: Local state changes and explicitly declared router, browser, or transport interactions only.
START_BLOCK_FORMAT_OUTPUT
Formats numeric amounts as ru-RU currency strings.
END_BLOCK_FORMAT_OUTPUT
CHANGE_SUMMARY: Adds deterministic currency formatting for shared UI usage.
*/
export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('ru-RU', {
    currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(amount);
}
