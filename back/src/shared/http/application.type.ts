import type { Express, Router } from "express";
import type { Database } from "../database/database.type.ts";

export type HttpApplication = Express;
export interface ApplicationServices {
  database: Database;
  sessionTtlHours: number;
}
export interface RouteRegistration {
  basePath: string;
  isPublic?: boolean;
  register(application: Router): void;
}
export type SessionResolver = (token: string) => unknown;
