import type { PageContext } from "../../shared/page.type.ts";
import { createRecordForm, type FormField } from "../../shared/components/record.form.ts";
import { setSession, submitAuth } from "./auth.store.ts";
import type { AuthSession, PublicUser } from "./auth.type.ts";

type AuthOperation = "register" | "login";
const email: FormField = { name: "email", label: "Email", type: "email", autocomplete: "email" };
const name: FormField = { name: "name", label: "Name", autocomplete: "name" };
function password(operation: AuthOperation): FormField {
  const autocomplete = operation === "register" ? "new-password" : "current-password";
  return { name: "password", label: "Password", type: "password", autocomplete };
}
function describeForm(operation: AuthOperation) {
  const title = operation === "register" ? "Register" : "Login";
  const fields = operation === "register" ? [email, name] : [email];
  return { title, submit: title, fields: [...fields, password(operation)] };
}
function renderAnswer(context: PageContext, answer: PublicUser | AuthSession) {
  if (!("token" in answer)) return "Registration confirmed";
  setSession(answer);
  if (new URLSearchParams(location.search).has("returnTo"))
    context.services.navigation.afterLogin();
  return "Logged in";
}
export function mountForm(context: PageContext, operation: AuthOperation) {
  const form = createRecordForm("auth-form");
  form.show(describeForm(operation));
  context.outlet.append(form);
  form.onSubmit(async (values) => {
    context.services.logger.action(operation, location.pathname);
    return renderAnswer(context, await submitAuth(context.services.http, { operation, values }));
  }, "Authentication unavailable");
}
