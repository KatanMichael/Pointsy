import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { registerFamily } from "@/lib/auth/register";
import {
  saveSubscription,
  listSubscriptionsForPerson,
  updateSubscriptionLocale,
  deleteOwnedSubscription,
} from "@/lib/push/service";
import { createTestDb, type TestDb } from "../helpers/test-db";

describe("device push language and ownership", () => {
  let ctx: TestDb;
  beforeAll(async () => {
    ctx = await createTestDb();
  });
  afterAll(async () => {
    await ctx.close();
  });
  async function family() {
    return registerFamily(ctx.db, {
      familyName: "Push",
      parentName: "Parent",
      email: `push.${crypto.randomUUID()}@example.com`,
      password: "supersecret1",
    });
  }
  const sub = (endpoint: string) => ({ endpoint, p256dh: "key", auth: "auth" });

  it("defaults legacy subscriptions to English and keeps device languages separate", async () => {
    const f = await family();
    await saveSubscription(
      ctx.db,
      f.familyId,
      f.personId,
      sub("https://push.example/old"),
    );
    await saveSubscription(
      ctx.db,
      f.familyId,
      f.personId,
      sub("https://push.example/he"),
      "he",
    );
    const rows = await listSubscriptionsForPerson(
      ctx.db,
      f.familyId,
      f.personId,
    );
    expect(rows.map((s) => [s.endpoint, s.locale])).toEqual([
      ["https://push.example/old", "en"],
      ["https://push.example/he", "he"],
    ]);
    expect(
      await updateSubscriptionLocale(
        ctx.db,
        f.familyId,
        f.personId,
        "https://push.example/old",
        "he",
      ),
    ).toBe(true);
    expect(
      (await listSubscriptionsForPerson(ctx.db, f.familyId, f.personId)).every(
        (s) => s.locale === "he",
      ),
    ).toBe(true);
  });

  it("does not transfer an existing endpoint or update/delete another family's device", async () => {
    const a = await family();
    const b = await family();
    const endpoint = "https://push.example/owned";
    await saveSubscription(ctx.db, a.familyId, a.personId, sub(endpoint), "he");
    expect(
      await saveSubscription(
        ctx.db,
        b.familyId,
        b.personId,
        sub(endpoint),
        "en",
      ),
    ).toBe(false);
    expect(
      await updateSubscriptionLocale(
        ctx.db,
        b.familyId,
        b.personId,
        endpoint,
        "en",
      ),
    ).toBe(false);
    await deleteOwnedSubscription(ctx.db, b.familyId, b.personId, endpoint);
    expect(
      await listSubscriptionsForPerson(ctx.db, b.familyId, b.personId),
    ).toEqual([]);
    expect(
      (await listSubscriptionsForPerson(ctx.db, a.familyId, a.personId))[0]
        .locale,
    ).toBe("he");
    await deleteOwnedSubscription(ctx.db, a.familyId, a.personId, endpoint);
    expect(
      await listSubscriptionsForPerson(ctx.db, a.familyId, a.personId),
    ).toEqual([]);
  });

  it("cannot update another person in the same family", async () => {
    const a = await family();
    const endpoint = "https://push.example/same-family";
    await saveSubscription(ctx.db, a.familyId, a.personId, sub(endpoint), "en");
    expect(
      await updateSubscriptionLocale(
        ctx.db,
        a.familyId,
        crypto.randomUUID(),
        endpoint,
        "he",
      ),
    ).toBe(false);
    expect(
      (await listSubscriptionsForPerson(ctx.db, a.familyId, a.personId))[0]
        .locale,
    ).toBe("en");
  });
});
