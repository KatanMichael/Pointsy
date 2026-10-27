import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createTestDb, type TestDb } from "../helpers/test-db";
import { registerFamily } from "@/lib/auth/register";
import { listCategories, updateCategory } from "@/lib/categories/service";
import { formatChoreLimit } from "@/lib/catalog/limit";
import { goalSummary } from "@/lib/challenges/format";
import { countdownAria } from "@/lib/chores/window-format";

describe("localized core flows", () => {
  let ctx: TestDb;
  beforeAll(async () => {
    ctx = await createTestDb();
  });
  afterAll(async () => {
    await ctx.close();
  });
  it("seeds Hebrew categories only for new Hebrew families and preserves names across family-scoped updates", async () => {
    const a = await registerFamily(ctx.db, {
      familyName: "משפחה",
      parentName: "נועה",
      email: "he-i18n@example.com",
      password: "test-password",
      locale: "he",
    });
    const b = await registerFamily(ctx.db, {
      familyName: "English",
      parentName: "Parent",
      email: "en-i18n@example.com",
      password: "test-password",
    });
    const ca = await listCategories(ctx.db, a.familyId);
    const cb = await listCategories(ctx.db, b.familyId);
    expect(ca[0].name).toBe("חדר שינה");
    expect(cb[0].name).toBe("Bedroom");
    await updateCategory(ctx.db, a.familyId, cb[0].id, {
      name: "לא לשנות",
      icon: "bed",
    });
    expect((await listCategories(ctx.db, b.familyId))[0].name).toBe("Bedroom");
    await updateCategory(ctx.db, a.familyId, ca[0].id, {
      name: "Bedroom",
      icon: "bed",
    });
    expect((await listCategories(ctx.db, a.familyId))[0].name).toBe("Bedroom");
  });
  it("formats full dynamic summaries in Hebrew", () => {
    expect(formatChoreLimit("day", 2, "per_kid", "he")).toBe(
      "עד 2 פעמים ביום לכל ילד",
    );
    expect(goalSummary("chore_count", 1, "he")).toBe("השלמת משימה אחת");
    expect(goalSummary("chore_count", 2, "he")).toBe("השלמת 2 משימות");
    expect(countdownAria(60000, "he")).toBe("דקה אחת");
  });
});
