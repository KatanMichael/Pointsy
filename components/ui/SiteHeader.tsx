"use client";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import styles from "./site-header.module.css";

/** Primary marketing nav — section anchors resolve to the homepage from any
 * page (e.g. `/#how`), so the header works on `/privacy` and `/terms` too. */

/**
 * Sticky, glassy site header for the marketing and legal surfaces. Gives every
 * public page a way home (the logo) and a path to sign in / sign up. The app's
 * authenticated screens use their own `ScreenHeader` instead.
 */
export function SiteHeader() {
  const tr = useTranslations();
  const NAV = [
    { href: "/#how", label: tr("ui.how.it.works") },
    { href: "/#why", label: tr("ui.why.pointsy") },
    { href: "/#features", label: tr("ui.features") },
    { href: "/compare", label: tr("ui.compare") },
    { href: "/#faq", label: tr("ui.faq") },
  ];

  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link
          href="/"
          className={styles.brand}
          aria-label={tr("ui.pointsy.home")}
        >
          <Logo size={28} />
        </Link>

        <nav className={styles.nav} aria-label={tr("ui.primary")}>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href="/sign-in" className={styles.signIn}>
            {tr("ui.parent.sign.in")}
          </Link>
          <Link href="/sign-up" className={styles.cta}>
            {tr("ui.create.your.family")}
          </Link>
        </div>

        <button
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? tr("ui.close.menu") : tr("ui.open.menu")}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X size={22} aria-hidden="true" />
          ) : (
            <Menu size={22} aria-hidden="true" />
          )}
        </button>
      </div>

      {open ? (
        <div className={styles.menu} id="site-menu">
          <nav className={styles.menuNav} aria-label={tr("ui.primary")}>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.menuLink}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className={styles.menuActions}>
            <Link
              href="/sign-in"
              className={styles.menuSignIn}
              onClick={() => setOpen(false)}
            >
              {tr("ui.parent.sign.in")}
            </Link>
            <Link
              href="/sign-up"
              className={styles.cta}
              onClick={() => setOpen(false)}
            >
              {tr("ui.create.your.family")}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
