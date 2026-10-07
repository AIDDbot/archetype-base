import type { Page } from "@playwright/test";

export function shellPage(page: Page) {
  return {
    account: page.locator("#visitor-name"),
    logout: page.getByRole("button", { name: "Logout" }),
    name: page.locator("application-shell nav strong"),
    home: page.getByRole("navigation", { name: "Main menu" }).getByRole("link", { name: "Home" }),
    theme: page.getByRole("button", { name: "Change theme" }),
  };
}
export function homePage(page: Page) {
  return {
    header: page.locator("#home-header"),
    cards: page.getByRole("region", { name: "Application cards" }),
    version: page.locator("#application-version"),
  };
}
export function notFoundPage(page: Page) {
  return {
    heading: page.getByRole("heading", { name: "Page not found" }),
    path: page.locator("main p"),
    home: page.locator("main").getByRole("link", { name: "Home" }),
  };
}
