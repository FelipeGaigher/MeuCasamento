import Link from "next/link";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { db } from "@/server/db";
import { requireWedding } from "@/server/auth/current";
import { Badge, Card, Figure, PageHeader, buttonClass } from "@/components/ui";
import { formatBRL } from "@/lib/money";
import { daysUntil, formatDateLong, formatDateTime } from "@/lib/dates";

const RSVP_TONE = { CONFIRMADO: "ok", RECUSADO: "danger", PENDENTE: "neutral" } as const;
const RSVP_LABEL = { CONFIRMADO: "Confirmou", RECUSADO: "Não vai", PENDENTE: "Pendente" } as const;

export default async function PainelPage() {
  const { wedding } = await requireWedding();
  const w = wedding.id;

  const [guestCount, confirmed, paid, pendingOrders, giftCount, firstEvent, invitation, payout, recentOrders, recentRsvps] =
    await Promise.all([
      db.guest.count({ where: { weddingId: w } }),
      db.rsvp.aggregate({ where: { weddingId: w, status: "CONFIRMADO" }, _sum: { adults: true, children: true } }),
      db.order.aggregate({ where: { weddingId: w, status: "PAGO" }, _sum: { coupleCents: true }, _count: true }),
      db.order.count({ where: { weddingId: w, status: "PENDENTE" } }),
      db.gift.count({ where: { weddingId: w, active: true } }),
      db.event.findFirst({ where: { weddingId: w }, orderBy: [{ startsAt: "asc" }] }),
      db.invitation.findUnique({ where: { weddingId: w }, select: { publishedAt: true } }),
      db.payoutAccount.findUnique({ where: { weddingId: w }, select: { status: true } }),
      db.order.findMany({ where: { weddingId: w, status: "PAGO" }, orderBy: { paidAt: "desc" }, take: 5 }),
      db.rsvp.findMany({
        where: { weddingId: w, respondedAt: { not: null } },
        orderBy: { respondedAt: "desc" },
        take: 5,
        include: { guest: { select: { name: true } } },
      }),
    ]);

  const people = (confirmed._sum.adults ?? 0) + (confirmed._sum.children ?? 0);
  const days = firstEvent ? daysUntil(firstEvent.startsAt) : null;

  const steps = [
    { done: !!firstEvent?.venueName && !!firstEvent?.address, label: "Cadastrar data, horário e local", href: "/painel/evento" },
    { done: !!invitation?.publishedAt, label: "Revisar e publicar o convite", href: "/painel/convite" },
    { done: giftCount > 0, label: "Adicionar o primeiro presente", href: "/painel/presentes" },
    { done: guestCount > 0, label: "Cadastrar convidados", href: "/painel/convidados" },
    { done: payout?.status === "ATIVA", label: "Ativar a conta de recebimento", href: "/painel/recebimento" },
    { done: !!wedding.notifyPhone, label: "Informar o WhatsApp para avisos", href: "/painel/notificacoes" },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <>
      <PageHeader
        title={wedding.coupleNames}
        description={
          firstEvent
            ? `${formatDateLong(firstEvent.startsAt)}${days !== null && days >= 0 ? ` · faltam ${days} ${days === 1 ? "dia" : "dias"}` : ""}`
            : "Cadastre a data do evento para começar."
        }
        actions={
          <>
            <Link href={`/${wedding.slug}`} target="_blank" className={buttonClass("secondary")}>
              Ver site <ExternalLink className="size-4" aria-hidden />
            </Link>
            <Link href={`/${wedding.slug}/convite`} target="_blank" className={buttonClass("secondary")}>
              Ver convite <ExternalLink className="size-4" aria-hidden />
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Figure label="Convidados" value={guestCount} />
        <Figure label="Pessoas confirmadas" value={people} hint="Adultos e crianças" />
        <Figure label="Recebido em presentes" value={formatBRL(paid._sum.coupleCents ?? 0)} hint={`${paid._count} presentes pagos`} />
        <Figure label="Pedidos pendentes" value={pendingOrders} hint="Aguardando pagamento" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="t-section">Próximos passos</h2>
            <span className="t-meta">{doneCount} de {steps.length}</span>
          </div>
          <ul className="mt-3 flex flex-col">
            {steps.map((s) => (
              <li key={s.label}>
                <Link href={s.href} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-canvas">
                  {s.done ? (
                    <CheckCircle2 className="size-5 shrink-0 text-ok" aria-label="Feito" />
                  ) : (
                    <Circle className="size-5 shrink-0 text-muted" aria-label="Pendente" />
                  )}
                  <span className={s.done ? "t-body text-muted line-through" : "t-body"}>{s.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="t-section">Últimos presentes</h2>
              <Link href="/painel/pedidos" className="t-label text-brand">Ver todos</Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="t-body mt-3 text-muted">Nenhum presente pago ainda.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {recentOrders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="t-item truncate">{o.buyerName}</p>
                      <p className="t-meta">{o.paidAt ? formatDateTime(o.paidAt) : ""}</p>
                    </div>
                    <span className="t-item tabular-nums">{formatBRL(o.coupleCents)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="t-section">Últimas respostas</h2>
              <Link href="/painel/convidados" className="t-label text-brand">Ver convidados</Link>
            </div>
            {recentRsvps.length === 0 ? (
              <p className="t-body mt-3 text-muted">Nenhuma resposta ainda.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {recentRsvps.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="t-item truncate">{r.guest.name}</p>
                      <p className="t-meta">
                        {r.status === "CONFIRMADO" ? `${r.adults + r.children} pessoas · ` : ""}
                        {r.respondedAt ? formatDateTime(r.respondedAt) : ""}
                      </p>
                    </div>
                    <Badge tone={RSVP_TONE[r.status]}>{RSVP_LABEL[r.status]}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
