import { getRequestLocale } from "@/lib/i18n/server";
import { translate, type Translator } from "@/lib/i18n";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { getKidBalances } from "@/lib/points/service";
import { AddCatalogForm } from "@/components/catalog/AddCatalogForm";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ManageNav } from "@/components/manage/ManageNav";
import manage from "@/components/manage/manage.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: translate(locale, "meta.app.manage.rewards.new.page.tsx.title"),
  };
}

export default async function NewRewardPage() {
  const locale = await getRequestLocale();
  const tr = translate.bind(null, locale) as Translator;

  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "parent") redirect("/me");

  const kidBalances = await getKidBalances(getDb(), session.familyId);
  const kids = kidBalances.map((k) => ({ id: k.id, name: k.name }));

  return (
    <main id="main" className={manage.main}>
      <ScreenHeader
        title={tr("ui.add.a.reward")}
        intro={tr("ui.give.kids.something.worth.saving.up.for")}
      />
      <AddCatalogForm kind="reward" kids={kids} />
      <ManageNav section="rewards" />
    </main>
  );
}
