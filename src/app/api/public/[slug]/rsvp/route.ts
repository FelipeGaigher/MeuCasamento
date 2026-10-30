import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { guestToken, readGuestToken } from "@/lib/guest-link";
import { maskName } from "@/components/public/data";
import { notifyRsvp } from "@/server/notify";

type Ctx = { params: Promise<{ slug: string }> };

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Busca do convidado pelo nome. Devolve no maximo 5, com nome abreviado e o
// token assinado; nunca telefone ou e-mail.
export async function GET(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  const q = fold(req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 3) return NextResponse.json({ results: [] });
  const wedding = await db.wedding.findUnique({ where: { slug }, select: { id: true } });
  if (!wedding) return NextResponse.json({ error: "Casamento não encontrado." }, { status: 404 });
  const guests = await db.guest.findMany({
    where: { weddingId: wedding.id },
    select: { id: true, name: true, household: true, maxCompanions: true },
  });
  const words = q.split(/\s+/);
  const results = guests
    .filter((g) => {
      const name = fold(g.name);
      return words.every((w) => name.split(/\s+/).some((part) => part.startsWith(w)));
    })
    .slice(0, 5)
    .map((g) => ({ token: guestToken(g.id), name: maskName(g.name), household: g.household, limit: 1 + g.maxCompanions }));
  return NextResponse.json({ results });
}

const answerSchema = z.object({
  token: z.string().min(10),
  status: z.enum(["CONFIRMADO", "RECUSADO"]),
  adults: z.coerce.number().int().min(0).max(20),
  children: z.coerce.number().int().min(0).max(20),
  message: z.string().trim().max(500).optional(),
});

export async function POST(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  const parsed = answerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Confira os dados da resposta." }, { status: 400 });
  const d = parsed.data;
  const guestId = readGuestToken(d.token);
  const wedding = await db.wedding.findUnique({ where: { slug }, select: { id: true } });
  if (!guestId || !wedding) return NextResponse.json({ error: "Convite não encontrado." }, { status: 404 });
  const guest = await db.guest.findFirst({ where: { id: guestId, weddingId: wedding.id } });
  if (!guest) return NextResponse.json({ error: "Convite não encontrado." }, { status: 404 });

  const limit = 1 + guest.maxCompanions;
  const confirmed = d.status === "CONFIRMADO";
  const adults = confirmed ? Math.max(1, d.adults) : 0;
  const children = confirmed ? d.children : 0;
  if (adults + children > limit) {
    return NextResponse.json(
      { error: `Este convite é para até ${limit} ${limit === 1 ? "pessoa" : "pessoas"}.` },
      { status: 400 },
    );
  }
  const data = { status: d.status, adults, children, message: d.message || null, respondedAt: new Date() };
  const rsvp = await db.rsvp.upsert({
    where: { guestId: guest.id },
    create: { weddingId: wedding.id, guestId: guest.id, ...data },
    update: data,
  });
  await notifyRsvp(rsvp.id);
  return NextResponse.json({ ok: true, status: rsvp.status });
}
