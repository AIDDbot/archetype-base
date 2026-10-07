export type FactKind = "text" | "date" | "duration" | "number" | "link" | "list";
export type FactValue = string | number | readonly string[] | undefined;

export interface Fact {
  readonly label: string;
  readonly kind: FactKind;
  readonly value: FactValue;
  readonly key?: string;
  readonly href?: string;
  readonly external?: boolean;
}
export interface RecordLink {
  readonly label: string;
  readonly href: string;
}
export interface RecordSection {
  readonly heading: string;
  readonly facts: readonly Fact[];
}
export interface RecordCardDescription {
  readonly title: string;
  readonly subtitle?: string;
  readonly state?: string;
  readonly facts: readonly Fact[];
  readonly links: readonly RecordLink[];
}
export interface RecordDetailDescription {
  readonly title: string;
  readonly subtitle?: string;
  readonly state?: string;
  readonly sections: readonly RecordSection[];
}
export interface RecordColumn {
  readonly key: string;
  readonly label: string;
  readonly kind: FactKind;
  readonly isRowHeader?: boolean;
}
export interface RecordTableDescription {
  readonly caption: string;
  readonly columns: readonly RecordColumn[];
  readonly rows: readonly Readonly<Record<string, FactValue>>[];
  readonly empty: string;
}
