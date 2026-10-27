"use client";
import { translateFormState } from "@/lib/i18n/errors";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { useActionState, useState } from "react";
import { UserPlus, Copy, Check } from "lucide-react";
import {
  createParentInviteAction,
  type InviteState,
} from "@/app/actions/parents";
import styles from "./parents.module.css";

const initial: InviteState = {};

export function InviteParent() {
  const tr = useTranslations();

  const [stateCodes, action, pending] = useActionState(
    createParentInviteAction,
    initial,
  );
  const state = translateFormState(stateCodes, tr);
  const [copied, setCopied] = useState(false);

  function copy(code: string) {
    void navigator.clipboard?.writeText(code);
    setCopied(true);
  }

  return (
    <div className={styles.invite}>
      <form action={action}>
        <button type="submit" className={styles.inviteBtn} disabled={pending}>
          <UserPlus size={18} aria-hidden="true" />
          {pending ? tr("ui.creating") : tr("ui.invite.a.parent")}
        </button>
      </form>

      {state.code ? (
        <output className={styles.codeBox}>
          <p className={styles.codeLabel}>
            {tr("ui.share.this.code.with.the.other.parent.it.works")}
          </p>
          <div className={styles.codeRow}>
            <span dir="ltr" className={styles.code}>
              {state.code}
            </span>
            <button
              type="button"
              onClick={() => copy(state.code as string)}
              className={styles.copyBtn}
            >
              {copied ? (
                <Check size={16} aria-hidden="true" />
              ) : (
                <Copy size={16} aria-hidden="true" />
              )}
              {copied ? tr("ui.copied") : tr("ui.copy")}
            </button>
          </div>
          <p className={styles.codeHint}>
            {tr("ui.they.enter.it.at")}{" "}
            <a href="/join">{tr("ui.the.join.page")}</a>{" "}
            {tr("ui.to.create.their.own.login")}
          </p>
        </output>
      ) : null}
    </div>
  );
}
