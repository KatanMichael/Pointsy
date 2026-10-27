import { getRequestLocale } from "@/lib/i18n/server";
import { translate, type Translator } from "@/lib/i18n";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { listCategoriesWithCounts } from "@/lib/categories/service";
import { CategoryManager } from "@/components/manage/CategoryManager";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ManageNav } from "@/components/manage/ManageNav";
import styles from "@/components/manage/manage.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: translate(locale, "meta.app.manage.categories.page.tsx.title"),
  };
}

export default async function ManageCategoriesPage() {
  const locale = await getRequestLocale();
  const tr = translate.bind(null, locale) as Translator;

  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "parent") redirect("/me");

  const categories = await listCategoriesWithCounts(getDb(), session.familyId);

  return (
    <main id="main" className={styles.main}>
      <ScreenHeader
        title={tr("ui.categories")}
        intro={tr("ui.the.groups.your.chores.are.organised.into.add.rename")}
      />

      <CategoryManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          choreCount: c.choreCount,
        }))}
      />

      <ManageNav section="categories" />
    </main>
  );
}
