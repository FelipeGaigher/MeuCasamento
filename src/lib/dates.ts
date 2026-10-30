const TZ = "America/Sao_Paulo";

export const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" }).format(d);

export const formatDateLong = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);

export const formatTime = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(d).replace(":", "h");

export const formatDateTime = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(d);

// "2026-12-13" + "15:30" no fuso de Sao Paulo -> Date (UTC-3, sem horario de verao)
export function fromLocalInput(date: string, time: string): Date {
  return new Date(`${date}T${time || "00:00"}:00-03:00`);
}

// Date -> { date: "2026-12-13", time: "15:30" } no fuso de Sao Paulo
export function toLocalInput(d: Date): { date: string; time: string } {
  const local = new Date(d.getTime() - 3 * 60 * 60 * 1000).toISOString();
  return { date: local.slice(0, 10), time: local.slice(11, 16) };
}

export function daysUntil(d: Date, now = new Date()): number {
  return Math.ceil((d.getTime() - now.getTime()) / 86_400_000);
}
