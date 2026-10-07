import type { PageContext } from "../../shared/page.type.ts";
import { ExpectedError } from "../../shared/error.type.ts";
import { PlatformElement } from "../../shared/components/platform.element.ts";
import { createAuthClient } from "./auth.client.ts";
import { createSubmission, setSession } from "./auth.store.ts";

class AuthForm extends PlatformElement {}
function renderFieldMessage(element: AuthForm, input: { name: string; message: string }) {
  const field = [...element.querySelectorAll<HTMLElement>("[data-field]")].find(
    (item) => item.dataset.field === input.name,
  );
  if (!field) return;
  field.textContent = input.message;
}
function renderAuthFailure(surface: { element: AuthForm; result: Element }, error: unknown) {
  surface.result.textContent =
    error instanceof ExpectedError ? error.message : "Authentication unavailable";
  if (!(error instanceof ExpectedError)) return;
  for (const [name, message] of Object.entries(error.details.fields ?? {})) {
    renderFieldMessage(surface.element, { name, message });
  }
}
export function mountForm(context: PageContext, operation: "register" | "login") {
  if (!customElements.get("auth-form")) customElements.define("auth-form", AuthForm);
  const element = new AuthForm();
  const template = document.createElement("template");
  const names = operation === "register" ? ["email", "name", "password"] : ["email", "password"];
  template.innerHTML = `<h1>${operation === "register" ? "Register" : "Login"}</h1><form>${names.map((name) => `<label>${name[0]!.toUpperCase() + name.slice(1)}<input name="${name}" type="${name === "password" ? "password" : name === "email" ? "email" : "text"}" required autocomplete="${name === "password" ? (operation === "register" ? "new-password" : "current-password") : name}"><small data-field="${name}" role="status"></small></label>`).join("")}<button type="submit">${operation === "register" ? "Register" : "Login"}</button><p role="status" id="form-result"></p></form>`;
  element.render(template);
  context.outlet.append(element);
  const form = element.querySelector("form");
  const button = element.querySelector("button");
  const result = element.querySelector("#form-result");
  if (!form || !button || !result) throw new Error("Auth template is incomplete");
  const submission = createSubmission();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity() || !submission.begin()) return;
    button.disabled = true;
    context.services.logger.action(operation, location.pathname);
    const values = Object.fromEntries(
      [...new FormData(form)].map(([name, value]) => [
        name,
        typeof value === "string" ? value : "",
      ]),
    );
    for (const field of element.querySelectorAll("[data-field]")) field.textContent = "";
    void createAuthClient(context.services.http)
      .submit(operation, values)
      .then((answer) => {
        if ("token" in answer) {
          setSession(answer);
          result.textContent = "Logged in";
          if (new URLSearchParams(location.search).has("returnTo"))
            context.services.navigation.afterLogin();
          return;
        }
        result.textContent = "Registration confirmed";
      })
      .catch((error: unknown) => renderAuthFailure({ element, result }, error))
      .finally(() => {
        submission.finish();
        button.disabled = false;
      });
  });
}
