"use client";
import { useTranslations } from "@/components/i18n/LocaleProvider";
import { IconByName } from "@/components/icons/registry";
import { RedeemButton } from "@/components/redeem/RedeemButton";
import styles from "./hype.module.css";

export interface ShelfReward {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  moreNeeded: number;
}

/**
 * The kid's reward motivators: a shelf of rewards they can grab right now, and
 * the single closest reward with a progress bar to pull them forward.
 */
export function RewardShelf({
  available,
  affordable,
  nextUp,
}: {
  available: number;
  affordable: ShelfReward[];
  nextUp: ShelfReward | null;
}) {
  const tr = useTranslations();

  if (affordable.length === 0 && !nextUp) return null;

  return (
    <>
      {affordable.length > 0 ? (
        <section className={styles.shelf} aria-labelledby="redeem-now">
          <h2 id="redeem-now" className={styles.shelfTitle}>
            {tr("ui.you.can.get.these.now")}
          </h2>
          <ul className={styles.shelfRow}>
            {affordable.map((r) => (
              <li key={r.id}>
                <RedeemButton
                  rewardId={r.id}
                  name={r.name}
                  cost={r.cost}
                  className={styles.shelfCard}
                >
                  <span className={styles.shelfIcon}>
                    <IconByName name={r.emoji} size={28} />
                  </span>
                  <span className={styles.shelfName}>
                    <bdi>{r.name}</bdi>
                  </span>
                  <span dir="ltr" className={styles.shelfCost}>
                    {tr("flow.pts", { count: r.cost })}
                  </span>
                </RedeemButton>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {nextUp ? (
        <section className={styles.almost} aria-labelledby="almost-there">
          <h2 id="almost-there" className={styles.shelfTitle}>
            {tr("ui.almost.there")}
          </h2>
          <div className={styles.almostCard}>
            <span className={styles.shelfIcon}>
              <IconByName name={nextUp.emoji} size={28} />
            </span>
            <div className={styles.almostText}>
              <span className={styles.shelfName}>
                <bdi>{nextUp.name}</bdi>
              </span>
              <span className={styles.almostNeed}>
                {tr("flow.moreReward", { count: nextUp.moreNeeded })}
              </span>
              <progress
                className={styles.bar}
                value={Math.max(0, available)}
                max={nextUp.cost}
                aria-label={tr("ui.name.of.name.points.toward.name", {
                  p0: Math.max(0, available),
                  p1: nextUp.cost,
                  p2: nextUp.name,
                })}
              />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
