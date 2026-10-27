"use client";
import { translateFormState } from "@/lib/i18n/errors";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { useActionState } from "react";
import { setMyPinAction } from "@/app/actions/people";
import { Field } from "@/components/auth/Field";
import type { FormState } from "@/lib/validation/form";
import form from "@/components/auth/auth-form.module.css";
import styles from "./account.module.css";

const initialState: FormState = {};

export function SetPinForm({ hasPin }: { hasPin: boolean }) {
  const tr = useTranslations();

  const [stateCodes, action, pending] = useActionState(
    setMyPinAction,
    initialState,
  );
  const state = translateFormState(stateCodes, tr);

  return (
    <form action={action} className={form.form} noValidate>
      <Field
        label={hasPin ? tr("ui.new.pin") : tr("ui.4.digit.pin")}
        name="pin"
        type="password"
        inputMode="numeric"
        autoComplete="off"
        maxLength={4}
        hint={tr("ui.lets.you.sign.in.fast.from.the.profile.picker")}
        error={state.fieldErrors?.pin}
        required
      />
      <button type="submit" className={form.submit} disabled={pending}>
        {pending
          ? tr("ui.saving")
          : hasPin
            ? tr("ui.update.pin")
            : tr("ui.set.pin")}
      </button>
      {state.ok ? <p className={styles.success}>{tr("ui.pin.saved")}</p> : null}
    </form>
  );
}
