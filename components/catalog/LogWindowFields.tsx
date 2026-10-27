"use client";
import { useTranslations, useLocale } from "@/components/i18n/LocaleProvider";

import { formatLogWindowSummary } from "@/lib/catalog/limit";
import { intlLocale } from "@/lib/i18n";
import { useId, useMemo, useState } from "react";
import { Clock, Sun, Moon, Eye } from "lucide-react";
import styles from "./chore-editor.module.css";

export interface LogWindowDefaults {
  logWindowDays?: number | null;
  logWindowStart?: string | null;
  logWindowEnd?: string | null;
}

type TimeMode = "any" | "after" | "before" | "between";

const DAYS = [
  { letter: "M", name: "Monday" },
  { letter: "T", name: "Tuesday" },
  { letter: "W", name: "Wednesday" },
  { letter: "T", name: "Thursday" },
  { letter: "F", name: "Friday" },
  { letter: "S", name: "Saturday" },
  { letter: "S", name: "Sunday" },
];
const WEEKDAYS = [true, true, true, true, true, false, false];
const WEEKENDS = [false, false, false, false, false, true, true];
const EVERY_DAY = [true, true, true, true, true, true, true];

function maskToBools(mask: number | null | undefined): boolean[] {
  if (mask === null || mask === undefined) return [...EVERY_DAY];
  return DAYS.map((_, i) => (mask & (1 << i)) !== 0);
}

function sameDays(a: boolean[], b: boolean[]): boolean {
  return a.every((v, i) => v === b[i]);
}

function modeFor(start?: string | null, end?: string | null): TimeMode {
  if (start && end) return "between";
  if (start) return "after";
  if (end) return "before";
  return "any";
}

/**
 * The "When can it be logged?" editor controls: a weekday selector plus an
 * optional time-of-day window. Emits `logWindowDays` (one checkbox per selected
 * day; 0 or 7 selected = every day → null mask server-side) and the
 * `logWindowStart` / `logWindowEnd` time inputs (absent = no bound → null).
 */
export function LogWindowFields({
  defaults,
}: {
  defaults?: LogWindowDefaults;
}) {
  const tr = useTranslations();
  const locale = useLocale();
  const localizedDays = DAYS.map((d, i) => ({
    name:
      locale === "en"
        ? d.name
        : new Intl.DateTimeFormat(intlLocale(locale), {
            weekday: "long",
            timeZone: "UTC",
          }).format(new Date(Date.UTC(2026, 5, 22 + i))),
    letter:
      locale === "en"
        ? d.letter
        : ["ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳", "א׳"][i],
  }));

  const [days, setDays] = useState<boolean[]>(() =>
    maskToBools(defaults?.logWindowDays),
  );
  const [mode, setMode] = useState<TimeMode>(() =>
    modeFor(defaults?.logWindowStart, defaults?.logWindowEnd),
  );
  const [start, setStart] = useState(defaults?.logWindowStart ?? "");
  const [end, setEnd] = useState(defaults?.logWindowEnd ?? "");
  const modeId = useId();

  const everyDay = useMemo(
    () => sameDays(days, EVERY_DAY) || days.every((d) => !d),
    [days],
  );

  const timeError =
    mode === "between" && start && end && end <= start
      ? tr("errors.validation.close.time.must.be.after.open.time")
      : null;
  const mask = everyDay
    ? null
    : days.reduce((mask, v, i) => (v ? mask | (1 << i) : mask), 0);
  const summary = formatLogWindowSummary(
    mask,
    mode === "after" || mode === "between" ? start || null : null,
    mode === "before" || mode === "between" ? end || null : null,
    locale,
  );
  const preview = summary
    ? tr("flow.windowPreview", { window: summary })
    : tr("flow.windowAny");

  const showStart = mode === "after" || mode === "between";
  const showEnd = mode === "before" || mode === "between";

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        <Clock size={18} aria-hidden="true" className={styles.titleIcon} />
        {tr("ui.when.can.it.be.logged")}
      </h2>
      <p className={styles.muted}>
        {tr("ui.limit.the.days.and.times.a.kid.can.log")}
      </p>

      <fieldset className={styles.windowGroup}>
        <legend className={styles.windowLegend}>{tr("ui.which.days")}</legend>
        <div className={styles.windowBody}>
          <div className={styles.presetRow}>
            {(
              [
                [tr("ui.every.day"), EVERY_DAY],
                [tr("ui.weekdays"), WEEKDAYS],
                [tr("ui.weekends"), WEEKENDS],
              ] as const
            ).map(([label, preset]) => (
              <button
                key={label}
                type="button"
                className={
                  sameDays(days, preset) ||
                  (label === tr("ui.every.day") && everyDay)
                    ? styles.presetActive
                    : styles.preset
                }
                aria-pressed={
                  sameDays(days, preset) ||
                  (label === tr("ui.every.day") && everyDay)
                }
                onClick={() => setDays([...preset])}
              >
                {label}
              </button>
            ))}
          </div>
          <div className={styles.dayRow}>
            {localizedDays.map((d, i) => (
              <label key={i} className={styles.dayChip}>
                <input
                  type="checkbox"
                  name="logWindowDays"
                  value={i}
                  checked={days[i]}
                  aria-label={d.name}
                  className={styles.dayInput}
                  onChange={() =>
                    setDays((prev) => prev.map((v, j) => (j === i ? !v : v)))
                  }
                />
                <span aria-hidden="true">{d.letter}</span>
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <div className={styles.windowGroup}>
        <label htmlFor={modeId} className={styles.windowLegend}>
          {tr("ui.time.of.day")}
        </label>
        <div className={styles.windowBody}>
          <select
            id={modeId}
            className={styles.select}
            value={mode}
            onChange={(e) => setMode(e.target.value as TimeMode)}
          >
            <option value="any">{tr("ui.any.time")}</option>
            <option value="after">{tr("ui.only.from.a.set.time")}</option>
            <option value="before">{tr("ui.only.until.a.set.time")}</option>
            <option value="between">{tr("ui.only.between.two.times")}</option>
          </select>

          {showStart || showEnd ? (
            <div className={styles.timeGrid}>
              {showStart ? (
                <div className={styles.timeField}>
                  <label htmlFor="logWindowStart" className={styles.timeLabel}>
                    <Sun size={15} aria-hidden="true" /> {tr("ui.opens.at")}
                  </label>
                  <input
                    id="logWindowStart"
                    type="time"
                    name="logWindowStart"
                    aria-label={tr("ui.opens.at")}
                    className={styles.timeInput}
                    value={start}
                    required
                    onChange={(e) => setStart(e.target.value)}
                  />
                </div>
              ) : null}
              {showEnd ? (
                <div className={styles.timeField}>
                  <label htmlFor="logWindowEnd" className={styles.timeLabel}>
                    <Moon size={15} aria-hidden="true" /> {tr("ui.closes.at")}
                  </label>
                  <input
                    id="logWindowEnd"
                    type="time"
                    name="logWindowEnd"
                    aria-label={tr("ui.closes.at")}
                    className={styles.timeInput}
                    value={end}
                    required
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {timeError ? (
        <p className={styles.previewError} role="alert">
          {timeError}
        </p>
      ) : (
        <p className={styles.preview}>
          <Eye size={16} aria-hidden="true" />
          <span>{preview}</span>
        </p>
      )}
    </section>
  );
}
