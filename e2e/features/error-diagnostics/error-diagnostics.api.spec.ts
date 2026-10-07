import { test, expect } from "../../shared/fixtures.ts";
import { startErrorHarness } from "../../shared/projects/error.fixture.ts";
import { freePort } from "../../shared/projects/port.find.ts";
import { expectError } from "../../shared/error.check.ts";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

test(
  "unexpected failures distinguish safe causes without secret attachments or client internals",
  { tag: ["@S0011-R01", "@S0011-R02", "@S0011-R03"] },
  async ({ request }) => {
    const directory = await mkdtemp(join(tmpdir(), "error-diagnostics-"));
    const port = await freePort();
    const secrets = {
      SECRET_PASSWORD: "password-" + crypto.randomUUID(),
      SECRET_TOKEN: "token-" + crypto.randomUUID(),
      SECRET_FORM: "form-" + crypto.randomUUID(),
    };
    const instance = startErrorHarness({ PORT: String(port), LOG_DIR: directory, ...secrets });
    try {
      await expect
        .poll(async () =>
          fetch(`http://localhost:${port}`).then(
            () => true,
            () => false,
          ),
        )
        .toBe(true);
      for (const kind of ["first", "second"]) {
        const response = await request.post(`http://localhost:${port}/api/failure/${kind}`, {
          headers: { Authorization: `Bearer ${secrets.SECRET_TOKEN}` },
          data: { password: secrets.SECRET_PASSWORD, formValue: secrets.SECRET_FORM },
        });
        expect(response.status()).toBe(500);
        expectError(await response.json(), "Internal server error");
        const body = await response.text();
        expect(body).not.toMatch(/Safe|stack|SQL|\.ts/);
        for (const secret of Object.values(secrets)) expect(body).not.toContain(secret);
      }
      await instance.stop();
      expect(await instance.exited).toBe(0);
      const files = await readdir(directory);
      const lines = (await readFile(join(directory, files[0]!), "utf8")).trim().split("\n");
      const diagnostics = lines.filter((line) => line.includes("Unexpected request failure:"));
      expect(diagnostics).toHaveLength(2);
      expect(diagnostics[0]).toContain("Safe first failure | continued detail");
      expect(diagnostics[0]).toContain("Safe storage cause");
      expect(diagnostics[1]).toContain("Safe second failure");
      expect(diagnostics[1]).toContain("Safe connection cause");
      expect(diagnostics[0]).not.toBe(diagnostics[1]);
      for (const diagnostic of diagnostics)
        expect(diagnostic).toMatch(/^\d{2}:\d{2}:\d{2}\.\d{3} back ERROR /);
      for (const secret of Object.values(secrets)) {
        expect(lines.join("\n")).not.toContain(secret);
        expect(instance.output).not.toContain(secret);
      }
    } finally {
      await instance.stop();
      await rm(directory, { recursive: true, force: true });
    }
  },
);
