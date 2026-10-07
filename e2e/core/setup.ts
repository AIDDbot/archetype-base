import { startProject, waitForProject } from "../shared/projects/process.start.ts";
import type { SuiteState } from "../shared/projects/suite.type.ts";
import { stopSuite } from "./lifecycle.ts";
import { readSuiteSettings } from "./settings.ts";

type SuiteProject = ReturnType<typeof readSuiteSettings>["projects"][number];
type OwnedProject = SuiteState["projects"][number];

function isAnswering(url: string) {
  return fetch(url, { signal: AbortSignal.timeout(500) }).then(
    () => true,
    () => false,
  );
}
async function checkProject(project: SuiteProject, url: string) {
  const endpoint = project.kind === "back" ? "/api/health" : "/";
  const response = await fetch(url + endpoint);
  if (!response.ok) throw new Error(`${project.kind} preflight failed: ${response.status}`);
}
function publishProject(project: SuiteProject, url: string) {
  const prefix = project.kind.toUpperCase();
  process.env[`${prefix}_BASE_URL`] = url;
  process.env[`${prefix}_SOURCE_DIRECTORY`] = project.directory;
}
function createPreparation(timeout: number, owned: OwnedProject[]) {
  return async (project: SuiteProject) => {
    const url = `http://localhost:${project.port}`;
    if (!(await isAnswering(url))) {
      const instance = await startProject(project);
      owned.push(instance);
      await waitForProject(instance, timeout);
    }
    await checkProject(project, url);
    publishProject(project, url);
  };
}
export default async function setup() {
  const settings = readSuiteSettings();
  const owned: OwnedProject[] = [];
  const prepare = createPreparation(settings.timeout, owned);
  try {
    for (const project of settings.projects) await prepare(project);
  } catch (error) {
    await stopSuite({ projects: owned });
    throw error;
  }
  return () => stopSuite({ projects: owned });
}
