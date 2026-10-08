import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { freePort } from "./port.find.ts";
import { startProject, waitForProject } from "./process.start.ts";

export interface RunSettings {
  kind: "back" | "front";
  directory: string;
  environment?: Record<string, string | undefined>;
}
export type RunningProject = Awaited<ReturnType<typeof startProject>>;

const startupTimeout = 15000;

/** Start a project on a free port, wait until it answers, use it, and always stop it. */
export async function runProject<T>(
  settings: RunSettings,
  use: (instance: RunningProject) => Promise<T>,
) {
  const port = await freePort();
  const environment = { ...settings.environment, PORT: String(port) };
  const instance = await startProject({ ...settings, port, environment });
  try {
    await waitForProject(instance, startupTimeout);
    return await use(instance);
  } finally {
    await instance.stop();
  }
}

/** Make an empty temporary directory, use it, and always remove it. */
export async function withTemporaryDirectory<T>(
  prefix: string,
  use: (directory: string) => Promise<T>,
) {
  const directory = await mkdtemp(join(tmpdir(), prefix));
  try {
    return await use(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
