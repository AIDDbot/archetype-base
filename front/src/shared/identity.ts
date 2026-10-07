import applicationPackage from "../../../package.json";

interface SystemPackage {
  name: string;
  displayName?: string;
  description?: string;
  author?: string;
  homepage?: string;
  version: string;
}
const system: SystemPackage = applicationPackage;
const defaults = { author: "AIDDbot", website: "https://aiddbot.com" };

export const identity = {
  name: system.displayName ?? system.name,
  description: system.description ?? "",
  author: system.author ?? defaults.author,
  website: system.homepage ?? defaults.website,
  version: system.version,
};
