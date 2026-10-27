import {
  en,
  he,
  type Message,
  type MessageKey,
  type MessageParams,
} from "./messages";
import { intlLocale, type Locale } from "./locale";
import { formatNumber } from "./format";
export {
  defaultLocale,
  direction,
  intlLocale,
  isLocale,
  locales,
  resolveLocale,
} from "./locale";
export type { Locale } from "./locale";
export { formatNumber, formatDateTime, formatRelativeTime } from "./format";
export type { MessageKey, MessageParams } from "./messages";

export type TranslationArgs<K extends MessageKey> =
  keyof MessageParams<K> extends never ? [] : [params: MessageParams<K>];
export type Translator = <K extends MessageKey>(
  key: K,
  ...args: TranslationArgs<K>
) => string;

export function translate<K extends MessageKey>(
  locale: Locale,
  key: K,
  ...args: TranslationArgs<K>
): string;
export function translate(
  locale: Locale,
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  // English is a runtime safety net for an incomplete catalog; parity is enforced in CI.
  const catalog: Partial<Record<MessageKey, Message>> =
    locale === "he" ? he : en;
  const message = catalog[key] ?? en[key];
  if (!message) throw new Error(`Unknown message key: ${key}`);
  let text: string;
  if (typeof message === "string") {
    text = message;
  } else {
    const count = params?.count;
    if (typeof count !== "number" || !Number.isFinite(count))
      throw new Error(`Numeric count required for ${key}`);
    text =
      message[new Intl.PluralRules(intlLocale(locale)).select(count)] ??
      message.other;
  }
  return text.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params?.[name];
    if (value === undefined)
      throw new Error(`Missing parameter ${name} for ${key}`);
    return typeof value === "number" ? formatNumber(locale, value) : value;
  });
}
