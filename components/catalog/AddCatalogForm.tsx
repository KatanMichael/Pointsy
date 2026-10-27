"use client";
import { translateFormState } from "@/lib/i18n/errors";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { useActionState, useEffect, useRef } from "react";
import { createCatalogItemAction } from "@/app/actions/catalog";
import { CatalogFields, type CatalogKind } from "./CatalogFields";
import type { FormState } from "@/lib/validation/form";
import form from "@/components/auth/auth-form.module.css";
import styles from "@/components/manage/manage.module.css";

const initialState: FormState = {};

export function AddCatalogForm({
  kind,
  kids,
}: {
  kind: CatalogKind;
  kids?: { id: string; name: string }[];
}) {
  const tr = useTranslations();

  const [stateCodes, action, pending] = useActionState(
    createCatalogItemAction,
    initialState,
  );
  const state = translateFormState(stateCodes, tr);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <section
      className={styles.card}
      aria-label={
        kind === "chore" ? tr("ui.add.a.chore") : tr("ui.add.a.reward")
      }
    >
      <form ref={formRef} action={action} className={form.form} noValidate>
        <input type="hidden" name="kind" value={kind} />
        <CatalogFields kind={kind} errors={state.fieldErrors} kids={kids} />
        {state.error ? (
          <p role="alert" className={form.formError}>
            {state.error}
          </p>
        ) : null}
        <button type="submit" className={form.submit} disabled={pending}>
          {pending
            ? tr("ui.adding")
            : kind === "chore"
              ? tr("ui.add.chore")
              : tr("ui.add.reward")}
        </button>
      </form>
    </section>
  );
}
