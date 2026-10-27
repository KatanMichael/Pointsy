"use client";

import { createContext, useContext, useCallback } from "react";
import { translate, type Locale, type Translator } from "@/lib/i18n";

const LocaleContext = createContext<Locale | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  const locale = useContext(LocaleContext);
  if (locale === null) throw new Error("useLocale requires LocaleProvider");
  return locale;
}

export function useTranslations(): Translator {
  const locale = useLocale();
  return useCallback<Translator>(
    (key, ...args) => translate(locale, key, ...args),
    [locale],
  );
}
