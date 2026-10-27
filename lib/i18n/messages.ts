import { domainEn, domainHe } from "./domain-messages";
import { coreEn, coreHe } from "./core-messages";
/** Flat semantic keys. Translations are plain text; callers render rich markup. */
export const en = {
  ...coreEn,
  ...domainEn,
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.back": "Back",
  "common.close": "Close",
  "common.loading": "Loading…",
  "common.language": "Language",
  "common.discardDraft":
    "Your unsaved changes will be lost when you switch language. Continue?",
  "common.english": "English",
  "common.hebrew": "עברית",
  "common.continue": "Continue",
  "common.signOut": "Sign out",
  "auth.welcome": "Hello, {name}",
  "auth.signIn": "Sign in",
  "auth.createFamily": "Create a family",
  "auth.familyCode": "Family code",
  "auth.pin": "PIN",
  "auth.password": "Password",
  "errors.generic": "Something went wrong. Please try again.",
  "errors.required": "This field is required.",
  "errors.invalidCredentials": "Incorrect email or password.",
  "errors.rateLimited": "Too many attempts. Please try again later.",
  "nav.home": "Home",
  "nav.dashboard": "Dashboard",
  "nav.chores": "Chores",
  "nav.rewards": "Rewards",
  "nav.activity": "Activity",
  "nav.manage": "Manage",
  "core.balance": "Balance",
  "core.available": "Available",
  "core.points": {
    zero: "{count} points",
    one: "{count} point",
    two: "{count} points",
    few: "{count} points",
    many: "{count} points",
    other: "{count} points",
  },
} as const;

export type MessageKey = keyof typeof en;
export type PluralMessage = Record<Intl.LDMLPluralRule, string>;
export type Message = string | PluralMessage;
type Placeholders<S extends string> =
  S extends `${string}{${infer Name}}${infer Rest}`
    ? Name | Placeholders<Rest>
    : never;
type TextOf<M> = M extends string
  ? M
  : M extends Record<string, string>
    ? M[keyof M]
    : never;
export type MessageParams<K extends MessageKey> = {
  [P in Placeholders<TextOf<(typeof en)[K]>>]: P extends "count"
    ? number
    : string | number;
};
type SameParams<A extends string, B extends string> = [
  Placeholders<A>,
] extends [Placeholders<B>]
  ? [Placeholders<B>] extends [Placeholders<A>]
    ? A
    : never
  : never;
type CheckedMessage<K extends MessageKey, M> = (typeof en)[K] extends string
  ? M extends string
    ? SameParams<M, TextOf<(typeof en)[K]>>
    : never
  : M extends PluralMessage
    ? {
        [P in keyof M]: M[P] extends string
          ? SameParams<M[P], TextOf<(typeof en)[K]>>
          : never;
      }
    : never;
type Catalog = { [K in MessageKey]: Message };

/** Ensures exact key and placeholder parity at compile time, including every plural branch. */
export function defineMessages<const T extends Catalog>(
  messages: T & { [K in MessageKey]: CheckedMessage<K, T[K]> } & Record<
      Exclude<keyof T, MessageKey>,
      never
    >,
): T {
  return messages;
}

export const he = defineMessages({
  ...coreHe,
  ...domainHe,
  "common.save": "שמירה",
  "common.cancel": "ביטול",
  "common.back": "חזרה",
  "common.close": "סגירה",
  "common.loading": "בטעינה…",
  "common.language": "שפה",
  "common.discardDraft": "שינויים שלא נשמרו יאבדו עם החלפת השפה. להמשיך?",
  "common.english": "English",
  "common.hebrew": "עברית",
  "common.continue": "המשך",
  "common.signOut": "יציאה",
  "auth.welcome": "שלום, {name}",
  "auth.signIn": "כניסה",
  "auth.createFamily": "יצירת משפחה",
  "auth.familyCode": "קוד משפחה",
  "auth.pin": "קוד אישי",
  "auth.password": "סיסמה",
  "errors.generic": "משהו השתבש. יש לנסות שוב.",
  "errors.required": "זהו שדה חובה.",
  "errors.invalidCredentials": "הפרטים שהוזנו שגויים.",
  "errors.rateLimited": "יותר מדי ניסיונות. יש לנסות שוב מאוחר יותר.",
  "nav.home": "בית",
  "nav.dashboard": "לוח בקרה",
  "nav.chores": "משימות",
  "nav.rewards": "פרסים",
  "nav.activity": "פעילות",
  "nav.manage": "ניהול",
  "core.balance": "יתרה",
  "core.available": "זמין",
  "core.points": {
    zero: "{count} נקודות",
    one: "{count} נקודה",
    two: "{count} נקודות",
    few: "{count} נקודות",
    many: "{count} נקודות",
    other: "{count} נקודות",
  },
});
