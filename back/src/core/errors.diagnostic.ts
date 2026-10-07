export function describeFailure(error: unknown) {
  if (!(error instanceof Error)) return typeof error;
  const messages: string[] = [];
  const visited = new Set<Error>();
  let current: Error | undefined = error;
  while (current && !visited.has(current)) {
    visited.add(current);
    messages.push(`${current.name}: ${current.message}`);
    const cause: unknown = current.cause;
    if (cause !== undefined && !(cause instanceof Error))
      messages.push(`cause type: ${typeof cause}`);
    current = cause instanceof Error ? cause : undefined;
  }
  return messages.join(" <- caused by ");
}
