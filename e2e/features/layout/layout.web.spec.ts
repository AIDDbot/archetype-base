import { test, expect } from "../../shared/fixtures.ts";
import { shellPage, homePage, notFoundPage } from "../../shared/page-objects/layout.page.ts";
import { readSystemIdentity } from "../../shared/system.identity.ts";

test(
  "home displays shared shell identity menu grid and release version",
  { tag: ["@S0003-R01", "@S0003-R02", "@S0003-R03", "@S0003-R09", "@S0003-R12"] },
  async ({ page, frontUrl, frontDirectory }) => {
    const identity = await readSystemIdentity(frontDirectory);
    await page.goto(frontUrl);
    const shell = shellPage(page);
    const home = homePage(page);
    await expect(shell.name).toHaveText(identity.name);
    await expect(shell.home).toHaveAttribute("href", "/");
    await expect(shell.home).toHaveAttribute("aria-current", "page");
    await expect(home.header.getByRole("heading")).toHaveText(identity.name);
    await expect(home.header).toContainText(identity.description);
    await expect(home.cards).toBeAttached();
    await expect(page).toHaveTitle(identity.name);
    await expect(home.version).toHaveText(identity.version);
  },
);
test(
  "unknown direct route shows path and menu navigation keeps the document",
  { tag: ["@S0003-R04", "@S0003-R05"] },
  async ({ page, frontUrl }) => {
    const path = `/unknown-${crypto.randomUUID()}`;
    await page.goto(frontUrl + path);
    const missing = notFoundPage(page);
    await expect(missing.heading).toBeVisible();
    await expect(missing.path).toHaveText(path);
    await expect(missing.home).toHaveAttribute("href", "/");
    await page.evaluate(() => {
      document.documentElement.dataset.documentMarker = "preserved";
    });
    await shellPage(page).home.click();
    await expect(homePage(page).header).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.dataset.documentMarker)).toBe(
      "preserved",
    );
  },
);
test(
  "new browser contexts respect both system color preferences",
  { tag: "@S0003-R06" },
  async ({ browser, frontUrl }) => {
    for (const preference of ["light", "dark"] as const) {
      const context = await browser.newContext({ colorScheme: preference });
      try {
        const page = await context.newPage();
        await page.goto(frontUrl);
        await expect(page.locator("html")).toHaveAttribute("data-theme", preference);
      } finally {
        await context.close();
      }
    }
  },
);
test(
  "theme toggles and persists after reload",
  { tag: ["@S0003-R07", "@S0003-R08"] },
  async ({ page, frontUrl }) => {
    await page.goto(frontUrl);
    await expect(shellPage(page).theme).toBeVisible();
    const initial = await page.locator("html").getAttribute("data-theme");
    const selected = initial === "dark" ? "light" : "dark";
    await shellPage(page).theme.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", selected);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", selected);
  },
);
test(
  "navigation and theme log short console action lines",
  { tag: ["@S0003-R10", "@S0003-R11"] },
  async ({ page, frontUrl }) => {
    const lines: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "info") lines.push(message.text());
    });
    await page.goto(frontUrl + "/log-route");
    await expect(notFoundPage(page).heading).toBeVisible();
    await expect.poll(() => lines).toContain("navigation /log-route");
    await shellPage(page).home.click();
    await expect.poll(() => lines).toContain("navigation /");
    await shellPage(page).theme.click();
    const selected = await page.locator("html").getAttribute("data-theme");
    expect(lines).toContain(`theme ${selected}`);
  },
);
test(
  "the menu wraps its links on a narrow screen when features add links",
  { tag: "@S0003-R13" },
  async ({ page, frontUrl }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(frontUrl);
    await expect(shellPage(page).home).toBeVisible();
    await page.evaluate(() => {
      const menu = document.querySelector("#menu-links");
      for (const label of ["Rockets", "Launches", "Bookings", "Customers"]) {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = `/${label.toLowerCase()}`;
        link.textContent = label;
        item.append(link);
        menu?.append(item);
      }
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  },
);
