import type { PageContext } from "../../shared/page.type.ts";
import type { Fact } from "../../shared/record.type.ts";
import { createRecordCard } from "../../shared/components/record.card.ts";
import { createRecordDetail } from "../../shared/components/record.detail.ts";
import { loadHealth as loadHealthState } from "./health.store.ts";
import type { Health } from "./health.type.ts";

const title = "Health";
const unavailable = "Health unavailable";
const links = [{ label: "Health details", href: "/health" }] as const;

function healthFacts(health: Health): readonly Fact[] {
  return [
    { label: "Runs", kind: "number", value: health.runs, key: "runs" },
    { label: "Uptime", kind: "duration", value: health.uptime, key: "uptime" },
  ];
}
function loadHealth(context: PageContext) {
  return loadHealthState(context.services.http);
}
export async function renderHealthCard(context: PageContext) {
  const card = createRecordCard();
  card.loading(title, links);
  context.outlet.append(card);
  const state = await loadHealth(context);
  if (state.status !== "loaded") return card.fail({ title, message: unavailable, links });
  card.show({ title, state: state.health.status, facts: healthFacts(state.health), links });
}
export async function renderHealthPage(context: PageContext) {
  const detail = createRecordDetail();
  detail.loading(title, []);
  context.outlet.append(detail);
  const state = await loadHealth(context);
  if (state.status !== "loaded") return detail.fail({ title, message: unavailable, links: [] });
  detail.show({
    title,
    subtitle: "The state of the back-api",
    state: state.health.status,
    sections: [{ heading: "Service", facts: healthFacts(state.health) }],
    links: [],
  });
}
