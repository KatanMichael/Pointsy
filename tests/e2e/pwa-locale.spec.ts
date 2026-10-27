import { test, expect } from "@playwright/test";
import { expectNoA11yViolations } from "./_helpers";

test.use({
  locale: "he-IL",
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
});

test("Hebrew installation guidance remains readable and keyboard accessible", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await page
    .getByRole("button", { name: "התקנת האפליקציה", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "הוספת Pointsy למסך הבית" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("הוספה למסך הבית");
  await expect(dialog).toContainText("שיתוף");
  await expectNoA11yViolations(page, "Hebrew install guide");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});
