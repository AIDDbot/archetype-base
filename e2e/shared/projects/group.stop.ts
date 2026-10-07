export interface ProcessGroupBoundary {
  signal(group: number, signal: NodeJS.Signals | 0): void;
  wait(milliseconds: number): Promise<void>;
  now(): number;
}
const nativeBoundary: ProcessGroupBoundary = {
  signal(group, signal) {
    process.kill(group, signal);
  },
  wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  },
  now: Date.now,
};
function isGroupAlive(group: number, boundary: ProcessGroupBoundary) {
  try {
    boundary.signal(group, 0);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ESRCH") return false;
    throw error;
  }
}
export async function stopProcessGroup(
  pid: number,
  boundary: ProcessGroupBoundary = nativeBoundary,
) {
  const group = -pid;
  try {
    boundary.signal(group, "SIGKILL");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
  }
  const deadline = boundary.now() + 5000;
  while (isGroupAlive(group, boundary)) {
    if (boundary.now() >= deadline) throw new Error(`Owned process group ${pid} did not terminate`);
    await boundary.wait(50);
  }
}
