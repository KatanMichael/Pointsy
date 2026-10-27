import { formatNumber } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate, type Translator } from "@/lib/i18n";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Lock, Hourglass } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { getPersonById } from "@/lib/db/queries";
import {
  listRedeemableRewards,
  listKidRedemptions,
} from "@/lib/redemptions/service";
import {
  listTeamInvitesFor,
  listKidTeamRedemptions,
} from "@/lib/redemptions/team";
import { getKidBalances } from "@/lib/points/service";
import { cancelRedemptionAction } from "@/app/actions/redemptions";
import { IconByName } from "@/components/icons/registry";
import { RedeemButton } from "@/components/redeem/RedeemButton";
import { TeamUpButton } from "@/components/redeem/TeamUpButton";
import { TeamUps } from "@/components/redeem/TeamUps";
import { KidTabBar } from "@/components/kid/KidTabBar";
import { Users } from "lucide-react";
import styles from "./redeem.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: translate(locale, "meta.app.redeem.page.tsx.title") };
}

export default async function RedeemPage() {
  const locale = await getRequestLocale();
  const tr = translate.bind(null, locale) as Translator;

  const session = await getSession();
  if (!session) redirect("/enter");
  if (session.role !== "kid") redirect("/dashboard");

  const db = getDb();
  const me = await getPersonById(db, session.familyId, session.personId);
  if (!me) redirect("/enter");

  const [{ available, rewards }, history, familyKids, invites, myTeamUps] =
    await Promise.all([
      listRedeemableRewards(db, session.familyId, session.personId),
      listKidRedemptions(db, session.familyId, session.personId, 20),
      getKidBalances(db, session.familyId),
      listTeamInvitesFor(db, session.familyId, session.personId),
      listKidTeamRedemptions(db, session.familyId, session.personId),
    ]);
  const pending = history.filter((r) => r.status === "requested");
  const soloRewards = rewards.filter((r) => !r.isTeam);
  const teamRewards = rewards.filter((r) => r.isTeam);
  const otherKids = familyKids
    .filter((k) => k.id !== session.personId)
    .map((k) => ({
      id: k.id,
      name: k.name,
      avatar: k.avatar,
      color: k.color,
    }));

  return (
    <main id="main" className={styles.main}>
      <h1 className={styles.title}>{tr("ui.rewards")}</h1>
      {available < 0 ? (
        <p className={styles.negative}>
          {tr("flow.debt", { balance: available, needed: -available })}
        </p>
      ) : (
        <p className={styles.available}>
          {formatNumber(locale, available)} {tr("ui.points.to.spend")}
        </p>
      )}

      {pending.length > 0 ? (
        <section aria-labelledby="pending-title">
          <h2 id="pending-title" className={styles.sectionTitle}>
            {tr("ui.waiting.for.a.parent")}
          </h2>
          <ul className={styles.pendingList}>
            {pending.map((p) => (
              <li key={p.id} className={styles.pendingRow}>
                <span className={styles.pendingText}>
                  <span className={styles.pendingName}>
                    <bdi>{p.rewardName}</bdi>
                  </span>
                  <span className={styles.pendingMeta}>
                    {formatNumber(locale, p.cost)} {tr("ui.pts.pending")}
                  </span>
                </span>
                <form action={cancelRedemptionAction}>
                  <input type="hidden" name="redemptionId" value={p.id} />
                  <button type="submit" className={styles.cancelBtn}>
                    {tr("ui.cancel")}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <TeamUps kidId={session.personId} invites={invites} mine={myTeamUps} />

      {teamRewards.length > 0 ? (
        <section aria-labelledby="team-title">
          <h2 id="team-title" className={styles.sectionTitle}>
            {tr("ui.team.rewards")}
          </h2>
          <div className={styles.grid}>
            {teamRewards.map((r) => {
              const canSolo =
                r.allowSolo && r.affordable && available >= 0 && !r.pending;
              return (
                <div key={r.id} className={styles.teamCard}>
                  <span className={styles.rewardIcon}>
                    <IconByName name={r.emoji} size={26} />
                  </span>
                  <span className={styles.rewardName}>
                    <bdi>{r.name}</bdi>
                  </span>
                  <span className={styles.rewardCost}>
                    {tr("flow.pts", { count: r.cost })}
                  </span>
                  <div className={styles.teamActions}>
                    <TeamUpButton
                      reward={{
                        id: r.id,
                        name: r.name,
                        cost: r.cost,
                        minKids: r.minKids,
                      }}
                      otherKids={otherKids}
                      className={styles.teamActionBtn}
                    >
                      <Users size={14} aria-hidden="true" />
                      {tr("ui.team.up")}
                    </TeamUpButton>
                    {canSolo ? (
                      <RedeemButton
                        rewardId={r.id}
                        name={r.name}
                        cost={r.cost}
                        className={styles.soloActionBtn}
                      >
                        {tr("ui.solo")}
                      </RedeemButton>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="rewards-title">
        <h2 id="rewards-title" className={styles.sectionTitle}>
          {tr("ui.spend.your.points")}
        </h2>
        {soloRewards.length > 0 ? (
          <div className={styles.grid}>
            {soloRewards.map((r) =>
              r.pending ? (
                <div key={r.id} className={styles.rewardLocked}>
                  <span className={styles.rewardIconLocked}>
                    <IconByName name={r.emoji} size={26} />
                  </span>
                  <span className={styles.rewardName}>
                    <bdi>{r.name}</bdi>
                  </span>
                  <span className={styles.rewardCost}>
                    {tr("flow.pts", { count: r.cost })}
                  </span>
                  <span className={styles.pendingPill}>
                    <Hourglass size={14} aria-hidden="true" />
                    {tr("ui.pending")}
                  </span>
                </div>
              ) : r.affordable && available >= 0 ? (
                <RedeemButton
                  key={r.id}
                  rewardId={r.id}
                  name={r.name}
                  cost={r.cost}
                  className={styles.rewardBtn}
                >
                  <span className={styles.rewardIcon}>
                    <IconByName name={r.emoji} size={26} />
                  </span>
                  <span className={styles.rewardName}>
                    <bdi>{r.name}</bdi>
                  </span>
                  <span className={styles.rewardCost}>
                    {tr("flow.pts", { count: r.cost })}
                  </span>
                  <span className={styles.redeemPill}>{tr("ui.redeem")}</span>
                </RedeemButton>
              ) : (
                <div key={r.id} className={styles.rewardLocked}>
                  <span className={styles.rewardIconLocked}>
                    <IconByName name={r.emoji} size={26} />
                  </span>
                  <span className={styles.rewardName}>
                    <bdi>{r.name}</bdi>
                  </span>
                  <span className={styles.rewardCost}>
                    {tr("flow.pts", { count: r.cost })}
                  </span>
                  <span className={styles.lockedPill}>
                    <Lock size={14} aria-hidden="true" />
                    {tr("flow.countMore", { count: r.moreNeeded })}
                  </span>
                </div>
              ),
            )}
          </div>
        ) : (
          <p className={styles.empty}>{tr("ui.no.rewards.yet.ask.a.parent")}</p>
        )}
      </section>
      <KidTabBar />
    </main>
  );
}
