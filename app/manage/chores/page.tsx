import { getRequestLocale } from "@/lib/i18n/server";
import { translate, type Translator } from "@/lib/i18n";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Tags } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { listChores } from "@/lib/catalog/service";
import { listCategories } from "@/lib/categories/service";
import { getAssigneesByChore } from "@/lib/chores/assignment";
import { getKidBalances } from "@/lib/points/service";
import { groupByCategory } from "@/lib/catalog/category";
import {
  ChoreCatalog,
  type ChoreGroup,
} from "@/components/catalog/ChoreCatalog";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ManageNav } from "@/components/manage/ManageNav";
import type { Chore } from "@/lib/db/schema";
import manage from "@/components/manage/manage.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: translate(locale, "meta.app.manage.chores.page.tsx.title") };
}

export default async function ChoresPage() {
  const locale = await getRequestLocale();
  const tr = translate.bind(null, locale) as Translator;

  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "parent") redirect("/me");

  const db = getDb();
  const chores = await listChores(db, session.familyId);
  const [assignees, kids, categories] = await Promise.all([
    getAssigneesByChore(
      db,
      chores.map((c) => c.id),
    ),
    getKidBalances(db, session.familyId),
    listCategories(db, session.familyId),
  ]);
  const nameById = new Map(kids.map((k) => [k.id, k.name]));
  const nameOf = (id: string) => nameById.get(id) ?? tr("ui.kids");

  function whoLabel(c: Chore): string | null {
    if (c.assignment === "everyone") return null;
    if (c.assignment === "rotating") {
      return c.currentTurnPersonId
        ? tr("domain.turn", { name: nameOf(c.currentTurnPersonId) })
        : tr("ui.takes.turns");
    }
    const names = (assignees.get(c.id) ?? []).map(nameOf);
    return names.length > 0 ? names.join(", ") : tr("ui.no.one.yet");
  }

  const groups: ChoreGroup[] = groupByCategory(chores, categories).map(
    ({ meta, items }) => ({
      meta,
      items: items.map((c) => ({
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        points: c.points,
        isActive: c.isActive,
        pinned: c.pinned,
        isCore: c.isCore,
        limitPeriod: c.limitPeriod,
        limitCount: c.limitCount,
        limitScope: c.limitScope,
        whoLabel: whoLabel(c),
        logWindowDays: c.logWindowDays,
        logWindowStart: c.logWindowStart,
        logWindowEnd: c.logWindowEnd,
      })),
    }),
  );

  return (
    <main id="main" className={manage.main}>
      <ScreenHeader
        title={tr("ui.chores")}
        intro={tr("ui.ways.for.kids.to.earn.points")}
      >
        <Link href="/manage/categories" className={manage.headerLink}>
          <Tags size={16} aria-hidden="true" />
          {tr("ui.categories")}
        </Link>
      </ScreenHeader>

      {groups.length > 0 ? (
        <ChoreCatalog groups={groups} />
      ) : (
        <p className={manage.empty}>
          {tr("ui.no.chores.yet.tap.add.a.chore.to.add")}
        </p>
      )}

      <ManageNav section="chores" />
    </main>
  );
}
