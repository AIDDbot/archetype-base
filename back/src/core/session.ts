import { Router } from "express";
import type { Express } from "express";
import type { RouteRegistration, SessionResolver } from "../shared/http/application.type.ts";
import { ExpectedError } from "../shared/error.type.ts";

export function mountRegistrations(
  application: Express,
  features: { registrations: readonly RouteRegistration[]; resolve: SessionResolver },
) {
  const ordered = [...features.registrations].sort(
    (first, second) => Number(Boolean(second.isPublic)) - Number(Boolean(first.isPublic)),
  );
  for (const registration of ordered) {
    const router = Router();
    if (!registration.isPublic)
      // oxlint-disable-next-line eslint/max-params -- Express session middleware requires request, response and continuation.
      router.use((request, response, next) => {
        const token = request.get("Authorization")?.match(/^Bearer (.+)$/)?.[1];
        const user = token ? features.resolve(token) : undefined;
        if (!user) {
          next(new ExpectedError({ status: 401, message: "Unauthorized" }));
          return;
        }
        response.locals.user = user;
        response.locals.token = token;
        next();
      });
    registration.register(router);
    application.use(registration.basePath, router);
  }
}
