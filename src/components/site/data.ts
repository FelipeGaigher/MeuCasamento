import { cache } from "react";
import { db } from "@/server/db";
import type { EventLite } from "./types";

// Casamento publico por slug, com site, convite e eventos (fonte unica de data e local).
export const loadPublicWedding = cache(async (slug: string) => {
  const wedding = await db.wedding.findUnique({
    where: { slug },
    include: {
      site: true,
      invitation: true,
      events: { orderBy: [{ startsAt: "asc" }, { order: "asc" }] },
    },
  });
  if (!wedding) return null;
  const events: EventLite[] = wedding.events.map((e) => ({
    id: e.id,
    kind: e.kind,
    title: e.title,
    startsAt: e.startsAt,
    venueName: e.venueName,
    address: e.address,
    mapsUrl: e.mapsUrl,
    dressCode: e.dressCode,
    notes: e.notes,
  }));
  return { wedding, events };
});

const dayMonthYear = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "numeric",
  month: "long",
  year: "numeric",
});

// "Ana & Pedro · 13 de dezembro de 2026"
export function shareTitle(coupleNames: string, first?: EventLite): string {
  return first ? `${coupleNames} · ${dayMonthYear.format(first.startsAt)}` : coupleNames;
}

export function shareDescription(first?: EventLite): string {
  if (!first) return "Convite, confirmação de presença e lista de presentes.";
  return `${first.venueName}, ${first.address}. Confirme sua presença e veja a lista de presentes.`;
}

export const formatDayMonthYear = (d: Date) => dayMonthYear.format(d);
