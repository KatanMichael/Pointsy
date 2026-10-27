"use client";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { useEffect, useRef } from "react";
import { Undo2 } from "lucide-react";
import { undoEarnAction } from "@/app/actions/points";
import sheet from "@/components/redeem/redeem-confirm.module.css";
import styles from "./points.module.css";

/**
 * "Put back" control on an earned activity entry (parents only). Confirms in a
 * bottom sheet before reversing, so a stray tap never takes points away — same
 * native <dialog> pattern as RedeemButton (backdrop, Esc, focus trap for free).
 */
export function PutBackButton({
  entryId,
  reason,
  amount,
  kidName,
}: {
  entryId: string;
  reason: string;
  amount: number;
  kidName: string;
}) {
  const tr = useTranslations();

  const ref = useRef<HTMLDialogElement>(null);

  // Close when the backdrop (the dialog element itself, not its content) is
  // tapped. Attached natively rather than via a JSX handler so it doesn't read
  // as a click handler on a non-interactive element; Esc-to-close is built in.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onClick = (e: MouseEvent) => {
      if (e.target === dialog) dialog.close();
    };
    dialog.addEventListener("click", onClick);
    return () => dialog.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <button
        type="button"
        className={styles.undoBtn}
        aria-label={tr("ui.put.back.name.for.name", {
          p0: reason,
          p1: kidName,
        })}
        onClick={() => {
          // Open on the next frame so the dialog doesn't intercept the very
          // click that opened it (a webkit hit-test race).
          requestAnimationFrame(() => ref.current?.showModal());
        }}
      >
        <Undo2 size={18} aria-hidden="true" />
      </button>

      <dialog
        ref={ref}
        className={sheet.sheet}
        aria-label={tr("ui.put.back.name", { p0: reason })}
      >
        <p className={sheet.sheetTitle}>
          {tr("flow.putBackTitle", { name: reason })}
        </p>
        <p className={sheet.sheetBody}>
          {tr("flow.putBackBody", { points: amount, name: kidName })}
        </p>
        <form action={undoEarnAction}>
          <input type="hidden" name="entryId" value={entryId} />
          <button
            type="submit"
            className={sheet.confirmBtn}
            onClick={() => ref.current?.close()}
          >
            {tr("ui.put.it.back")}
          </button>
        </form>
        <button
          type="button"
          className={sheet.cancelBtn}
          onClick={() => ref.current?.close()}
        >
          {tr("ui.cancel")}
        </button>
      </dialog>
    </>
  );
}
