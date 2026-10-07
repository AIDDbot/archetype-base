import { test as base, expect } from "@playwright/test";

export const test = base.extend<{
  backUrl: string;
  frontUrl: string;
  backDirectory: string;
  frontDirectory: string;
}>({
  backUrl: async ({}, use) => {
    await use(process.env.BACK_BASE_URL!);
  },
  frontUrl: async ({}, use) => {
    await use(process.env.FRONT_BASE_URL!);
  },
  backDirectory: async ({}, use) => {
    await use(process.env.BACK_SOURCE_DIRECTORY!);
  },
  frontDirectory: async ({}, use) => {
    await use(process.env.FRONT_SOURCE_DIRECTORY!);
  },
});
export { expect };
