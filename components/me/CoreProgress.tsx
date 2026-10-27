"use client";
import { useTranslations } from "@/components/i18n/LocaleProvider";
import styles from "./core.module.css";

const R = 34;
const CIRC = 2 * Math.PI * R;

/**
 * The kid's daily core-chore progress: a ring showing how many of today's
 * must-do chores are done, plus their all-done streak. Purely presentational.
 */
export function CoreProgress({
  done,
  total,
  streak,
}: {
  done: number;
  total: number;
  streak: number;
}) {
  const tr = useTranslations();

  const pct = total > 0 ? Math.min(1, done / total) : 0;
  const complete = total > 0 && done >= total;

  return (
    <section className={styles.card} aria-labelledby="core-heading">
      <div className={styles.ringWrap}>
        <svg viewBox="0 0 80 80" className={styles.ring} aria-hidden="true">
          <circle cx="40" cy="40" r={R} className={styles.track} />
          <circle
            cx="40"
            cy="40"
            r={R}
            className={styles.fill}
            data-complete={complete}
            style={{
              strokeDasharray: CIRC,
              strokeDashoffset: CIRC * (1 - pct),
            }}
          />
        </svg>
        <span dir="ltr" className={styles.count}>
          <span aria-hidden="true">
            {done}
            <span className={styles.den}>/{total}</span>
          </span>
          <span className="sr-only">
            {tr("flow.coreProgress", { done, total })}
          </span>
        </span>
      </div>

      <div className={styles.text}>
        <h2 id="core-heading" className={styles.title}>
          {complete ? tr("ui.all.done.today") : tr("ui.today.s.must.dos")}
        </h2>
        <p className={styles.sub}>
          {complete
            ? tr("ui.you.finished.every.must.do.chore")
            : tr("ui.name.still.to.do", { p0: total - done })}
        </p>
        {streak > 0 ? (
          <p className={styles.streak}>
            🔥 {tr("flow.streak", { count: streak })}
          </p>
        ) : null}
      </div>
    </section>
  );
}
