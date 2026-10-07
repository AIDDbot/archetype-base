import { test, expect } from "../../shared/fixtures.ts";
import { aboutPage } from "../../shared/page-objects/about.page.ts";
import { readSystemIdentity } from "../../shared/system.identity.ts";

test(
  "about menu and page show identity current version author and safe website",
  { tag: ["@S0007-R01", "@S0007-R02", "@S0007-R03", "@S0007-R05"] },
  async ({ page, frontUrl, frontDirectory }) => {
    const identity = await readSystemIdentity(frontDirectory);
    await page.goto(frontUrl);
    const link = page.getByRole("navigation").getByRole("link", { name: "About", exact: true });
    await expect(link).toHaveAttribute("href", "/about");
    await link.click();
    const about = aboutPage(page);
    await expect(about.content.getByRole("heading", { level: 1 })).toHaveText(
      `About ${identity.name}`,
    );
    await expect(about.content).toContainText(identity.description);
    await expect(about.version).toHaveText(identity.version);
    await expect(about.author).toHaveText(identity.author);
    await expect(about.author).toHaveAttribute("href", identity.website);
    await expect(about.author).toHaveAttribute("target", "_blank");
    await expect(about.author).toHaveAttribute("rel", "noopener noreferrer");
  },
);
test(
  "about lists every project type and main technologies",
  { tag: "@S0007-R04" },
  async ({ page, frontUrl }) => {
    await page.goto(frontUrl + "/about");
    const table = aboutPage(page).technology;
    const back = table
      .getByRole("row")
      .filter({ has: page.getByRole("rowheader", { name: "back", exact: true }) });
    await expect(back).toContainText("back-api");
    await expect(back).toContainText("Node.js 26");
    await expect(back).toContainText("Express 5");
    await expect(back).toContainText("SQLite");
    const front = table
      .getByRole("row")
      .filter({ has: page.getByRole("rowheader", { name: "front", exact: true }) });
    await expect(front).toContainText("front-web");
    await expect(front).toContainText("TypeScript 7");
    await expect(front).toContainText("Vite");
    await expect(front).toContainText("Pico CSS");
    const suite = table
      .getByRole("row")
      .filter({ has: page.getByRole("rowheader", { name: "e2e", exact: true }) });
    await expect(suite).toContainText("e2e");
    await expect(suite).toContainText("Playwright");
    await expect(suite).toContainText("Chromium");
  },
);
