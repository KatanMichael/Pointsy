"use client";
import { useTranslations } from "@/components/i18n/LocaleProvider";
import Link from "next/link";
import { Star } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { InstallLink } from "@/components/pwa/InstallLink";
import styles from "./site-footer.module.css";

const REPO = "https://github.com/Highfivery/Pointsy";

/**
 * Marketing / legal site footer — a modern multi-column layout. Rendered on the
 * public surfaces (homepage, legal, auth), not on the authenticated app screens
 * (those navigate via the bottom nav).
 */
export function SiteFooter() {
  const tr = useTranslations();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Link
              href="/"
              className={styles.brand}
              aria-label={tr("ui.pointsy.home")}
            >
              <Logo size={28} />
            </Link>
            <p className={styles.tagline}>
              {tr("ui.points.that.make.chores.fun.a.free.private.open")}
            </p>
            <ul className={styles.pills}>
              <li>{tr("ui.free.forever")}</li>
              <li>{tr("ui.no.ads")}</li>
              <li>{tr("ui.open.source.mit")}</li>
            </ul>
          </div>

          <nav className={styles.col} aria-label={tr("ui.product")}>
            <h2 className={styles.colHead}>{tr("ui.product")}</h2>
            <ul>
              <li>
                <Link href="/#how">{tr("ui.how.it.works")}</Link>
              </li>
              <li>
                <Link href="/#why">{tr("ui.why.pointsy")}</Link>
              </li>
              <li>
                <Link href="/#features">{tr("ui.features")}</Link>
              </li>
              <li>
                <Link href="/#faq">{tr("ui.faq")}</Link>
              </li>
            </ul>
          </nav>

          <nav className={styles.col} aria-label={tr("ui.resources")}>
            <h2 className={styles.colHead}>{tr("ui.resources")}</h2>
            <ul>
              <li>
                <Link href="/tools/reward-calculator">
                  {tr("ui.reward.calculator")}
                </Link>
              </li>
              <li>
                <Link href="/tools/allowance-calculator">
                  {tr("ui.allowance.calculator")}
                </Link>
              </li>
              <li>
                <Link href="/guides/age-appropriate-chores">
                  {tr("ui.chores.by.age")}
                </Link>
              </li>
              <li>
                <Link href="/guides/token-economy-for-kids">
                  {tr("ui.token.economy")}
                </Link>
              </li>
              <li>
                <Link href="/compare">{tr("ui.compare.apps")}</Link>
              </li>
              <li>
                <Link href="/compare/greenlight">{tr("ui.vs.greenlight")}</Link>
              </li>
              <li>
                <Link href="/compare/busykid">{tr("ui.vs.busykid")}</Link>
              </li>
              <li>
                <Link href="/compare/famzoo">{tr("ui.vs.famzoo")}</Link>
              </li>
            </ul>
          </nav>

          <nav className={styles.col} aria-label={tr("ui.get.started")}>
            <h2 className={styles.colHead}>{tr("ui.get.started")}</h2>
            <ul>
              <li>
                <Link href="/sign-up">{tr("ui.create.your.family")}</Link>
              </li>
              <li>
                <Link href="/sign-in">{tr("ui.parent.sign.in")}</Link>
              </li>
              <li>
                <Link href="/enter">{tr("ui.enter.family.code")}</Link>
              </li>
              <li>
                <Link href="/join">{tr("ui.join.as.a.co.parent")}</Link>
              </li>
              <li>
                <InstallLink className={styles.installLink} />
              </li>
            </ul>
          </nav>

          <nav className={styles.col} aria-label={tr("ui.company")}>
            <h2 className={styles.colHead}>{tr("ui.company")}</h2>
            <ul>
              <li>
                <Link href="/about">{tr("ui.about")}</Link>
              </li>
              <li>
                <Link href="/privacy">{tr("ui.privacy.policy")}</Link>
              </li>
              <li>
                <Link href="/terms">{tr("ui.terms")}</Link>
              </li>
              <li>
                <a href={REPO} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </li>
              <li>
                <a href="mailto:info@highfivery.com">{tr("ui.contact")}</a>
              </li>
            </ul>
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            {tr("ui.2026.highfivery.llc.pointsy.is.a.highfivery.app.made")}
          </p>
          <a
            className={styles.social}
            href={REPO}
            target="_blank"
            rel="noreferrer"
          >
            <Star size={15} aria-hidden="true" />
            {tr("ui.star.on.github")}
          </a>
        </div>
      </div>
    </footer>
  );
}
