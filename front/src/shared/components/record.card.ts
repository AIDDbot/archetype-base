import { PlatformElement } from "./platform.element.ts";
import { createBadge, createFacts, createFooterLinks, createStatus } from "./record.facts.ts";
import type { RecordCardDescription, RecordLink } from "../record.type.ts";

const skeleton = document.createElement("template");
skeleton.innerHTML =
  '<article class="record-card" aria-busy="true"><header><h2></h2></header><div class="record-body"></div><footer></footer></article>';

export class RecordCard extends PlatformElement {
  private piece(selector: string) {
    const element = this.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Record card has no ${selector}`);
    return element;
  }
  private frame(title: string, links: readonly RecordLink[]) {
    this.render(skeleton);
    this.piece("article").setAttribute("aria-label", title);
    this.piece("h2").textContent = title;
    this.piece("footer").replaceChildren(...createFooterLinks(links));
  }
  loading(title: string, links: readonly RecordLink[]) {
    this.frame(title, links);
  }
  show(description: RecordCardDescription) {
    this.frame(description.title, description.links);
    this.piece("article").removeAttribute("aria-busy");
    if (description.state) this.piece("header").append(createBadge(description.state));
    const body = this.piece(".record-body");
    if (description.subtitle) body.append(createStatus(description.subtitle));
    body.append(createFacts(description.facts));
  }
  fail(failure: { title: string; message: string; links: readonly RecordLink[] }) {
    this.frame(failure.title, failure.links);
    this.piece("article").removeAttribute("aria-busy");
    this.piece(".record-body").append(createStatus(failure.message));
  }
}
export function createRecordCard() {
  if (!customElements.get("record-card")) customElements.define("record-card", RecordCard);
  return new RecordCard();
}
