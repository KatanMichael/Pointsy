import { getRequestLocale } from "@/lib/i18n/server";
import { translate, type Translator } from "@/lib/i18n";
import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/SignInForm";
import styles from "../auth.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: translate(locale, "meta.app.auth.sign.in.page.tsx.title"),
    description: translate(
      locale,
      "meta.app.auth.sign.in.page.tsx.description",
    ),
    alternates: { canonical: "/sign-in" },
  };
}

export default async function SignInPage() {
  const locale = await getRequestLocale();
  const tr = translate.bind(null, locale) as Translator;

  return (
    <main id="main" className={styles.main}>
      <section className={styles.card} aria-labelledby="signin-title">
        <div className={styles.intro}>
          <h1 id="signin-title" className={styles.title}>
            {tr("ui.welcome.back")}
          </h1>
          <p className={styles.subtitle}>
            {tr("ui.sign.in.to.your.pointsy.parent.account")}
          </p>
        </div>
        <SignInForm />
        <p className={styles.alt}>
          {tr("ui.new.here")}{" "}
          <Link href="/sign-up">{tr("ui.create.your.family")}</Link>
        </p>
      </section>
    </main>
  );
}
