"use client";

import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import {
  subscribePushAction,
  unsubscribePushAction,
  syncPushLocaleAction,
} from "@/app/actions/push";
import styles from "./push.module.css";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { systemCopy } from "@/lib/i18n/system";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

type Status = { supported: boolean; subscribed: boolean } | null;

export function EnableNotifications({
  audience = "parent",
}: {
  audience?: "parent" | "kid";
}) {
  const locale = useLocale();
  const copy = systemCopy(locale);
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;
      if (!supported) {
        if (active) setStatus({ supported: false, subscribed: false });
        return;
      }
      const reg = await navigator.serviceWorker.getRegistration();
      const existing = reg ? await reg.pushManager.getSubscription() : null;
      if (existing)
        await syncPushLocaleAction(existing.endpoint).catch(() => undefined);
      if (active) setStatus({ supported: true, subscribed: Boolean(existing) });
    })();
    return () => {
      active = false;
    };
  }, [locale]);

  // Render only once we know the state, push is configured, and it's supported.
  if (!VAPID_PUBLIC_KEY || !status || !status.supported) return null;

  async function enable() {
    const key = VAPID_PUBLIC_KEY;
    if (!key) return;
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError(copy.blocked);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
      });
      const json = sub.toJSON();
      const res = await subscribePushAction({
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
      });
      if (res.ok) setStatus({ supported: true, subscribed: true });
      else setError(copy.saveFailed);
    } catch {
      setError(copy.enableFailed);
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribePushAction(sub.endpoint);
        await sub.unsubscribe();
      }
      setStatus({ supported: true, subscribed: false });
    } catch {
      setError(copy.disableFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.card} aria-labelledby="notif-heading">
      <span className={styles.icon} aria-hidden="true">
        <Bell size={20} />
      </span>
      <div className={styles.body}>
        <h2 id="notif-heading" className={styles.title}>
          {copy.notifications}
        </h2>
        <p className={styles.desc}>
          {copy[audience === "parent" ? "parentHint" : "kidHint"]}
        </p>
        {error ? (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        ) : null}
      </div>
      <div className={styles.action}>
        {status.subscribed ? (
          <>
            <span className={styles.statusOn}>
              <Check size={16} aria-hidden="true" />
              {copy.on}
            </span>
            <button
              type="button"
              onClick={disable}
              disabled={busy}
              className={styles.linkBtn}
            >
              {busy ? copy.working : copy.turnOff}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={enable}
            disabled={busy}
            className={styles.enableBtn}
            aria-label={copy.enableLabel}
          >
            {busy ? copy.working : copy.enable}
          </button>
        )}
      </div>
    </section>
  );
}
