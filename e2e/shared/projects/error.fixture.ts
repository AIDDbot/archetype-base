import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";

export function startErrorHarness(environment: Record<string, string>) {
  const child = fork(
    fileURLToPath(new URL("../test-data/processes/error-harness.mjs", import.meta.url)),
    [],
    {
      env: { ...process.env, ...environment },
      stdio: ["ignore", "pipe", "pipe", "ipc"],
      execArgv: [],
    },
  );
  const exited = new Promise<number | null>((resolve) => child.once("close", resolve));
  let output = "";
  child.stdout?.on("data", (data: Buffer) => {
    output += data.toString();
  });
  child.stderr?.on("data", (data: Buffer) => {
    output += data.toString();
  });
  return {
    async stop() {
      if (child.exitCode === null && child.connected) child.send("shutdown");
      await exited;
    },
    exited,
    get output() {
      return output;
    },
  };
}
