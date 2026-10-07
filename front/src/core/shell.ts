import { identity } from "../shared/identity.ts";
import type { MenuControl, MenuLink, PageServices, SessionPlatform } from "../shared/page.type.ts";
import { escapeHtml } from "../shared/html.escape.ts";
import { PlatformElement } from "../shared/components/platform.element.ts";
import { canAccess } from "./access.ts";

class ApplicationShell extends PlatformElement {}
type ShellOptions = {
  menu: readonly MenuLink[];
  services: PageServices;
  session: SessionPlatform;
};
function mountShell() {
  customElements.define("application-shell", ApplicationShell);
  const shell = new ApplicationShell();
  const template = document.createElement("template");
  template.innerHTML = `<header class="container"><nav aria-label="Main menu"><strong class="logo">${escapeHtml(identity.name)}</strong><ul id="menu-links"></ul><button type="button" id="theme-control" aria-label="Change theme">Theme</button></nav><p id="menu-error" role="status"></p></header><main class="container" id="page-outlet"></main>`;
  shell.render(template);
  document.body.append(shell);
  return shell;
}
function readShellElements(shell: ApplicationShell) {
  const outlet = shell.querySelector<HTMLElement>("#page-outlet");
  const control = shell.querySelector<HTMLButtonElement>("#theme-control");
  const menu = shell.querySelector("#menu-links");
  if (!outlet || !control || !menu) throw new Error("Shell template is incomplete");
  return { shell, outlet, control, menu };
}
type ShellElements = ReturnType<typeof readShellElements>;
function appendMenuLink(menu: Element, entry: MenuLink) {
  const item = document.createElement("li");
  const link = document.createElement("a");
  link.href = entry.path;
  link.textContent = entry.label;
  if (entry.access === "session") link.id = "visitor-name";
  item.append(link);
  menu.append(item);
}
function renderMenuLinks(surface: ShellElements, options: ShellOptions) {
  for (const entry of [...options.menu, ...options.session.links()]) {
    if (!canAccess(entry.access, Boolean(options.session.read()))) continue;
    appendMenuLink(surface.menu, entry);
  }
}
function showLogoutFailure(shell: ApplicationShell) {
  const message = shell.querySelector("#menu-error");
  if (message) message.textContent = "Logout unavailable";
}
function appendMenuControl(surface: ShellElements, entry: MenuControl) {
  const item = document.createElement("li");
  const button = document.createElement("button");
  button.textContent = entry.label;
  button.addEventListener("click", () => {
    button.disabled = true;
    void entry
      .run()
      .catch(() => showLogoutFailure(surface.shell))
      .finally(() => {
        button.disabled = false;
      });
  });
  item.append(button);
  surface.menu.append(item);
}
function markCurrent(shell: ApplicationShell, path: string) {
  for (const link of shell.querySelectorAll<HTMLAnchorElement>("nav a")) {
    if (link.pathname === path) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
}
function renderMenu(surface: ShellElements, options: ShellOptions) {
  surface.menu.replaceChildren();
  renderMenuLinks(surface, options);
  for (const entry of options.session.controls()) appendMenuControl(surface, entry);
  markCurrent(surface.shell, location.pathname);
}
function wireThemeControl(control: HTMLButtonElement, services: PageServices) {
  control.addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    services.logger.action("theme", theme);
  });
}
export function createShell(options: ShellOptions) {
  const surface = readShellElements(mountShell());
  wireThemeControl(surface.control, options.services);
  document.title = identity.name;
  const updateMenu = () => renderMenu(surface, options);
  updateMenu();
  options.session.subscribe(updateMenu);
  return {
    outlet: surface.outlet,
    markCurrent: (path: string) => markCurrent(surface.shell, path),
  };
}
