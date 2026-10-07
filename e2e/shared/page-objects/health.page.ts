import type { Page } from "@playwright/test";
import { shellPage, homePage } from "./layout.page.ts";

export function healthPage(page: Page) {
  return { shell: shellPage(page), content: page.getByRole("region", { name: "Health" }) };
}
export function healthCard(page: Page) {
  return {
    home: homePage(page),
    content: page.getByRole("article", { name: "Health" }),
    link: page.getByRole("link", { name: "Health details" }),
  };
}
