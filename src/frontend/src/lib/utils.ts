import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function getDayOfYear(date: Date): bigint {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return BigInt(Math.floor(diff / oneDay));
}

export function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function computeDaysTogether(startDate: string): number {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  if (diff < 0) return 0;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  const d = new Date(ms);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  const hh = h % 12 || 12;
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm}${ampm}`;
}

export function formatDate(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  const d = new Date(ms);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getNextAnniversary(
  startDate: string,
): { date: Date; daysAway: number; years: number } | null {
  if (!startDate) return null;
  const start = new Date(startDate);
  const now = new Date();
  let year = now.getFullYear();
  let next = new Date(year, start.getMonth(), start.getDate());
  if (next <= now) {
    year += 1;
    next = new Date(year, start.getMonth(), start.getDate());
  }
  const daysAway = Math.ceil(
    (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const years = year - start.getFullYear();
  return { date: next, daysAway, years };
}
