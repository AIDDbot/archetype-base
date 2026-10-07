import type { ApplicationServices } from "../../shared/http/application.type.ts";
import { createRunRepository } from "./health.repository.ts";
import { createHealthService } from "./health.service.ts";

import type { Router } from "express";
export const registerHealth = (application: Router, services: ApplicationServices) => {
  const health = createHealthService(createRunRepository(services.database));
  application.get("/", (_request, response) => {
    response.json(health.read());
  });
};
