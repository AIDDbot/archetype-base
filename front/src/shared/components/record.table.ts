import { PlatformElement } from "./platform.element.ts";
import { formatFact, isEndAligned, listMessage } from "../record.format.ts";
import type { FactValue, RecordColumn, RecordTableDescription } from "../record.type.ts";

function createHeaderCell(column: RecordColumn) {
  const cell = document.createElement("th");
  cell.scope = "col";
  cell.textContent = column.label;
  if (isEndAligned(column.kind)) cell.className = "record-end";
  return cell;
}
function createCell(column: RecordColumn, value: FactValue) {
  const cell = document.createElement(column.isRowHeader ? "th" : "td");
  if (column.isRowHeader) cell.setAttribute("scope", "row");
  if (isEndAligned(column.kind)) cell.className = "record-end";
  cell.textContent = formatFact(column.kind, value);
  return cell;
}
function createTable(description: RecordTableDescription) {
  const table = document.createElement("table");
  table.className = "striped";
  const caption = table.createCaption();
  caption.textContent = description.caption;
  const head = table.createTHead().insertRow();
  head.append(...description.columns.map(createHeaderCell));
  const body = table.createTBody();
  for (const row of description.rows) {
    const line = body.insertRow();
    line.append(...description.columns.map((column) => createCell(column, row[column.key])));
  }
  return table;
}
export class RecordTable extends PlatformElement {
  show(description: RecordTableDescription) {
    const figure = document.createElement("figure");
    figure.className = "record-table";
    const message = listMessage(description.rows.length, description.empty);
    if (message === undefined) figure.append(createTable(description));
    else {
      const empty = document.createElement("p");
      empty.setAttribute("role", "status");
      empty.textContent = message;
      figure.append(empty);
    }
    this.replaceChildren(figure);
  }
}
export function createRecordTable() {
  if (!customElements.get("record-table")) customElements.define("record-table", RecordTable);
  return new RecordTable();
}
