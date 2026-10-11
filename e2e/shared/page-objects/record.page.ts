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
export function recordForm(scope: Locator) {
  const field = (label: string) => scope.getByLabel(label, { exact: true });
  const submit = scope.locator("button[type=submit]");
  async function fill(values: Record<string, string>) {
    for (const [label, value] of Object.entries(values)) {
      const control = field(label);
      const isSelect = await control.evaluate((element) => element.tagName === "SELECT");
      await (isSelect ? control.selectOption(value) : control.fill(value));
    }
  }
  return {
    scope,
    field,
    submit,
    result: scope.locator("[data-result]"),
    error: (name: string) => scope.locator(`[data-field="${name}"]`),
    fill,
    async send(values: Record<string, string>) {
      await fill(values);
      await submit.click();
    },
  };
}
