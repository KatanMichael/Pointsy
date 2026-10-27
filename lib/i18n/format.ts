import { intlLocale, type Locale } from "./locale";

export function formatNumber(locale: Locale, value: number): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(value);
}

/** Always use the family's timezone, never the server/browser timezone. */
export function formatDateTime(
  locale: Locale,
  value: Date | number,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function formatRelativeTime(
  locale: Locale,
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
): string {
  return new Intl.RelativeTimeFormat(intlLocale(locale), {
    numeric: "auto",
  }).format(value, unit);
}
