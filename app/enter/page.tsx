import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n";
import type { Metadata } from "next";
import { getKnownFamily } from "@/lib/auth/device";
import { PickerScreen } from "@/components/enter/PickerScreen";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: translate(locale, "meta.app.enter.page.tsx.title") };
}

export default async function EnterPage() {
  const family = await getKnownFamily();
  return <PickerScreen initialFamily={family} />;
}
