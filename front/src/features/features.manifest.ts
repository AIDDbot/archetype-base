import { initializeAuth } from "./auth/auth.routes.ts";
import type {
  CardRegistration,
  MenuLink,
  PageRegistration,
  PageServices,
} from "../shared/page.type.ts";

export const cards: readonly CardRegistration[] = [
  { load: () => import("./health/health.card.ts") },
  { load: () => import("./auth/auth.card.ts") },
];
export const menu: readonly MenuLink[] = [
  { path: "/", label: "Home", access: "everyone" },
  { path: "/about", label: "About", access: "everyone" },
  { path: "/health", label: "Health", access: "everyone" },
  { path: "/login", label: "Login", access: "anonymous" },
  { path: "/register", label: "Register", access: "anonymous" },
];
export function registerPages(homeCards: readonly CardRegistration[]): readonly PageRegistration[] {
  return [
    { path: "/about", access: "everyone", load: () => import("./about/about.page.ts") },
    { path: "/users/:id", access: "session", load: () => import("./users/users.page.ts") },
    { path: "/login", access: "anonymous", load: () => import("./auth/auth.login.page.ts") },
    { path: "/register", access: "anonymous", load: () => import("./auth/auth.register.page.ts") },
    { path: "/health", access: "everyone", load: () => import("./health/health.page.ts") },
    {
      path: "/",
      access: "everyone",
      load: async () => (await import("./home/home.page.ts")).createHomePage(homeCards),
    },
  ];
}
export async function initializeFeatures(services: PageServices) {
  return { session: await initializeAuth(services), loginPath: "/login" };
}
