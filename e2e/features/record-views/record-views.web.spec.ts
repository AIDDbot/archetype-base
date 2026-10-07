import type { APIRequestContext, Page } from "@playwright/test";
import { test, expect } from "../../shared/fixtures.ts";
import { authClient, uniqueCredentials } from "../../shared/auth.client.ts";
import { textContrast } from "../../shared/contrast.check.ts";
import { recordTable, recordView } from "../../shared/page-objects/record.page.ts";

async function signIn(page: Page, request: APIRequestContext, backUrl: string) {
  const values = uniqueCredentials();
  const user: { id: string } = await (await authClient(request, backUrl).register(values)).json();
  const session: { token: string } = await (
    await authClient(request, backUrl).login({ email: values.email, password: values.password })
  ).json();
  await page.addInitScript((token) => localStorage.setItem("session-token", token), session.token);
  return user;
}
async function expectFacts(view: ReturnType<typeof recordView>) {
  await expect(view.facts.first().locator("dt").first()).toBeVisible();
  await expect(view.facts.first().locator("dd").first()).toBeVisible();
}
function delayHealth(page: Page) {
  return page.route("**/api/health", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });
}
async function cardLefts(page: Page) {
  const cards = page.locator("record-card article");
  await expect(cards.nth(1)).toBeVisible();
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  return [first?.x ?? 0, second?.x ?? 0];
}
function hasNoHorizontalScroll(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
}

test(
  "each home card has a heading, label and value pairs and a footer link",
  { tag: "@S0008-R01" },
  async ({ page, frontUrl }) => {
    await page.goto(frontUrl);
    const cards = page.locator("record-card article");
    await expect(cards.first()).toBeVisible();
    for (const card of await cards.all()) {
      const view = recordView(card);
      await expect(card.getByRole("heading", { level: 2 })).toBeVisible();
      await expect(view.facts.locator("dt").first()).toBeVisible();
      await expect(view.links.first()).toBeVisible();
    }
  },
);
test(
  "detail pages show a page header and sections of label and value pairs",
  { tag: "@S0008-R02" },
  async ({ page, request, backUrl, frontUrl }) => {
    const user = await signIn(page, request, backUrl);
    for (const path of ["/health", "/about", `/users/${user.id}`]) {
      await page.goto(frontUrl + path);
      const view = recordView(page.locator("record-detail"));
      await expect(view.scope.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(view.scope.getByRole("heading", { level: 2 }).first()).toBeVisible();
      await expectFacts(view);
    }
  },
);
test(
  "a loading view is busy and shows no fact",
  { tag: "@S0008-R03" },
  async ({ page, frontUrl }) => {
    await delayHealth(page);
    await page.goto(frontUrl + "/health");
    const section = page.locator("record-detail > section");
    await expect(section).toHaveAttribute("aria-busy", "true");
    await expect(section.locator("dl")).toHaveCount(0);
    await expect(section).not.toHaveAttribute("aria-busy", /.*/);
    await expect(section.locator("dd").first()).toBeVisible();
  },
);
test(
  "a view that cannot load keeps its title and footer link",
  { tag: "@S0008-R04" },
  async ({ page, frontUrl }) => {
    await page.route("**/api/health", (route) => route.abort());
    await page.goto(frontUrl);
    const card = recordView(page.getByRole("article", { name: "Health" }));
    await expect(card.status).toHaveText("Health unavailable");
    await expect(card.scope.getByRole("heading", { name: "Health" })).toBeVisible();
    await expect(card.links).toHaveAttribute("href", "/health");
    await expect(card.facts).toHaveCount(0);
  },
);
test(
  "a record state shows as a badge with text",
  { tag: "@S0008-R05" },
  async ({ page, frontUrl }) => {
    await page.goto(frontUrl + "/health");
    await expect(recordView(page.locator("record-detail")).state).toHaveText("ok");
    await page.goto(frontUrl);
    await expect(
      recordView(page.getByRole("article", { name: "Authentication" })).state,
    ).toHaveText(/\S/);
  },
);
test(
  "dates, durations and numbers show in a form that a person reads",
  { tag: "@S0008-R06" },
  async ({ page, request, backUrl, frontUrl }) => {
    const user = await signIn(page, request, backUrl);
    await page.goto(frontUrl + "/health");
    const health = recordView(page.locator("record-detail"));
    await expect(health.fact("Runs")).toHaveText(/^\d[\d.,\s]*$/);
    await expect(health.fact("Uptime")).toHaveText(/\d+\s*\p{L}+/u);
    await page.goto(frontUrl + `/users/${user.id}`);
    const created = recordView(page.locator("record-detail")).fact("Created");
    await expect(created).toHaveText(/\d/);
    await expect(created).toHaveText(/\p{L}/u);
  },
);
test(
  "cards are one column on a narrow screen and several on a wide one",
  { tag: "@S0008-R07" },
  async ({ page, frontUrl }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(frontUrl);
    const [narrowFirst, narrowSecond] = await cardLefts(page);
    expect(narrowFirst).toBe(narrowSecond);
    expect(await hasNoHorizontalScroll(page)).toBe(true);
    await page.setViewportSize({ width: 1024, height: 812 });
    const [wideFirst, wideSecond] = await cardLefts(page);
    expect(wideFirst).not.toBe(wideSecond);
  },
);
test(
  "labels and values keep AA contrast in both themes",
  { tag: "@S0008-R08" },
  async ({ page, frontUrl }) => {
    for (const theme of ["light", "dark"]) {
      await page.goto(frontUrl + "/health");
      await page.evaluate(
        (value) => document.documentElement.setAttribute("data-theme", value),
        theme,
      );
      const texts = page.locator("record-detail dt, record-detail dd");
      await expect(texts.first()).toBeVisible();
      for (const text of await texts.all()) {
        expect(
          await textContrast(text),
          `${theme}: ${await text.textContent()}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  },
);
test(
  "a list of records shows as a table with caption, headers and rows",
  { tag: "@S0008-R09" },
  async ({ page, frontUrl }) => {
    await page.goto(frontUrl + "/about");
    const table = recordTable(page.locator("record-table"));
    await expect(table.caption).toHaveText("Technology of each project");
    await expect(table.columnHeaders).toHaveCount(6);
    await expect(table.rows).toHaveCount(3);
    await expect(table.table.getByRole("rowheader", { name: "front", exact: true })).toBeVisible();
  },
);
test(
  "a table scrolls in its own area on a narrow screen",
  { tag: "@S0008-R10" },
  async ({ page, frontUrl }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(frontUrl + "/about");
    await expect(recordTable(page.locator("record-table")).table).toBeVisible();
    expect(await hasNoHorizontalScroll(page)).toBe(true);
    const scroll = await recordTable(page.locator("record-table")).area.evaluate(
      (area) => getComputedStyle(area).overflowX,
    );
    expect(scroll).toBe("auto");
  },
);
