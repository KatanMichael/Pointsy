"use client";
import { useTranslations, useLocale } from "@/components/i18n/LocaleProvider";
import Link from "next/link";
import {
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Star,
  Clock,
  Users,
} from "lucide-react";
import { IconByName } from "@/components/icons/registry";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Chip } from "@/components/ui/Chip";
import {
  formatChoreLimit,
  formatLogWindowSummary,
  type LimitPeriod,
  type LimitScope,
} from "@/lib/catalog/limit";
import {
  toggleChorePinnedAction,
  moveCatalogItemAction,
} from "@/app/actions/catalog";
import ui from "@/components/ui/ui.module.css";
import styles from "./catalog.module.css";

export interface ChoreRowItem {
  id: string;
  name: string;
  emoji: string;
  points: number;
  isActive: boolean;
  pinned: boolean;
  isCore: boolean;
  limitPeriod: LimitPeriod;
  limitCount: number;
  limitScope: LimitScope;
  /** "Robin's turn" / "Robin, Sky" / null for everyone. */
  whoLabel: string | null;
  /** Logging-window day mask (Mon=0…Sun=6) + bounds, null when unrestricted. */
  logWindowDays: number | null;
  logWindowStart: string | null;
  logWindowEnd: string | null;
}

/** A self-contained chore card — head taps through to the editor. */
export function ChoreRow({ item }: { item: ChoreRowItem }) {
  const locale = useLocale();
  const tr = useTranslations();

  const freq = formatChoreLimit(
    item.limitPeriod,
    item.limitCount,
    undefined,
    locale,
  );
  const window = formatLogWindowSummary(
    item.logWindowDays,
    item.logWindowStart,
    item.logWindowEnd,
    locale,
  );
  return (
    <Card>
      <Link href={`/manage/chores/${item.id}`} className={styles.rowLink}>
        <span className={styles.emoji}>
          <IconByName name={item.emoji} size={24} />
        </span>
        <span className={styles.rowText}>
          <span className={styles.name}>
            <bdi>{item.name}</bdi>
          </span>
          <span className={styles.metaRow}>
            <Chip variant="accent">
              {tr("flow.pts", { count: item.points })}
            </Chip>
            {item.isCore ? (
              <Chip variant="neutral">{tr("ui.core")}</Chip>
            ) : null}
            {item.limitScope === "total" ? (
              <Chip variant="accent">
                <Users size={12} aria-hidden="true" />
                {tr("ui.shared")}
              </Chip>
            ) : null}
            {item.whoLabel ? (
              <Chip variant="neutral">{item.whoLabel}</Chip>
            ) : null}
            {freq ? <Chip variant="muted">{freq}</Chip> : null}
            {window ? (
              <Chip variant="muted">
                <Clock size={12} aria-hidden="true" />
                {window}
              </Chip>
            ) : null}
            {!item.isActive ? (
              <Chip variant="warning">{tr("ui.hidden")}</Chip>
            ) : null}
          </span>
        </span>
        <ChevronRight
          size={20}
          aria-hidden="true"
          className={styles.rowChevron}
        />
      </Link>

      <div className={ui.actionRow}>
        <form action={toggleChorePinnedAction} className={ui.inlineForm}>
          <input type="hidden" name="id" value={item.id} />
          <input
            type="hidden"
            name="pinned"
            value={(!item.pinned).toString()}
          />
          <IconButton
            type="submit"
            variant={item.pinned ? "accent" : "default"}
            aria-pressed={item.pinned}
            label={
              item.pinned
                ? tr("ui.unpin.name.80", { p0: item.name })
                : tr("ui.pin.name", { p0: item.name })
            }
          >
            <Star
              size={18}
              aria-hidden="true"
              fill={item.pinned ? "currentColor" : "none"}
            />
          </IconButton>
        </form>
        <form action={moveCatalogItemAction} className={styles.reorder}>
          <input type="hidden" name="kind" value="chore" />
          <input type="hidden" name="id" value={item.id} />
          <IconButton
            type="submit"
            name="direction"
            value="up"
            label={tr("ui.move.name.up.82", { p0: item.name })}
          >
            <ChevronUp size={18} aria-hidden="true" />
          </IconButton>
          <IconButton
            type="submit"
            name="direction"
            value="down"
            label={tr("ui.move.name.down.83", { p0: item.name })}
          >
            <ChevronDown size={18} aria-hidden="true" />
          </IconButton>
        </form>
      </div>
    </Card>
  );
}
