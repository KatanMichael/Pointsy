"use client";
import { formatNumber } from "@/lib/i18n";

import type { Translator } from "@/lib/i18n";

import { useLocale, useTranslations } from "@/components/i18n/LocaleProvider";
import { Hourglass } from "lucide-react";
import { IconByName } from "@/components/icons/registry";
import { RedeemButton } from "@/components/redeem/RedeemButton";
import type { GoalProgress } from "@/lib/redemptions/service";
import hype from "./hype.module.css";
import styles from "./special.module.css";

/** A cheer that scales with how close the kid is — small wins feel like wins. */
function cheer(
  pct: number,
  moreNeeded: number,
  pending: boolean,
  tr: Translator,
): string {
  if (pending) return tr("ui.requested.waiting.for.a.grown.up");
  if (moreNeeded === 0) return tr("ui.you.saved.enough.go.claim.it");
  if (pct >= 75) return tr("ui.so.close.almost.there");
  if (pct >= 50) return tr("ui.over.halfway.keep.going");
  if (pct >= 25) return tr("ui.great.start.keep.it.up");
  return tr("ui.let.s.save.up.for.this");
}

/**
 * "Just for you" — rewards a parent set aside for this kid, shown as bright,
 * encouraging progress cards (closest first) to pull them toward the goal. When
 * they've saved enough it flips to a celebratory claim button.
 */
export function KidRewardGoals({ rewards }: { rewards: GoalProgress[] }) {
  const locale = useLocale();
  const tr = useTranslations();

  if (rewards.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="just-for-you">
      <h2 id="just-for-you" className={hype.shelfTitle}>
        {tr("ui.just.for.you")}
      </h2>
      <ul className={styles.list}>
        {rewards.map((g) => {
          const ready = g.moreNeeded === 0;
          const have = Math.max(0, g.saved);
          return (
            <li
              key={g.reward.id}
              className={
                g.pending
                  ? `${styles.card} ${styles.pendingCard}`
                  : ready
                    ? `${styles.card} ${styles.ready}`
                    : styles.card
              }
            >
              <div className={styles.top}>
                <Ring
                  pct={g.pct}
                  emoji={g.reward.emoji}
                  ready={ready && !g.pending}
                  pending={g.pending}
                />
                <div className={styles.info}>
                  <span className={styles.name}>
                    <bdi>{g.reward.name}</bdi>
                  </span>
                  <span className={styles.cheer}>
                    {cheer(g.pct, g.moreNeeded, g.pending, tr)}
                  </span>
                </div>
              </div>

              <progress
                className={
                  g.pending ? `${hype.bar} ${hype.pendingBar}` : hype.bar
                }
                value={have}
                max={g.reward.cost}
                aria-label={tr("ui.name.of.name.points.toward.name.52", {
                  p0: have,
                  p1: g.reward.cost,
                  p2: g.reward.name,
                })}
              />

              <div className={styles.foot}>
                <span dir="ltr" className={styles.count}>
                  {have} / {tr("flow.pts", { count: g.reward.cost })}
                </span>
                {g.pending ? (
                  <span className={styles.pending}>
                    <Hourglass size={13} aria-hidden="true" />
                    {tr("ui.pending")}
                  </span>
                ) : ready ? (
                  <RedeemButton
                    rewardId={g.reward.id}
                    name={g.reward.name}
                    cost={g.reward.cost}
                    className={styles.claim}
                  >
                    {tr("ui.claim.it")}
                  </RedeemButton>
                ) : (
                  <span className={styles.toGo}>
                    {formatNumber(locale, g.moreNeeded)} {tr("ui.to.go")}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Ring({
  pct,
  emoji,
  ready,
  pending,
}: {
  pct: number;
  emoji: string;
  ready: boolean;
  pending: boolean;
}) {
  const r = 30;
  const circumference = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, pct)) / 100) * circumference;
  const fillClass = pending
    ? hype.ringFillPending
    : ready
      ? styles.ringFillReady
      : hype.ringFill;
  return (
    <div className={hype.ringWrap} aria-hidden="true">
      <svg viewBox="0 0 72 72" className={hype.ring}>
        <circle cx="36" cy="36" r={r} className={hype.ringTrack} />
        <circle
          cx="36"
          cy="36"
          r={r}
          className={fillClass}
          strokeDasharray={`${dash} ${circumference}`}
          transform="rotate(-90 36 36)"
          strokeLinecap="round"
        />
      </svg>
      <span className={styles.ringIcon}>
        <IconByName name={emoji} size={26} />
      </span>
    </div>
  );
}
