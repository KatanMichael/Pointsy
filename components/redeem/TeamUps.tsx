"use client";
import type { Translator } from "@/lib/i18n";

import { useTranslations } from "@/components/i18n/LocaleProvider";
import { Users } from "lucide-react";
import { IconByName } from "@/components/icons/registry";
import { respondTeamAction, cancelTeamAction } from "@/app/actions/team";
import type { TeamRedemptionView } from "@/lib/redemptions/team";
import styles from "./team-list.module.css";

function statusLabel(t: TeamRedemptionView, tr: Translator): string {
  if (t.status === "approved") return tr("ui.approved");
  return t.members.every((m) => m.status === "accepted")
    ? tr("ui.waiting.for.a.grown.up")
    : tr("ui.waiting.for.teammates");
}

/** A kid's team-up invites (to answer) and the team-ups they're already in. */
export function TeamUps({
  kidId,
  invites,
  mine,
}: {
  kidId: string;
  invites: TeamRedemptionView[];
  mine: TeamRedemptionView[];
}) {
  const tr = useTranslations();

  // "mine" overlaps invites — only show ones the kid has actually committed to.
  const committed = mine.filter(
    (t) => t.members.find((m) => m.personId === kidId)?.status === "accepted",
  );
  if (invites.length === 0 && committed.length === 0) return null;

  return (
    <section aria-labelledby="teamups-title" className={styles.wrap}>
      <h2 id="teamups-title" className={styles.heading}>
        <Users size={20} aria-hidden="true" />
        {tr("ui.team.ups")}
      </h2>

      {invites.map((t) => {
        const proposer = t.members.find((m) => m.personId === t.proposedBy);
        const myShare = t.members.find((m) => m.personId === kidId)?.share ?? 0;
        return (
          <div key={t.id} className={styles.invite}>
            <p className={styles.inviteText}>
              {tr("flow.teamInvite", {
                name: proposer?.name ?? tr("ui.a.teammate"),
                reward: t.rewardName,
              })}
            </p>
            <p className={styles.share}>
              {tr("flow.myShare", { points: myShare })}
            </p>
            <form action={respondTeamAction} className={styles.respond}>
              <input type="hidden" name="teamRedemptionId" value={t.id} />
              <button
                type="submit"
                name="accept"
                value="true"
                className={styles.yes}
              >
                {tr("ui.i.m.in")}
              </button>
              <button
                type="submit"
                name="accept"
                value="false"
                className={styles.no}
              >
                {tr("ui.no.thanks")}
              </button>
            </form>
          </div>
        );
      })}

      {committed.map((t) => (
        <div key={t.id} className={styles.row}>
          <span className={styles.rowText}>
            <span className={styles.rowName}>
              <bdi>{t.rewardName}</bdi>
            </span>
            <span className={styles.rowStatus}>{statusLabel(t, tr)}</span>
          </span>
          <span className={styles.avatars}>
            {t.members.map((m) => (
              <span
                key={m.personId}
                className={styles.avatar}
                style={{ background: m.color }}
                data-out={m.status === "declined"}
                title={tr("ui.name.name.pts", { p0: m.name, p1: m.share })}
              >
                <IconByName name={m.avatar} size={16} />
              </span>
            ))}
          </span>
          {t.status === "proposed" && t.proposedBy === kidId ? (
            <form action={cancelTeamAction}>
              <input type="hidden" name="teamRedemptionId" value={t.id} />
              <button type="submit" className={styles.cancel}>
                {tr("ui.cancel")}
              </button>
            </form>
          ) : null}
        </div>
      ))}
    </section>
  );
}
