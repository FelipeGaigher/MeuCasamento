import { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { computeSplit, splitConfigFromEnv } from "@/lib/split";
import { createPixCharge, isDemoPayments, AsaasError } from "@/server/payment/asaas";
import { notifyOrderPaid } from "@/server/notify";

export class OrderError extends Error {}

export type CartLine = { giftId: string; quantity: number };

export type CreateOrderInput = {
  weddingId: string;
  lines: CartLine[];
  buyerName: string;
  buyerEmail: string;
  buyerCpf?: string;
  message?: string;
};

// Pedido pendente reserva a unidade por este tempo; depois volta a ficar livre.
const PENDING_HOLD_MS = 2 * 60 * 60 * 1000;

// Quantas unidades de cada presente ja foram pagas ou estao reservadas.
export async function takenByGift(weddingId: string, giftIds?: string[]): Promise<Map<string, number>> {
  const since = new Date(Date.now() - PENDING_HOLD_MS);
  const rows = await db.orderItem.groupBy({
    by: ["giftId"],
    where: {
      weddingId,
      ...(giftIds ? { giftId: { in: giftIds } } : {}),
      order: { OR: [{ status: "PAGO" }, { status: "PENDENTE", createdAt: { gte: since } }] },
    },
    _sum: { quantity: true },
  });
  return new Map(rows.map((r) => [r.giftId, r._sum.quantity ?? 0]));
}

export async function createOrder(input: CreateOrderInput) {
  const lines = input.lines.filter((l) => Number.isInteger(l.quantity) && l.quantity > 0 && l.quantity <= 20);
  if (lines.length === 0) throw new OrderError("Seu carrinho está vazio.");
  const giftIds = [...new Set(lines.map((l) => l.giftId))];

  // Precos sempre do banco, nunca do navegador.
  const gifts = await db.gift.findMany({ where: { id: { in: giftIds }, weddingId: input.weddingId, active: true } });
  if (gifts.length !== giftIds.length) throw new OrderError("Algum presente do carrinho não está mais disponível. Atualize a página.");

  const taken = await takenByGift(input.weddingId, giftIds);
  const items = giftIds.map((id) => {
    const gift = gifts.find((g) => g.id === id)!;
    const quantity = lines.filter((l) => l.giftId === id).reduce((s, l) => s + l.quantity, 0);
    if (gift.quantity !== null && quantity > gift.quantity - (taken.get(id) ?? 0)) {
      throw new OrderError(`"${gift.title}" já foi escolhido por outro convidado. Escolha outro presente.`);
    }
    return { giftId: id, title: gift.title, unitCents: gift.priceCents, quantity };
  });
  const totalCents = items.reduce((s, i) => s + i.unitCents * i.quantity, 0);
  if (totalCents < 500) throw new OrderError("O valor mínimo por pedido é R$ 5,00.");
  const split = computeSplit(totalCents, splitConfigFromEnv());

  const demo = isDemoPayments();
  let walletId: string | null = null;
  if (!demo) {
    const payout = await db.payoutAccount.findUnique({ where: { weddingId: input.weddingId } });
    if (payout?.status !== "ATIVA" || !payout.walletId) {
      throw new OrderError("O casal ainda está ativando o recebimento. Tente novamente em breve.");
    }
    walletId = payout.walletId;
  }

  // Numero sequencial por casamento; a unique (weddingId, number) segura corrida.
  let order;
  for (let attempt = 0; ; attempt++) {
    try {
      order = await db.$transaction(async (tx) => {
        const last = await tx.order.aggregate({ where: { weddingId: input.weddingId }, _max: { number: true } });
        return tx.order.create({
          data: {
            weddingId: input.weddingId,
            number: (last._max.number ?? 0) + 1,
            buyerName: input.buyerName,
            buyerEmail: input.buyerEmail,
            message: input.message || null,
            totalCents: split.totalCents,
            feeCents: split.feeCents,
            coupleCents: split.coupleCents,
            method: "PIX",
            items: { create: items.map((i) => ({ ...i, weddingId: input.weddingId })) },
          },
        });
      });
      break;
    } catch (e) {
      if (attempt < 3 && e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      throw e;
    }
  }

  if (demo) return order;

  try {
    const charge = await createPixCharge({
      externalReference: order.id,
      description: `Presente para o casal (pedido ${order.number})`,
      totalCents: order.totalCents,
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail,
      buyerCpf: input.buyerCpf,
      coupleWalletId: walletId,
      coupleCents: order.coupleCents,
    });
    return db.order.update({
      where: { id: order.id },
      data: { gatewayId: charge.gatewayId, pixCopyPaste: charge.copyPaste, pixQrBase64: charge.qrBase64 },
    });
  } catch (e) {
    await db.order.update({ where: { id: order.id }, data: { status: "CANCELADO" } });
    console.error("createPixCharge falhou", { orderId: order.id });
    throw new OrderError(e instanceof AsaasError ? `Não foi possível gerar o Pix: ${e.message}` : "Não foi possível gerar o Pix. Tente de novo.");
  }
}

// Idempotente. Com paidCents informado, so marca se o valor bater com o pedido.
export async function markOrderPaid(orderId: string, paidCents?: number): Promise<"pago" | "ja-pago" | "valor-divergente" | "nao-encontrado"> {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return "nao-encontrado";
  if (order.status === "PAGO") return "ja-pago";
  if (paidCents !== undefined && paidCents !== order.totalCents) {
    console.error("markOrderPaid: valor divergente", { orderId });
    return "valor-divergente";
  }
  const updated = await db.order.updateMany({
    where: { id: orderId, status: { not: "PAGO" } },
    data: { status: "PAGO", paidAt: new Date() },
  });
  if (updated.count === 0) return "ja-pago";
  await notifyOrderPaid(orderId);
  return "pago";
}

export async function markOrderRefunded(orderId: string): Promise<void> {
  await db.order.updateMany({ where: { id: orderId, status: { not: "ESTORNADO" } }, data: { status: "ESTORNADO" } });
}
