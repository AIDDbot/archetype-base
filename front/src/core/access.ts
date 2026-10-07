import type { PageRegistration, Access } from "../shared/page.type.ts";

export function canAccess(access: Access, hasSession: boolean) {
  if (access === "everyone") return true;
  return access === "session" ? hasSession : !hasSession;
}
export function returnTarget(pages: readonly PageRegistration[], target: string | null) {
  if (!target?.startsWith("/") || target.startsWith("//")) return "/";
  const address = new URL(target, location.origin);
  if (address.origin !== location.origin) return "/";
  const page = pages.find((entry) => new URLPattern({ pathname: entry.path }).test(address));
  if (!page || page.access === "anonymous") return "/";
  return address.pathname + address.search + address.hash;
}
