"use client";

import { useEffect, useRef, useState } from "react";
import { Languages } from "lucide-react";
import { setLocaleAction } from "@/app/actions/locale";
import { syncPushLocaleAction } from "@/app/actions/push";
import { isLocale } from "@/lib/i18n";
import { useLocale, useTranslations } from "./LocaleProvider";
import styles from "./language-switcher.module.css";

function formValues(form: HTMLFormElement, originals = false): string {
  // Include unnamed controls too: not every local draft is serialized by FormData.
  return JSON.stringify(
    Array.from(form.elements).flatMap<unknown[]>((element) => {
      if (element instanceof HTMLInputElement) {
        if (["submit", "button", "reset"].includes(element.type)) return [];
        if (element.type === "hidden") {
          const initial = element.getAttribute("data-draft-initial-value");
          return initial === null
            ? []
            : [[element.name, originals ? initial : element.value]];
        }
        if (["checkbox", "radio"].includes(element.type))
          return [
            [
              element.name,
              originals ? element.defaultChecked : element.checked,
            ],
          ];
        return [
          [element.name, originals ? element.defaultValue : element.value],
        ];
      }
      if (element instanceof HTMLTextAreaElement)
        return [
          [element.name, originals ? element.defaultValue : element.value],
        ];
      if (element instanceof HTMLSelectElement)
        return [
          [
            element.name,
            // SSR selected attributes retain the pre-hydration value. Client-mounted
            // controlled selects have no defaultSelected, so snapshot their actual value.
            Array.from(element.options)
              .filter((option) =>
                originals &&
                Array.from(element.options).some((item) => item.defaultSelected)
                  ? option.defaultSelected
                  : option.selected,
              )
              .map((option) => option.value),
          ],
        ];
      return [];
    }),
  );
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const baselines = useRef(new Map<HTMLFormElement, string>());

  useEffect(() => {
    // Snapshot actual selections at mount, including forms added by client navigation.
    // Text/check defaults still protect edits made before hydration/listener setup.
    const captureForms = () => {
      for (const form of baselines.current.keys()) {
        if (!form.isConnected) baselines.current.delete(form);
      }
      for (const form of document.forms) {
        if (!baselines.current.has(form))
          baselines.current.set(form, formValues(form, true));
      }
    };
    captureForms();
    const observer = new MutationObserver(captureForms);
    observer.observe(document.body, { childList: true, subtree: true });
    const remember = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const form = target.closest("form");
      if (form && !baselines.current.has(form))
        baselines.current.set(form, formValues(form, true));
    };
    document.addEventListener("focusin", remember, true);
    document.addEventListener("pointerdown", remember, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", remember, true);
      document.removeEventListener("pointerdown", remember, true);
    };
  }, []);

  async function changeLocale(next: string) {
    if (!isLocale(next) || next === locale) return;
    const dirty = Array.from(document.forms).some(
      (form) =>
        formValues(form) !==
        (baselines.current.get(form) ?? formValues(form, true)),
    );
    if (dirty && !window.confirm(t("common.discardDraft"))) return;
    setPending(true);
    setError(false);
    try {
      const result = await setLocaleAction(next);
      if (!result.ok) throw new Error("Locale update failed");
      // The saved cookie is sent on this second request. Do not request permission
      // or create a subscription merely because someone changed the language.
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          const subscription =
            await registration?.pushManager.getSubscription();
          if (subscription) await syncPushLocaleAction(subscription.endpoint);
        } catch {
          // Language switching remains usable when push is unavailable/offline.
        }
      }
      // A full request changes server text, html direction and client context together,
      // and deliberately discards the draft only after the visitor has confirmed.
      window.location.reload();
    } catch {
      setError(true);
      setPending(false);
    }
  }

  return (
    <div className={styles.bar}>
      <label className={styles.control}>
        <Languages size={18} aria-hidden="true" />
        <span>{t("common.language")}</span>
        <select
          aria-label={t("common.language")}
          value={locale}
          disabled={pending}
          onChange={(event) => {
            void changeLocale(event.target.value);
          }}
        >
          <option value="en" lang="en">
            English
          </option>
          <option value="he" lang="he">
            עברית
          </option>
        </select>
      </label>
      {error && <p role="alert">{t("errors.generic")}</p>}
    </div>
  );
}
