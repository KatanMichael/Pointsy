import { formatNumber } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate, type Translator } from "@/lib/i18n";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import {
  LogOut,
  Users,
  Plus,
  Minus,
  Check,
  X,
  PackageCheck,
  Download,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { signOutAction } from "@/app/actions/auth";
import { getDb } from "@/lib/db/client";
import { getPersonById } from "@/lib/db/queries";
import { getKidBalances } from "@/lib/points/service";
import {
  listPendingRedemptions,
  listAwaitingFulfillment,
} from "@/lib/redemptions/service";
import {
  decideRedemptionAction,
  fulfillRedemptionAction,
} from "@/app/actions/redemptions";
import { listPendingSubmissions } from "@/lib/submissions/service";
import { decideSubmissionAction } from "@/app/actions/submissions";
import {
  listTeamRedemptionsAwaitingApproval,
  listTeamRedemptionsAwaitingFulfillment,
} from "@/lib/redemptions/team";
import { decideTeamAction, fulfillTeamAction } from "@/app/actions/team";
import { listChallengeApprovals } from "@/lib/challenges/service";
import { decideChallengeAwardAction } from "@/app/actions/challenges";
import { IconByName } from "@/components/icons/registry";
import { Chip } from "@/components/ui/Chip";
import { ConfirmDeleteDisclosure } from "@/components/account/ConfirmDeleteDisclosure";
import { deleteFamilyAction } from "@/app/actions/family";
import danger from "@/components/account/danger.module.css";
import { SetPinForm } from "@/components/account/SetPinForm";
import { EnableNotifications } from "@/components/push/EnableNotifications";
import { FamilyTimezone } from "@/components/family/FamilyTimezone";
import { DashboardNav } from "@/components/manage/DashboardNav";
import { families } from "@/lib/db/schema";
import styles from "./dashboard.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: translate(locale, "meta.app.dashboard.page.tsx.title") };
}

export default async function DashboardPage() {
  const locale = await getRequestLocale();
  const tr = translate.bind(null, locale) as Translator;

  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "parent") redirect("/me");

  const db = getDb();
  const [family] = await db
    .select()
    .from(families)
    .where(eq(families.id, session.familyId))
    .limit(1);
  const me = await getPersonById(db, session.familyId, session.personId);
  if (!family || !me) redirect("/sign-in");

  const [
    kids,
    pending,
    awaiting,
    choreSubs,
    teamReady,
    teamAwaiting,
    challengeApprovals,
  ] = await Promise.all([
    getKidBalances(db, session.familyId),
    listPendingRedemptions(db, session.familyId),
    listAwaitingFulfillment(db, session.familyId),
    listPendingSubmissions(db, session.familyId),
    listTeamRedemptionsAwaitingApproval(db, session.familyId),
    listTeamRedemptionsAwaitingFulfillment(db, session.familyId),
    listChallengeApprovals(db, session.familyId),
  ]);

  return (
    <main id="main" className={styles.main}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{tr("ui.welcome.back")}</p>
          <h1 className={styles.title}>
            <bdi>{me.name}</bdi>
          </h1>
        </div>
        <form action={signOutAction}>
          <button type="submit" className={styles.signOut}>
            <LogOut size={18} aria-hidden="true" />
            {tr("ui.sign.out")}
          </button>
        </form>
      </header>

      {pending.length > 0 ? (
        <section aria-labelledby="pending-heading">
          <h2 id="pending-heading" className={styles.sectionTitle}>
            {tr("ui.pending.approvals")}
          </h2>
          <ul className={styles.queueList}>
            {pending.map((p) => (
              <li key={p.id} className={styles.queueCard}>
                <span
                  className={styles.kidAvatar}
                  style={{ background: p.color }}
                >
                  <IconByName name={p.avatar} size={22} />
                </span>
                <span className={styles.queueText}>
                  <span className={styles.queueTitle}>
                    {tr("flow.requestedReward", {
                      name: p.kidName,
                      reward: p.rewardName,
                    })}
                  </span>
                  <span className={styles.queueMeta}>
                    {tr("flow.pts", { count: p.cost })}
                  </span>
                </span>
                <form
                  action={decideRedemptionAction}
                  className={styles.queueActions}
                >
                  <input type="hidden" name="redemptionId" value={p.id} />
                  <button
                    type="submit"
                    name="decision"
                    value="approved"
                    className={styles.approveBtn}
                    aria-label={tr("ui.approve.name.for.name", {
                      p0: p.rewardName,
                      p1: p.kidName,
                    })}
                  >
                    <Check size={16} aria-hidden="true" />
                    {tr("ui.approve")}
                  </button>
                  <button
                    type="submit"
                    name="decision"
                    value="denied"
                    className={styles.denyBtn}
                    aria-label={tr("ui.deny.name.for.name", {
                      p0: p.rewardName,
                      p1: p.kidName,
                    })}
                  >
                    <X size={16} aria-hidden="true" />
                    {tr("ui.deny")}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {teamReady.length > 0 ? (
        <section aria-labelledby="team-approvals-heading">
          <h2 id="team-approvals-heading" className={styles.sectionTitle}>
            {tr("ui.team.up.approvals")}
          </h2>
          <ul className={styles.queueList}>
            {teamReady.map((t) => (
              <li key={t.id} className={styles.queueCard}>
                <span
                  className={styles.kidAvatar}
                  style={{ background: "var(--color-primary)" }}
                >
                  <Users size={20} aria-hidden="true" />
                </span>
                <span className={styles.queueText}>
                  <span className={styles.queueTitle}>
                    <bdi>{t.rewardName}</bdi>
                  </span>
                  <span className={styles.queueMeta}>
                    {formatNumber(locale, t.cost)} {tr("ui.pts")}{" "}
                    {t.members.map((m) => `${m.name} ${m.share}`).join(", ")}
                  </span>
                </span>
                <form action={decideTeamAction} className={styles.queueActions}>
                  <input type="hidden" name="teamRedemptionId" value={t.id} />
                  <button
                    type="submit"
                    name="decision"
                    value="approved"
                    className={styles.approveBtn}
                    aria-label={tr("ui.approve.name.team.up", {
                      p0: t.rewardName,
                    })}
                  >
                    <Check size={16} aria-hidden="true" />
                    {tr("ui.approve")}
                  </button>
                  <button
                    type="submit"
                    name="decision"
                    value="denied"
                    className={styles.denyBtn}
                    aria-label={tr("ui.deny.name.team.up", {
                      p0: t.rewardName,
                    })}
                  >
                    <X size={16} aria-hidden="true" />
                    {tr("ui.deny")}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {choreSubs.length > 0 ? (
        <section aria-labelledby="chore-approvals-heading">
          <h2 id="chore-approvals-heading" className={styles.sectionTitle}>
            {tr("ui.chore.approvals")}
          </h2>
          <ul className={styles.queueList}>
            {choreSubs.map((s) => (
              <li key={s.id} className={styles.queueCard}>
                <span
                  className={styles.kidAvatar}
                  style={{ background: s.color }}
                >
                  <IconByName name={s.avatar} size={22} />
                </span>
                <span className={styles.queueText}>
                  <span className={styles.queueTitle}>
                    {tr("flow.didChore", {
                      name: s.kidName,
                      chore: s.choreName,
                    })}
                  </span>
                  <span className={styles.queueMeta}>
                    +{tr("flow.pts", { count: s.points })}
                    {s.limitScope === "total" ? (
                      <Chip variant="accent">
                        <Users size={12} aria-hidden="true" />
                        {tr("ui.shared")}
                      </Chip>
                    ) : s.isCore ? (
                      <Chip variant="neutral">{tr("ui.core")}</Chip>
                    ) : null}
                  </span>
                </span>
                <form
                  action={decideSubmissionAction}
                  className={styles.queueActions}
                >
                  <input type="hidden" name="submissionId" value={s.id} />
                  <button
                    type="submit"
                    name="decision"
                    value="approved"
                    className={styles.approveBtn}
                    aria-label={tr("ui.approve.name.for.name.65", {
                      p0: s.choreName,
                      p1: s.kidName,
                    })}
                  >
                    <Check size={16} aria-hidden="true" />
                    {tr("ui.approve")}
                  </button>
                  <button
                    type="submit"
                    name="decision"
                    value="rejected"
                    className={styles.denyBtn}
                    aria-label={tr("ui.reject.name.for.name", {
                      p0: s.choreName,
                      p1: s.kidName,
                    })}
                  >
                    <X size={16} aria-hidden="true" />
                    {tr("ui.reject")}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {challengeApprovals.length > 0 ? (
        <section aria-labelledby="challenge-approvals-heading">
          <h2 id="challenge-approvals-heading" className={styles.sectionTitle}>
            {tr("ui.challenge.approvals")}
          </h2>
          <ul className={styles.queueList}>
            {challengeApprovals.map((c) => (
              <li key={c.awardId} className={styles.queueCard}>
                <span
                  className={styles.kidAvatar}
                  style={{ background: c.color }}
                >
                  <IconByName name={c.avatar} size={22} />
                </span>
                <span className={styles.queueText}>
                  <span className={styles.queueTitle}>
                    {tr("flow.finishedChallenge", {
                      name: c.kidName,
                      challenge: c.challengeTitle,
                    })}
                  </span>
                  <span className={styles.queueMeta}>
                    +{tr("flow.pts", { count: c.bonusPoints })}
                  </span>
                </span>
                <form
                  action={decideChallengeAwardAction}
                  className={styles.queueActions}
                >
                  <input type="hidden" name="awardId" value={c.awardId} />
                  <button
                    type="submit"
                    name="decision"
                    value="approved"
                    className={styles.approveBtn}
                    aria-label={tr("ui.approve.name.for.name.67", {
                      p0: c.challengeTitle,
                      p1: c.kidName,
                    })}
                  >
                    <Check size={16} aria-hidden="true" />
                    {tr("ui.approve")}
                  </button>
                  <button
                    type="submit"
                    name="decision"
                    value="denied"
                    className={styles.denyBtn}
                    aria-label={tr("ui.deny.name.for.name.68", {
                      p0: c.challengeTitle,
                      p1: c.kidName,
                    })}
                  >
                    <X size={16} aria-hidden="true" />
                    {tr("ui.deny")}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="kids-heading">
        <h2 id="kids-heading" className={styles.sectionTitle}>
          {tr("ui.your.kids")}
        </h2>
        {kids.length > 0 ? (
          <ul className={styles.kidList}>
            {kids.map((k) => (
              <li key={k.id} className={styles.kidCard}>
                <Link
                  href={`/award/${k.id}`}
                  className={styles.kidIdentity}
                  aria-label={tr("ui.manage.name.s.points", { p0: k.name })}
                >
                  <span
                    className={styles.kidAvatar}
                    style={{ background: k.color }}
                  >
                    <IconByName name={k.avatar} size={24} />
                  </span>
                  <span className={styles.kidInfo}>
                    <span className={styles.kidCardName}>
                      <bdi>{k.name}</bdi>
                    </span>
                    <span
                      dir="ltr"
                      className={
                        k.balance < 0 ? styles.kidBalanceNeg : styles.kidBalance
                      }
                    >
                      {tr("flow.pts", { count: k.balance })}
                    </span>
                  </span>
                </Link>
                <div className={styles.kidActions}>
                  <Link
                    href={`/award/${k.id}`}
                    className={styles.awardChip}
                    aria-label={tr("ui.award.points.to.name", { p0: k.name })}
                  >
                    <Plus size={16} aria-hidden="true" />
                    {tr("ui.award")}
                  </Link>
                  <Link
                    href={`/award/${k.id}?mode=deduct`}
                    className={styles.deductChip}
                    aria-label={tr("ui.deduct.points.from.name", {
                      p0: k.name,
                    })}
                  >
                    <Minus size={16} aria-hidden="true" />
                    {tr("ui.deduct")}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.muted}>
            <Link href="/manage/kids">{tr("ui.add.your.kids")}</Link>{" "}
            {tr("ui.to.start.awarding.points")}
          </p>
        )}
      </section>

      {awaiting.length > 0 ? (
        <section aria-labelledby="awaiting-heading">
          <h2 id="awaiting-heading" className={styles.sectionTitle}>
            {tr("ui.awaiting.delivery")}
          </h2>
          <ul className={styles.queueList}>
            {awaiting.map((a) => (
              <li key={a.id} className={styles.queueCard}>
                <span
                  className={styles.kidAvatar}
                  style={{ background: a.color }}
                >
                  <IconByName name={a.avatar} size={22} />
                </span>
                <span className={styles.queueText}>
                  <span className={styles.queueTitle}>
                    <bdi>{a.kidName}</bdi> · <bdi>{a.rewardName}</bdi>
                  </span>
                  <span className={styles.queueMeta}>
                    {formatNumber(locale, a.cost)} {tr("ui.pts.approved")}
                  </span>
                </span>
                <form action={fulfillRedemptionAction}>
                  <input type="hidden" name="redemptionId" value={a.id} />
                  <button type="submit" className={styles.deliverBtn}>
                    <PackageCheck size={16} aria-hidden="true" />
                    {tr("ui.delivered")}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {teamAwaiting.length > 0 ? (
        <section aria-labelledby="team-awaiting-heading">
          <h2 id="team-awaiting-heading" className={styles.sectionTitle}>
            {tr("ui.team.rewards.to.hand.out")}
          </h2>
          <ul className={styles.queueList}>
            {teamAwaiting.map((t) => (
              <li key={t.id} className={styles.queueCard}>
                <span
                  className={styles.kidAvatar}
                  style={{ background: "var(--color-primary)" }}
                >
                  <Users size={20} aria-hidden="true" />
                </span>
                <span className={styles.queueText}>
                  <span className={styles.queueTitle}>
                    <bdi>{t.rewardName}</bdi>
                  </span>
                  <span className={styles.queueMeta}>
                    {t.members.map((m) => m.name).join(" & ")}{" "}
                    {tr("ui.approved")}
                  </span>
                </span>
                <form action={fulfillTeamAction}>
                  <input type="hidden" name="teamRedemptionId" value={t.id} />
                  <button type="submit" className={styles.deliverBtn}>
                    <PackageCheck size={16} aria-hidden="true" />
                    {tr("ui.delivered")}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.card} aria-labelledby="family-heading">
        <h2 id="family-heading" className={styles.cardTitle}>
          <bdi>{family.name}</bdi>
        </h2>
        <p className={styles.muted}>
          {tr("ui.kids.sign.in.at.the")}{" "}
          <Link href="/enter">{tr("ui.pin.sign.in.page")}</Link>{" "}
          {tr("ui.share.this.code.so.a.new.device.can.join")}
        </p>
        <p className={styles.code}>{family.code}</p>
        <details className={styles.pinDetails}>
          <summary className={styles.pinSummary}>
            {me.pinHash
              ? tr("ui.change.your.sign.in.pin")
              : tr("ui.set.a.sign.in.pin.for.yourself")}
          </summary>
          <p className={styles.muted}>
            {tr("ui.adds.you.to.the.profile.picker.so.you.can")}
          </p>
          <SetPinForm hasPin={!!me.pinHash} />
        </details>
        <details className={styles.pinDetails}>
          <summary className={styles.pinSummary}>
            {tr("ui.family.time.zone")}
          </summary>
          <FamilyTimezone current={family.timezone} />
        </details>
      </section>

      <section
        className={`${styles.card} ${danger.zone}`}
        aria-labelledby="data-heading"
      >
        <h2 id="data-heading" className={styles.cardTitle}>
          {tr("ui.your.data")}
        </h2>
        <p className={styles.muted}>
          {tr("ui.download.everything.in.your.family.as.a.json.file")}
        </p>
        <a href="/api/family/export" className={danger.exportLink} download>
          <Download size={16} aria-hidden="true" />
          {tr("ui.export.your.data.json")}
        </a>
        {family.ownerId === session.personId ? (
          <ConfirmDeleteDisclosure
            detailsClassName={styles.pinDetails}
            summaryClassName={`${styles.pinSummary} ${danger.zoneTitle}`}
            summary={tr("ui.delete.this.family")}
            action={deleteFamilyAction}
            confirmWord={family.name}
            buttonLabel={tr("ui.delete.family.forever")}
            intro={tr(
              "ui.this.permanently.deletes.name.every.parent.child.chore.reward.and",
              { p0: family.name },
            )}
          />
        ) : null}
      </section>

      <EnableNotifications audience="parent" />

      <DashboardNav />
    </main>
  );
}
