import type { APIRequestContext, Page } from "@playwright/test";
import { test, expect } from "../../shared/fixtures.ts";
import { authClient, uniqueCredentials } from "../../shared/auth.client.ts";
import { authPage } from "../../shared/page-objects/auth.page.ts";
import { accountPage } from "../../shared/page-objects/account.page.ts";

async function loginFromHome(
  page: Page,
  request: APIRequestContext,
  urls: { backUrl: string; frontUrl: string },
) {
  const values = uniqueCredentials();
  const response = await authClient(request, urls.backUrl).register(values);
  expect(response.status()).toBe(201);
  const user: { id: string } = await response.json();
  await page.goto(urls.frontUrl);
  await page.getByRole("navigation").getByRole("link", { name: "Login", exact: true }).click();
  await authPage(page).fill({ email: values.email, password: values.password });
  await authPage(page).submit.click();
  await expect(page.locator("#visitor-name")).toHaveText(values.name);
  await page.getByRole("navigation").getByRole("link", { name: "Home", exact: true }).click();
  await expect(page.getByRole("article", { name: "Authentication" })).toBeVisible();
  return { ...values, id: user.id };
}
async function expectSignedIn(page: Page, id: string) {
  for (const surface of [
    page.getByRole("navigation"),
    page.getByRole("article", { name: "Authentication" }),
  ]) {
    const profile = surface.locator('a[href^="/users/"]');
    await expect(profile).toBeVisible();
    await expect(profile).toHaveAttribute("href", `/users/${id}`);
    await expect(surface.getByRole("link", { name: "Login", exact: true })).not.toBeVisible();
    await expect(surface.getByRole("link", { name: "Register", exact: true })).not.toBeVisible();
  }
}
async function expectAnonymous(page: Page) {
  for (const surface of [
    page.getByRole("navigation"),
    page.getByRole("article", { name: "Authentication" }),
  ]) {
    await expect(surface.getByRole("link", { name: "Login", exact: true })).toBeVisible();
    await expect(surface.getByRole("link", { name: "Register", exact: true })).toBeVisible();
    await expect(surface.locator('a[href^="/users/"]')).not.toBeVisible();
  }
}
test(
  "login immediately shows own profile on both surfaces",
  { tag: "@S0019-R01" },
  async ({ page, request, backUrl, frontUrl }) => {
    const user = await loginFromHome(page, request, { backUrl, frontUrl });
    await expectSignedIn(page, user.id);
    await page.getByRole("navigation").getByRole("link", { name: "About", exact: true }).click();
    await expect(page.locator("#visitor-name")).toHaveAttribute("href", `/users/${user.id}`);
    await expect(
      page.getByRole("navigation").getByRole("link", { name: "Login", exact: true }),
    ).not.toBeVisible();
  },
);
test(
  "auth card greeting is the only link to the own account",
  { tag: "@S0024-R01" },
  async ({ page, request, backUrl, frontUrl }) => {
    const user = await loginFromHome(page, request, { backUrl, frontUrl });
    const card = page.getByRole("article", { name: "Authentication" });
    const greeting = card.getByRole("link", { name: `Hello, ${user.name}`, exact: true });
    await expect(greeting).toHaveAttribute("href", `/users/${user.id}`);
    await expect(card.locator('a[href^="/users/"]')).toHaveCount(1);
  },
);
test(
  "both own profile links navigate without document reload",
  { tag: "@S0019-R02" },
  async ({ page, request, backUrl, frontUrl }) => {
    const user = await loginFromHome(page, request, { backUrl, frontUrl });
    for (const selector of ["article[aria-label=Authentication]", "nav"]) {
      await page.evaluate(() => {
        document.documentElement.dataset.profileMarker = "same-document";
      });
      await page.locator(selector).locator('a[href^="/users/"]').click();
      await expect(page).toHaveURL(`${frontUrl}/users/${user.id}`);
      await expect(accountPage(page).email).toHaveText(user.email);
      expect(await page.evaluate(() => document.documentElement.dataset.profileMarker)).toBe(
        "same-document",
      );
      await page.getByRole("navigation").getByRole("link", { name: "Home", exact: true }).click();
      await expect(page.getByRole("article", { name: "Authentication" })).toBeVisible();
    }
  },
);
test(
  "valid restored session retains both own profile links",
  { tag: "@S0019-R03" },
  async ({ page, request, backUrl, frontUrl }) => {
    const user = await loginFromHome(page, request, { backUrl, frontUrl });
    await page.reload();
    await expectSignedIn(page, user.id);
  },
);
test(
  "completed logout updates both surfaces to anonymous",
  { tag: "@S0019-R04" },
  async ({ page, request, backUrl, frontUrl }) => {
    const user = await loginFromHome(page, request, { backUrl, frontUrl });
    await expectSignedIn(page, user.id);
    await page.getByRole("navigation").getByRole("button", { name: "Logout" }).click();
    await expectAnonymous(page);
  },
);
test(
  "rejected restored session removes both own profile links",
  { tag: "@S0019-R05" },
  async ({ page, request, backUrl, frontUrl }) => {
    const user = await loginFromHome(page, request, { backUrl, frontUrl });
    await expectSignedIn(page, user.id);
    const token = await page.evaluate(() => localStorage.getItem("session-token"));
    expect(token).not.toBeNull();
    const response = await authClient(request, backUrl).logout(token ?? undefined);
    expect(response.status()).toBe(204);
    await page.reload();
    await expectAnonymous(page);
  },
);
