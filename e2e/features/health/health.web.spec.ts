import { test, expect } from "../../shared/fixtures.ts";
import { healthPage, healthCard } from "../../shared/page-objects/health.page.ts";

test(
  "health page shows API state readable uptime and health menu",
  { tag: ["@S0004-R04", "@S0004-R06"] },
  async ({ page, frontUrl }) => {
    await page.goto(frontUrl + "/health");
    const health = healthPage(page);
    // S0020-R01, R02 replace the one-line text with a state badge and label and value pairs.
    await expect(health.content.locator(".record-badge")).toHaveText("ok");
    await expect(health.content).toContainText(/Runs\s*\d+.*Uptime\s*\d+\s*\w+/);
    await expect(
      page.getByRole("navigation").getByRole("link", { name: "Health", exact: true }),
    ).toHaveAttribute("href", "/health");
    await expect(health.shell.home).toBeVisible();
  },
);
test("health page unavailable keeps shell", { tag: "@S0004-R05" }, async ({ page, frontUrl }) => {
  await page.route("**/api/health", (route) => route.abort());
  await page.goto(frontUrl + "/health");
  await expect(healthPage(page).content).toContainText("Health unavailable");
  await expect(healthPage(page).shell.home).toBeVisible();
});
test(
  "home health card navigates without reload and fits narrow viewport",
  { tag: ["@S0004-R07", "@S0004-R09", "@S0004-R10"] },
  async ({ page, frontUrl }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(frontUrl);
    const card = healthCard(page);
    // S0020-R01 replaces the one-line text with a state badge and label and value pairs.
    await expect(card.content.locator(".record-badge")).toHaveText("ok");
    await expect(card.content).toContainText(/Runs\s*\d+.*Uptime\s*\d+\s*\w+/);
    await expect(card.link).toHaveAttribute("href", "/health");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.evaluate(() => {
      document.documentElement.dataset.marker = "health";
    });
    await card.link.click();
    await expect(healthPage(page).content).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.dataset.marker)).toBe("health");
  },
);
test(
  "unavailable home card keeps link grid and menu",
  { tag: "@S0004-R08" },
  async ({ page, frontUrl }) => {
    await page.route("**/api/health", (route) => route.abort());
    await page.goto(frontUrl);
    const card = healthCard(page);
    await expect(card.content).toContainText("Health unavailable");
    await expect(card.link).toBeVisible();
    await expect(card.home.cards).toBeAttached();
    await expect(page.getByRole("navigation")).toBeVisible();
  },
);
