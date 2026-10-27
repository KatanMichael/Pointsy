"use client";
import { formatNumber } from "@/lib/i18n";

import { useLocale, useTranslations } from "@/components/i18n/LocaleProvider";
import { Trophy } from "lucide-react";
import type { ChallengeProgress } from "@/lib/challenges/service";

import styles from "./kid-challenges.module.css";

/** Active challenges the kid is part of, with a live progress bar. */
export function KidChallenges({ items }: { items: ChallengeProgress[] }) {
  const locale = useLocale();
  const tr = useTranslations();

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="challenges-heading" className={styles.section}>
      <h2 id="challenges-heading" className={styles.heading}>
        <Trophy size={20} aria-hidden="true" />
        {tr("ui.challenges")}
      </h2>
      <ul className={styles.list}>
        {items.map((p) => {
          const done = p.awarded; // green only once the bonus is actually paid
          const shown = Math.min(p.value, p.target);
          return (
            <li
              key={p.challenge.id}
              className={styles.card}
              data-complete={done}
            >
              <div className={styles.top}>
                <span className={styles.name}>
                  <bdi>{p.challenge.title}</bdi>
                </span>
                <span className={styles.bonus}>
                  +{formatNumber(locale, p.challenge.bonusPoints)}
                </span>
              </div>
              {/* Decorative — the status line below states the numbers. */}
              <div className={styles.track} aria-hidden="true">
                <div
                  className={styles.fill}
                  data-complete={done}
                  style={{ width: `${p.pct}%` }}
                />
              </div>
              <p className={styles.status}>
                {p.awarded
                  ? tr("ui.done.bonus.earned")
                  : p.pendingApproval
                    ? tr("ui.done.waiting.for.a.grown.up")
                    : p.complete
                      ? tr("ui.complete")
                      : tr(
                          p.challenge.goalType === "points"
                            ? "flow.progressPoints"
                            : p.challenge.goalType === "chore_count"
                              ? "flow.progressChores"
                              : "flow.progressDays",
                          { done: shown, total: p.target },
                        )}
                {p.challenge.scope === "family" ? (
                  <span className={styles.team}> {tr("ui.team")}</span>
                ) : null}
                {p.challenge.recurrence === "weekly" ? (
                  <span className={styles.team}> {tr("ui.weekly")}</span>
                ) : null}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
