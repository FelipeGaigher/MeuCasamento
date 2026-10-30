import { NextResponse } from "next/server";
import { isDemoPayments } from "@/server/payment/asaas";
import { markOrderPaid } from "@/server/orders";

// Modo demonstracao (sem ASAAS_API_KEY): simula o webhook de pagamento.
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isDemoPayments()) return NextResponse.json({ error: "Indisponível." }, { status: 404 });
  const { id } = await params;
  const result = await markOrderPaid(id);
  if (result === "nao-encontrado") return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
