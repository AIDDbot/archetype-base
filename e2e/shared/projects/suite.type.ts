export interface SuiteState {
  readonly projects: readonly { readonly url: string; readonly stop: () => Promise<void> }[];
}
