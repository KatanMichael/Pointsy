import { direction, type Locale } from "@/lib/i18n/locale";
import { formatNumber } from "@/lib/i18n/format";

/** Semantic events: each recipient's device chooses the language at send time. */
export type PushMessage =
  | { kind: "earned"; amount: number; reason: string }
  | { kind: "undone"; amount: number; reason: string; chore: boolean }
  | { kind: "choreLogged"; name: string | null }
  | { kind: "choreApproved"; amount: number; reason: string }
  | { kind: "choreDenied"; reason: string }
  | { kind: "rewardRequested"; name: string | null; reward: string }
  | { kind: "rewardApproved"; reward: string }
  | { kind: "teamInvite"; name: string | null }
  | { kind: "teamReady" };

export interface FormattedPushMessage {
  title: string;
  body: string;
  url: string;
  lang: Locale;
  dir: "ltr" | "rtl";
}

/** Isolate dynamic names/reasons without modifying stored content. */
const isolate = (text: string) => `\u2068${text}\u2069`;

export function formatPushMessage(
  locale: Locale,
  message: PushMessage,
): FormattedPushMessage {
  const he = locale === "he";
  let title: string;
  let body: string;
  let url = "/me";
  switch (message.kind) {
    case "earned":
    case "choreApproved": {
      const amount = isolate(`+${formatNumber(locale, message.amount)}`);
      title =
        message.kind === "earned"
          ? he
            ? "צברת נקודות! 🎉"
            : "You earned points! 🎉"
          : he
            ? "המשימה אושרה! 🎉"
            : "Chore approved! 🎉";
      body = he
        ? `${amount} על ${isolate(message.reason)}`
        : `${amount} for ${isolate(message.reason)}`;
      break;
    }
    case "undone": {
      const amount = isolate(`−${formatNumber(locale, message.amount)}`);
      title = message.chore
        ? he
          ? "משימה הוחזרה"
          : "A chore was put back"
        : he
          ? "נקודות הוחזרו"
          : "Points were put back";
      body = `${amount} · ${isolate(message.reason)}`;
      if (message.chore)
        body += he ? " — יש לבצע שוב את המשימה" : " needs doing again";
      break;
    }
    case "choreLogged":
      title = he ? "משימה ממתינה לאישור" : "Chore to review";
      body = he
        ? `משימה חדשה מאת ${isolate(message.name ?? "אחד הילדים")}`
        : `${isolate(message.name ?? "A child")} logged a chore`;
      url = "/dashboard";
      break;
    case "choreDenied":
      title = he ? "המשימה לא אושרה" : "Chore not approved";
      body = he
        ? `המשימה ״${isolate(message.reason)}״ לא אושרה הפעם.`
        : `Your "${isolate(message.reason)}" wasn't approved this time.`;
      break;
    case "rewardRequested":
      title = he ? "בקשה לפרס" : "Reward requested";
      body = he
        ? `בקשה מאת ${isolate(message.name ?? "אחד הילדים")}: ${isolate(message.reward)}`
        : `${isolate(message.name ?? "A child")} wants ${isolate(message.reward)}`;
      url = "/dashboard";
      break;
    case "rewardApproved":
      title = he ? "הפרס אושר! 🎉" : "Reward approved! 🎉";
      body = he
        ? `הבקשה לפרס ${isolate(message.reward)} אושרה.`
        : `Your ${isolate(message.reward)} was approved.`;
      break;
    case "teamInvite":
      title = he ? "הזמנה לפרס משותף! 🤝" : "Team-up invite! 🤝";
      body = he
        ? `הזמנה מאת ${isolate(message.name ?? "אחד הילדים")} לצבור יחד נקודות לפרס.`
        : `${isolate(message.name ?? "A teammate")} wants to team up for a reward.`;
      url = "/redeem";
      break;
    case "teamReady":
      title = he ? "פרס משותף מוכן לאישור" : "Team-up ready";
      body = he
        ? "בקשה לפרס משותף ממתינה לאישור שלך."
        : "A team reward is ready for your approval.";
      url = "/dashboard";
      break;
  }
  return { title, body, url, lang: locale, dir: direction(locale) };
}
