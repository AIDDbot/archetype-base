export class PlatformElement extends HTMLElement {
  render(template: HTMLTemplateElement) {
    this.replaceChildren(template.content.cloneNode(true));
  }
}

export function registerPlatformElement() {
  customElements.define("platform-element", PlatformElement);
}
