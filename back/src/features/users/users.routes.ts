import type { RouteRegistration } from "../../shared/http/application.type.ts";
import { readAccount } from "./users.service.ts";

export const usersRegistration: RouteRegistration = {
  basePath: "/api/users",
  register(router) {
    router.get("/:id", (request, response) => {
      response.json(readAccount({ id: request.params.id, user: response.locals.user }));
    });
  },
};
