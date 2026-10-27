"use client";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import {
  House,
  Gift,
  ListChecks,
  Tags,
  Trophy,
  Users,
  UserPlus,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BottomNav, type BottomNavItem } from "@/components/ui/BottomNav";

type Section =
  "rewards" | "chores" | "categories" | "challenges" | "kids" | "parents";

/** Contextual [Dashboard · Section · Add?] bottom nav for the manage screens. */
export function ManageNav({ section }: { section: Section }) {
  const tr = useTranslations();
  const SECTIONS: Record<
    Section,
    {
      href: string;
      label: string;
      Icon: LucideIcon;
      /** Omitted for sections without a dedicated "add" page (e.g. parents). */
      addHref?: string;
      addLabel?: string;
    }
  > = {
    rewards: {
      href: "/manage/rewards",
      label: tr("ui.rewards"),
      Icon: Gift,
      addHref: "/manage/rewards/new",
      addLabel: tr("ui.add.a.reward"),
    },
    chores: {
      href: "/manage/chores",
      label: tr("ui.chores"),
      Icon: ListChecks,
      addHref: "/manage/chores/new",
      addLabel: tr("ui.add.a.chore"),
    },
    categories: {
      href: "/manage/categories",
      label: tr("ui.categories"),
      Icon: Tags,
    },
    challenges: {
      href: "/manage/challenges",
      label: tr("ui.challenges"),
      Icon: Trophy,
      addHref: "/manage/challenges/new",
      addLabel: tr("ui.add.a.challenge"),
    },
    kids: {
      href: "/manage/kids",
      label: tr("ui.kids"),
      Icon: Users,
      addHref: "/manage/kids/new",
      addLabel: tr("ui.add.a.kid"),
    },
    parents: {
      href: "/manage/parents",
      label: tr("ui.parents"),
      Icon: UserPlus,
    },
  };

  const s = SECTIONS[section];
  const items: BottomNavItem[] = [
    { href: "/dashboard", label: tr("nav.dashboard"), Icon: House },
    { href: s.href, label: s.label, Icon: s.Icon },
  ];
  if (s.addHref && s.addLabel) {
    items.push({
      href: s.addHref,
      label: s.addLabel,
      Icon: Plus,
      accent: true,
    });
  }
  return <BottomNav items={items} label={tr("ui.manage")} />;
}
