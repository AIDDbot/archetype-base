import type { ApplicationServices, RouteRegistration } from "../../shared/http/application.type.ts";
import { createAuthService } from "./auth.service.ts";
import { createAuthRepository } from "./auth.repository.ts";
import { readAuthInput } from "./auth.controller.ts";

export function registerAuth(services: ApplicationServices) {
  const auth = createAuthService({
    repository: createAuthRepository(services.database),
    sessionTtlHours: services.sessionTtlHours,
  });
  const registrations: readonly RouteRegistration[] = [
    {
      basePath: "/api/auth/logout",
      register(router) {
        router.post("/", (_request, response) => {
          auth.logout(String(response.locals.token));
          response.status(204).end();
        });
      },
    },
    {
      basePath: "/api/auth/register",
      isPublic: true,
      register(application) {
        application.post("/", async (request, response) => {
          response.status(201).json(await auth.register(readAuthInput(request.body, true)));
        });
      },
    },
    {
      basePath: "/api/auth/login",
      isPublic: true,
      register(application) {
        application.post("/", async (request, response) => {
          response.json(await auth.login(readAuthInput(request.body, false)));
        });
      },
    },
    {
      basePath: "/api/auth/me",
      register(application) {
        application.get("/", (_request, response) => {
          response.json(response.locals.user);
        });
      },
    },
  ];
  return { registrations, resolve: (token: string) => auth.resolve(token) };
}
