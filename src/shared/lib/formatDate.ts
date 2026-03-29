/*
MODULE_CONTRACT: Shared date formatting helper for frontend display strings.
SCOPE: Today/tomorrow labels and ru-RU day-month formatting.
DEPENDS: Date, Intl.DateTimeFormat
LINKS: [FrontendSharedLib][format][BLOCK_FORMAT_OUTPUT]

MODULE_MAP:
- formatDate - Public export declared in this module.
CONTRACT:
PURPOSE: Provide the governed module behavior described by MODULE_CONTRACT.
INPUTS: Module-local parameters, props, or declarations referenced below.
OUTPUTS: The exported component, helper, or typed surface declared in this file.
SIDE_EFFECTS: Local state changes and explicitly declared router, browser, or transport interactions only.
START_BLOCK_FORMAT_OUTPUT
Formats date-like inputs as Сегодня, Завтра, or ru-RU day-month strings.
END_BLOCK_FORMAT_OUTPUT
CHANGE_SUMMARY: Adds deterministic calendar-label formatting for shared UI usage.
*/
function parseDateInput(dateStr: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(dateStr);
}

function toLocalDateKey(date: Date): string {
  return [date.getFullYear(), date.getMonth(), date.getDate()].join('-');
}

export function formatDate(dateStr: string): string {
  const date = parseDateInput(dateStr);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dateKey = toLocalDateKey(date);
  const todayKey = toLocalDateKey(today);
  const tomorrowKey = toLocalDateKey(tomorrow);

  if (dateKey === todayKey) {
    return 'Сегодня';
  }

  if (dateKey === tomorrowKey) {
    return 'Завтра';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}
