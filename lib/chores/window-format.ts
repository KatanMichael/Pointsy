import { translate, intlLocale, type Locale } from "@/lib/i18n";
/**
 * Human-facing formatting for logging windows — pure and Intl-based, so it runs
 * in both server components and client components (no DOM). Time labels are
 * rendered in the family timezone; the countdown is a plain duration.
 */
import { localDate, weekdayOf } from "@/lib/timezone";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/** Wall-clock time of an instant in a timezone, e.g. "6:00 PM". */
export function formatClock(
  timezone: string,
  at: Date,
  locale: Locale = "en",
): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: locale === "en",
  }).format(at);
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round(
    (Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000,
  );
}

/** "Opens today at 6:00 PM" / "Opens tomorrow at 7:00 AM" / "Opens Saturday at 9:00 AM". */
export function opensLabel(
  opensAt: Date,
  timezone: string,
  now: Date,
  locale: Locale = "en",
): string {
  const time = formatClock(timezone, opensAt, locale);
  const todayD = localDate(timezone, now);
  const openD = localDate(timezone, opensAt);
  const diff = daysBetween(todayD, openD);
  if (locale === "he")
    return diff <= 0
      ? translate(locale, "domain.todayOpen", { time })
      : diff === 1
        ? translate(locale, "domain.tomorrowOpen", { time })
        : translate(locale, "domain.weekdayOpen", {
            time,
            day: new Intl.DateTimeFormat(intlLocale(locale), {
              weekday: "long",
              timeZone: timezone,
            })
              .format(opensAt)
              .replace(/^יום /, ""),
          });
  if (diff <= 0) return `Opens today at ${time}`;
  if (diff === 1) return `Opens tomorrow at ${time}`;
  return `Opens ${WEEKDAYS[weekdayOf(openD)]} at ${time}`;
}

/** "Open now · closes 8:00 PM" for a time-bounded chore that's currently open. */
export function openNowLabel(
  closesAt: Date,
  timezone: string,
  locale: Locale = "en",
): string {
  if (locale === "he")
    return translate(locale, "domain.openNow", {
      time: formatClock(timezone, closesAt, locale),
    });
  return `Open now · closes ${formatClock(timezone, closesAt)}`;
}

/** Compact countdown, e.g. "2d 4h", "2h 14m", "9m", "now". */
export function countdownText(ms: number, locale: Locale = "en"): string {
  if (ms <= 0) return translate(locale, "domain.now");
  const totalMin = Math.ceil(ms / 60000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (locale === "he")
    return d > 0 ? `${d}י׳ ${h}ש׳` : h > 0 ? `${h}ש׳ ${m}ד׳` : `${m}ד׳`;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** Spoken countdown for screen readers, e.g. "2 days 4 hours", "14 minutes". */
export function countdownAria(ms: number, locale: Locale = "en"): string {
  if (ms <= 0) return translate(locale, "domain.now");
  const totalMin = Math.ceil(ms / 60000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (locale === "he") {
    const unit = (n: number, u: "day" | "hour" | "minute") =>
      n === 1
        ? { day: "יום אחד", hour: "שעה אחת", minute: "דקה אחת" }[u]
        : `${n} ${{ day: "ימים", hour: "שעות", minute: "דקות" }[u]}`;
    return d > 0
      ? `${unit(d, "day")} ${unit(h, "hour")}`
      : h > 0
        ? `${unit(h, "hour")} ${unit(m, "minute")}`
        : unit(m, "minute");
  }
  const plural = (n: number, unit: string) =>
    `${n} ${unit}${n === 1 ? "" : "s"}`;
  if (d > 0) return `${plural(d, "day")} ${plural(h, "hour")}`;
  if (h > 0) return `${plural(h, "hour")} ${plural(m, "minute")}`;
  return plural(m, "minute");
}
