import type { PageRegistration, PageServices, SessionPlatform } from "../shared/page.type.ts";
import { escapeHtml } from "../shared/html.escape.ts";

export function startRouter(options: {
  outlet: HTMLElement;
  pages: readonly PageRegistration[];
  services: PageServices;
  session: SessionPlatform;
  loginPath: string;
  markCurrent: (path: string) => void;
}) {
  const routes = options.pages.map((page) => ({
    page,
    pattern: new URLPattern({ pathname: page.path }),
  }));
  async function render(url: string) {
    const address = new URL(url);
    const match = routes
      .map((route) => ({ ...route, result: route.pattern.exec(url) }))
      .find((route) => route.result);
    if (match?.page.access === "session" && !options.session.read()) {
      options.services.navigation.navigate(
        options.loginPath +
          "?returnTo=" +
          encodeURIComponent(address.pathname + address.search + address.hash),
      );
      return;
    }
    options.outlet.replaceChildren();
    if (match?.result) {
      const page = await match.page.load();
      await page.mount({
        outlet: options.outlet,
        services: options.services,
        parameters: match.result.pathname.groups,
      });
    } else {
      options.outlet.innerHTML = `<h1>Page not found</h1><p>${escapeHtml(address.pathname)}</p><a href="/">Home</a>`;
    }
    options.markCurrent(address.pathname);
    options.services.logger.action("navigation", address.pathname);
  }
  navigation.addEventListener("navigate", (event) => {
    if (!event.canIntercept || event.hashChange || event.downloadRequest) return;
    event.intercept({ handler: () => render(event.destination.url) });
  });
  void render(location.href);
}
