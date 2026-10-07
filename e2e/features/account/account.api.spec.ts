import { test, expect } from "../../shared/fixtures.ts";
import { authClient, uniqueCredentials } from "../../shared/auth.client.ts";
import { expectError } from "../../shared/error.check.ts";

test(
  "account shows only own public details and hides existing or missing foreign IDs",
  { tag: ["@S0006-R01", "@S0006-R02"] },
  async ({ request, backUrl }) => {
    const client = authClient(request, backUrl);
    const values = uniqueCredentials();
    const own = await (await client.register(values)).json();
    const other = await (await client.register(uniqueCredentials())).json();
    const session = await (await client.login(values)).json();
    const get = (id: string) =>
      request.get(`${backUrl}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
    const response = await get(own.id);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      name: own.name,
      email: own.email,
      createdAt: own.createdAt,
    });
    for (const id of [other.id, crypto.randomUUID()]) {
      const denied = await get(id);
      expect(denied.status()).toBe(404);
      expectError(await denied.json(), "Not found");
    }
  },
);
test(
  "account and logout need a valid session",
  { tag: "@S0006-R03" },
  async ({ request, backUrl }) => {
    const client = authClient(request, backUrl);
    for (const token of [undefined, "bad"]) {
      const response = await request.get(`${backUrl}/api/users/missing`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      expect(response.status()).toBe(401);
      expectError(await response.json());
      const logout = await client.logout(token);
      expect(logout.status()).toBe(401);
      expectError(await logout.json());
    }
  },
);
test(
  "logout revokes only current token and has no response body",
  { tag: "@S0006-R04" },
  async ({ request, backUrl }) => {
    const client = authClient(request, backUrl);
    const values = uniqueCredentials();
    await client.register(values);
    const first = await (await client.login(values)).json();
    const second = await (await client.login(values)).json();
    const logout = await client.logout(first.token);
    expect(logout.status()).toBe(204);
    expect(await logout.text()).toBe("");
    expect((await client.me(first.token)).status()).toBe(401);
    expect((await client.me(second.token)).status()).toBe(200);
  },
);
