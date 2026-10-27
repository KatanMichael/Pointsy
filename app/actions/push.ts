"use server";

import { getDb } from "@/lib/db/client";
import { getSession, requireSession } from "@/lib/auth/session";
import { getRequestLocale } from "@/lib/i18n/server";
import {
  pushEndpointSchema,
  pushSubscriptionSchema,
} from "@/lib/validation/push";
import {
  saveSubscription,
  deleteOwnedSubscription,
  updateSubscriptionLocale,
} from "@/lib/push/service";

export async function subscribePushAction(
  input: unknown,
): Promise<{ ok: boolean }> {
  const session = await requireSession();
  const parsed = pushSubscriptionSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  const ok = await saveSubscription(
    getDb(),
    session.familyId,
    session.personId,
    parsed.data,
    await getRequestLocale(),
  );
  return { ok };
}

export async function unsubscribePushAction(
  endpoint: unknown,
): Promise<{ ok: boolean }> {
  const session = await requireSession();
  const parsed = pushEndpointSchema.safeParse(endpoint);
  if (!parsed.success) return { ok: false };

  await deleteOwnedSubscription(
    getDb(),
    session.familyId,
    session.personId,
    parsed.data,
  );
  return { ok: true };
}

/** No permission prompt or new subscription: synchronize only this owned device. */
export async function syncPushLocaleAction(
  endpoint: unknown,
): Promise<{ ok: boolean }> {
  const parsed = pushEndpointSchema.safeParse(endpoint);
  if (!parsed.success) return { ok: false };
  const session = await getSession();
  if (!session) return { ok: false };
  const ok = await updateSubscriptionLocale(
    getDb(),
    session.familyId,
    session.personId,
    parsed.data,
    await getRequestLocale(),
  );
  return { ok };
}
