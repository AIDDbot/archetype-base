import { test, expect } from "../../shared/fixtures.ts";
import { authClient, uniqueCredentials } from "../../shared/auth.client.ts";
import { expectError } from "../../shared/error.check.ts";

test(
  "register returns only public user and role is always user",
  { tag: "@S0005-R01" },
  async ({ request, backUrl }) => {
    const values = uniqueCredentials();
    const response = await authClient(request, backUrl).register({ ...values, role: "admin" });
    expect(response.status()).toBe(201);
    expect(await response.json()).toEqual({
      id: expect.any(String),
      email: values.email,
      name: values.name,
      role: "user",
      createdAt: expect.any(String),
    });
  },
);
test(
  "register and login report every invalid field",
  { tag: "@S0005-R02" },
  async ({ request, backUrl }) => {
    const client = authClient(request, backUrl);
    for (const value of [undefined, "", "   ", 3, null, {}]) {
      const register = await client.register(
        value === undefined ? {} : { email: value, name: value, password: value },
      );
      expect(register.status()).toBe(400);
      const body = (await register.json()) as { fields: Record<string, string> };
      expectError(body);
      expect(Object.keys(body.fields).sort()).toEqual(["email", "name", "password"]);
      const login = await client.login(
        value === undefined ? {} : { email: value, password: value },
      );
      expect(login.status()).toBe(400);
      expect(Object.keys((await login.json()).fields).sort()).toEqual(["email", "password"]);
    }
  },
);
test(
  "duplicate email ignores case and preserves credentials",
  { tag: "@S0005-R03" },
  async ({ request, backUrl }) => {
    const client = authClient(request, backUrl);
    const values = uniqueCredentials();
    expect((await client.register(values)).status()).toBe(201);
    const duplicate = await client.register({
      ...values,
      email: values.email.toUpperCase(),
      name: "Changed",
      password: "different",
    });
    expect(duplicate.status()).toBe(409);
    expectError(await duplicate.json());
    const login = await client.login(values);
    expect(login.status()).toBe(200);
    expect((await login.json()).user.name).toBe(values.name);
  },
);
test(
  "valid login token resolves public user",
  { tag: ["@S0005-R04", "@S0005-R06"] },
  async ({ request, backUrl }) => {
    const client = authClient(request, backUrl);
    const values = uniqueCredentials();
    await client.register(values);
    const login = await client.login(values);
    expect(login.status()).toBe(200);
    const session = await login.json();
    expect(session.token).toEqual(expect.any(String));
    expect(session.token.length).toBeGreaterThan(0);
    const me = await client.me(session.token);
    expect(me.status()).toBe(200);
    expect(await me.json()).toEqual(session.user);
  },
);
test(
  "unknown email and wrong password have identical failures",
  { tag: "@S0005-R05" },
  async ({ request, backUrl }) => {
    const client = authClient(request, backUrl);
    const values = uniqueCredentials();
    await client.register(values);
    for (const input of [
      { email: values.email, password: "wrong" },
      { email: uniqueCredentials().email, password: values.password },
    ]) {
      const response = await client.login(input);
      expect(response.status()).toBe(401);
      expectError(await response.json(), "Invalid credentials");
    }
  },
);
test(
  "protected registration rejects absent or invalid token including subpaths",
  { tag: "@S0005-R07" },
  async ({ request, backUrl }) => {
    const client = authClient(request, backUrl);
    for (const token of [undefined, "invalid-token"]) {
      const response = await client.me(token);
      expect(response.status()).toBe(401);
      expectError(await response.json());
    }
    const nested = await request.get(`${backUrl}/api/auth/me/unknown`);
    expect(nested.status()).toBe(401);
    expectError(await nested.json());
  },
);
