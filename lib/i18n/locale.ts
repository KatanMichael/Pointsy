/** Pure locale negotiation; no cookies or request APIs are read here. */
export type Locale = "en" | "he";
export const locales = ["en", "he"] as const;
export const defaultLocale: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "he";
}

export function resolveLocale(
  cookie: string | undefined,
  acceptLanguage: string | null,
): Locale {
  if (isLocale(cookie)) return cookie;
  const preferences = (acceptLanguage ?? "")
    .split(",")
    .flatMap((entry, index) => {
      const match =
        /^\s*([a-z]{1,8}(?:-[a-z0-9]{1,8})*)(?:\s*;\s*q=(0(?:\.\d{0,3})?|1(?:\.0{0,3})?))?\s*$/i.exec(
          entry,
        );
      if (!match) return [];
      const quality = match[2] === undefined ? 1 : Number(match[2]);
      const language = match[1].toLowerCase().split("-")[0];
      const locale = language === "iw" ? "he" : language;
      return quality > 0 && isLocale(locale)
        ? [{ locale, quality, index }]
        : [];
    });
  preferences.sort((a, b) => b.quality - a.quality || a.index - b.index);
  return preferences[0]?.locale ?? defaultLocale;
}

export function direction(locale: Locale): "ltr" | "rtl" {
  return locale === "he" ? "rtl" : "ltr";
}

export function intlLocale(locale: Locale): string {
  return locale === "he" ? "he-IL" : "en-US";
}
