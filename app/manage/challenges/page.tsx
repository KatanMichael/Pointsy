import { formatNumber } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate, type Translator } from "@/lib/i18n";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { getFamilyTimezone } from "@/lib/family/settings";
import { listChallenges } from "@/lib/challenges/service";
import { localDate } from "@/lib/timezone";
import {
  goalSummary,
  scopeLabel,
  dateRange,
  challengeStatus,
  type ChallengeStatus,
} from "@/lib/challenges/format";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ManageNav } from "@/components/manage/ManageNav";
import manage from "@/components/manage/manage.module.css";
import styles from "@/components/challenges/challenges.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: translate(locale, "meta.app.manage.challenges.page.tsx.title"),
  };
}

export default async function ChallengesPage() {
  const locale = await getRequestLocale();
  const tr = translate.bind(null, locale) as Translator;
  const STATUS_LABEL: Record<ChallengeStatus, string> = {
    active: tr("ui.active"),
    upcoming: tr("ui.upcoming"),
    ended: tr("ui.ended"),
    paused: tr("ui.paused"),
  };

  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "parent") redirect("/me");

  const db = getDb();
  const [list, tz] = await Promise.all([
    listChallenges(db, session.familyId),
    getFamilyTimezone(db, session.familyId),
  ]);
  const today = localDate(tz, new Date());
  const sorted = [...list].reverse(); // newest first

  return (
    <main id="main" className={manage.main}>
      <ScreenHeader
        title={tr("ui.challenges")}
        intro={tr("ui.time.boxed.goals.that.pay.a.bonus.when.a")}
      />

      {sorted.length === 0 ? (
        <p className={styles.empty}>
          {tr("ui.no.challenges.yet.add.one.to.kick.off.a")}
        </p>
      ) : (
        <ul className={styles.list}>
          {sorted.map((c) => {
            const status = challengeStatus(c, today);
            return (
              <li key={c.id}>
                <Link
                  href={`/manage/challenges/${c.id}`}
                  className={styles.row}
                >
                  <span className={styles.icon} aria-hidden="true">
                    <Trophy size={20} />
                  </span>
                  <span className={styles.main}>
                    <span className={styles.name}>
                      <bdi>{c.title}</bdi>
                    </span>
                    <span className={styles.meta}>
                      {goalSummary(c.goalType, c.goalTarget, locale)} ·{" "}
                      {scopeLabel(c.scope, locale)} ·{" "}
                      {dateRange(c.startsOn, c.endsOn, locale)}
                      {c.recurrence === "weekly" ? tr("ui.weekly.330") : ""}
                    </span>
                  </span>
                  <span className={styles.end}>
                    <span className={styles.bonus}>
                      +{formatNumber(locale, c.bonusPoints)}
                    </span>
                    <span className={styles.status} data-status={status}>
                      {STATUS_LABEL[status]}
                    </span>
                  </span>
                  <ChevronRight
                    size={18}
                    aria-hidden="true"
                    className={styles.chevron}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <ManageNav section="challenges" />
    </main>
  );
}
