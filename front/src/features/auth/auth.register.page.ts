import type { PageContext } from "../../shared/page.type.ts";
import { mountForm } from "./auth.component.ts";

export function mount(context: PageContext) {
  mountForm(context, "register");
}
