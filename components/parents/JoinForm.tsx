"use client";
import { translateFormState } from "@/lib/i18n/errors";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { useActionState } from "react";
import Link from "next/link";
import { joinFamilyAction } from "@/app/actions/parents";
import type { FormState } from "@/lib/validation/form";
import { Field } from "@/components/auth/Field";
import styles from "@/components/auth/auth-form.module.css";

const initialState: FormState = {};

export function JoinForm() {
  const tr = useTranslations();

  const [stateCodes, action, pending] = useActionState(
    joinFamilyAction,
    initialState,
  );
  const state = translateFormState(stateCodes, tr);

  return (
    <form action={action} className={styles.form} noValidate>
      <Field
        label={tr("ui.invite.code")}
        name="code"
        autoComplete="off"
        autoCapitalize="characters"
        error={state.fieldErrors?.code}
        required
      />
      <Field
        label={tr("ui.your.name")}
        name="name"
        autoComplete="name"
        error={state.fieldErrors?.name}
        required
      />
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
        autoComplete="new-password"
        hint={tr("ui.at.least.8.characters")}
        error={state.fieldErrors?.password}
        required
      />

      <div className={styles.consent}>
        <input
          id="consent"
          name="consent"
          type="checkbox"
          required
          aria-labelledby="consent-label"
        />
        <label
          id="consent-label"
          htmlFor="consent"
          className={styles.consentLabel}
        >
          {tr("flow.consentStart")} <Link href="/terms">{tr("ui.terms")}</Link>
          {tr("flow.and")}
          <Link href="/privacy">{tr("ui.privacy.policy")}</Link>.
        </label>
      </div>
      {state.fieldErrors?.consent ? (
        <p role="alert" className={styles.error}>
          {state.fieldErrors.consent}
        </p>
      ) : null}

      {state.error ? (
        <p role="alert" className={styles.formError}>
          {state.error}
        </p>
      ) : null}

      <button type="submit" className={styles.submit} disabled={pending}>
        {pending ? tr("ui.joining") : tr("ui.join.family")}
      </button>
    </form>
  );
}
