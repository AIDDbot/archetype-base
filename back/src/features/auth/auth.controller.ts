import { Email } from "../../shared/email.value.ts";
import { readFields, text } from "../../shared/input.read.ts";

const loginRules = { email: text, password: text };
const registerRules = { email: text, name: text, password: text };
function rawPassword(input: unknown) {
  return String((input as { password?: unknown }).password);
}
export function readAuthInput(input: unknown, isRegister: boolean) {
  const values: { email: string; name?: string } = readFields(
    input,
    isRegister ? registerRules : loginRules,
  );
  return {
    email: new Email(values.email),
    name: values.name ?? "",
    password: rawPassword(input),
  };
}
