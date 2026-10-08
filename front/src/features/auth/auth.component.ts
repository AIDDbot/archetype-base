import type { PageContext } from "../../shared/page.type.ts";
import { ExpectedError } from "../../shared/error.type.ts";
import { PlatformElement } from "../../shared/components/platform.element.ts";
import { createAuthClient } from "./auth.client.ts";
import { createSubmission, setSession } from "./auth.store.ts";
import type { AuthSession, PublicUser } from "./auth.type.ts";

type AuthOperation = "register" | "login";
interface AuthSurface {
  element: AuthForm;
  form: HTMLFormElement;
  button: HTMLButtonElement;
  result: Element;
}
class AuthForm extends PlatformElement {}
const fieldTypes: Record<string, string> = { email: "email", name: "text", password: "password" };
function fieldNames(operation: AuthOperation) {
  return operation === "register" ? ["email", "name", "password"] : ["email", "password"];
}
function autocompleteOf(name: string, operation: AuthOperation) {
  if (name !== "password") return name;
  return operation === "register" ? "new-password" : "current-password";
}
function fieldMarkup(name: string, operation: AuthOperation) {
  const label = name[0]!.toUpperCase() + name.slice(1);
  const input = `<input name="${name}" type="${fieldTypes[name]}" required autocomplete="${autocompleteOf(name, operation)}">`;
  return `<label>${label}${input}<small data-field="${name}" role="status"></small></label>`;
}
function createTemplate(operation: AuthOperation) {
  const title = operation === "register" ? "Register" : "Login";
  const fields = fieldNames(operation)
    .map((name) => fieldMarkup(name, operation))
    .join("");
  const template = document.createElement("template");
  template.innerHTML = `<h1>${title}</h1><form>${fields}<button type="submit">${title}</button><p role="status" id="form-result"></p></form>`;
  return template;
}
function renderFieldMessage(element: AuthForm, input: { name: string; message: string }) {
  const field = [...element.querySelectorAll<HTMLElement>("[data-field]")].find(
    (item) => item.dataset.field === input.name,
  );
  if (!field) return;
  field.textContent = input.message;
}
function renderAuthFailure(surface: AuthSurface, error: unknown) {
  surface.result.textContent =
    error instanceof ExpectedError ? error.message : "Authentication unavailable";
  if (!(error instanceof ExpectedError)) return;
  for (const [name, message] of Object.entries(error.details.fields ?? {})) {
    renderFieldMessage(surface.element, { name, message });
  }
}
function renderAuthAnswer(
  context: PageContext,
  input: { result: Element; answer: PublicUser | AuthSession },
) {
  if (!("token" in input.answer)) {
    input.result.textContent = "Registration confirmed";
    return;
  }
  setSession(input.answer);
  input.result.textContent = "Logged in";
  if (new URLSearchParams(location.search).has("returnTo"))
    context.services.navigation.afterLogin();
}
function readValues(form: HTMLFormElement) {
  return Object.fromEntries(
    [...new FormData(form)].map(([name, value]) => [name, typeof value === "string" ? value : ""]),
  );
}
function mountSurface(context: PageContext, operation: AuthOperation): AuthSurface {
  if (!customElements.get("auth-form")) customElements.define("auth-form", AuthForm);
  const element = new AuthForm();
  element.render(createTemplate(operation));
  context.outlet.append(element);
  const form = element.querySelector("form");
  const button = element.querySelector("button");
  const result = element.querySelector("#form-result");
  if (!form || !button || !result) throw new Error("Auth template is incomplete");
  return { element, form, button, result };
}
export function mountForm(context: PageContext, operation: AuthOperation) {
  const surface = mountSurface(context, operation);
  const submission = createSubmission();
  surface.form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!surface.form.reportValidity() || !submission.begin()) return;
    surface.button.disabled = true;
    context.services.logger.action(operation, location.pathname);
    const values = readValues(surface.form);
    for (const field of surface.element.querySelectorAll("[data-field]")) field.textContent = "";
    void createAuthClient(context.services.http)
      .submit(operation, values)
      .then((answer) => renderAuthAnswer(context, { result: surface.result, answer }))
      .catch((error: unknown) => renderAuthFailure(surface, error))
      .finally(() => {
        submission.finish();
        surface.button.disabled = false;
      });
  });
}
