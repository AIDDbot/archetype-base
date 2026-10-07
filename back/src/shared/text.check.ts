import { ExpectedError } from "./error.type.ts";

export function requireText(input: { value: unknown; field: string }) {
  if (typeof input.value === "string" && input.value.trim().length > 0) return input.value.trim();
  const message = `${input.field} is required`;
  throw new ExpectedError({
    status: 400,
    message: "Invalid input",
    fields: { [input.field]: message },
  });
}
