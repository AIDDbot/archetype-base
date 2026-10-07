export interface ProjectTechnology {
  readonly project: string;
  readonly type: string;
  readonly language: string;
  readonly framework: string;
  readonly libraries: readonly string[];
  readonly tests: readonly string[];
}
export const technologies: readonly ProjectTechnology[] = [
  {
    project: "back",
    type: "back-api",
    language: "TypeScript 7",
    framework: "Node.js 26 · Express 5",
    libraries: ["SQLite (node:sqlite)"],
    tests: ["node --test", "Supertest"],
  },
  {
    project: "front",
    type: "front-web",
    language: "HTML · CSS · TypeScript 7",
    framework: "Vite · Custom elements and template · Navigation API · URLPattern",
    libraries: ["Pico CSS", "Fontsource Roboto, Audiowide and Anonymous Pro"],
    tests: ["node --test"],
  },
  {
    project: "e2e",
    type: "e2e",
    language: "TypeScript 7",
    framework: "Node.js 26 · Playwright",
    libraries: ["Chromium"],
    tests: ["Playwright", "node --test"],
  },
];
