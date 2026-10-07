import { PlatformElement } from "./platform.element.ts";
import { createBadge, createFacts, createFooterLinks, createStatus } from "./record.facts.ts";
import type {
  RecordDetailDescription,
  RecordFailure,
  RecordLink,
  RecordSection,
} from "../record.type.ts";

const skeleton = document.createElement("template");
skeleton.innerHTML =
  '<section class="record-detail" aria-busy="true"><header class="record-header"><hgroup><h1></h1></hgroup></header><div class="record-body"></div><footer></footer></section>';

function createSection(section: RecordSection) {
  const element = document.createElement("section");
  const heading = document.createElement("h2");
  heading.textContent = section.heading;
  element.append(heading, createFacts(section.facts));
  return element;
}
export class RecordDetail extends PlatformElement {
  private piece(selector: string) {
    const element = this.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Record detail has no ${selector}`);
    return element;
  }
  private frame(title: string, links: readonly RecordLink[]) {
    this.render(skeleton);
    this.piece("section").setAttribute("aria-label", title);
    this.piece("h1").textContent = title;
    const footer = this.piece("footer");
    if (links.length === 0) return footer.remove();
    footer.replaceChildren(...createFooterLinks(links));
  }
  loading(title: string, links: readonly RecordLink[]) {
    this.frame(title, links);
  }
  show(description: RecordDetailDescription) {
    this.frame(description.title, description.links);
    this.piece("section").removeAttribute("aria-busy");
    if (description.subtitle) {
      const subtitle = document.createElement("p");
      subtitle.textContent = description.subtitle;
      this.piece("hgroup").append(subtitle);
    }
    if (description.state) this.piece(".record-header").append(createBadge(description.state));
    this.piece(".record-body").append(...description.sections.map(createSection));
  }
  fail(failure: RecordFailure) {
    this.frame(failure.title, failure.links);
    this.piece("section").removeAttribute("aria-busy");
    this.piece(".record-body").append(createStatus(failure.message));
  }
  addSection(heading: string, content: HTMLElement) {
    const section = document.createElement("section");
    const title = document.createElement("h2");
    title.textContent = heading;
    section.append(title, content);
    this.piece(".record-body").append(section);
  }
}
export function createRecordDetail() {
  if (!customElements.get("record-detail")) customElements.define("record-detail", RecordDetail);
  return new RecordDetail();
}
