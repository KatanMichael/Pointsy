"use client";
import { translateFormState } from "@/lib/i18n/errors";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { useActionState } from "react";
import { UserMinus } from "lucide-react";
import { removeParentAction } from "@/app/actions/parents";
import styles from "./parents.module.css";

export function RemoveParentButton({
  parentId,
  name,
}: {
  parentId: string;
  name: string;
}) {
  const tr = useTranslations();

  const [stateCodes, action, pending] = useActionState(removeParentAction, {});
  const state = translateFormState(stateCodes, tr);

  return (
    <form action={action} className={styles.removeForm}>
      <input type="hidden" name="parentId" value={parentId} />
      <button
        type="submit"
        className={styles.remove}
        disabled={pending}
        aria-label={tr("ui.remove.name", { p0: name })}
      >
        <UserMinus size={16} aria-hidden="true" />
        {pending ? tr("ui.removing") : tr("ui.remove.212")}
      </button>
      {state.error ? (
        <span role="alert" className={styles.removeError}>
          {state.error}
        </span>
      ) : null}
    </form>
  );
}
