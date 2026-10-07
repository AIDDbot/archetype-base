import type { Page } from "@playwright/test";
import { shellPage } from "./layout.page.ts";

export function aboutPage(page: Page) {
  return {
    shell: shellPage(page),
    content: page.locator("about-page"),
    version: page.locator("about-page [data-fact=version]"),
    author: page.locator("about-page [data-fact=author] a"),
    technology: page.locator("about-page table"),
  };
}
