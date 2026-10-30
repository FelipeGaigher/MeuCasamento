import { db } from "@/server/db";
import { requireWedding } from "@/server/auth/current";
import { guestToken } from "@/lib/guest-link";

const STATUS = { PENDENTE: "Sem resposta", CONFIRMADO: "Confirmado", RECUSADO: "Não vai" } as const;

const cell = (v: string | number | null | undefined) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  const { wedding } = await requireWedding();
  const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const guests = await db.guest.findMany({ where: { weddingId: wedding.id }, include: { rsvp: true }, orderBy: { name: "asc" } });
  const header = ["Nome", "Grupo", "Família", "Telefone", "E-mail", "Resposta", "Adultos", "Crianças", "Recado", "Link"];
  const rows = guests.map((g) => [
    g.name,
    g.group,
    g.household,
    g.phone,
    g.email,
    STATUS[g.rsvp?.status ?? "PENDENTE"],
    g.rsvp?.status === "CONFIRMADO" ? g.rsvp.adults : "",
    g.rsvp?.status === "CONFIRMADO" ? g.rsvp.children : "",
    g.rsvp?.message,
    `${appUrl}/${wedding.slug}/c/${guestToken(g.id)}`,
  ]);
  // Ponto e virgula + BOM: abre direto no Excel em portugues.
  const csv = "﻿" + [header, ...rows].map((r) => r.map(cell).join(";")).join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="convidados-${wedding.slug}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
