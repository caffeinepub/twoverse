// Utility helpers used across TwoVerse pages

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function getDayOfYear(date: Date): bigint {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return BigInt(Math.floor(diff / oneDay));
}

export function computeDaysTogether(startDate: string): number {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function getNextAnniversary(
  startDate: string,
): { years: number; date: Date; daysAway: number } | null {
  if (!startDate) return null;
  const start = new Date(startDate);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let next = new Date(start);
  next.setFullYear(start.getFullYear() + years);
  if (next <= now) {
    years += 1;
    next = new Date(start);
    next.setFullYear(start.getFullYear() + years);
  }
  const daysAway = Math.ceil(
    (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return { years, date: next, daysAway };
}

export function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTimestamp(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
