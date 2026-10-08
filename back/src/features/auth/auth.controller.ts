import { Email } from "../../shared/email.value.ts";
import { requireText } from "../../shared/text.check.ts";
import { ExpectedError } from "../../shared/error.type.ts";

type AuthField = "email" | "name" | "password";
type FieldResult = { value: string } | { fields: Record<string, string> | undefined };
const registerFields: readonly AuthField[] = ["email", "name", "password"];
const loginFields: readonly AuthField[] = ["email", "password"];
function readAuthText(input: { value: unknown; field: AuthField }): FieldResult {
  try {
    return { value: requireText(input) };
  } catch (error) {
    if (!(error instanceof ExpectedError)) throw error;
    return { fields: error.details.fields };
  }
}
function collectAuthFields(input: { body: Record<string, unknown>; names: readonly AuthField[] }) {
  const fields: Record<string, string> = {};
  const values: Record<string, string> = {};
  for (const field of input.names) {
    const result = readAuthText({ value: input.body[field], field });
    if ("value" in result) {
      values[field] = result.value;
      continue;
    }
    Object.assign(fields, result.fields);
  }
  if (Object.keys(fields).length)
    throw new ExpectedError({ status: 400, message: "Invalid input", fields });
  return values;
}
function asBody(input: unknown): Record<string, unknown> {
  const isObject = typeof input === "object" && input !== null;
  return isObject ? (input as Record<string, unknown>) : {};
}
export function readAuthInput(input: unknown, isRegister: boolean) {
  const body = asBody(input);
  const values = collectAuthFields({ body, names: isRegister ? registerFields : loginFields });
  return {
    email: new Email(values.email),
    name: values.name ?? "",
    password: String(body.password),
  };
}
