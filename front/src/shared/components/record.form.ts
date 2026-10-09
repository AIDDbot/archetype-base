import { ExpectedError } from "../error.type.ts";
import { PlatformElement } from "./platform.element.ts";

export interface FormField {
  name: string;
  label: string;
  type?: string;
  autocomplete?: string;
  options?: readonly string[];
}
export interface RecordFormDescription {
  title: string;
  submit: string;
  fields: readonly FormField[];
}
export type FormSubmit = (values: Record<string, string>) => Promise<string>;

function createControl(field: FormField) {
  if (field.options) {
    const select = document.createElement("select");
    select.append(...field.options.map((option) => new Option(option, option)));
    return select;
  }
  const input = document.createElement("input");
  input.type = field.type ?? "text";
  if (field.autocomplete) input.autocomplete = field.autocomplete as AutoFill;
  return input;
}
function createField(field: FormField) {
  const control = createControl(field);
  control.name = field.name;
  control.required = true;
  control.setAttribute("aria-describedby", `${field.name}-error`);
  const message = document.createElement("small");
  Object.assign(message, { id: `${field.name}-error`, role: "status" });
  message.dataset.field = field.name;
  const label = document.createElement("label");
  label.append(field.label, control, message);
  return label;
}
export class RecordForm extends PlatformElement {
  private busy = false;
  private piece<T extends Element>(selector: string) {
    const element = this.querySelector<T>(selector);
    if (!element) throw new Error(`Record form has no ${selector}`);
    return element;
  }
  show(description: RecordFormDescription) {
    const title = document.createElement("h1");
    title.textContent = description.title;
    const form = document.createElement("form");
    const button = document.createElement("button");
    Object.assign(button, { type: "submit", textContent: description.submit });
    const result = document.createElement("p");
    Object.assign(result, { id: "form-result", role: "status" });
    form.append(...description.fields.map(createField), button, result);
    this.replaceChildren(title, form);
  }
  onSubmit(submit: FormSubmit, fallback: string) {
    this.piece("form").addEventListener("submit", (event) => {
      event.preventDefault();
      void this.send(submit, fallback);
    });
  }
  private async send(submit: FormSubmit, fallback: string) {
    if (this.busy || !this.piece<HTMLFormElement>("form").reportValidity()) return;
    this.setBusy(true);
    this.clearErrors();
    try {
      this.piece("#form-result").textContent = await submit(this.values());
    } catch (error) {
      this.fail(error, fallback);
    } finally {
      this.setBusy(false);
    }
  }
  private setBusy(busy: boolean) {
    this.busy = busy;
    this.piece<HTMLButtonElement>("button").disabled = busy;
    this.piece("form").setAttribute("aria-busy", String(busy));
  }
  private clearErrors() {
    for (const message of this.querySelectorAll("[data-field]")) message.textContent = "";
    for (const control of this.querySelectorAll("[aria-invalid]"))
      control.removeAttribute("aria-invalid");
  }
  values() {
    const entries = [...new FormData(this.piece<HTMLFormElement>("form"))];
    return Object.fromEntries(
      entries.map(([name, value]) => [name, typeof value === "string" ? value : ""]),
    );
  }
  fail(error: unknown, fallback: string) {
    const expected = error instanceof ExpectedError;
    this.piece("#form-result").textContent = expected ? error.message : fallback;
    if (!expected) return;
    for (const [name, message] of Object.entries(error.details.fields ?? {})) {
      const field = this.querySelector(`#${name}-error`);
      if (field) field.textContent = message;
      this.querySelector(`[name="${name}"]`)?.setAttribute("aria-invalid", "true");
    }
  }
}
export function createRecordForm(tag = "record-form") {
  if (!customElements.get(tag)) customElements.define(tag, class extends RecordForm {});
  return document.createElement(tag) as RecordForm;
}
