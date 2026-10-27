"use client";
import { translateFormState } from "@/lib/i18n/errors";
import { useTranslations, useLocale } from "@/components/i18n/LocaleProvider";

import { useActionState, useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { changePointsAction } from "@/app/actions/points";
import { Field } from "@/components/auth/Field";
import { formatNameList } from "@/lib/domain/names";
import type { FormState } from "@/lib/validation/form";
import form from "@/components/auth/auth-form.module.css";
import styles from "./points.module.css";

const initial: FormState = {};

export interface AwardRecipient {
  id: string;
  name: string;
}

/**
 * Manual points control: award a custom amount or take points away. A
 * segmented toggle picks the direction so the parent always types a plain
 * positive number — no minus-sign guesswork — and the submit button restates
 * exactly what will happen, including who gets it when "also give to" picks
 * add recipients (issue #159).
 */
export function AwardExtras({
  recipients,
  nameById,
  initialMode = "award",
}: {
  /** Everyone this form posts to, the kid whose screen this is first. */
  recipients: AwardRecipient[];
  /** Names for every kid on the screen, so the result can name them back. */
  nameById: Record<string, string>;
  initialMode?: "award" | "deduct";
}) {
  const locale = useLocale();
  const tr = useTranslations();

  const [stateCodes, action, pending] = useActionState(
    changePointsAction,
    initial,
  );
  const state = translateFormState(stateCodes, tr);
  const [mode, setMode] = useState<"award" | "deduct">(initialMode);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  const isDeduct = mode === "deduct";
  const shared = recipients.length > 1;
  const who = formatNameList(
    recipients.map((r) => r.name),
    undefined,
    locale,
  );

  // With extra recipients the button names them, so a parent can see who a
  // typed amount is about to reach before they commit it (issue #159).
  const submitLabel = pending
    ? isDeduct
      ? tr("ui.deducting")
      : tr("ui.awarding")
    : isDeduct
      ? shared
        ? tr("flow.deductFrom", { names: who })
        : tr("ui.deduct.points")
      : shared
        ? tr("flow.awardTo", { names: who })
        : tr("ui.award.points");

  const done = (state.kidIds ?? [])
    .map((id) => nameById[id])
    .filter((name): name is string => Boolean(name));
  const successMessage = isDeduct
    ? done.length > 1
      ? tr("flow.deductedFrom", { names: formatNameList(done, 3, locale) })
      : tr("ui.points.deducted")
    : done.length > 1
      ? tr("flow.awardedTo", { names: formatNameList(done, 3, locale) })
      : tr("ui.points.awarded");

  return (
    <section
      className={styles.manualCard}
      aria-labelledby="manual-points-title"
    >
      <h2 id="manual-points-title" className={styles.sectionTitle}>
        {tr("ui.award.or.deduct.points")}
      </h2>
      <form ref={ref} action={action} className={form.form} noValidate>
        {recipients.map((r) => (
          <input key={r.id} type="hidden" name="kidId" value={r.id} />
        ))}
        <input type="hidden" name="direction" value={mode} />

        <fieldset className={styles.segment}>
          <legend className="sr-only">{tr("ui.choose.award.or.deduct")}</legend>
          <button
            type="button"
            className={isDeduct ? styles.segBtn : styles.segBtnAward}
            aria-pressed={!isDeduct}
            onClick={() => setMode("award")}
          >
            <Plus size={16} aria-hidden="true" />
            {tr("ui.award")}
          </button>
          <button
            type="button"
            className={isDeduct ? styles.segBtnDeduct : styles.segBtn}
            aria-pressed={isDeduct}
            onClick={() => setMode("deduct")}
          >
            <Minus size={16} aria-hidden="true" />
            {tr("ui.deduct")}
          </button>
        </fieldset>

        <Field
          label={tr("ui.points")}
          name="amount"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          error={state.fieldErrors?.amount}
          required
        />
        <Field
          label={tr("ui.reason")}
          name="reason"
          autoComplete="off"
          error={state.fieldErrors?.reason}
          required
        />
        {state.error ? (
          <p role="alert" className={form.formError}>
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          className={isDeduct ? styles.deductSubmit : form.submit}
          disabled={pending}
        >
          {submitLabel}
        </button>
        {state.ok && state.direction === mode ? (
          <p className={styles.success}>{successMessage}</p>
        ) : null}
      </form>
    </section>
  );
}
