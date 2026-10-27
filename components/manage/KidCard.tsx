"use client";
import { translateFormState } from "@/lib/i18n/errors";
import { useTranslations, useLocale } from "@/components/i18n/LocaleProvider";

import { useActionState } from "react";
import { Pencil, KeyRound, Power, Trash2 } from "lucide-react";
import {
  updateKidAction,
  setKidPinAction,
  toggleKidActiveAction,
  deleteKidAction,
} from "@/app/actions/people";
import { ConfirmDeleteDisclosure } from "@/components/account/ConfirmDeleteDisclosure";
import { Field } from "@/components/auth/Field";
import { IconPicker } from "@/components/icons/IconPicker";
import { IconByName } from "@/components/icons/registry";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Chip } from "@/components/ui/Chip";
import { AVATAR_ICON_KEYS } from "@/lib/icons";
import type { FormState } from "@/lib/validation/form";
import { colorName, COLOR_OPTIONS } from "./options";
import form from "@/components/auth/auth-form.module.css";
import ui from "@/components/ui/ui.module.css";
import styles from "./manage.module.css";

export interface KidCardData {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isActive: boolean;
}

const initialState: FormState = {};

export function KidCard({ kid }: { kid: KidCardData }) {
  const tr = useTranslations();
  const locale = useLocale();

  const [editStateCodes, editAction, editPending] = useActionState(
    updateKidAction,
    initialState,
  );
  const editState = translateFormState(editStateCodes, tr);
  const [pinStateCodes, pinAction, pinPending] = useActionState(
    setKidPinAction,
    initialState,
  );
  const pinState = translateFormState(pinStateCodes, tr);

  return (
    <Card aria-label={tr("ui.manage.name", { p0: kid.name })}>
      <div className={styles.kidHead}>
        <span className={styles.avatar} style={{ background: kid.color }}>
          <IconByName name={kid.avatar} size={26} />
        </span>
        <span className={styles.kidName}>
          <bdi>{kid.name}</bdi>
        </span>
        {!kid.isActive ? (
          <Chip variant="warning">{tr("ui.inactive")}</Chip>
        ) : null}
      </div>

      <div className={ui.actionRow}>
        <details className={ui.actionDisclosure}>
          <summary
            className={`${ui.iconBtn} ${ui.iconSummary}`}
            aria-label={tr("ui.edit.name.s.profile", { p0: kid.name })}
            title={tr("ui.edit.profile")}
          >
            <Pencil size={18} aria-hidden="true" />
          </summary>
          <form
            action={editAction}
            className={`${form.form} ${ui.actionPanel}`}
            noValidate
          >
            <input type="hidden" name="kidId" value={kid.id} />
            <Field
              label={tr("ui.name")}
              name="name"
              defaultValue={kid.name}
              error={editState.fieldErrors?.name}
              required
            />
            <IconPicker
              name="avatar"
              label={tr("ui.avatar")}
              options={AVATAR_ICON_KEYS}
              defaultValue={kid.avatar}
            />
            <div className={form.field}>
              <label htmlFor={`color-${kid.id}`} className={form.label}>
                {tr("ui.color")}
              </label>
              <select
                id={`color-${kid.id}`}
                name="color"
                defaultValue={kid.color}
                className={styles.select}
              >
                {COLOR_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {colorName(c.value, locale)}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className={form.submit}
              disabled={editPending}
            >
              {editPending ? tr("ui.saving") : tr("ui.save.changes")}
            </button>
            {editState.ok ? (
              <p className={styles.success}>{tr("ui.saved")}</p>
            ) : null}
          </form>
        </details>

        <details className={ui.actionDisclosure}>
          <summary
            className={`${ui.iconBtn} ${ui.iconSummary}`}
            aria-label={tr("ui.reset.name.s.pin", { p0: kid.name })}
            title={tr("ui.reset.pin")}
          >
            <KeyRound size={18} aria-hidden="true" />
          </summary>
          <form
            action={pinAction}
            className={`${form.form} ${ui.actionPanel}`}
            noValidate
          >
            <input type="hidden" name="kidId" value={kid.id} />
            <Field
              label={tr("ui.new.4.digit.pin")}
              name="pin"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              error={pinState.fieldErrors?.pin}
              required
            />
            <button type="submit" className={form.submit} disabled={pinPending}>
              {pinPending ? tr("ui.saving") : tr("ui.set.new.pin")}
            </button>
            {pinState.ok ? (
              <p className={styles.success}>{tr("ui.pin.updated")}</p>
            ) : null}
          </form>
        </details>

        <ConfirmDeleteDisclosure
          detailsClassName={ui.actionDisclosure}
          summaryClassName={`${ui.iconBtn} ${ui.iconSummary}`}
          summaryAriaLabel={tr("ui.delete.name.permanently", { p0: kid.name })}
          summaryTitle={tr("ui.delete.permanently")}
          summary={<Trash2 size={18} aria-hidden="true" />}
          panelClassName={ui.actionPanel}
          action={deleteKidAction}
          confirmWord={kid.name}
          buttonLabel={tr("ui.delete.permanently")}
          intro={tr(
            "ui.this.permanently.deletes.name.and.all.of.their.points.history",
            { p0: kid.name },
          )}
          hidden={[{ name: "kidId", value: kid.id }]}
        />

        <form
          action={toggleKidActiveAction}
          className={`${ui.inlineForm} ${ui.pushRight}`}
        >
          <input type="hidden" name="kidId" value={kid.id} />
          <input
            type="hidden"
            name="isActive"
            value={(!kid.isActive).toString()}
          />
          <IconButton
            type="submit"
            variant={kid.isActive ? "default" : "accent"}
            label={
              kid.isActive
                ? tr("ui.deactivate.name", { p0: kid.name })
                : tr("ui.reactivate.name", { p0: kid.name })
            }
          >
            <Power size={18} aria-hidden="true" />
          </IconButton>
        </form>
      </div>
    </Card>
  );
}
