/**
 * Provides UTC date/time variables for template injection.
 *
 * - YEAR, MONTH, DAY: string representations of the current UTC date
 * - NOW: epoch milliseconds (number) suitable for ICU date/time formatting
 *   e.g. `{NOW, date, long}` or `{NOW, time, short}`
 *
 * Values are computed at call time so they always reflect the current moment.
 */
export function getUtcDateVars(): Record<string, string | number> {
  const now = new Date();
  return {
    YEAR: String(now.getUTCFullYear()),
    MONTH: String(now.getUTCMonth() + 1).padStart(2, '0'),
    DAY: String(now.getUTCDate()).padStart(2, '0'),
    NOW: now.getTime(),
  };
}
