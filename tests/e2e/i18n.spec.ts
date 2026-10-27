import { test, expect } from "@playwright/test";
import { expectNoA11yViolations, enterPin } from "./_helpers";

for (const [language, locale, dir] of [
  ["he-IL", "he", "rtl"],
  ["en-US", "en", "ltr"],
]) {
  test(`initial HTML negotiates ${language}`, async ({ request }) => {
    const response = await request.get("/sign-in", {
      headers: { "Accept-Language": language },
    });
    expect(response.ok()).toBe(true);
    expect((await response.text()).match(/<html[^>]*>/)?.[0]).toMatch(
      new RegExp(`<html[^>]*lang="${locale}"[^>]*dir="${dir}"`),
    );
  });
}

test("one accessible language control persists a year across navigation and reload", async ({
  page,
  context,
}) => {
  await page.goto("/");
  const language = page.getByRole("combobox", { name: /Language|שפה/ });
  await expect(language).toHaveCount(1);
  await language.selectOption("he");
  await expect(page.locator("html")).toHaveAttribute("lang", "he");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect
    .poll(
      async () =>
        (await context.cookies()).find((c) => c.name === "pointsy_locale")
          ?.value,
    )
    .toBe("he");
  const cookie = (await context.cookies()).find(
    (c) => c.name === "pointsy_locale",
  )!;
  expect(cookie.path).toBe("/");
  expect(cookie.sameSite).toBe("Lax");
  expect(cookie.expires - Date.now() / 1000).toBeGreaterThan(364 * 86400);
  await page
    .getByRole("link", { name: /^כניסת הורים$/ })
    .last()
    .click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(language).toHaveValue("he");
  await page.reload();
  await expect(language).toHaveValue("he");
  await expectNoA11yViolations(page, "Hebrew sign-in language control");
  await language.selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});

test("cancel retains the draft and locale; confirm discards it and switches", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("draft@example.com");
  const cancelled = page.waitForEvent("dialog");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("combobox", { name: "Language" }).selectOption("he");
  await cancelled;
  await expect(page.getByLabel("Email")).toHaveValue("draft@example.com");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toMatch(/unsaved.*lost/i);
    await dialog.accept();
  });
  await page.getByRole("combobox", { name: "Language" }).selectOption("he");
  await expect(page.locator("html")).toHaveAttribute("lang", "he");
  await expect(page.getByLabel("דוא״ל")).toHaveValue("");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "he");
});

test("invalid cookie safely negotiates locale and login remains usable", async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: "pointsy_locale", value: "broken", domain: "localhost", path: "/" },
  ]);
  await page.goto("/sign-in");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByLabel("Email").fill("unknown@example.com");
  await page.getByLabel("Password").fill("wrongpassword");
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await expect(page.getByText(/incorrect email or password/i)).toBeVisible();
});

test("locale survives authentication, sign-out and profile switching", async ({
  page,
}) => {
  await page.goto("/sign-up");
  await page.getByRole("combobox", { name: "Language" }).selectOption("he");
  await expect(page.locator("html")).toHaveAttribute("lang", "he");
  await page.getByLabel("שם המשפחה").fill("Locale Family");
  await page.getByLabel("השם שלך").fill("Locale Parent");
  await page
    .getByLabel("דוא״ל")
    .fill(`locale.${Date.now()}.${Math.random()}@example.com`);
  await page.getByLabel("סיסמה").fill("supersecret123");
  await page.getByLabel(/אני הורה או אפוטרופוס/).check();
  await page.getByRole("button", { name: /יצירת משפחה/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("combobox", { name: "שפה" })).toHaveValue("he");
  await page.getByText(/הגדרת קוד אישי לעצמך/).click();
  await page.getByLabel(/קוד אישי בן 4 ספרות/).fill("1234");
  await page.getByRole("button", { name: /^הגדרת קוד אישי$/ }).click();
  await expect(page.getByText("הקוד האישי נשמר.")).toBeVisible();
  await page.getByRole("button", { name: /יציאה/ }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("combobox", { name: "שפה" })).toHaveValue("he");
  await page.getByRole("button", { name: /Locale Parent/ }).click();
  await enterPin(page, "1234");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "he");
});

async function createDraftTestFamily(page: import("@playwright/test").Page) {
  await page.goto("/sign-up");
  await page.getByLabel("Family name").fill("Draft Guard Family");
  await page.getByLabel("Your name").fill("Draft Parent");
  await page
    .getByLabel("Email")
    .fill(`draft.${Date.now()}.${Math.random()}@example.com`);
  await page.getByLabel("Password").fill("supersecret123");
  await page.getByLabel(/parent or guardian/i).check();
  await page.getByRole("button", { name: /create family/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("partial PIN draft is retained on cancel and discarded only after confirmation", async ({
  page,
}) => {
  await createDraftTestFamily(page);
  await page.getByText(/set a sign-in pin for yourself/i).click();
  await page.getByLabel(/4-digit PIN/i).fill("1234");
  await page.getByRole("button", { name: /^set pin$/i }).click();
  await expect(page.getByText("PIN saved.")).toBeVisible();
  await page.getByRole("button", { name: /sign out/i }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("button", { name: /Draft Parent/ }).click();
  await page.getByRole("button", { name: "1", exact: true }).click();
  await page.getByRole("button", { name: "2", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("2 of 4 digits entered");
  const cancelled = page.waitForEvent("dialog", { timeout: 5000 });
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("combobox", { name: "Language" }).selectOption("he");
  await cancelled;
  await expect(page.getByRole("status")).toHaveText("2 of 4 digits entered");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const confirmed = page.waitForEvent("dialog", { timeout: 5000 });
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("combobox", { name: "Language" }).selectOption("he");
  await confirmed;
  await expect(page.locator("html")).toHaveAttribute("lang", "he");
  await expect(
    page.getByRole("heading", { name: /מי נכנס עכשיו/ }),
  ).toBeVisible();
});

test("a persisted nonfirst controlled selection reached by client navigation is clean, while editing it protects the draft", async ({
  page,
}) => {
  await createDraftTestFamily(page);
  await page.goto("/manage/challenges/new");
  await page.getByLabel("Name").fill("Controlled select challenge");
  await page.getByLabel("Measure", { exact: true }).selectOption("chore_count");
  await page.getByLabel("Chores to log").fill("5");
  await page.getByLabel(/bonus points/i).fill("2");
  await page.getByRole("button", { name: /save challenge/i }).click();
  await expect(page).toHaveURL(/\/manage\/challenges$/);
  await page.getByRole("link", { name: /Controlled select challenge/ }).click();
  await expect(page.getByLabel("Measure", { exact: true })).toHaveValue(
    "chore_count",
  );
  let dialogs = 0;
  const rejectUnexpected = async (
    dialog: import("@playwright/test").Dialog,
  ) => {
    dialogs++;
    await dialog.dismiss();
  };
  page.on("dialog", rejectUnexpected);
  await Promise.all([
    page.waitForEvent("load"),
    page.getByRole("combobox", { name: "Language" }).selectOption("he"),
  ]);
  await expect(page.locator("html")).toHaveAttribute("lang", "he");
  expect(dialogs).toBe(0);
  page.off("dialog", rejectUnexpected);
  await page.getByLabel("מדד", { exact: true }).selectOption("core_days");
  const cancelled = page.waitForEvent("dialog", { timeout: 5000 });
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("combobox", { name: "שפה" }).selectOption("en");
  await cancelled;
  await expect(page.getByLabel("מדד", { exact: true })).toHaveValue(
    "core_days",
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "he");
  const confirmed = page.waitForEvent("dialog", { timeout: 5000 });
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("combobox", { name: "שפה" }).selectOption("en");
  await confirmed;
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByLabel("Measure", { exact: true })).toHaveValue(
    "chore_count",
  );
});

test("Hebrew sign-in presents field and wrong-password errors without internal details", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await page.getByRole("combobox", { name: "Language" }).selectOption("he");
  await page.getByLabel("דוא״ל").fill("bad");
  await page.getByRole("button", { name: "כניסה", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "יש להזין כתובת דוא״ל תקינה." }),
  ).toBeVisible();
  await page.getByLabel("דוא״ל").fill("missing@example.com");
  await page.getByLabel("סיסמה").fill("wrong-password");
  await page.getByRole("button", { name: "כניסה", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toHaveCount(1);
  await expect(page.locator("main").getByRole("alert")).toHaveText(
    "הפרטים שהוזנו שגויים.",
  );
  await expect(page.locator("main")).not.toContainText(
    /postgres|exception|stack trace/i,
  );
});
