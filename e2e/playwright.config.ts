import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./features",
  globalSetup: "./core/setup.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: "list",
  use: { trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
