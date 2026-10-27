import { getRequestLocale } from "@/lib/i18n/server";
import { translate, type Translator } from "@/lib/i18n";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { JoinForm } from "@/components/parents/JoinForm";
import styles from "../auth.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: translate(locale, "meta.app.auth.join.page.tsx.title"),
    description: translate(locale, "meta.app.auth.join.page.tsx.description"),
    alternates: { canonical: "/join" },
  };
}

export default async function JoinPage() {
  const locale = await getRequestLocale();
  const tr = translate.bind(null, locale) as Translator;

  // Already signed in? You're already in a family.
  const session = await getSession();
  if (session) redirect(session.role === "kid" ? "/me" : "/dashboard");

  return (
    <main id="main" className={styles.main}>
      <section className={styles.card} aria-labelledby="join-title">
        <div className={styles.intro}>
          <h1 id="join-title" className={styles.title}>
            {tr("ui.join.a.family")}
          </h1>
          <p className={styles.subtitle}>
            {tr("ui.enter.the.invite.code.another.parent.shared.with.you")}
          </p>
        </div>
        <JoinForm />
        <p className={styles.alt}>
          {tr("ui.already.have.an.account")}{" "}
          <Link href="/sign-in">{tr("ui.sign.in")}</Link>
        </p>
      </section>
    </main>
  );
}
