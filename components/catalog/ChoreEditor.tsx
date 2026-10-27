"use client";
import { translateFormState } from "@/lib/i18n/errors";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { useActionState, useId, useState } from "react";
import Link from "next/link";
import { Plus, X, Eye } from "lucide-react";
import { Field } from "@/components/auth/Field";
import { IconPicker } from "@/components/icons/IconPicker";
import { LogWindowFields } from "@/components/catalog/LogWindowFields";
import { IconByName } from "@/components/icons/registry";
import { ICON_KEYS, DEFAULT_CHORE_ICON } from "@/lib/icons";
import { saveChoreAction } from "@/app/actions/catalog";
import type { FormState } from "@/lib/validation/form";
import type { ChoreAssignment } from "@/lib/db/schema";
import type { LimitPeriod, LimitScope } from "@/lib/catalog/limit";
import form from "@/components/auth/auth-form.module.css";
import styles from "./chore-editor.module.css";

export interface EditorKid {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface EditorCategory {
  id: string;
  name: string;
}

export interface ChoreDefaults {
  id?: string;
  name?: string;
  emoji?: string;
  points?: number;
  categoryId?: string;
  description?: string | null;
  isCore?: boolean;
  assignment?: ChoreAssignment;
  kidIds?: string[];
  subtasks?: string[];
  limitPeriod?: LimitPeriod;
  limitCount?: number;
  limitScope?: LimitScope;
  logWindowDays?: number | null;
  logWindowStart?: string | null;
  logWindowEnd?: string | null;
}

const initialState: FormState = {};

/** Complete frequency and scope messages retain each language's word order. */
function limitPreview(
  period: LimitPeriod,
  count: string,
  scope: LimitScope,
  tr: import("@/lib/i18n").Translator,
): string {
  const n = Math.max(1, Number(count) || 1);
  const frequency =
    n === 1
      ? tr(period === "day" ? "flow.onceDay" : "flow.onceWeek")
      : tr(period === "day" ? "flow.timesDay" : "flow.timesWeek", { count: n });
  return tr(scope === "total" ? "flow.limitShared" : "flow.limitEach", {
    frequency,
  });
}

export function ChoreEditor({
  kids,
  categories,
  defaults,
}: {
  kids: EditorKid[];
  categories: EditorCategory[];
  defaults?: ChoreDefaults;
}) {
  const tr = useTranslations();

  const ASSIGN_OPTIONS: {
    value: ChoreAssignment;
    label: string;
    hint: string;
  }[] = [
    {
      value: "everyone",
      label: tr("ui.everyone"),
      hint: tr("ui.any.kid.can.do.it"),
    },
    {
      value: "specific",
      label: tr("ui.specific.kids"),
      hint: tr("ui.only.the.kids.you.pick"),
    },
    {
      value: "rotating",
      label: tr("ui.take.turns"),
      hint: tr("ui.passes.to.the.next.kid.once.the.current.one.does.it"),
    },
  ];

  const [stateCodes, action, pending] = useActionState(
    saveChoreAction,
    initialState,
  );
  const state = translateFormState(stateCodes, tr);
  const errors = state.fieldErrors;
  const [assignment, setAssignment] = useState<ChoreAssignment>(
    defaults?.assignment ?? "everyone",
  );
  const [period, setPeriod] = useState<LimitPeriod>(
    defaults?.limitPeriod ?? "none",
  );
  const [scope, setScope] = useState<LimitScope>(
    defaults?.limitScope ?? "per_kid",
  );
  // Core (per-kid daily must-do) and a shared/total limit are mutually exclusive.
  const [core, setCore] = useState<boolean>(defaults?.isCore ?? false);
  const [count, setCount] = useState<string>(String(defaults?.limitCount ?? 1));
  const shared = period !== "none" && scope === "total";
  const [subtasks, setSubtasks] = useState<string[]>(defaults?.subtasks ?? []);
  const categoryId = useId();
  const periodId = useId();
  const selected = new Set(defaults?.kidIds ?? []);

  return (
    <form action={action} className={form.form} noValidate>
      {defaults?.id ? (
        <input type="hidden" name="id" value={defaults.id} />
      ) : null}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{tr("ui.basics")}</h2>
        <Field
          label={tr("ui.name")}
          name="name"
          defaultValue={defaults?.name}
          error={errors?.name}
          autoComplete="off"
          required
        />
        <IconPicker
          name="emoji"
          label={tr("ui.icon")}
          options={ICON_KEYS}
          defaultValue={defaults?.emoji ?? DEFAULT_CHORE_ICON}
        />
        <Field
          label={tr("ui.points")}
          name="points"
          type="text"
          inputMode="numeric"
          defaultValue={defaults?.points ?? 5}
          error={errors?.points}
          autoComplete="off"
          required
        />
        <div className={form.field}>
          <label htmlFor={categoryId} className={form.label}>
            {tr("ui.category")}
          </label>
          {categories.length > 0 ? (
            <select
              id={categoryId}
              name="categoryId"
              defaultValue={defaults?.categoryId ?? categories[0].id}
              className={styles.select}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  <bdi>{c.name}</bdi>
                </option>
              ))}
            </select>
          ) : (
            <p className={styles.muted}>
              {tr("ui.no.categories.yet")}{" "}
              <Link href="/manage/categories">{tr("ui.add.one.first")}</Link>.
            </p>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{tr("ui.who.when")}</h2>
        <fieldset className={styles.choice}>
          <legend className={form.label}>{tr("ui.who.s.it.for")}</legend>
          {ASSIGN_OPTIONS.map((o) => (
            <label key={o.value} className={styles.radioRow}>
              <input
                type="radio"
                name="assignment"
                value={o.value}
                checked={assignment === o.value}
                onChange={() => setAssignment(o.value)}
                aria-label={o.label}
              />
              <span className={styles.radioLabel}>{o.label}</span>
              <span className={styles.radioHint}>{o.hint}</span>
            </label>
          ))}
        </fieldset>

        {assignment !== "everyone" ? (
          <fieldset className={styles.kids}>
            <legend className={form.label}>
              {assignment === "rotating"
                ? tr("ui.who.takes.turns")
                : tr("ui.which.kids")}
            </legend>
            {kids.length === 0 ? (
              <p className={styles.muted}>
                {tr("ui.add.kids.first.to.assign.this.chore")}
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
                  <bdi>{k.name}</bdi>
                </label>
              ))
            )}
          </fieldset>
        ) : null}

        <label className={styles.coreRow} data-disabled={shared}>
          <input
            type="checkbox"
            name="isCore"
            checked={core && !shared}
            disabled={shared}
            onChange={(e) => setCore(e.target.checked)}
            aria-label={tr("ui.core.chore")}
          />
          <span className={styles.radioLabel}>{tr("ui.core.chore")}</span>
          <span className={styles.radioHint}>
            {shared
              ? tr("ui.not.available.for.shared.chores")
              : tr("ui.expected.every.day.counts.toward.challenges")}
          </span>
        </label>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{tr("ui.checklist.optional")}</h2>
        <p className={styles.muted}>
          {tr("ui.steps.a.kid.ticks.off.they.must.complete.them")}
        </p>
        {subtasks.map((step, i) => (
          <div key={i} className={styles.subtaskRow}>
            <input
              className={styles.subtaskInput}
              name="subtasks"
              value={step}
              placeholder={tr("ui.step.name", { p0: i + 1 })}
              aria-label={tr("ui.step.name.85", { p0: i + 1 })}
              onChange={(e) =>
                setSubtasks((prev) =>
                  prev.map((v, j) => (j === i ? e.target.value : v)),
                )
              }
            />
            <button
              type="button"
              className={styles.subtaskRemove}
              aria-label={tr("ui.remove.step.name", { p0: i + 1 })}
              onClick={() =>
                setSubtasks((prev) => prev.filter((_, j) => j !== i))
              }
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className={styles.addStep}
          onClick={() => setSubtasks((prev) => [...prev, ""])}
        >
          <Plus size={16} aria-hidden="true" />
          {tr("ui.add.a.step")}
        </button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{tr("ui.limits")}</h2>
        <div className={form.field}>
          <label htmlFor={periodId} className={form.label}>
            {tr("ui.how.often.can.it.be.claimed")}
          </label>
          <select
            id={periodId}
            name="limitPeriod"
            value={period}
            onChange={(e) => setPeriod(e.target.value as LimitPeriod)}
            className={styles.select}
          >
            <option value="none">{tr("ui.unlimited")}</option>
            <option value="day">{tr("ui.a.set.number.per.day")}</option>
            <option value="week">{tr("ui.a.set.number.per.week")}</option>
          </select>
        </div>

        {period === "none" ? (
          <input type="hidden" name="limitCount" value="1" />
        ) : (
          <>
            <div className={styles.limitCount}>
              <Field
                label={
                  period === "day"
                    ? tr("ui.times.per.day")
                    : tr("ui.times.per.week")
                }
                name="limitCount"
                type="text"
                inputMode="numeric"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                error={errors?.limitCount}
                autoComplete="off"
                required
              />
            </div>

            <fieldset className={styles.choice}>
              <legend className={form.label}>
                {tr("ui.who.shares.this.limit")}
              </legend>
              {[
                {
                  value: "per_kid" as const,
                  label: tr("ui.each.kid"),
                  hint: tr("ui.every.kid.can.claim.it.this.many.times"),
                },
                {
                  value: "total" as const,
                  label: tr("ui.shared.by.everyone"),
                  hint: tr("ui.first.come.first.served.once.it.s.claimed.this"),
                },
              ].map((o) => (
                <label key={o.value} className={styles.radioRow}>
                  <input
                    type="radio"
                    name="limitScope"
                    value={o.value}
                    checked={scope === o.value}
                    onChange={() => {
                      setScope(o.value);
                      if (o.value === "total") setCore(false);
                    }}
                    aria-label={o.label}
                  />
                  <span className={styles.radioLabel}>{o.label}</span>
                  <span className={styles.radioHint}>{o.hint}</span>
                </label>
              ))}
            </fieldset>

            <p className={styles.preview}>
              <Eye size={16} aria-hidden="true" />
              <span>{limitPreview(period, count, scope, tr)}</span>
            </p>
          </>
        )}
      </section>

      <LogWindowFields
        defaults={{
          logWindowDays: defaults?.logWindowDays,
          logWindowStart: defaults?.logWindowStart,
          logWindowEnd: defaults?.logWindowEnd,
        }}
      />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{tr("ui.description")}</h2>
        <Field
          label={tr("ui.description.optional")}
          name="description"
          defaultValue={defaults?.description ?? ""}
          maxLength={280}
          error={errors?.description}
          autoComplete="off"
        />
      </section>

      {state.error ? <p className={form.formError}>{state.error}</p> : null}
      <div className={styles.actions}>
        <Link href="/manage/chores" className={styles.cancel}>
          {tr("ui.cancel")}
        </Link>
        <button type="submit" className={form.submit} disabled={pending}>
          {pending ? tr("ui.saving") : tr("ui.save.chore")}
        </button>
      </div>
    </form>
  );
}
