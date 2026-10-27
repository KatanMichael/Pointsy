import { describe, expect, it } from "vitest";
import { formatPushMessage, type PushMessage } from "@/lib/push/messages";

describe("recipient-localized push messages", () => {
  const messages: PushMessage[] = [
    { kind: "earned", amount: 5, reason: "נועה Alex" },
    { kind: "undone", amount: 5, reason: "User chore", chore: true },
    { kind: "choreLogged", name: null },
    { kind: "choreApproved", amount: 5, reason: "Wash car" },
    { kind: "choreDenied", reason: "Wash car" },
    { kind: "rewardRequested", name: "Ava", reward: "Ice cream" },
    { kind: "rewardApproved", reward: "Ice cream" },
    { kind: "teamInvite", name: "Noa" },
    { kind: "teamReady" },
  ];
  it.each(messages)("formats $kind for both recipient languages", (message) => {
    const en = formatPushMessage("en", message);
    const he = formatPushMessage("he", message);
    expect(en).toMatchObject({ lang: "en", dir: "ltr" });
    expect(he).toMatchObject({ lang: "he", dir: "rtl" });
    expect(he.title).toMatch(/[א-ת]/);
    expect(he.body).not.toBe(en.body);
    expect(he.url).toMatch(/^\/(me|dashboard|redeem)$/);
  });
  it("preserves dynamic family content and uses bidi isolation", () => {
    const text = "נועה Alex 12";
    const message = formatPushMessage("he", {
      kind: "earned",
      amount: 12,
      reason: text,
    });
    expect(message.body).toContain(`\u2068${text}\u2069`);
    expect(message.body).toContain("12");
  });
});
