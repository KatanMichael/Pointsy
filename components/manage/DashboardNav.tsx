"use client";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { Users, ListChecks, Gift, Trophy, UserPlus } from "lucide-react";
import { BottomNav, type BottomNavItem } from "@/components/ui/BottomNav";

/** Fixed bottom navigation for the parent dashboard — quick access to each
 *  management section. */
export function DashboardNav() {
  const tr = useTranslations();
  const ITEMS: readonly BottomNavItem[] = [
    { href: "/manage/kids", label: tr("ui.kids"), Icon: Users },
    { href: "/manage/chores", label: tr("ui.chores"), Icon: ListChecks },
    { href: "/manage/rewards", label: tr("ui.rewards"), Icon: Gift },
    { href: "/manage/challenges", label: tr("ui.challenges"), Icon: Trophy },
    { href: "/manage/parents", label: tr("ui.parents"), Icon: UserPlus },
  ];

  return <BottomNav items={ITEMS} label={tr("ui.manage")} />;
}
