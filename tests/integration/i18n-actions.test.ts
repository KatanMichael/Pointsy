import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createTestDb, type TestDb } from "../helpers/test-db";
const runtime = vi.hoisted(() => ({
  db: null as unknown,
  session: { familyId: "", personId: "", role: "parent" as "parent" | "kid" },
}));
vi.mock("@/lib/db/client", () => ({ getDb: () => runtime.db }));
vi.mock("@/lib/auth/session", () => ({
  requireParent: async () => runtime.session,
  requireKid: async () => runtime.session,
  createSession: async () => {},
  destroySession: async () => {},
}));
vi.mock("@/lib/auth/device", () => ({
  rememberFamily: async () => {},
  forgetFamily: async () => {},
}));
vi.mock("@/lib/i18n/server", () => ({ getRequestLocale: async () => "he" }));
vi.mock("@/lib/push/send", () => ({
  notifyPerson: async () => {},
  notifyParents: async () => {},
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({
  redirect: () => {
    throw new Error("REDIRECT");
  },
}));
import { signInAction } from "@/app/actions/auth";
import { kidSignInAction } from "@/app/actions/kid-login";
import {
  requestRedemptionAction,
  setGoalAction,
} from "@/app/actions/redemptions";
import { registerFamily } from "@/lib/auth/register";
import { addKid } from "@/lib/people/service";
import { createReward } from "@/lib/catalog/service";
import { getKidGoal } from "@/lib/redemptions/service";
import { presentError } from "@/lib/i18n/errors";
const form = (values: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(values)) f.set(k, v);
  return f;
};
describe("localized action failures and reward goals", () => {
  let ctx: TestDb;
  beforeAll(async () => {
    ctx = await createTestDb();
    runtime.db = ctx.db;
  });
  afterAll(async () => {
    await ctx.close();
  });
  it("returns render-time Hebrew codes for incorrect passwords and invalid fields", async () => {
    const state = await signInAction(
      {},
      form({ email: "missing@example.com", password: "wrong" }),
    );
    expect(state.errorCode?.key).toBe("errors.invalidCredentials");
    expect(presentError("he", state.errorCode)).toBe("הפרטים שהוזנו שגויים.");
    const fields = await signInAction({}, form({ email: "bad", password: "" }));
    expect(presentError("he", fields.fieldErrorCodes?.email)).toBe(
      "יש להזין כתובת דוא״ל תקינה.",
    );
  });
  it("returns distinct wrong-PIN and lock codes while preserving repeated attempt counters", async () => {
    const family = await registerFamily(ctx.db, {
      familyName: "PIN",
      parentName: "Parent",
      email: "i18n-pin@example.com",
      password: "password123",
    });
    const kid = await addKid(ctx.db, family.familyId, {
      name: "Kid",
      avatar: "cat",
      color: "#4338ca",
      pin: "1234",
    });
    const data = form({
      familyId: family.familyId,
      personId: kid.id,
      pin: "0000",
    });
    let state = await kidSignInAction({}, data);
    expect(state.errorCode?.key).toBe("errors.pinTries");
    expect(presentError("he", state.errorCode)).toContain("הקוד האישי שגוי");
    const firstAttempt = state.attempt!;
    for (let i = 0; i < 8; i++) state = await kidSignInAction(state, data);
    expect(state.errorCode?.key).toBe("errors.pinLocked");
    expect(state.attempt).toBeGreaterThan(firstAttempt);
  });
  it("surfaces insufficient points safely and supports setting and clearing a goal without mutating reward snapshots", async () => {
    const family = await registerFamily(ctx.db, {
      familyName: "Rewards",
      parentName: "Parent",
      email: "i18n-reward@example.com",
      password: "password123",
    });
    const kid = await addKid(ctx.db, family.familyId, {
      name: "Kid",
      avatar: "cat",
      color: "#4338ca",
      pin: "1234",
    });
    runtime.session = {
      familyId: family.familyId,
      personId: kid.id,
      role: "kid",
    };
    const reward = await createReward(ctx.db, family.familyId, {
      name: "Bedroom",
      emoji: "gift",
      cost: 100,
    });
    const state = await requestRedemptionAction(
      {},
      form({ rewardId: reward.id }),
    );
    expect(presentError("he", state.errorCode)).toBe(
      "אין מספיק נקודות למימוש הפרס.",
    );
    await setGoalAction(form({ rewardId: reward.id }));
    expect(
      (await getKidGoal(ctx.db, family.familyId, kid.id))?.reward.name,
    ).toBe("Bedroom");
    await setGoalAction(form({ rewardId: "" }));
    expect(await getKidGoal(ctx.db, family.familyId, kid.id)).toBeNull();
  });
});
