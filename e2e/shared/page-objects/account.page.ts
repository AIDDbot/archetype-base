import type { Page } from "@playwright/test";
import { shellPage } from "./layout.page.ts";

export function accountPage(page: Page) {
  return {
    shell: shellPage(page),
    name: page.locator("record-detail [data-fact=name]"),
    email: page.locator("record-detail [data-fact=email]"),
    created: page.locator("record-detail [data-fact=createdAt]"),
    message: page.locator("record-detail [role=status]"),
  };
}
