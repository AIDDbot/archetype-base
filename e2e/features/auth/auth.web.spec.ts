import { test, expect } from "../../shared/fixtures.ts";
import { authClient, uniqueCredentials } from "../../shared/auth.client.ts";
import { authPage } from "../../shared/page-objects/auth.page.ts";

test(
  "registration confirms then duplicate error permits retry",
  { tag: "@S0005-R08" },
  async ({ page, frontUrl }) => {
    const values = uniqueCredentials();
    await page.goto(frontUrl + "/register");
    const form = authPage(page);
    await form.fill(values);
    await form.submit.click();
    await expect(form.result).toHaveText("Registration confirmed");
    await form.submit.click();
    await expect(form.result).toHaveText("Email already registered");
    await form.email.fill(uniqueCredentials().email);
    await form.submit.click();
    await expect(form.result).toHaveText("Registration confirmed");
  },
);
test(
  "login handles failure retry updates menu and persists reload",
  { tag: ["@S0005-R09", "@S0005-R10"] },
  async ({ page, request, backUrl, frontUrl }) => {
    const values = uniqueCredentials();
    await authClient(request, backUrl).register(values);
    await page.goto(frontUrl + "/login");
    const form = authPage(page);
    await form.fill({ email: values.email, password: "incorrect" });
    await form.submit.click();
    await expect(form.result).toHaveText("Invalid credentials");
    await form.password.fill(values.password);
    await form.submit.click();
    await expect(page.locator("#visitor-name")).toHaveText(values.name);
    await page.reload();
    await expect(page.locator("#visitor-name")).toHaveText(values.name);
  },
);
test("rapid submits send only one request", { tag: "@S0005-R11" }, async ({ page, frontUrl }) => {
  let requests = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/api/auth/register") && request.method() === "POST") requests++;
  });
  await page.goto(frontUrl + "/register");
  await authPage(page).fill(uniqueCredentials());
  await page.locator("auth-form button").evaluate((button: HTMLButtonElement) => {
    button.click();
    button.click();
  });
  await expect(authPage(page).result).toHaveText("Registration confirmed");
  expect(requests).toBe(1);
});
test(
  "SPA auth pages send their displayed operation",
  { tag: "@S0005-R12" },
  async ({ page, frontUrl }) => {
    const values = uniqueCredentials();
    const paths: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "POST") paths.push(new URL(request.url()).pathname);
    });
    await page.goto(frontUrl + "/login");
    await page.getByRole("navigation").getByRole("link", { name: "Register", exact: true }).click();
    await authPage(page).fill(values);
    await authPage(page).submit.click();
    await expect(authPage(page).result).toHaveText("Registration confirmed");
    await page.getByRole("navigation").getByRole("link", { name: "Login", exact: true }).click();
    await authPage(page).fill({ email: values.email, password: values.password });
    await authPage(page).submit.click();
    await expect(authPage(page).result).toHaveText("Logged in");
    expect(paths).toEqual(["/api/auth/register", "/api/auth/login"]);
  },
);
test(
  "register field errors display beside their fields",
  { tag: "@S0005-R13" },
  async ({ page, frontUrl }) => {
    await page.goto(frontUrl + "/register");
    await authPage(page).fill({ ...uniqueCredentials(), name: "   " });
    await authPage(page).submit.click();
    await expect(
      page
        .locator("label")
        .filter({ has: page.locator("input[name=name]") })
        .locator("[data-field=name]"),
    ).toHaveText("name is required");
  },
);
test(
  "auth card has visitor links or signed-in greeting",
  { tag: "@S0005-R14" },
  async ({ page, request, backUrl, frontUrl }) => {
    await page.goto(frontUrl);
    const card = page.getByRole("article", { name: "Authentication" });
    await expect(card.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(card.getByRole("link", { name: "Register" })).toBeVisible();
    const values = uniqueCredentials();
    await authClient(request, backUrl).register(values);
    await card.getByRole("link", { name: "Login" }).click();
    await authPage(page).fill({ email: values.email, password: values.password });
    await authPage(page).submit.click();
    await expect(page.locator("#visitor-name")).toHaveText(values.name);
    await page.getByRole("navigation").getByRole("link", { name: "Home" }).click();
    await expect(page.getByRole("article", { name: "Authentication" })).toContainText(
      `Hello, ${values.name}`,
    );
  },
);
test(
  "submit logs operation before response without credentials",
  { tag: "@S0005-R15" },
  async ({ page, frontUrl }) => {
    const values = uniqueCredentials();
    const lines: string[] = [];
    page.on("console", (message) => lines.push(message.text()));
    await page.route("**/api/auth/register", async (route) => {
      expect(lines).toContain("register /register");
      await route.continue();
    });
    await page.goto(frontUrl + "/register");
    await authPage(page).fill(values);
    await authPage(page).submit.click();
    await expect(authPage(page).result).toHaveText("Registration confirmed");
    expect(lines.join("\n")).not.toContain(values.email);
    expect(lines.join("\n")).not.toContain(values.password);
  },
);
