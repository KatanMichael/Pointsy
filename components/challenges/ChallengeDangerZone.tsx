"use client";
import { useTranslations } from "@/components/i18n/LocaleProvider";
import {
  setChallengeActiveAction,
  deleteChallengeAction,
} from "@/app/actions/challenges";
import manage from "@/components/manage/manage.module.css";
import styles from "@/components/catalog/catalog.module.css";

/** Pause/resume + delete controls at the bottom of the challenge editor. */
export function ChallengeDangerZone({
  id,
  title,
  isActive,
}: {
  id: string;
  title: string;
  isActive: boolean;
}) {
  const tr = useTranslations();

  return (
    <div className={styles.footer}>
      <form action={setChallengeActiveAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="isActive" value={(!isActive).toString()} />
        <button type="submit" className={manage.secondaryBtn}>
          {isActive ? tr("ui.pause.challenge") : tr("ui.resume.challenge")}
        </button>
      </form>
      <details className={styles.deleteWrap}>
        <summary className={styles.deleteSummary}>{tr("ui.delete")}</summary>
        <form action={deleteChallengeAction} className={styles.deleteForm}>
          <input type="hidden" name="id" value={id} />
          <p className={styles.warn}>
            {tr("flow.deleteChallenge", { name: title })}
          </p>
          <button type="submit" className={styles.dangerBtn}>
            {tr("ui.delete.permanently")}
          </button>
        </form>
      </details>
    </div>
  );
}
