import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { markOrderPaid, markOrderRefunded } from "@/server/orders";

function validToken(received: string | null): boolean {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expected || !received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

type AsaasEvent = { id?: string; event?: string; payment?: { id?: string; value?: number; externalReference?: string } };

export async function POST(req: NextRequest) {
  if (!validToken(req.headers.get("asaas-access-token"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as AsaasEvent | null;
  const payment = body?.payment;
  if (!body?.event || !payment?.id) return NextResponse.json({ ok: true, ignored: true });
  const eventId = body.id ?? `${body.event}:${payment.id}`;

  // Idempotencia: o mesmo evento so e processado uma vez.
  try {
    await db.webhookEvent.create({ data: { provider: "asaas", eventId } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    throw e;
  }

  try {
    const order = await db.order.findUnique({ where: { gatewayId: payment.id }, select: { id: true } });
    if (!order) return NextResponse.json({ ok: true, ignored: true });
    if (body.event === "PAYMENT_RECEIVED" || body.event === "PAYMENT_CONFIRMED") {
      const paidCents = typeof payment.value === "number" ? Math.round(payment.value * 100) : undefined;
      await markOrderPaid(order.id, paidCents);
    } else if (body.event === "PAYMENT_REFUNDED") {
      await markOrderRefunded(order.id);
    }
    return NextResponse.json({ ok: true });
  } catch {
    // Libera o evento para o Asaas reenviar.
    await db.webhookEvent.delete({ where: { provider_eventId: { provider: "asaas", eventId } } }).catch(() => {});
    console.error("webhook asaas falhou", { gatewayId: payment.id });
    return NextResponse.json({ error: "retry" }, { status: 500 });
  }
}
