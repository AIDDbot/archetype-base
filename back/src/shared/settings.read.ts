export function readSetting<T>(input: {
  value: string | undefined;
  fallback: string;
  parse: (value: string) => T;
}): T {
  return input.parse(input.value ?? input.fallback);
}
