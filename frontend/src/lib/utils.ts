/**
 * Utility functions for common operations
 */

/**
 * Parse a date string in YYYY-MM-DD format as local time to avoid timezone issues.
 * When you use `new Date('2024-01-15')`, JavaScript interprets it as UTC midnight,
 * which can shift the date by a day depending on your timezone.
 * This function ensures the date is interpreted in the local timezone.
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object in local timezone
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a date string in YYYY-MM-DD format to a localized string.
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatLocalDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format a date string in YYYY-MM-DD format to a simple localized string.
 * Uses default browser locale.
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string
 */
export function formatLocalDateSimple(dateString: string): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString();
}
