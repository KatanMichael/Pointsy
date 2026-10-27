import { describe, expect, it } from "vitest";
import { translate } from "@/lib/i18n";
import { defineMessages, en, he } from "@/lib/i18n/messages";

describe("messages", () => {
  it("requires matching keys and interpolation placeholders in each language", () => {
    expect(Object.keys(he).sort()).toEqual(Object.keys(en).sort());
    const placeholders = (text: string) =>
      [...new Set([...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort();
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      const source = en[key];
      const target = he[key];
      if (typeof source === "string") {
        expect(typeof target).toBe("string");
        expect(placeholders(target as string)).toEqual(placeholders(source));
      } else {
        expect(typeof target).toBe("object");
        expect(target).toHaveProperty("other");
        for (const form of Object.values(target))
          expect(placeholders(form)).toEqual(placeholders(source.other));
      }
    }
  });
  it("interpolates names as plain text without altering user content", () => {
    expect(translate("he", "auth.welcome", { name: "<Robin>" })).toBe(
      "שלום, <Robin>",
    );
  });
  it.each([
    [0, "0 נקודות"],
    [1, "1 נקודה"],
    [2, "2 נקודות"],
    [3, "3 נקודות"],
    [10, "10 נקודות"],
    [11, "11 נקודות"],
    [20, "20 נקודות"],
    [101, "101 נקודות"],
  ] as const)("pluralizes Hebrew %s", (count, expected) => {
    expect(translate("he", "core.points", { count })).toBe(expected);
  });
  it("pluralizes English singular and plural", () => {
    expect(translate("en", "core.points", { count: 1 })).toBe("1 point");
    expect(translate("en", "core.points", { count: 2 })).toBe("2 points");
  });
});

// These compile-time assertions must remain errors under npm run typecheck.
function checkTypes() {
  const missingPlaceholder = { ...he, "auth.welcome": "שלום" } as const;
  // @ts-expect-error Hebrew must retain the English interpolation parameter
  defineMessages(missingPlaceholder);
  const wrongPluralPlaceholder = {
    ...he,
    "core.points": { ...he["core.points"], one: "{total} נקודה" },
  } as const;
  // @ts-expect-error every plural branch must retain the English parameters
  defineMessages(wrongPluralPlaceholder);
  const missingPluralOther = {
    ...he,
    "core.points": { one: "{count} נקודה", two: "{count} נקודות" },
  } as const;
  // @ts-expect-error all plural branches, including other, are required
  defineMessages(missingPluralOther);
  const extraKey = { ...he, "unknown.key": "extra" } as const;
  // @ts-expect-error catalogs must have exactly the English keys
  defineMessages(extraKey);
  const missingKey: Omit<typeof he, "common.save"> = he;
  // @ts-expect-error every English key must be translated
  defineMessages(missingKey);
  // @ts-expect-error unknown message key
  translate("he", "missing.key");
  // @ts-expect-error missing interpolation parameter
  translate("he", "auth.welcome");
  // @ts-expect-error misspelled interpolation parameter
  translate("en", "auth.welcome", { nmae: "Robin" });
  // @ts-expect-error count is numeric
  translate("he", "core.points", { count: "2" });
  // @ts-expect-error static messages have no parameters
  translate("he", "common.save", { name: "Robin" });
}
void checkTypes;
