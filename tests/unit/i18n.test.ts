import { describe, expect, it } from "vitest";
import {
  direction,
  resolveLocale,
  formatNumber,
  formatDateTime,
  formatRelativeTime,
} from "@/lib/i18n";
import { localDate, localParts, weekStart } from "@/lib/timezone";
import { eligibleFor } from "@/lib/chores/eligibility";

describe("locale negotiation", () => {
  it.each([
    ["he", "en", "he"],
    ["en", "he", "en"],
    ["invalid", "he-IL", "he"],
    [undefined, "iw", "he"],
    [undefined, "iw-IL", "he"],
    [undefined, "en;q=0.3,he;q=0.9", "he"],
    [undefined, "he;q=0,en;q=0.4", "en"],
    [undefined, "he;q=0", "en"],
    [undefined, null, "en"],
    [undefined, "he;q=oops", "en"],
    [undefined, "@@@", "en"],
    [undefined, "fr,he;q=0.5", "he"],
    [undefined, "HE-il;q=0.8,en;q=0.8", "he"],
  ] as const)("resolves %s / %s to %s", (cookie, header, expected) => {
    expect(resolveLocale(cookie, header)).toBe(expected);
  });
  it("uses direction for the resolved language", () => {
    expect(direction("he")).toBe("rtl");
    expect(direction("en")).toBe("ltr");
  });
});

describe("display formatting", () => {
  it("preserves negative balances in both languages", () => {
    expect(formatNumber("en", -12)).toBe("-12");
    expect(formatNumber("he", -12).replace(/[\u200e\u200f]/g, "")).toBe("-12");
  });
  it("formats the family date across midnight", () => {
    const at = new Date("2026-06-29T21:30:00Z");
    expect(formatDateTime("en", at, "Asia/Jerusalem")).toContain(
      "Jun 30, 2026",
    );
    expect(formatDateTime("he", at, "Asia/Jerusalem")).toContain("30");
  });
  it("honors Jerusalem's spring DST jump", () => {
    expect(
      formatDateTime("en", new Date("2026-03-26T23:30:00Z"), "Asia/Jerusalem"),
    ).toContain("1:30");
    expect(
      formatDateTime("en", new Date("2026-03-27T00:30:00Z"), "Asia/Jerusalem"),
    ).toContain("3:30");
  });
  it("localizes relative time", () => {
    expect(formatRelativeTime("en", -1, "day")).toBe("yesterday");
    expect(formatRelativeTime("he", -1, "day")).toBe("אתמול");
  });
  it.each(["en", "he"] as const)(
    "keeps display language %s separate from scheduling",
    (locale) => {
      const at = new Date("2026-06-29T21:30:00Z");
      formatDateTime(locale, at, "Asia/Jerusalem");
      expect(localDate("Asia/Jerusalem", at)).toBe("2026-06-30");
      expect(weekStart(localDate("Asia/Jerusalem", at))).toBe("2026-06-29");
      expect(localParts("Asia/Jerusalem", at)).toEqual({
        weekday: 1,
        minutes: 30,
      });
      expect(
        eligibleFor(
          {
            assignment: "specific",
            assigneeIds: ["a"],
            currentTurnPersonId: null,
          },
          "b",
          (id) => id,
        ).allowed,
      ).toBe(false);
    },
  );
});
