import { translate, intlLocale, type Locale } from "@/lib/i18n";
import type { Challenge, ChallengeGoal, ChallengeScope } from "@/lib/db/schema";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "2026-06-24" → "Jun 24". */
export function formatDay(isoDate: string, locale: Locale = "en"): string {
  if (locale === "he")
    return new Intl.DateTimeFormat(intlLocale(locale), {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(isoDate + "T12:00:00Z"));
  const [, m, d] = isoDate.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${d}`;
}

export function dateRange(
  startsOn: string,
  endsOn: string | null,
  locale: Locale = "en",
): string {
  if (locale === "he")
    return endsOn
      ? translate(locale, "domain.range", {
          start: formatDay(startsOn, locale),
          end: formatDay(endsOn, locale),
        })
      : translate(locale, "domain.from", { date: formatDay(startsOn, locale) });
  if (!endsOn) return `From ${formatDay(startsOn)}`;
  return `${formatDay(startsOn)} – ${formatDay(endsOn)}`;
}

/** A short, human description of what the goal asks for. */
export function goalSummary(
  goalType: ChallengeGoal,
  target: number,
  locale: Locale = "en",
): string {
  if (locale === "he" && target === 1)
    return translate(
      locale,
      goalType === "points"
        ? "domain.pointsGoalOne"
        : goalType === "chore_count"
          ? "domain.choreGoalOne"
          : "domain.coreGoalOne",
    );
  if (locale === "he")
    return translate(
      locale,
      goalType === "points"
        ? "domain.pointsGoal"
        : goalType === "chore_count"
          ? "domain.choreGoal"
          : "domain.coreGoal",
      { count: target },
    );
  if (goalType === "points") return `Earn ${target} points`;
  if (goalType === "chore_count") {
    return `Log ${target} ${target === 1 ? "chore" : "chores"}`;
  }
  return `All core chores, ${target} ${target === 1 ? "day" : "days"}`;
}

export function scopeLabel(
  scope: ChallengeScope,
  locale: Locale = "en",
): string {
  if (locale === "he") return scope === "family" ? "כל המשפחה" : "לכל ילד";
  return scope === "family" ? "Whole family" : "Each kid";
}

export type ChallengeStatus = "active" | "upcoming" | "ended" | "paused";

export function challengeStatus(
  challenge: Pick<Challenge, "isActive" | "startsOn" | "endsOn">,
  today: string,
): ChallengeStatus {
  if (!challenge.isActive) return "paused";
  if (today < challenge.startsOn) return "upcoming";
  // A weekly challenge with no end date never "ends".
  if (challenge.endsOn && today > challenge.endsOn) return "ended";
  return "active";
}
