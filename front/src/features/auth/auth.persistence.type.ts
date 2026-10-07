export interface SessionPersistence {
  readToken(): string | null;
  writeToken(token: string): void;
  clearToken(): void;
}
export interface SessionPorts {
  persistence: SessionPersistence;
  notify(): void;
}
