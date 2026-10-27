"use client";
import { translateFormState } from "@/lib/i18n/errors";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { useActionState, useId, useState } from "react";
import { Field } from "@/components/auth/Field";
import { IconByName } from "@/components/icons/registry";
import { saveChallengeAction } from "@/app/actions/challenges";
import type { FormState } from "@/lib/validation/form";
import type {
  ChallengeScope,
  ChallengeGoal,
  ChallengeRecurrence,
} from "@/lib/db/schema";
import form from "@/components/auth/auth-form.module.css";
import styles from "@/components/catalog/chore-editor.module.css";

export interface EditorKid {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface ChallengeDefaults {
  id?: string;
  title?: string;
  description?: string | null;
  scope?: ChallengeScope;
  recurrence?: ChallengeRecurrence;
  goalType?: ChallengeGoal;
  goalTarget?: number;
  bonusPoints?: number;
  autoAward?: boolean;
  startsOn?: string;
  endsOn?: string | null;
  kidIds?: string[];
}

const initialState: FormState = {};

export function ChallengeEditor({
  kids,
  defaults,
}: {
  kids: EditorKid[];
  defaults?: ChallengeDefaults;
}) {
  const tr = useTranslations();
  const SCOPE_OPTIONS: {
    value: ChallengeScope;
    label: string;
    hint: string;
  }[] = [
    {
      value: "kid",
      label: tr("ui.each.kid"),
      hint: tr("ui.everyone.works.toward.it.on.their.own"),
    },
    {
      value: "family",
      label: tr("ui.whole.family"),
      hint: tr("ui.you.all.share.one.tally"),
    },
  ];
  const GOALS: {
    value: ChallengeGoal;
    label: string;
    targetLabel: string;
  }[] = [
    {
      value: "points",
      label: tr("ui.earn.points"),
      targetLabel: tr("ui.points.to.earn"),
    },
    {
      value: "chore_count",
      label: tr("ui.log.chores"),
      targetLabel: tr("ui.chores.to.log"),
    },
    {
      value: "core_days",
      label: tr("ui.core.chore.days"),
      targetLabel: tr("ui.days.with.all.core.chores.done"),
    },
  ];
  const RECUR_OPTIONS: {
    value: ChallengeRecurrence;
    label: string;
    hint: string;
  }[] = [
    {
      value: "none",
      label: tr("ui.one.off"),
      hint: tr("ui.runs.once.over.these.dates"),
    },
    {
      value: "weekly",
      label: tr("ui.every.week"),
      hint: tr("ui.resets.each.week.earn.the.bonus.again"),
    },
  ];

  const [stateCodes, action, pending] = useActionState(
    saveChallengeAction,
    initialState,
  );
  const state = translateFormState(stateCodes, tr);
  const errors = state.fieldErrors;
  const [scope, setScope] = useState<ChallengeScope>(defaults?.scope ?? "kid");
  const [recurrence, setRecurrence] = useState<ChallengeRecurrence>(
    defaults?.recurrence ?? "none",
  );
  const [goalType, setGoalType] = useState<ChallengeGoal>(
    defaults?.goalType ?? "points",
  );
  const goalId = useId();
  const selected = new Set(defaults?.kidIds ?? []);
  const targetLabel =
    GOALS.find((g) => g.value === goalType)?.targetLabel ?? tr("ui.target");

  return (
    <form action={action} className={form.form} noValidate>
      {defaults?.id ? (
        <input type="hidden" name="id" value={defaults.id} />
      ) : null}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{tr("ui.basics")}</h2>
        <Field
          label={tr("ui.name")}
          name="title"
          defaultValue={defaults?.title}
          error={errors?.title}
          placeholder={tr("ui.e.g.super.saver.week")}
          required
        />
        <Field
          label={tr("ui.description")}
          name="description"
          defaultValue={defaults?.description ?? undefined}
          error={errors?.description}
          placeholder={tr("ui.optional.a.line.of.encouragement")}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{tr("ui.the.goal")}</h2>
        <fieldset className={styles.choice}>
          <legend className={form.label}>{tr("ui.who.s.it.for")}</legend>
          {SCOPE_OPTIONS.map((o) => (
            <label key={o.value} className={styles.radioRow}>
              <input
                type="radio"
                name="scope"
                value={o.value}
                checked={scope === o.value}
                onChange={() => setScope(o.value)}
                aria-label={o.label}
              />
              <span className={styles.radioLabel}>{o.label}</span>
              <span className={styles.radioHint}>{o.hint}</span>
            </label>
          ))}
        </fieldset>

        <div className={form.field}>
          <label htmlFor={goalId} className={form.label}>
            {tr("ui.measure")}
          </label>
          <select
            id={goalId}
            name="goalType"
            value={goalType}
            onChange={(e) => setGoalType(e.target.value as ChallengeGoal)}
            className={styles.select}
          >
            {GOALS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <Field
          label={targetLabel}
          name="goalTarget"
          type="number"
          inputMode="numeric"
          min={1}
          defaultValue={defaults?.goalTarget}
          error={errors?.goalTarget}
          required
        />
        <Field
          label={tr("ui.bonus.points.when.completed")}
          name="bonusPoints"
          type="number"
          inputMode="numeric"
          min={1}
          defaultValue={defaults?.bonusPoints}
          error={errors?.bonusPoints}
          hint={
            scope === "family"
              ? tr("ui.each.kid.gets.the.full.bonus.when.the.family")
              : undefined
          }
          required
        />
        <label className={styles.coreRow}>
          <input
            type="checkbox"
            name="needsApproval"
            defaultChecked={defaults?.autoAward === false}
            aria-label={tr("ui.hold.the.bonus.until.i.approve.it")}
          />
          <span className={styles.radioLabel}>
            {tr("ui.hold.the.bonus.until.i.approve.it")}
          </span>
        </label>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{tr("ui.when")}</h2>
        <fieldset className={styles.choice}>
          <legend className={form.label}>{tr("ui.repeat")}</legend>
          {RECUR_OPTIONS.map((o) => (
            <label key={o.value} className={styles.radioRow}>
              <input
                type="radio"
                name="recurrence"
                value={o.value}
                checked={recurrence === o.value}
                onChange={() => setRecurrence(o.value)}
                aria-label={o.label}
              />
              <span className={styles.radioLabel}>{o.label}</span>
              <span className={styles.radioHint}>{o.hint}</span>
            </label>
          ))}
        </fieldset>
        <Field
          label={tr("ui.starts")}
          name="startsOn"
          type="date"
          defaultValue={defaults?.startsOn}
          error={errors?.startsOn}
          required
        />
        {recurrence === "weekly" ? (
          <Field
            label={tr("ui.ends.optional")}
            name="endsOn"
            type="date"
            defaultValue={defaults?.endsOn ?? undefined}
            error={errors?.endsOn}
            hint={tr("ui.leave.blank.to.repeat.every.week.until.you.pause")}
          />
        ) : (
          <Field
            label={tr("ui.ends")}
            name="endsOn"
            type="date"
            defaultValue={defaults?.endsOn ?? undefined}
            error={errors?.endsOn}
            required
          />
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{tr("ui.who.s.in.it")}</h2>
        <fieldset className={styles.kids}>
          <legend className={form.label}>
            {tr("ui.tick.the.kids.or.leave.empty.for.the.whole")}
          </legend>
          {kids.length === 0 ? (
            <p className={styles.muted}>
              {tr("ui.add.kids.first.to.run.a.challenge")}
            </p>
          ) : (
            kids.map((k) => (
              <label key={k.id} className={styles.kidRow}>
                <input
                  type="checkbox"
                  name="kidIds"
                  value={k.id}
                  defaultChecked={selected.has(k.id)}
                  aria-label={k.name}
                />
                <span
                  className={styles.kidAvatar}
                  style={{ background: k.color }}
                >
                  <IconByName name={k.avatar} size={18} />
                </span>
                <span>
                  <bdi>{k.name}</bdi>
                </span>
              </label>
            ))
          )}
        </fieldset>
      </section>

      {state.error ? (
        <p className={form.error} role="alert">
          {state.error}
        </p>
      ) : null}

      <button type="submit" className={form.submit} disabled={pending}>
        {pending ? tr("ui.saving") : tr("ui.save.challenge")}
      </button>
    </form>
  );
}
