import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/db/types";

const { sendNotification, listSubscriptionsForPerson } = vi.hoisted(() => ({
  sendNotification: vi
    .fn<(subscription: unknown, payload: string) => Promise<void>>()
    .mockResolvedValue(undefined),
  listSubscriptionsForPerson: vi.fn(async () => [
    {
      endpoint: "https://push.example/en",
      p256dh: "k",
      auth: "a",
      locale: "en",
    },
    {
      endpoint: "https://push.example/he",
      p256dh: "k",
      auth: "a",
      locale: "he",
    },
  ]),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_VAPID_PUBLIC_KEY: "public", VAPID_PRIVATE_KEY: "private" },
}));
vi.mock("web-push", () => ({
  default: { sendNotification, setVapidDetails: vi.fn() },
}));
vi.mock("@/lib/push/service", () => ({
  listSubscriptionsForPerson,
  listSubscriptionsForParents: vi.fn(),
  deleteSubscriptionByEndpoint: vi.fn(),
}));
import { notifyPerson } from "@/lib/push/send";

describe("push delivery", () => {
  it("sends the same event in each receiving device's language", async () => {
    await notifyPerson({} as Database, "family-a", "kid-a", {
      kind: "earned",
      amount: 12,
      reason: "Wash car",
    });
    expect(listSubscriptionsForPerson).toHaveBeenCalledWith(
      {},
      "family-a",
      "kid-a",
    );
    expect(sendNotification).toHaveBeenCalledTimes(2);
    const bodies = sendNotification.mock.calls.map(([, body]) =>
      JSON.parse(body),
    );
    expect(bodies[0]).toMatchObject({
      lang: "en",
      dir: "ltr",
      title: "You earned points! 🎉",
    });
    expect(bodies[1]).toMatchObject({
      lang: "he",
      dir: "rtl",
      title: "צברת נקודות! 🎉",
    });
    expect(bodies.every((body) => body.body.includes("Wash car"))).toBe(true);
  });
});
