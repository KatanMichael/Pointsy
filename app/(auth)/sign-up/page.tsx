import { getRequestLocale } from "@/lib/i18n/server";
import { translate, type Translator } from "@/lib/i18n";
import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/SignUpForm";
import styles from "../auth.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: translate(locale, "meta.app.auth.sign.up.page.tsx.title"),
    description: translate(
      locale,
      "meta.app.auth.sign.up.page.tsx.description",
    ),
    alternates: { canonical: "/sign-up" },
  };
}

export default async function SignUpPage() {
  const locale = await getRequestLocale();
  const tr = translate.bind(null, locale) as Translator;

  return (
    <main id="main" className={styles.main}>
      <section className={styles.card} aria-labelledby="signup-title">
        <div className={styles.intro}>
          <h1 id="signup-title" className={styles.title}>
            {tr("ui.create.your.family")}
          </h1>
          <p className={styles.subtitle}>
            {tr("ui.set.up.pointsy.in.under.a.minute.it.s")}
          </p>
        </div>
        <SignUpForm />
        <p className={styles.alt}>
          {tr("ui.already.have.an.account")}{" "}
          <Link href="/sign-in">{tr("ui.sign.in")}</Link>
        </p>
      </section>
    </main>
  );
}
