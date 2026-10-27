"use client";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { House, ListTodo, Gift } from "lucide-react";
import { BottomNav, type BottomNavItem } from "@/components/ui/BottomNav";

/** Fixed bottom navigation for the kid's three screens. */
export function KidTabBar() {
  const tr = useTranslations();

  const TABS: readonly BottomNavItem[] = [
    { href: "/me", label: tr("ui.home"), Icon: House },
    { href: "/submit", label: tr("ui.chores"), Icon: ListTodo },
    { href: "/redeem", label: tr("ui.rewards"), Icon: Gift },
  ];
  return <BottomNav items={TABS} />;
}
