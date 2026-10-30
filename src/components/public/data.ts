import { cache } from "react";
import { db } from "@/server/db";
import { themeVars } from "@/collections";

// Casamento publico pelo slug, com as variaveis de tema ja montadas.
export const loadPublicWedding = cache(async (slug: string) => {
  const wedding = await db.wedding.findUnique({
    where: { slug },
    include: { site: true, events: { orderBy: [{ order: "asc" }, { startsAt: "asc" }] } },
  });
  if (!wedding) return null;
  const vars = themeVars(wedding.site?.collectionKey ?? "cereja", wedding.site?.fontPairKey);
  return { wedding, vars };
});

// "Mariana Costa Silva" -> "Mariana C. S." (busca publica nao expoe o nome inteiro)
export function maskName(name: string): string {
  const [first, ...rest] = name.trim().split(/\s+/);
  return [first, ...rest.map((p) => `${p[0].toUpperCase()}.`)].join(" ");
}
