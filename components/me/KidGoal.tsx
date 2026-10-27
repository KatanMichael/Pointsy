"use client";
import { formatNumber } from "@/lib/i18n";

import { useLocale, useTranslations } from "@/components/i18n/LocaleProvider";
import { setGoalAction } from "@/app/actions/redemptions";
import { IconByName } from "@/components/icons/registry";
import type { GoalProgress } from "@/lib/redemptions/service";
import styles from "./hype.module.css";

export interface GoalRewardOption {
  id: string;
  name: string;
  cost: number;
}

/**
 * The kid's savings goal: a progress ring toward the reward they chose, or a
 * picker to set one. Clearing/changing posts the kid-only setGoalAction.
 */
export function KidGoal({
  goal,
  rewardOptions,
}: {
  goal: GoalProgress | null;
  rewardOptions: GoalRewardOption[];
}) {
  const locale = useLocale();
  const tr = useTranslations();

  if (rewardOptions.length === 0) return null;

  return (
    <section className={styles.goal} aria-labelledby="goal-title">
      <h2 id="goal-title" className={styles.shelfTitle}>
        {tr("ui.my.goal")}
      </h2>
      {goal ? (
        <div className={styles.goalRow}>
          <GoalRing
            pct={goal.pct}
            emoji={goal.reward.emoji}
            pending={goal.pending}
          />
          <div className={styles.goalText}>
            <span className={styles.shelfName}>
              <bdi>{goal.reward.name}</bdi>
            </span>
            <span className={styles.almostNeed}>
              {goal.pending
                ? tr("ui.requested.waiting.for.a.grown.up")
                : goal.moreNeeded === 0
                  ? tr("ui.you.have.enough.go.get.it")
                  : tr("ui.name.to.go.name.name", {
                      p0: goal.moreNeeded,
                      p1: goal.saved,
                      p2: goal.reward.cost,
                    })}
            </span>
            <form action={setGoalAction}>
              <input type="hidden" name="rewardId" value="" />
              <button type="submit" className={styles.goalClear}>
                {tr("ui.clear.goal")}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <form action={setGoalAction} className={styles.goalPicker}>
          <label htmlFor="goal-reward" className={styles.goalLabel}>
            {tr("ui.pick.a.reward.to.save.toward")}
          </label>
          <div className={styles.goalPickRow}>
            <select
              id="goal-reward"
              name="rewardId"
              className={styles.goalSelect}
            >
              {rewardOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  <bdi>{r.name}</bdi> ({formatNumber(locale, r.cost)})
                </option>
              ))}
            </select>
            <button type="submit" className={styles.goalSet}>
              {tr("ui.set.goal")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function GoalRing({
  pct,
  emoji,
  pending,
}: {
  pct: number;
  emoji: string;
  pending: boolean;
}) {
  const r = 30;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  const dash = (clamped / 100) * circumference;
  return (
    <div className={styles.ringWrap} aria-hidden="true">
      <svg viewBox="0 0 72 72" className={styles.ring}>
        <circle cx="36" cy="36" r={r} className={styles.ringTrack} />
        <circle
          cx="36"
          cy="36"
          r={r}
          className={pending ? styles.ringFillPending : styles.ringFill}
          strokeDasharray={`${dash} ${circumference}`}
          transform="rotate(-90 36 36)"
          strokeLinecap="round"
        />
      </svg>
      <span className={styles.ringIcon}>
        <IconByName name={emoji} size={24} />
      </span>
    </div>
  );
}
