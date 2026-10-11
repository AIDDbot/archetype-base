import type { Page } from "@playwright/test";
import { recordForm } from "./record.page.ts";

export function authPage(page: Page) {
  const form = recordForm(page.locator("auth-form"));
  return {
    email: form.field("Email"),
    name: form.field("Name"),
    password: form.field("Password"),
    submit: form.submit,
    result: form.result,
    async fill(values: { email: string; name?: string; password: string }) {
      const name = values.name === undefined ? {} : { Name: values.name };
      await form.fill({ Email: values.email, ...name, Password: values.password });
    },
  };
}
