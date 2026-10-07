import { ExpectedError } from "./error.type.ts";

export function parseInteger(input: {
  value: string;
  field: string;
  minimum: number;
  maximum: number;
}) {
  const number = Number(input.value);
  const valid = /^\d+$/.test(input.value) && Number.isInteger(number);
  const inRange = number >= input.minimum && number <= input.maximum;
  if (!valid || !inRange) {
    const message = `${input.field} must be an integer from ${input.minimum} to ${input.maximum}`;
    throw new ExpectedError({ status: 400, message, fields: { [input.field]: message } });
  }
  return number;
}
