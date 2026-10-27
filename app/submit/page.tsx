import { getRequestLocale } from "@/lib/i18n/server";
import { translate, type Translator } from "@/lib/i18n";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { getFamilyTimezone } from "@/lib/family/settings";
import { listSubmittableChores, lockedLast } from "@/lib/submissions/service";
import { listCategories } from "@/lib/categories/service";
import { groupByCategory } from "@/lib/catalog/category";
import { IconByName } from "@/components/icons/registry";
import { SubmitChoreCard } from "@/components/submit/SubmitChoreCard";
import { KidTabBar } from "@/components/kid/KidTabBar";
import styles from "./submit.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: translate(locale, "meta.app.submit.page.tsx.title") };
}

export default async function SubmitPage() {
  const locale = await getRequestLocale();
  const tr = translate.bind(null, locale) as Translator;

  const session = await getSession();
  if (!session) redirect("/enter");
  if (session.role !== "kid") redirect("/dashboard");

  const db = getDb();
  const tz = await getFamilyTimezone(db, session.familyId);
  const [allChores, categories] = await Promise.all([
    listSubmittableChores(db, session.familyId, session.personId, tz),
    listCategories(db, session.familyId),
  ]);
  // Only this kid's chores — a chore assigned to someone else (or on another
  // kid's turn) isn't theirs to see here.
  const chores = allChores.filter((c) => c.eligible);
  // Within each section, time-locked chores (countdowns) sink to the bottom so
  // the ones a kid can do now group at the top (#123).
  const core = chores.filter((c) => c.isCore).sort(lockedLast);
  const others = chores.filter((c) => !c.isCore);

  return (
    <main id="main" className={styles.main}>
      <h1 className={styles.title}>{tr("ui.my.chores")}</h1>
      <p className={styles.intro}>
        {tr("ui.tap.a.chore.you.finished.a.grown.up.approves")}
      </p>

      {chores.length === 0 ? (
        <p className={styles.empty}>
          {tr("ui.no.chores.yet.ask.a.parent.to.add.some")}
        </p>
      ) : (
        <>
          {core.length > 0 ? (
            <section
              className={styles.section}
              aria-label={tr("ui.today.s.must.dos.379")}
            >
              <h2 className={styles.sectionTitle}>
                <Star size={18} aria-hidden="true" />
                {tr("ui.today.s.must.dos.380")}
              </h2>
              <ul className={styles.list}>
                {core.map((c) => (
                  <SubmitChoreCard key={c.id} chore={c} timezone={tz} />
                ))}
              </ul>
            </section>
          ) : null}

          {groupByCategory(others, categories).map(({ meta, items }) => (
            <section
              key={meta.id}
              className={styles.section}
              aria-label={meta.name}
            >
              <h2 className={styles.sectionTitle}>
                <IconByName name={meta.icon} size={18} />
                <bdi>{meta.name}</bdi>
              </h2>
              <ul className={styles.list}>
                {items
                  .slice()
                  .sort(lockedLast)
                  .map((c) => (
                    <SubmitChoreCard key={c.id} chore={c} timezone={tz} />
                  ))}
              </ul>
            </section>
          ))}
        </>
      )}
      <KidTabBar />
    </main>
  );
}
