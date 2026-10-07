import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import type { SpawnOptions } from "node:child_process";

import { stopProcessGroup } from "./group.stop.ts";
export function startCommand(command: string, options: SpawnOptions) {
  if (process.platform === "win32") {
    return spawn(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-File",
        fileURLToPath(new URL("./command.windows.ps1", import.meta.url)),
      ],
      {
        ...options,
        env: { ...options.env, AIDD_OWNED_COMMAND: command },
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
      },
    );
  }
  return spawn(command, {
    ...options,
    stdio: ["pipe", "pipe", "pipe"],
    shell: true,
    detached: true,
  });
}
export async function stopCommand(child: ReturnType<typeof spawn>) {
  if (process.platform === "win32") {
    if (child.exitCode === null) child.stdin?.end("shutdown\n");
    return;
  }
  if (!child.pid) return;
  await stopProcessGroup(child.pid);
}
