import type { Event } from "@prisma/client";

// Link do mapa: o informado pelo casal ou uma busca no Google Maps pelo endereco.
export function mapsLink(e: Pick<Event, "mapsUrl" | "venueName" | "address">) {
  return e.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venueName}, ${e.address}`)}`;
}
