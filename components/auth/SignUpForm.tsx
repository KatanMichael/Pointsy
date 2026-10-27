"use client";
import { translateFormState } from "@/lib/i18n/errors";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { signUpAction, type AuthState } from "@/app/actions/auth";
import { Field } from "./Field";
import styles from "./auth-form.module.css";

const initialState: AuthState = {};

export function SignUpForm() {
  const tr = useTranslations();

  const [stateCodes, action, pending] = useActionState(
    signUpAction,
    initialState,
  );
  const state = translateFormState(stateCodes, tr);
  const tzRef = useRef<HTMLInputElement>(null);

  // Capture the browser's timezone so chore limits reset at the family's local
  // midnight. Set via a DOM ref (no state) to avoid hydration mismatch.
  useEffect(() => {
    if (tzRef.current) {
      tzRef.current.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
  }, []);

  return (
    <form action={action} className={styles.form} noValidate>
      <input ref={tzRef} type="hidden" name="timezone" defaultValue="" />
      <Field
        label={tr("ui.family.name")}
        name="familyName"
        autoComplete="off"
        error={state.fieldErrors?.familyName}
        required
      />
      <Field
        label={tr("ui.your.name")}
        name="parentName"
        autoComplete="name"
        error={state.fieldErrors?.parentName}
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
          <Link href="/privacy">{tr("ui.privacy.policy")}</Link>
          {tr("flow.consentEnd")}
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
        {pending ? tr("ui.creating.your.family") : tr("ui.create.family")}
      </button>
    </form>
  );
}
