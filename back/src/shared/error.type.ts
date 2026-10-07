export class ExpectedError extends Error {
  readonly details: { status: number; message: string; fields?: Record<string, string> };
  constructor(details: { status: number; message: string; fields?: Record<string, string> }) {
    super(details.message);
    this.details = details;
  }
}
