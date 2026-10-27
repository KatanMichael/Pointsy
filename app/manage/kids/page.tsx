import { getRequestLocale } from "@/lib/i18n/server";
import { translate, type Translator } from "@/lib/i18n";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { listKids } from "@/lib/people/service";
import { KidCard } from "@/components/manage/KidCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ManageNav } from "@/components/manage/ManageNav";
import styles from "@/components/manage/manage.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: translate(locale, "meta.app.manage.kids.page.tsx.title") };
}

export default async function ManageKidsPage() {
  const locale = await getRequestLocale();
  const tr = translate.bind(null, locale) as Translator;

  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "parent") redirect("/me");

  const kids = await listKids(getDb(), session.familyId);

  return (
    <main id="main" className={styles.main}>
      <ScreenHeader
        title={tr("ui.kids")}
        intro={tr("ui.profiles.avatars.and.sign.in.pins")}
      />

      {kids.length > 0 ? (
        <ul className={styles.list}>
          {kids.map((kid) => (
            <li key={kid.id}>
              <KidCard
                kid={{
                  id: kid.id,
                  name: kid.name,
                  avatar: kid.avatar,
                  color: kid.color,
                  isActive: kid.isActive,
                }}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          {tr("ui.no.children.yet.tap.add.a.kid.to.add")}
        </p>
      )}

      <ManageNav section="kids" />
    </main>
  );
}
