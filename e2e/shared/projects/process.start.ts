import { fork, type ChildProcess } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { startCommand, stopCommand } from "./command.start.ts";
export interface ProjectSettings {
  directory: string;
  kind: "back" | "front";
  port: number;
  environment?: Record<string, string | undefined>;
  command?: string;
}
export interface CommandRuntime {
  start: typeof startCommand;
  stop: typeof stopCommand;
}
const commands: CommandRuntime = { start: startCommand, stop: stopCommand };
const stopTimeout = 5000;

function isCustomCommand(settings: ProjectSettings) {
  return Boolean(settings.command && settings.command !== "npm run start");
}
function createEnvironment(settings: ProjectSettings, temporary: string) {
  const environment = { ...process.env, ...settings.environment };
  delete environment.PORT;
  delete environment.DATABASE_URL;
  Object.assign(environment, settings.environment);
  const needsDatabase = settings.kind === "back" && !environment.DATABASE_URL;
  if (needsDatabase) environment.DATABASE_URL = join(temporary, "app.sqlite");
  return environment;
}
function spawnProject(
  settings: ProjectSettings,
  context: { runtime: CommandRuntime; temporary: string },
) {
  const options = {
    cwd: settings.directory,
    env: createEnvironment(settings, context.temporary),
    stdio: ["ignore", "pipe", "pipe", "ipc"] as ["ignore", "pipe", "pipe", "ipc"],
  };
  if (isCustomCommand(settings)) return context.runtime.start(settings.command ?? "", options);
  const entry = settings.kind === "back" ? "src/app.main.ts" : "server.ts";
  return fork(join(settings.directory, entry), [], { ...options, execArgv: [] });
}
function watchChild(child: ChildProcess) {
  const state = { output: "", failedStart: false };
  const append = (data: Buffer) => {
    state.output += data.toString();
  };
  child.stdout?.on("data", append);
  child.stderr?.on("data", append);
  child.on("error", (error) => {
    state.failedStart = true;
    state.output += error.message;
  });
  const exited = new Promise<number | null>((resolve) => {
    child.once("close", (code) => resolve(state.failedStart ? 1 : code));
  });
  return { state, exited };
}
function askToStop(child: ChildProcess, context: { runtime: CommandRuntime; isCustom: boolean }) {
  if (context.isCustom) return context.runtime.stop(child);
  if (child.exitCode === null && child.connected) child.send("shutdown");
  return Promise.resolve();
}
function forceStop(child: ChildProcess, context: { runtime: CommandRuntime; isCustom: boolean }) {
  if (context.isCustom) void context.runtime.stop(child);
  else child.kill();
}
export async function startProject(settings: ProjectSettings, runtime: CommandRuntime = commands) {
  const temporary = await mkdtemp(join(tmpdir(), "aidd-instance-"));
  const child = spawnProject(settings, { runtime, temporary });
  const { state, exited } = watchChild(child);
  const control = { runtime, isCustom: isCustomCommand(settings) };
  async function stopOwned() {
    await askToStop(child, control);
    const timeout = setTimeout(() => forceStop(child, control), stopTimeout);
    await exited;
    clearTimeout(timeout);
    await rm(temporary, { recursive: true, force: true });
  }
  let stopping: Promise<void> | undefined;
  return {
    url: `http://localhost:${settings.port}`,
    exited,
    get output() {
      return state.output;
    },
    get exitCode() {
      return state.failedStart ? 1 : child.exitCode;
    },
    stop: () => (stopping ??= stopOwned()),
  };
}
export async function waitForProject(
  instance: Awaited<ReturnType<typeof startProject>>,
  timeout: number,
) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (instance.exitCode !== null) throw new Error(`Project exited: ${instance.output}`);
    try {
      await fetch(instance.url, { signal: AbortSignal.timeout(500) });
      return;
    } catch {
      /* Startup polling. */
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Project startup timeout: ${instance.url} ${instance.output}`);
}
