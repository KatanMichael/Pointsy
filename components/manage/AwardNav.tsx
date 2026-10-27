"use client";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { House, ListChecks, Gift } from "lucide-react";
import { BottomNav, type BottomNavItem } from "@/components/ui/BottomNav";

/** Bottom nav for the award screen — back to the hub plus the catalogs. */
export function AwardNav() {
  const tr = useTranslations();
  const ITEMS: readonly BottomNavItem[] = [
    { href: "/dashboard", label: tr("nav.dashboard"), Icon: House },
    { href: "/manage/chores", label: tr("ui.chores"), Icon: ListChecks },
    { href: "/manage/rewards", label: tr("ui.rewards"), Icon: Gift },
  ];

  return <BottomNav items={ITEMS} label={tr("ui.award")} />;
}
