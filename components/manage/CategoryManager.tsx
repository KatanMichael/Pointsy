"use client";
import { translateFormState } from "@/lib/i18n/errors";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { useActionState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import {
  createCategoryAction,
  updateCategoryAction,
  moveCategoryAction,
  deleteCategoryAction,
} from "@/app/actions/categories";
import { Field } from "@/components/auth/Field";
import { IconPicker } from "@/components/icons/IconPicker";
import { IconByName } from "@/components/icons/registry";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Chip } from "@/components/ui/Chip";
import { CHORE_ICON_KEYS } from "@/lib/icons";
import type { FormState } from "@/lib/validation/form";
import form from "@/components/auth/auth-form.module.css";
import manage from "@/components/manage/manage.module.css";
import ui from "@/components/ui/ui.module.css";
import styles from "./category-manager.module.css";

export interface ManagedCategory {
  id: string;
  name: string;
  icon: string;
  choreCount: number;
}

const initial: FormState = {};

function chores(n: number, tr: import("@/lib/i18n").Translator) {
  return tr("flow.choreCount", { count: n });
}

/** Add / edit / reorder / delete the family's chore categories. */
export function CategoryManager({
  categories,
}: {
  categories: ManagedCategory[];
}) {
  return (
    <>
      <AddCategory />
      <ul className={manage.list}>
        {categories.map((c) => (
          <li key={c.id}>
            <CategoryCard
              category={c}
              others={categories.filter((o) => o.id !== c.id)}
              isOnly={categories.length <= 1}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

function AddCategory() {
  const tr = useTranslations();

  const [stateCodes, action, pending] = useActionState(
    createCategoryAction,
    initial,
  );
  const state = translateFormState(stateCodes, tr);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <details className={styles.addCard}>
      <summary className={styles.addSummary}>
        <Plus size={18} aria-hidden="true" />
        {tr("ui.add.a.category")}
      </summary>
      <form ref={ref} action={action} className={form.form} noValidate>
        <Field
          label={tr("ui.name")}
          name="name"
          autoComplete="off"
          error={state.fieldErrors?.name}
          required
        />
        <IconPicker
          name="icon"
          label={tr("ui.icon")}
          options={CHORE_ICON_KEYS}
          defaultValue="sparkles"
        />
        {state.error ? (
          <p role="alert" className={form.formError}>
            {state.error}
          </p>
        ) : null}
        <button type="submit" className={form.submit} disabled={pending}>
          {pending ? tr("ui.adding") : tr("ui.add.category")}
        </button>
        {state.ok ? <p className={manage.success}>{tr("ui.added")}</p> : null}
      </form>
    </details>
  );
}

function CategoryCard({
  category,
  others,
  isOnly,
}: {
  category: ManagedCategory;
  others: ManagedCategory[];
  isOnly: boolean;
}) {
  const tr = useTranslations();

  const [editStateCodes, editAction, editPending] = useActionState(
    updateCategoryAction,
    initial,
  );
  const editState = translateFormState(editStateCodes, tr);
  const [delStateCodes, delAction, delPending] = useActionState(
    deleteCategoryAction,
    initial,
  );
  const delState = translateFormState(delStateCodes, tr);
  const hasChores = category.choreCount > 0;

  return (
    <Card aria-label={tr("ui.manage.name.43", { p0: category.name })}>
      <div className={styles.row}>
        <span className={styles.icon}>
          <IconByName name={category.icon} size={24} />
        </span>
        <div className={styles.text}>
          <span className={styles.name}>
            <bdi>{category.name}</bdi>
          </span>
          <Chip variant="neutral">{chores(category.choreCount, tr)}</Chip>
        </div>
        <form action={moveCategoryAction} className={styles.reorder}>
          <input type="hidden" name="id" value={category.id} />
          <IconButton
            type="submit"
            name="direction"
            value="up"
            label={tr("ui.move.name.up", { p0: category.name })}
          >
            <ChevronUp size={18} aria-hidden="true" />
          </IconButton>
          <IconButton
            type="submit"
            name="direction"
            value="down"
            label={tr("ui.move.name.down", { p0: category.name })}
          >
            <ChevronDown size={18} aria-hidden="true" />
          </IconButton>
        </form>
      </div>

      <div className={ui.actionRow}>
        <details className={ui.actionDisclosure}>
          <summary
            className={`${ui.iconBtn} ${ui.iconSummary}`}
            aria-label={tr("ui.edit.name", { p0: category.name })}
            title={tr("ui.edit")}
          >
            <Pencil size={18} aria-hidden="true" />
          </summary>
          <form
            action={editAction}
            className={`${form.form} ${ui.actionPanel}`}
            noValidate
          >
            <input type="hidden" name="id" value={category.id} />
            <Field
              label={tr("ui.name")}
              name="name"
              defaultValue={category.name}
              autoComplete="off"
              error={editState.fieldErrors?.name}
              required
            />
            <IconPicker
              name="icon"
              label={tr("ui.icon")}
              options={CHORE_ICON_KEYS}
              defaultValue={category.icon}
            />
            {editState.error ? (
              <p role="alert" className={form.formError}>
                {editState.error}
              </p>
            ) : null}
            <button
              type="submit"
              className={form.submit}
              disabled={editPending}
            >
              {editPending ? tr("ui.saving") : tr("ui.save.changes")}
            </button>
            {editState.ok ? (
              <p className={manage.success}>{tr("ui.saved")}</p>
            ) : null}
          </form>
        </details>

        <details className={`${ui.actionDisclosure} ${ui.pushRight}`}>
          <summary
            className={`${ui.iconBtn} ${ui.danger} ${ui.iconSummary}`}
            aria-label={tr("ui.delete.name", { p0: category.name })}
            title={tr("ui.delete")}
          >
            <Trash2 size={18} aria-hidden="true" />
          </summary>
          <form
            action={delAction}
            className={`${ui.actionPanel} ${styles.deleteForm}`}
          >
            <input type="hidden" name="id" value={category.id} />
            {isOnly ? (
              <p className={styles.warn}>
                {tr(
                  "ui.this.is.your.only.category.add.another.before.removing",
                )}
              </p>
            ) : hasChores ? (
              <>
                <p className={styles.warn}>
                  {tr("flow.categoryMove", {
                    name: category.name,
                    count: category.choreCount,
                  })}
                </p>
                <select
                  name="reassignTo"
                  className={styles.select}
                  defaultValue={others[0]?.id}
                  aria-label={tr("ui.move.chores.to")}
                >
                  {others.map((o) => (
                    <option key={o.id} value={o.id}>
                      <bdi>{o.name}</bdi>
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <p className={styles.warn}>
                {tr("flow.categoryDelete", { name: category.name })}
              </p>
            )}
            {delState.error ? (
              <p role="alert" className={form.formError}>
                {delState.error}
              </p>
            ) : null}
            <button
              type="submit"
              className={styles.dangerBtn}
              disabled={delPending || isOnly}
            >
              {hasChores
                ? tr("ui.move.chores.delete")
                : tr("ui.delete.category")}
            </button>
          </form>
        </details>
      </div>
    </Card>
  );
}
