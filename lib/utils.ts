export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Parse yyyy-mm-dd as a local date (avoids timezone shifts). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function formatDate(iso: string, style: "long" | "short" = "long"): string {
  const date = parseISODate(iso);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  });
}

export function formatDateRange(start: string, end?: string): string {
  if (!end || end === start) return formatDate(start);
  const s = parseISODate(start);
  const e = parseISODate(end);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    const monthYear = s.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    return `${s.getDate()}–${e.getDate()} ${monthYear}`;
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}

/** Whole days from today until the given date (negative if past). */
export function daysUntil(iso: string): number {
  const target = parseISODate(iso);
  const today = startOfToday();
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function deadlineText(iso: string): { text: string; urgent: boolean; closed: boolean } {
  const days = daysUntil(iso);
  if (days < 0) return { text: "Registration closed", urgent: false, closed: true };
  if (days === 0) return { text: "Registration closes today", urgent: true, closed: false };
  if (days === 1) return { text: "Registration closes tomorrow", urgent: true, closed: false };
  return {
    text: `Registration closes in ${days} days`,
    urgent: days <= 5,
    closed: false,
  };
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
