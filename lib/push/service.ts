import { and, eq } from "drizzle-orm";
import type { Database } from "@/lib/db/types";
import { pushSubscriptions, people } from "@/lib/db/schema";
import type { Locale } from "@/lib/i18n/locale";

export interface SendableSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
  locale: Locale;
}

/** Upsert a Web Push subscription for a person (keyed by endpoint). */
export async function saveSubscription(
  db: Database,
  familyId: string,
  personId: string,
  sub: Omit<SendableSubscription, "locale">,
  locale: Locale = "en",
): Promise<boolean> {
  const saved = await db
    .insert(pushSubscriptions)
    .values({
      familyId,
      personId,
      endpoint: sub.endpoint,
      p256dh: sub.p256dh,
      auth: sub.auth,
      locale,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { p256dh: sub.p256dh, auth: sub.auth, locale },
      setWhere: and(
        eq(pushSubscriptions.familyId, familyId),
        eq(pushSubscriptions.personId, personId),
      ),
    })
    .returning({ id: pushSubscriptions.id });
  return saved.length > 0;
}

/** Update only an existing endpoint belonging to this authenticated person. */
export async function updateSubscriptionLocale(
  db: Database,
  familyId: string,
  personId: string,
  endpoint: string,
  locale: Locale,
): Promise<boolean> {
  const changed = await db
    .update(pushSubscriptions)
    .set({ locale })
    .where(
      and(
        eq(pushSubscriptions.endpoint, endpoint),
        eq(pushSubscriptions.familyId, familyId),
        eq(pushSubscriptions.personId, personId),
      ),
    )
    .returning({ id: pushSubscriptions.id });
  return changed.length > 0;
}

export async function deleteOwnedSubscription(
  db: Database,
  familyId: string,
  personId: string,
  endpoint: string,
): Promise<void> {
  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.endpoint, endpoint),
        eq(pushSubscriptions.familyId, familyId),
        eq(pushSubscriptions.personId, personId),
      ),
    );
}

export async function deleteSubscriptionByEndpoint(
  db: Database,
  endpoint: string,
): Promise<void> {
  await db
    .delete(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, endpoint));
}

export async function listSubscriptionsForPerson(
  db: Database,
  familyId: string,
  personId: string,
): Promise<SendableSubscription[]> {
  return db
    .select({
      endpoint: pushSubscriptions.endpoint,
      p256dh: pushSubscriptions.p256dh,
      auth: pushSubscriptions.auth,
      locale: pushSubscriptions.locale,
    })
    .from(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.familyId, familyId),
        eq(pushSubscriptions.personId, personId),
      ),
    );
}

/** All parents' subscriptions in a family (for approval requests). */
export async function listSubscriptionsForParents(
  db: Database,
  familyId: string,
): Promise<SendableSubscription[]> {
  return db
    .select({
      endpoint: pushSubscriptions.endpoint,
      p256dh: pushSubscriptions.p256dh,
      auth: pushSubscriptions.auth,
      locale: pushSubscriptions.locale,
    })
    .from(pushSubscriptions)
    .innerJoin(people, eq(people.id, pushSubscriptions.personId))
    .where(
      and(eq(pushSubscriptions.familyId, familyId), eq(people.role, "parent")),
    );
}
