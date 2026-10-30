import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { createOrder, OrderError } from "@/server/orders";

const schema = z.object({
  lines: z.array(z.object({ giftId: z.string().min(1), quantity: z.number().int().min(1).max(20) })).min(1).max(50),
  buyerName: z.string().trim().min(2, "Informe seu nome.").max(120),
  buyerEmail: z.string().trim().toLowerCase().email("E-mail inválido."),
  buyerCpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v === "" || v.length === 11, "CPF inválido.")
    .optional(),
  message: z.string().trim().max(500).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const wedding = await db.wedding.findUnique({ where: { slug }, select: { id: true } });
  if (!wedding) return NextResponse.json({ error: "Casamento não encontrado." }, { status: 404 });
  try {
    const order = await createOrder({ weddingId: wedding.id, ...parsed.data, buyerCpf: parsed.data.buyerCpf || undefined });
    return NextResponse.json({ id: order.id });
  } catch (e) {
    if (e instanceof OrderError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("criar pedido falhou", { weddingId: wedding.id });
    return NextResponse.json({ error: "Não foi possível criar o pedido. Tente de novo." }, { status: 500 });
  }
}
