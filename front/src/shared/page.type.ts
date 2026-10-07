import type { HttpClient } from "./http.type.ts";
import type { ActionLogger } from "./logger.type.ts";

export type Access = "everyone" | "anonymous" | "session";
export interface PageServices {
  http: HttpClient;
  logger: ActionLogger;
  navigation: { navigate(path: string): void; afterLogin(): void };
}
export interface PageContext {
  outlet: HTMLElement;
  services: PageServices;
  parameters: Readonly<Record<string, string | undefined>>;
}
export interface PageRegistration {
  readonly path: string;
  readonly access: Access;
  readonly load: () => Promise<{ mount: (context: PageContext) => void | Promise<void> }>;
}
export interface MenuLink {
  path: string;
  label: string;
  access: Access;
}
export interface MenuControl {
  label: string;
  run(): Promise<void>;
}
export interface CardRegistration {
  load: () => Promise<{ mount: (context: PageContext) => void | Promise<void> }>;
}
export interface SessionPlatform {
  read(): { id: string; name: string } | undefined;
  subscribe(update: () => void): void;
  links(): readonly MenuLink[];
  controls(): readonly MenuControl[];
}
