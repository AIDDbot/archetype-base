export function parseInteger(input: {
  value: string;
  field: string;
  minimum: number;
  maximum: number;
}) {
  const number = Number(input.value);
  const valid = /^\d+$/.test(input.value) && Number.isInteger(number);
  const inRange = number >= input.minimum && number <= input.maximum;
  if (!valid || !inRange)
    throw new Error(`${input.field} must be an integer from ${input.minimum} to ${input.maximum}`);
  return number;
}
