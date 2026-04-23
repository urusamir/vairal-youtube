/**
 * Shared formatting utilities used across multiple pages.
 */

function parseDateInput(dateStr: string): Date | null {
  if (!dateStr) return null;

  const normalized = dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`;
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

/**
 * Format a YYYY-MM-DD or ISO date string into a human-readable format.
 * @example formatDisplayDate("2026-03-15") => "Mar 15, 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  const d = parseDateInput(dateStr);
  if (!d) return "Date unavailable";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Format a YYYY-MM-DD or ISO date string into "Month Day" format (no year).
 * @example formatMonthDay("2026-03-15") => "March 15"
 */
export function formatMonthDay(dateStr: string): string {
  const d = parseDateInput(dateStr);
  if (!d) return "Date unavailable";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}
