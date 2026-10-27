"use client";
import { useTranslations } from "@/components/i18n/LocaleProvider";
import { setChoreHiddenAction, deleteChoreAction } from "@/app/actions/catalog";
import manage from "@/components/manage/manage.module.css";
import styles from "./catalog.module.css";

/** Hide/show + delete controls shown at the bottom of the chore editor. */
export function ChoreDangerZone({
  id,
  name,
  isActive,
}: {
  id: string;
  name: string;
  isActive: boolean;
}) {
  const tr = useTranslations();

  return (
    <div className={styles.footer}>
      <form action={setChoreHiddenAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="isActive" value={(!isActive).toString()} />
        <button type="submit" className={manage.secondaryBtn}>
          {isActive ? tr("ui.hide.from.kids") : tr("ui.show.to.kids")}
        </button>
      </form>
      <details className={styles.deleteWrap}>
        <summary className={styles.deleteSummary}>{tr("ui.delete")}</summary>
        <form action={deleteChoreAction} className={styles.deleteForm}>
          <input type="hidden" name="id" value={id} />
          <p className={styles.warn}>{tr("flow.deleteItem", { name: name })}</p>
          <button type="submit" className={styles.dangerBtn}>
            {tr("ui.delete.permanently")}
          </button>
        </form>
      </details>
    </div>
  );
}
