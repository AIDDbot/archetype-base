import type { PageContext } from "../../shared/page.type.ts";
import type { RecordColumn } from "../../shared/record.type.ts";
import { PlatformElement } from "../../shared/components/platform.element.ts";
import { createRecordDetail } from "../../shared/components/record.detail.ts";
import { createRecordTable } from "../../shared/components/record.table.ts";
import { identity } from "../../shared/identity.ts";
import { technologies } from "./about.type.ts";

class AboutPage extends PlatformElement {}
const columns: readonly RecordColumn[] = [
  { key: "project", label: "Project", kind: "text", isRowHeader: true },
  { key: "type", label: "Type", kind: "text" },
  { key: "language", label: "Language", kind: "text" },
  { key: "framework", label: "Framework", kind: "text" },
  { key: "libraries", label: "Main libraries", kind: "list" },
  { key: "tests", label: "Test tools", kind: "list" },
];
function createTechnologyTable() {
  const table = createRecordTable();
  table.show({
    caption: "Technology of each project",
    columns,
    rows: technologies.map((project) => ({ ...project })),
    empty: "No projects",
  });
  return table;
}
export function mount(context: PageContext) {
  if (!customElements.get("about-page")) customElements.define("about-page", AboutPage);
  const page = new AboutPage();
  const detail = createRecordDetail();
  detail.show({
    title: `About ${identity.name}`,
    subtitle: identity.description,
    sections: [
      {
        heading: "Application",
        facts: [
          { label: "Version", kind: "text", value: identity.version, key: "version" },
          {
            label: "Author",
            kind: "link",
            value: identity.author,
            href: identity.website,
            external: true,
            key: "author",
          },
        ],
      },
    ],
    links: [],
  });
  detail.addSection("Technology", createTechnologyTable());
  page.append(detail);
  context.outlet.append(page);
}
