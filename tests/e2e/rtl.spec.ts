import { test, expect } from "@playwright/test";
import { expectNoA11yViolations } from "./_helpers";

test.use({ locale: "he-IL" });

test("Hebrew uses its own font and isolates email direction", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  const typography = await page.locator("body").evaluate((body) => ({
    font: getComputedStyle(body).fontFamily,
    spacing: getComputedStyle(document.querySelector("h1")!).letterSpacing,
    emailDirection: getComputedStyle(
      document.querySelector('input[type="email"]')!,
    ).direction,
  }));
  expect(typography.font).toMatch(/Heebo/i);
  expect(typography.spacing).toBe("normal");
  expect(typography.emailDirection).toBe("ltr");
});

test("Hebrew auth controls reflow at 320px and remain accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  for (const route of ["/sign-in", "/sign-up"]) {
    await page.goto(route);
    await expect(page.locator("html")).toHaveAttribute("lang", "he");
    const controls = await page
      .locator("main input:not([type=hidden]), main button[type=submit]")
      .evaluateAll((items) =>
        items.map((item) => ({
          left: item.getBoundingClientRect().left,
          right: item.getBoundingClientRect().right,
        })),
      );
    expect(controls.length).toBeGreaterThan(0);
    for (const bounds of controls) {
      expect(bounds.left).toBeGreaterThanOrEqual(0);
      expect(bounds.right).toBeLessThanOrEqual(320);
    }
    await expectNoA11yViolations(page, `Hebrew ${route} at 320px`);
  }
});
