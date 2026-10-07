import type { SuiteState } from "../shared/projects/suite.type.ts";

export async function stopSuite(state: SuiteState) {
  await Promise.all(state.projects.map((project) => project.stop()));
}
