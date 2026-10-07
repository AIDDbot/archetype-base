import { test, expect } from "../../shared/fixtures.ts";
import { authClient, uniqueCredentials } from "../../shared/auth.client.ts";
import { authPage } from "../../shared/page-objects/auth.page.ts";
import { accountPage } from "../../shared/page-objects/account.page.ts";
import type { Page, APIRequestContext } from "@playwright/test";

async function sessionFor(
  page: Page,
  request: APIRequestContext,
  urls: { backUrl: string; frontUrl: string },
) {
  const values = uniqueCredentials();
  const client = authClient(request, urls.backUrl);
  const user = await (await client.register(values)).json();
  const session = await (await client.login(values)).json();
  await page.goto(urls.frontUrl);
  await page.evaluate(
    (token: string) => localStorage.setItem("session-token", token),
    session.token,
  );
  await page.reload();
  await expect(page.locator("#visitor-name")).toHaveText(values.name);
  return { values, user, session };
}
test(
  "own account shows readable date and other account is not found",
  { tag: ["@S0006-R05", "@S0006-R06"] },
  async ({ page, request, backUrl, frontUrl }) => {
    const { user } = await sessionFor(page, request, { backUrl, frontUrl });
    await page.goto(`${frontUrl}/users/${user.id}`);
    const account = accountPage(page);
    await expect(account.name).toHaveText(user.name);
    await expect(account.email).toHaveText(user.email);
    await expect(account.created).toContainText(/\d/);
    expect(await account.created.textContent()).not.toBe(user.createdAt);
    await page.goto(`${frontUrl}/users/${crypto.randomUUID()}`);
    await expect(account.message).toHaveText("Account not found");
    await expect(account.shell.home).toBeVisible();
  },
);
test(
  "menu uses one access mark and changes with session",
  { tag: ["@S0006-R07", "@S0006-R08"] },
  async ({ page, request, backUrl, frontUrl }) => {
    await page.goto(frontUrl);
    const menu = page.getByRole("navigation");
    await expect(menu.getByRole("link", { name: "Login", exact: true })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Register", exact: true })).toBeVisible();
    await expect(menu.getByRole("button", { name: "Logout" })).toHaveCount(0);
    const { user } = await sessionFor(page, request, { backUrl, frontUrl });
    await expect(menu.getByRole("link", { name: user.name })).toHaveAttribute(
      "href",
      `/users/${user.id}`,
    );
    await expect(menu.getByRole("button", { name: "Logout" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Login", exact: true })).toHaveCount(0);
    await expect(menu.getByRole("link", { name: "Register", exact: true })).toHaveCount(0);
  },
);
test(
  "guard keeps full target then login returns without reload",
  { tag: ["@S0006-R09", "@S0006-R10"] },
  async ({ page, request, backUrl, frontUrl }) => {
    const values = uniqueCredentials();
    const user = await (await authClient(request, backUrl).register(values)).json();
    const target = `/users/${user.id}?a=1#b`;
    await page.goto(frontUrl + target);
    await expect(page).toHaveURL(frontUrl + "/login?returnTo=" + encodeURIComponent(target));
    await expect(page.locator("record-detail")).toHaveCount(0);
    await page.evaluate(() => {
      document.documentElement.dataset.returnMarker = "same-document";
    });
    await authPage(page).fill({ email: values.email, password: values.password });
    await authPage(page).submit.click();
    await expect(page).toHaveURL(frontUrl + target);
    await expect(accountPage(page).name).toHaveText(values.name);
    expect(await page.evaluate(() => document.documentElement.dataset.returnMarker)).toBe(
      "same-document",
    );
  },
);
test(
  "return target rejects external unknown and anonymous pages",
  { tag: "@S0006-R11" },
  async ({ page, request, backUrl, frontUrl }) => {
    const values = uniqueCredentials();
    await authClient(request, backUrl).register(values);
    for (const target of ["https://example.com/", "//example.com", "/no-such-page", "/register"]) {
      await page.goto(frontUrl + "/login?returnTo=" + encodeURIComponent(target));
      await authPage(page).fill({ email: values.email, password: values.password });
      await authPage(page).submit.click();
      await expect(page).toHaveURL(frontUrl + "/");
      await page.evaluate(() => localStorage.removeItem("session-token")); // Next direct load initializes anonymous state.
    }
  },
);
test(
  "logout 204 or 401 clears session and displays anonymous home",
  { tag: "@S0006-R12" },
  async ({ page, request, backUrl, frontUrl }) => {
    for (const status of [204, 401]) {
      await sessionFor(page, request, { backUrl, frontUrl });
      if (status === 401)
        await page.route("**/api/auth/logout", (route) =>
          route.fulfill({
            status: 401,
            contentType: "application/json",
            body: '{"error":"Unauthorized"}',
          }),
        );
      await page.getByRole("button", { name: "Logout" }).click();
      await expect(
        page.getByRole("navigation").getByRole("link", { name: "Login", exact: true }),
      ).toBeVisible();
      expect(await page.evaluate(() => localStorage.getItem("session-token"))).toBeNull();
      await expect(page).toHaveURL(frontUrl + "/");
      await page.unroute("**/api/auth/logout");
    }
  },
);
test(
  "failed logout keeps session and permits retry",
  { tag: "@S0006-R13" },
  async ({ page, request, backUrl, frontUrl }) => {
    await sessionFor(page, request, { backUrl, frontUrl });
    for (const failure of ["500", "network"]) {
      await page.route("**/api/auth/logout", (route) =>
        failure === "500"
          ? route.fulfill({
              status: 500,
              contentType: "application/json",
              body: '{"error":"Internal server error"}',
            })
          : route.abort(),
      );
      await page.getByRole("button", { name: "Logout" }).click();
      await expect(page.locator("#menu-error")).toHaveText("Logout unavailable");
      expect(await page.evaluate(() => localStorage.getItem("session-token"))).toEqual(
        expect.any(String),
      );
      await expect(page.getByRole("button", { name: "Logout" })).toBeEnabled();
      await page.unroute("**/api/auth/logout");
    }
    await page.getByRole("button", { name: "Logout" }).click();
    await expect(
      page.getByRole("navigation").getByRole("link", { name: "Login", exact: true }),
    ).toBeVisible();
  },
);
