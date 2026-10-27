"use client";
import { translateFormState } from "@/lib/i18n/errors";
import { useTranslations } from "@/components/i18n/LocaleProvider";

import { useActionState, useState } from "react";
import {
  lookupFamilyAction,
  forgetFamilyAction,
  kidSignInAction,
  type KidSignInState,
} from "@/app/actions/kid-login";
import type { FamilyLookup, PickerMember } from "@/lib/people/service";
import { PinPad } from "@/components/auth/PinPad";
import { IconByName } from "@/components/icons/registry";
import form from "@/components/auth/auth-form.module.css";
import styles from "./enter.module.css";

const pinInitial: KidSignInState = {};

/**
 * The family profile picker. Three steps, each with its own heading so the copy
 * always matches what's on screen: (1) enter a family code, (2) tap a profile,
 * (3) enter that profile's PIN. The known family is provided by the server from
 * the device cookie, so step 1 is skipped on a recognised device.
 */
export function KidLogin({
  initialFamily = null,
}: {
  initialFamily?: FamilyLookup | null;
}) {
  const tr = useTranslations();

  const [family, setFamily] = useState<FamilyLookup | null>(initialFamily);
  const [selected, setSelected] = useState<PickerMember | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pinStateCodes, pinAction, pinPending] = useActionState(
    kidSignInAction,
    pinInitial,
  );
  const pinState = translateFormState(pinStateCodes, tr);

  async function resolveCode(raw: string) {
    setLoading(true);
    setCodeError(false);
    const result = await lookupFamilyAction(raw);
    setLoading(false);
    if (!result) {
      setCodeError(true);
      return;
    }
    setFamily(result);
  }

  async function forget() {
    await forgetFamilyAction();
    setFamily(null);
    setSelected(null);
    setCode("");
  }

  // Step 1 — family code entry (only when this device doesn't know a family).
  if (!family) {
    return (
      <>
        <h1 id="enter-title" className={styles.title}>
          {tr("ui.find.your.family")}
        </h1>
        <p className={styles.subtitle}>
          {tr("ui.enter.your.family.code.to.see.who.s.in")}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void resolveCode(code);
          }}
          className={form.form}
          noValidate
        >
          <div className={form.field}>
            <label
              id="family-code-label"
              htmlFor="family-code"
              className={form.label}
            >
              {tr("ui.family.code")}
            </label>
            <input
              id="family-code"
              aria-labelledby="family-code-label"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoCapitalize="characters"
              autoComplete="off"
              className={form.input}
              aria-invalid={codeError ? true : undefined}
              aria-describedby={codeError ? "code-err" : undefined}
              required
            />
            {codeError ? (
              <p id="code-err" role="alert" className={form.error}>
                {tr("ui.we.couldn.t.find.a.family.with.that.code")}
              </p>
            ) : null}
          </div>
          <button type="submit" className={form.submit} disabled={loading}>
            {loading ? tr("ui.looking") : tr("ui.continue")}
          </button>
        </form>
        <div className={styles.altLinks}>
          <a href="/join" className={styles.textBtn}>
            {tr("ui.invited.as.a.co.parent.enter.your.invite.code")}
          </a>
          <a href="/sign-in" className={styles.textBtn}>
            {tr("ui.parent.sign.in.with.email.password")}
          </a>
        </div>
      </>
    );
  }

  // Step 3 — PIN entry for the chosen profile.
  if (selected) {
    return (
      <>
        <button
          type="button"
          onClick={() => setSelected(null)}
          className={styles.textBtn}
        >
          {tr("ui.choose.someone.else")}
        </button>
        <h1 id="enter-title" className={styles.title}>
          {tr("auth.welcome", { name: selected.name })}!
        </h1>
        <div className={styles.pinStep}>
          <div className={styles.who}>
            <span
              className={styles.bigAvatar}
              style={{ background: selected.color }}
            >
              <IconByName name={selected.avatar} size={40} />
            </span>
          </div>
          <form action={pinAction} className={form.form} noValidate>
            <input type="hidden" name="familyId" value={family.familyId} />
            <input type="hidden" name="personId" value={selected.id} />
            <PinPad
              name="pin"
              label={tr("ui.enter.your.pin")}
              autoSubmit
              disabled={pinPending}
              errorNonce={pinState.attempt ?? 0}
            />
            {pinState.error ? (
              <p role="alert" className={form.formError}>
                {pinState.error}
              </p>
            ) : null}
            <button type="submit" className={form.submit} disabled={pinPending}>
              {pinPending ? tr("ui.checking") : tr("ui.let.s.go")}
            </button>
          </form>
        </div>
      </>
    );
  }

  // Step 2 — profile picker.
  return (
    <>
      <h1 id="enter-title" className={styles.title}>
        {tr("ui.who.s.signing.in")}
      </h1>
      <p className={styles.subtitle}>
        {tr("ui.tap.your.name.and.enter.your.pin")}
      </p>
      <div className={styles.picker}>
        <p className={styles.familyName}>
          <bdi>{family.familyName}</bdi>
        </p>
        {family.members.length === 0 ? (
          <p className={styles.empty}>
            {tr("ui.no.profiles.yet.a.parent.can")}{" "}
            <a href="/sign-in">{tr("ui.sign.in.with.email.password")}</a>{" "}
            {tr("ui.to.set.up.pins")}
          </p>
        ) : (
          <ul className={styles.grid}>
            {family.members.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className={styles.profileBtn}
                  onClick={() => setSelected(m)}
                >
                  <span
                    className={styles.bigAvatar}
                    style={{ background: m.color }}
                  >
                    <IconByName name={m.avatar} size={40} />
                  </span>
                  <span className={styles.profileName}>
                    <bdi>{m.name}</bdi>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.pickerFooter}>
          <a href="/sign-in" className={styles.textBtn}>
            {tr("ui.parent.sign.in.with.email.password")}
          </a>
          <button
            type="button"
            onClick={() => void forget()}
            className={styles.textBtn}
          >
            {tr("ui.use.a.different.family")}
          </button>
        </div>
      </div>
    </>
  );
}
