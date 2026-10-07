import { identity } from "../../shared/identity.ts";
import { escapeHtml } from "../../shared/html.escape.ts";
import type { CardRegistration, PageContext } from "../../shared/page.type.ts";

export function createHomePage(cards: readonly CardRegistration[]) {
  return {
    async mount(context: PageContext) {
      const template = document.createElement("template");
      template.innerHTML = `<header id="home-header"><h1>${escapeHtml(identity.name)}</h1><p>${escapeHtml(identity.description)}</p><p>Version <span id="application-version">${escapeHtml(identity.version)}</span></p></header><section class="card-grid" aria-label="Application cards"></section>`;
      context.outlet.append(template.content.cloneNode(true));
      const grid = context.outlet.querySelector<HTMLElement>(".card-grid");
      if (!grid) throw new Error("Home template is incomplete");
      for (const registration of cards) {
        const card = await registration.load();
        await card.mount({ ...context, outlet: grid });
      }
    },
  };
}
