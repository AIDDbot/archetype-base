import type { Page } from "@playwright/test";

export function authPage(page: Page) {
  return {
    email: page.getByLabel("Email", { exact: true }),
    name: page.getByLabel("Name", { exact: true }),
    password: page.getByLabel("Password", { exact: true }),
    submit: page.locator("auth-form button[type=submit]"),
    result: page.locator("#form-result"),
    async fill(values: { email: string; name?: string; password: string }) {
      await page.getByLabel("Email", { exact: true }).fill(values.email);
      if (values.name !== undefined)
        await page.getByLabel("Name", { exact: true }).fill(values.name);
      await page.getByLabel("Password", { exact: true }).fill(values.password);
    },
  };
}
