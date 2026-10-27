import { getRequestLocale } from "@/lib/i18n/server";
import { translate, type Translator } from "@/lib/i18n";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AddKidForm } from "@/components/manage/AddKidForm";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ManageNav } from "@/components/manage/ManageNav";
import styles from "@/components/manage/manage.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: translate(locale, "meta.app.manage.kids.new.page.tsx.title"),
  };
}

export default async function NewKidPage() {
  const locale = await getRequestLocale();
  const tr = translate.bind(null, locale) as Translator;

  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "parent") redirect("/me");

  return (
    <main id="main" className={styles.main}>
      <ScreenHeader
        title={tr("ui.add.a.kid")}
        intro={tr("ui.name.avatar.and.a.4.digit.pin.they.ll")}
      />
      <AddKidForm />
      <ManageNav section="kids" />
    </main>
  );
}
