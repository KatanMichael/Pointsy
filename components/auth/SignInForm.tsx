"use client";
import { translateFormState } from "@/lib/i18n/errors";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { useActionState } from "react";
import { signInAction, type AuthState } from "@/app/actions/auth";
import { Field } from "./Field";
import styles from "./auth-form.module.css";

const initialState: AuthState = {};

export function SignInForm() {
  const tr = useTranslations();

  const [stateCodes, action, pending] = useActionState(
    signInAction,
    initialState,
  );
  const state = translateFormState(stateCodes, tr);

  return (
    <form action={action} className={styles.form} noValidate>
      <Field
        label={tr("ui.email")}
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        error={state.fieldErrors?.email}
        required
      />
      <Field
        label={tr("ui.password")}
        name="password"
        type="password"
        autoComplete="current-password"
        error={state.fieldErrors?.password}
        required
      />

      {state.error ? (
        <p role="alert" className={styles.formError}>
          {state.error}
        </p>
      ) : null}

      <button type="submit" className={styles.submit} disabled={pending}>
        {pending ? tr("ui.signing.in") : tr("ui.sign.in")}
      </button>
    </form>
  );
}
