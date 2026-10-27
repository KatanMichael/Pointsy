"use client";
import { translateFormState } from "@/lib/i18n/errors";
import { useTranslations, useLocale } from "@/components/i18n/LocaleProvider";

import { useActionState, useEffect, useRef } from "react";
import { addKidAction } from "@/app/actions/people";
import { Field } from "@/components/auth/Field";
import { IconPicker } from "@/components/icons/IconPicker";
import { AVATAR_ICON_KEYS, DEFAULT_AVATAR_ICON } from "@/lib/icons";
import type { FormState } from "@/lib/validation/form";
import { colorName, COLOR_OPTIONS, DEFAULT_COLOR } from "./options";
import form from "@/components/auth/auth-form.module.css";
import styles from "./manage.module.css";

const initialState: FormState = {};

export function AddKidForm() {
  const tr = useTranslations();
  const locale = useLocale();

  const [stateCodes, action, pending] = useActionState(
    addKidAction,
    initialState,
  );
  const state = translateFormState(stateCodes, tr);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <section className={styles.card} aria-label={tr("ui.add.a.child")}>
      <form ref={formRef} action={action} className={form.form} noValidate>
        <Field
          label={tr("ui.name")}
          name="name"
          autoComplete="off"
          error={state.fieldErrors?.name}
          required
        />
        <IconPicker
          name="avatar"
          label={tr("ui.avatar")}
          options={AVATAR_ICON_KEYS}
          defaultValue={DEFAULT_AVATAR_ICON}
        />

        <div className={form.field}>
          <label htmlFor="add-kid-color" className={form.label}>
            {tr("ui.color")}
          </label>
          <select
            id="add-kid-color"
            name="color"
            defaultValue={DEFAULT_COLOR}
            className={styles.select}
          >
            {COLOR_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {colorName(c.value, locale)}
              </option>
            ))}
          </select>
        </div>

        <Field
          label={tr("ui.4.digit.pin")}
          name="pin"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          hint={tr("ui.your.child.uses.this.to.sign.in")}
          error={state.fieldErrors?.pin}
          required
        />

        {state.error ? (
          <p role="alert" className={form.formError}>
            {state.error}
          </p>
        ) : null}

        <button type="submit" className={form.submit} disabled={pending}>
          {pending ? tr("ui.adding") : tr("ui.add.child")}
        </button>
      </form>
    </section>
  );
}
