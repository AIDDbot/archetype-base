import type { APIRequestContext } from "@playwright/test";

export function authClient(request: APIRequestContext, baseUrl: string) {
  return {
    register(values: Record<string, unknown>) {
      return request.post(`${baseUrl}/api/auth/register`, { data: values });
    },
    login(values: Record<string, unknown>) {
      return request.post(`${baseUrl}/api/auth/login`, { data: values });
    },
    logout(token?: string) {
      return request.post(baseUrl + "/api/auth/logout", {
        headers: token ? { Authorization: "Bearer " + token } : {},
      });
    },
    me(token?: string) {
      return request.get(`${baseUrl}/api/auth/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
  };
}
export function uniqueCredentials() {
  return {
    email: `user-${crypto.randomUUID()}@example.test`,
    name: "Test User",
    password: `secret-${crypto.randomUUID()}`,
  };
}
