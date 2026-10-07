import { formatDate } from "./date.format.ts";
import { formatDuration } from "./duration.format.ts";
import type { FactKind, FactValue } from "./record.type.ts";

export const missingValue = "—";
const numberFormat = new Intl.NumberFormat();

function isMissing(value: FactValue) {
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  return String(value).trim() === "";
}
function formatPresent(kind: FactKind, value: Exclude<FactValue, undefined>) {
  if (Array.isArray(value)) return value.join(", ");
  if (kind === "date") return formatDate(String(value));
  if (kind === "duration") return formatDuration(Number(value));
  if (kind === "number") return numberFormat.format(Number(value));
  return String(value);
}
export function formatFact(kind: FactKind, value: FactValue) {
  if (isMissing(value) || value === undefined) return missingValue;
  return formatPresent(kind, value);
}
export function isEndAligned(kind: FactKind) {
  return kind === "number" || kind === "date" || kind === "duration";
}
export function listMessage(rowCount: number, empty: string) {
  return rowCount === 0 ? empty : undefined;
}
