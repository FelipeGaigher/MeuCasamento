import { NextResponse } from "next/server";
import { db } from "@/server/db";

// Status do pedido para a tela do Pix. So o necessario, sem dados do comprador.
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, select: { status: true } });
  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  return NextResponse.json({ status: order.status }, { headers: { "Cache-Control": "no-store" } });
}
