import type { NotificationChannel, NotificationKind } from "@prisma/client";
import { db } from "@/server/db";
import { formatBRL } from "@/lib/money";
import { evolutionConfigured, sendWhatsApp } from "./evolution";
import { brevoConfigured, sendEmail } from "./brevo";

// Avisos para o casal. O historico (Notification) guarda so canal, tipo,
// status e um erro curto: nunca telefone, e-mail ou texto da mensagem.
// Uma falha aqui nunca pode derrubar o pagamento ou a confirmacao.

type Message = { subject: string; text: string };

const appUrl = () => (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

async function deliver(
  wedding: { id: string; notifyPhone: string | null; notifyEmail: string | null },
  kind: NotificationKind,
  msg: Message,
) {
  const attempts: { channel: NotificationChannel; to: string | null; ready: boolean; why: string; send: (to: string) => Promise<void> }[] = [
    {
      channel: "WHATSAPP",
      to: wedding.notifyPhone,
      ready: evolutionConfigured(),
      why: "WhatsApp não configurado",
      send: (to) => sendWhatsApp(to, msg.text),
    },
    {
      channel: "EMAIL",
      to: wedding.notifyEmail,
      ready: brevoConfigured(),
      why: "E-mail não configurado",
      send: (to) => sendEmail(to, msg.subject, msg.text),
    },
  ];
  for (const a of attempts) {
    let status: "ENVIADA" | "FALHOU" | "IGNORADA" = "ENVIADA";
    let error: string | null = null;
    if (!a.to) {
      status = "IGNORADA";
      error = "Sem destino cadastrado";
    } else if (!a.ready) {
      status = "IGNORADA";
      error = a.why;
    } else {
      try {
        await a.send(a.to);
      } catch (e) {
        status = "FALHOU";
        error = (e instanceof Error ? e.message : "Erro").slice(0, 120);
      }
    }
    await db.notification
      .create({ data: { weddingId: wedding.id, channel: a.channel, kind, status, error } })
      .catch(() => console.error("notify: falha ao registrar", { weddingId: wedding.id, kind }));
  }
}

export async function notifyOrderPaid(orderId: string): Promise<void> {
  try {
    const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true, wedding: true } });
    if (!order || !order.wedding.notifyOnOrder) return;
    const items = order.items.map((i) => (i.quantity > 1 ? `${i.quantity}x ${i.title}` : i.title)).join(", ");
    const lines = [
      `Novo presente! ${order.buyerName} presenteou vocês com: ${items}.`,
      `Valor: ${formatBRL(order.totalCents)} (para vocês: ${formatBRL(order.coupleCents)}).`,
    ];
    if (order.message) lines.push("", `Recado: "${order.message}"`);
    lines.push("", `Ver no painel: ${appUrl()}/painel/pedidos`);
    await deliver(order.wedding, "PEDIDO_PAGO", { subject: `Novo presente de ${order.buyerName}`, text: lines.join("\n") });
  } catch {
    console.error("notifyOrderPaid falhou", { orderId });
  }
}

export async function notifyRsvp(rsvpId: string): Promise<void> {
  try {
    const rsvp = await db.rsvp.findUnique({ where: { id: rsvpId }, include: { guest: true, wedding: true } });
    if (!rsvp || !rsvp.wedding.notifyOnRsvp) return;
    const name = rsvp.guest.name;
    let text: string;
    if (rsvp.status === "CONFIRMADO") {
      const people = [`${rsvp.adults} ${rsvp.adults === 1 ? "adulto" : "adultos"}`];
      if (rsvp.children > 0) people.push(`${rsvp.children} ${rsvp.children === 1 ? "criança" : "crianças"}`);
      text = `${name} confirmou presença (${people.join(" e ")}).`;
    } else {
      text = `${name} avisou que não poderá ir.`;
    }
    if (rsvp.message) text += `\n\nRecado: "${rsvp.message}"`;
    text += `\n\nVer no painel: ${appUrl()}/painel/convidados`;
    await deliver(rsvp.wedding, "RSVP", {
      subject: rsvp.status === "CONFIRMADO" ? `${name} confirmou presença` : `${name} não poderá ir`,
      text,
    });
  } catch {
    console.error("notifyRsvp falhou", { rsvpId });
  }
}
