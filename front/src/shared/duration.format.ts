export function formatDuration(seconds: number) {
  const total = Math.floor(seconds);
  return new Intl.DurationFormat(undefined, { style: "short" }).format({
    hours: Math.floor(total / 3600),
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
  });
}
