"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { systemCopy } from "@/lib/i18n/system";

import { useState } from "react";
import { useInstall } from "./useInstall";
import { InstallGuide } from "./InstallGuide";

/**
 * An "Install app" trigger for the footer. Renders nothing when the app is
 * already installed or installing isn't supported in this browser.
 */
export function InstallLink({ className }: { className?: string }) {
  const copy = systemCopy(useLocale());
  const { ready, isIOS, isStandalone, canPromptNative, promptNative } =
    useInstall();
  const [guide, setGuide] = useState(false);

  if (!ready || isStandalone) return null;
  if (!canPromptNative && !isIOS) return null;

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => (canPromptNative ? promptNative() : setGuide(true))}
      >
        {copy.installApp}
      </button>
      {guide ? <InstallGuide onClose={() => setGuide(false)} /> : null}
    </>
  );
}
