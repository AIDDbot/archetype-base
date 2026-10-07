import type { Locator } from "@playwright/test";

export function recordView(scope: Locator) {
  return {
    scope,
    heading: scope.getByRole("heading").first(),
    state: scope.locator(".record-badge"),
    facts: scope.locator("dl"),
    status: scope.getByRole("status"),
    links: scope.locator("footer a"),
    fact(label: string) {
      return scope.locator("dt", { hasText: label }).locator("xpath=following-sibling::dd[1]");
    },
  };
}
export function recordTable(scope: Locator) {
  return {
    table: scope.getByRole("table"),
    caption: scope.locator("caption"),
    columnHeaders: scope.getByRole("columnheader"),
    rows: scope.locator("tbody tr"),
    area: scope.locator("figure"),
  };
}
