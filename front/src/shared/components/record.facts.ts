import { formatFact, missingValue } from "../record.format.ts";
import type { Fact } from "../record.type.ts";

function createLink(fact: Fact) {
  const link = document.createElement("a");
  link.href = fact.href ?? "";
  link.textContent = formatFact("text", fact.value);
  if (!fact.external) return link;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}
function createValue(fact: Fact) {
  const value = document.createElement("dd");
  if (fact.key) value.dataset.fact = fact.key;
  const text = formatFact(fact.kind, fact.value);
  const isLink = fact.kind === "link" && fact.href && text !== missingValue;
  if (isLink) value.append(createLink(fact));
  else value.textContent = text;
  return value;
}
export function createFacts(facts: readonly Fact[]) {
  const list = document.createElement("dl");
  list.className = "record-facts";
  for (const fact of facts) {
    const term = document.createElement("dt");
    term.textContent = fact.label;
    list.append(term, createValue(fact));
  }
  return list;
}
export function createBadge(state: string) {
  const badge = document.createElement("mark");
  badge.className = "record-badge";
  badge.textContent = state;
  return badge;
}
export function createStatus(message: string) {
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  status.textContent = message;
  return status;
}
