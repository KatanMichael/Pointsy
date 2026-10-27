"use client";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { errorText } from "@/lib/i18n/errors";
import { useActionState, useEffect, useRef } from "react";
import { requestRedemptionAction } from "@/app/actions/redemptions";
import styles from "./redeem-confirm.module.css";

/**
 * Wraps a reward as a tappable button that asks for confirmation in a bottom
 * sheet before requesting it — so a stray tap never spends points. Uses a native
 * <dialog> (backdrop, Esc, focus trap for free). Card content is passed as
 * children so each surface keeps its own styling.
 */
export function RedeemButton({
  rewardId,
  name,
  cost,
  className,
  children,
}: {
  rewardId: string;
  name: string;
  cost: number;
  className?: string;
  children: React.ReactNode;
}) {
  const tr = useTranslations();

  const [state, action, pending] = useActionState(requestRedemptionAction, {});
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.close();
  }, [state.ok]);

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
        className={className}
        onClick={() => {
          // Open on the next frame so the dialog doesn't intercept the very
          // click that opened it (a webkit hit-test race).
          requestAnimationFrame(() => ref.current?.showModal());
        }}
      >
        {children}
      </button>

      <dialog
        ref={ref}
        className={styles.sheet}
        aria-label={tr("ui.request.name", { p0: name })}
      >
        <p className={styles.sheetTitle}>
          {tr("flow.confirmRequest", { name })}
        </p>
        <p className={styles.sheetBody}>
          {tr("flow.requestCost", { points: cost })}
        </p>
        {state.errorCode ? (
          <p role="alert">{errorText(tr, state.errorCode)}</p>
        ) : null}
        <form action={action}>
          <input type="hidden" name="rewardId" value={rewardId} />
          <button
            type="submit"
            className={styles.confirmBtn}
            disabled={pending}
          >
            {tr("ui.yes.request.it")}
          </button>
        </form>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => ref.current?.close()}
        >
          {tr("ui.not.yet")}
        </button>
      </dialog>
    </>
  );
}
