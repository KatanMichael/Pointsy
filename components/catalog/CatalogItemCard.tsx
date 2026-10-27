"use client";
import { translateFormState } from "@/lib/i18n/errors";
import { useTranslations, useLocale } from "@/components/i18n/LocaleProvider";

import { useActionState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Star,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import {
  updateCatalogItemAction,
  toggleCatalogItemActiveAction,
  toggleChorePinnedAction,
  moveCatalogItemAction,
  deleteCatalogItemAction,
} from "@/app/actions/catalog";
import { CatalogFields, type CatalogKind } from "./CatalogFields";
import { IconByName } from "@/components/icons/registry";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Chip } from "@/components/ui/Chip";
import { formatChoreLimit, type LimitPeriod } from "@/lib/catalog/limit";
import type { FormState } from "@/lib/validation/form";
import form from "@/components/auth/auth-form.module.css";
import manage from "@/components/manage/manage.module.css";
import ui from "@/components/ui/ui.module.css";
import styles from "./catalog.module.css";

export interface CatalogItem {
  id: string;
  name: string;
  emoji: string;
  value: number;
  description: string | null;
  isActive: boolean;
  pinned?: boolean;
  limitPeriod?: LimitPeriod;
  limitCount?: number;
  isTeam?: boolean;
  minKids?: number;
  allowSolo?: boolean;
  assignedToKidId?: string | null;
}

const initialState: FormState = {};

export function CatalogItemCard({
  kind,
  item,
  kids,
}: {
  kind: CatalogKind;
  item: CatalogItem;
  kids?: { id: string; name: string }[];
}) {
  const locale = useLocale();
  const tr = useTranslations();

  const [editStateCodes, editAction, editPending] = useActionState(
    updateCatalogItemAction,
    initialState,
  );
  const editState = translateFormState(editStateCodes, tr);

  return (
    <Card aria-label={tr("ui.manage.name.73", { p0: item.name })}>
      <div className={styles.head}>
        <span className={styles.emoji}>
          <IconByName name={item.emoji} size={26} />
        </span>
        <div className={styles.headText}>
          <span className={styles.name}>
            <bdi>{item.name}</bdi>
          </span>
          <div className={styles.metaRow}>
            <Chip variant="accent">
              {tr("flow.pts", { count: item.value })}
            </Chip>
            {kind === "chore" &&
            item.limitPeriod &&
            item.limitPeriod !== "none" ? (
              <Chip variant="neutral">
                {formatChoreLimit(
                  item.limitPeriod,
                  item.limitCount ?? 1,
                  undefined,
                  locale,
                )}
              </Chip>
            ) : null}
            {!item.isActive ? (
              <Chip variant="warning">{tr("ui.hidden")}</Chip>
            ) : null}
          </div>
          {item.description ? (
            <span className={styles.desc}>
              <bdi>{item.description}</bdi>
            </span>
          ) : null}
        </div>
        <div className={styles.controls}>
          {kind === "chore" ? (
            <form action={toggleChorePinnedAction} className={styles.pinForm}>
              <input type="hidden" name="id" value={item.id} />
              <input
                type="hidden"
                name="pinned"
                value={(!item.pinned).toString()}
              />
              <IconButton
                type="submit"
                variant={item.pinned ? "accent" : "default"}
                aria-pressed={Boolean(item.pinned)}
                label={
                  item.pinned
                    ? tr("ui.unpin.name", { p0: item.name })
                    : tr("ui.pin.name.to.the.top", { p0: item.name })
                }
              >
                <Star
                  size={18}
                  aria-hidden="true"
                  fill={item.pinned ? "currentColor" : "none"}
                />
              </IconButton>
            </form>
          ) : null}
          <form action={moveCatalogItemAction} className={styles.reorder}>
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="id" value={item.id} />
            <IconButton
              type="submit"
              name="direction"
              value="up"
              label={tr("ui.move.name.up.76", { p0: item.name })}
            >
              <ChevronUp size={18} aria-hidden="true" />
            </IconButton>
            <IconButton
              type="submit"
              name="direction"
              value="down"
              label={tr("ui.move.name.down.77", { p0: item.name })}
            >
              <ChevronDown size={18} aria-hidden="true" />
            </IconButton>
          </form>
        </div>
      </div>

      <div className={ui.actionRow}>
        <details className={ui.actionDisclosure}>
          <summary
            className={`${ui.iconBtn} ${ui.iconSummary}`}
            aria-label={tr("ui.edit.name.78", { p0: item.name })}
            title={tr("ui.edit")}
          >
            <Pencil size={18} aria-hidden="true" />
          </summary>
          <form
            action={editAction}
            className={`${form.form} ${ui.actionPanel}`}
            noValidate
          >
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="id" value={item.id} />
            <CatalogFields
              kind={kind}
              errors={editState.fieldErrors}
              kids={kids}
              defaults={{
                name: item.name,
                emoji: item.emoji,
                value: item.value,
                description: item.description,
                limitPeriod: item.limitPeriod,
                limitCount: item.limitCount,
                isTeam: item.isTeam,
                minKids: item.minKids,
                allowSolo: item.allowSolo,
                assignedToKidId: item.assignedToKidId,
              }}
            />
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

        <form action={toggleCatalogItemActiveAction} className={ui.inlineForm}>
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={item.id} />
          <input
            type="hidden"
            name="isActive"
            value={(!item.isActive).toString()}
          />
          <IconButton
            type="submit"
            label={
              item.isActive ? tr("ui.hide.from.kids") : tr("ui.show.to.kids")
            }
          >
            {item.isActive ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </IconButton>
        </form>

        <details className={`${ui.actionDisclosure} ${ui.pushRight}`}>
          <summary
            className={`${ui.iconBtn} ${ui.danger} ${ui.iconSummary}`}
            aria-label={tr("ui.delete.name.79", { p0: item.name })}
            title={tr("ui.delete")}
          >
            <Trash2 size={18} aria-hidden="true" />
          </summary>
          <form
            action={deleteCatalogItemAction}
            className={`${ui.actionPanel} ${styles.deleteForm}`}
          >
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="id" value={item.id} />
            <p className={styles.warn}>
              {tr("flow.deleteItem", { name: item.name })}
            </p>
            <button type="submit" className={styles.dangerBtn}>
              {tr("ui.delete.permanently")}
            </button>
          </form>
        </details>
      </div>
    </Card>
  );
}
