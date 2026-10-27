"use client";
import { translateFormState } from "@/lib/i18n/errors";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { useActionState, useEffect, useRef, useState } from "react";
import { IconByName } from "@/components/icons/registry";
import { proposeTeamAction } from "@/app/actions/team";
import { evenShares } from "@/lib/redemptions/split";
import type { FormState } from "@/lib/validation/form";
import styles from "./team-up.module.css";

export interface TeamKid {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

const initialState: FormState = {};

/**
 * Lets a kid propose a team reward: pick teammates, see their own even share
 * update live, and send invites. The proposer is always included.
 */
export function TeamUpButton({
  reward,
  otherKids,
  className,
  children,
}: {
  reward: { id: string; name: string; cost: number; minKids: number };
  otherKids: TeamKid[];
  className?: string;
  children: React.ReactNode;
}) {
  const tr = useTranslations();

  const ref = useRef<HTMLDialogElement>(null);
  const [stateCodes, action, pending] = useActionState(
    proposeTeamAction,
    initialState,
  );
  const state = translateFormState(stateCodes, tr);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (state.ok) ref.current?.close();
  }, [state.ok]);

  const total = selected.size + 1; // + the proposer
  const myShare = evenShares(reward.cost, total)[0] ?? reward.cost;
  const enough = total >= reward.minKids;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => requestAnimationFrame(() => ref.current?.showModal())}
      >
        {children}
      </button>

      <dialog
        ref={ref}
        className={styles.sheet}
        aria-label={tr("ui.team.up.for.name", { p0: reward.name })}
      >
        <p className={styles.title}>
          {tr("flow.teamTitle", { name: reward.name })}
        </p>
        <p className={styles.cost}>
          {tr("flow.teamCost", { points: reward.cost })}
        </p>

        <form action={action} className={styles.form}>
          <input type="hidden" name="rewardId" value={reward.id} />
          <fieldset className={styles.kids}>
            <legend className={styles.legend}>
              {tr("ui.who.s.teaming.up")}
            </legend>
            {otherKids.length === 0 ? (
              <p className={styles.muted}>
                {tr("ui.no.one.else.to.team.up.with.yet")}
              </p>
            ) : (
              otherKids.map((k) => (
                <label key={k.id} className={styles.kidRow}>
                  <input
                    type="checkbox"
                    name="kidIds"
                    value={k.id}
                    checked={selected.has(k.id)}
                    onChange={() => toggle(k.id)}
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

          <p className={styles.share}>
            {enough
              ? tr("ui.name.kids.your.share.is.name.points", {
                  p0: total,
                  p1: myShare,
                })
              : tr("ui.pick.at.least.name.kids.in.total", {
                  p0: reward.minKids,
                })}
          </p>
          {state.error ? (
            <p className={styles.error} role="alert">
              {state.error}
            </p>
          ) : null}
          <button
            type="submit"
            className={styles.propose}
            disabled={pending || !enough}
          >
            {pending ? tr("ui.sending") : tr("ui.send.team.up.invites")}
          </button>
        </form>

        <button
          type="button"
          className={styles.cancel}
          onClick={() => ref.current?.close()}
        >
          {tr("ui.not.now")}
        </button>
      </dialog>
    </>
  );
}
