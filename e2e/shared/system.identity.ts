import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export interface SystemIdentity {
  name: string;
  description: string;
  author: string;
  website: string;
  version: string;
}
interface SystemPackage {
  name: string;
  displayName?: string;
  description?: string;
  author?: string;
  homepage?: string;
  version: string;
}
export async function readSystemIdentity(frontDirectory: string): Promise<SystemIdentity> {
  const text = await readFile(resolve(frontDirectory, "../package.json"), "utf8");
  const system = JSON.parse(text) as SystemPackage;
  return {
    name: system.displayName ?? system.name,
    description: system.description ?? "",
    author: system.author ?? "AIDDbot",
    website: system.homepage ?? "https://aiddbot.com",
    version: system.version,
  };
}
