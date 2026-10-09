import { ExpectedError } from "./error.type.ts";
import { requireText } from "./text.check.ts";

export type FieldRule<T> = (value: unknown, field: string) => T;
type Values<R> = { [K in keyof R]: R[K] extends FieldRule<infer T> ? T : never };

function fieldError(field: string, message: string) {
  return new ExpectedError({ status: 400, message: "Invalid input", fields: { [field]: message } });
}
function asBody(input: unknown): Record<string, unknown> {
  return typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
}
function readField(input: { rule: FieldRule<unknown>; value: unknown; field: string }) {
  try {
    return { value: input.rule(input.value, input.field) };
  } catch (error) {
    if (!(error instanceof ExpectedError) || !error.details.fields) throw error;
    return { fields: error.details.fields };
  }
}
export function readFields<R extends Record<string, FieldRule<unknown>>>(input: unknown, rules: R) {
  const body = asBody(input);
  const values: Record<string, unknown> = {};
  const fields: Record<string, string> = {};
  for (const [field, rule] of Object.entries(rules)) {
    const result = readField({ rule, value: body[field], field });
    if ("value" in result) values[field] = result.value;
    else Object.assign(fields, result.fields);
  }
  if (Object.keys(fields).length > 0)
    throw new ExpectedError({ status: 400, message: "Invalid input", fields });
  return values as Values<R>;
}
export const text: FieldRule<string> = (value, field) => requireText({ value, field });
export function integerIn(minimum: number, maximum: number): FieldRule<number> {
  return (value, field) => {
    const valid = typeof value === "number" && Number.isInteger(value);
    if (valid && value >= minimum && value <= maximum) return value;
    throw fieldError(field, `${field} must be an integer from ${minimum} to ${maximum}`);
  };
}
export function oneOf<const T extends string>(options: readonly T[]): FieldRule<T> {
  return (value, field) => {
    const match = options.find((option) => option === value);
    if (match !== undefined) return match;
    throw fieldError(field, `${field} must be one of ${options.join(", ")}`);
  };
}
