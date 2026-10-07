import { requireText } from "./text.check.ts";

export class Email {
  readonly value: string;
  constructor(value: unknown) {
    this.value = requireText({ value, field: "email" }).toLowerCase();
  }
}
