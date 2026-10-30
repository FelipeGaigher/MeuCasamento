import type { EventKind } from "@prisma/client";

// Dados minimos de evento que o convite e o site precisam.
export type EventLite = {
  id: string;
  kind: EventKind;
  title: string;
  startsAt: Date;
  venueName: string;
  address: string;
  mapsUrl: string | null;
  dressCode: string | null;
  notes: string | null;
};

export function mapsHref(e: Pick<EventLite, "mapsUrl" | "address" | "venueName">): string {
  if (e.mapsUrl) return e.mapsUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venueName}, ${e.address}`)}`;
}

export { splitNames } from "@/lib/cms";
