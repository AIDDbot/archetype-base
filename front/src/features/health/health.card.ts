import type { PageContext } from "../../shared/page.type.ts";
import { renderHealthCard } from "./health.component.ts";

export async function mount(context: PageContext) {
  await renderHealthCard(context);
}
