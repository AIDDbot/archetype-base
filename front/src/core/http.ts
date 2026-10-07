import type { HttpClient } from "../shared/http.type.ts";

import { ExpectedError } from "../shared/error.type.ts";
export async function createHttpClient(): Promise<HttpClient> {
  const configuration: unknown = await (await fetch("/runtime-config.json")).json();
  const baseUrl = (configuration as { apiBaseUrl: string }).apiBaseUrl;
  return {
    async request(path, options = {}) {
      const controller = new AbortController();
      const headers = new Headers(options.headers);
      const token = localStorage.getItem("session-token");
      if (token) headers.set("Authorization", "Bearer " + token);
      const response = await fetch(new URL(path, baseUrl), {
        ...options,
        headers,
        signal: options.signal ?? controller.signal,
      });
      if (response.ok) return response;
      const body = (await response.json()) as { error: string; fields?: Record<string, string> };
      throw new ExpectedError({
        status: response.status,
        message: body.error,
        ...(body.fields ? { fields: body.fields } : {}),
      });
    },
  };
}
