import { expect } from "@playwright/test";

export function expectError(body: unknown, message?: string) {
  expect(body).toEqual({
    error: message ?? expect.any(String),
    ...(typeof body === "object" && body !== null && "fields" in body
      ? { fields: expect.any(Object) }
      : {}),
  });
}
