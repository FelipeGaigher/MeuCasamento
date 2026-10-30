import type { Metadata } from "next";
import Link from "next/link";
import type { OrderStatus, Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { requireWedding } from "@/server/auth/current";
import { formatBRL } from "@/lib/money";
import { formatDateTime } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { Badge, Card, EmptyState, Figure, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Pedidos" };

const FILTERS: { key: string; label: string; status?: OrderStatus }[] = [
  { key: "todos", label: "Todos" },
  { key: "pagos", label: "Pagos", status: "PAGO" },
  { key: "pendentes", label: "Aguardando Pix", status: "PENDENTE" },
  { key: "cancelados", label: "Cancelados", status: "CANCELADO" },
  { key: "estornados", label: "Estornados", status: "ESTORNADO" },
];

const STATUS_BADGE: Record<OrderStatus, { label: string; tone: "ok" | "warn" | "neutral" | "danger" }> = {
  PAGO: { label: "Pago", tone: "ok" },
  PENDENTE: { label: "Aguardando Pix", tone: "warn" },
  CANCELADO: { label: "Cancelado", tone: "neutral" },
  ESTORNADO: { label: "Estornado", tone: "danger" },
};

type Props = { searchParams: Promise<{ status?: string }> };

export default async function OrdersPage({ searchParams }: Props) {
  const { wedding } = await requireWedding();
  const { status = "todos" } = await searchParams;
  const filter = FILTERS.find((f) => f.key === status) ?? FILTERS[0];
  const where: Prisma.OrderWhereInput = { weddingId: wedding.id, ...(filter.status ? { status: filter.status } : {}) };

  const [orders, paid, messages] = await Promise.all([
    db.order.findMany({ where, include: { items: true }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.order.aggregate({
      where: { weddingId: wedding.id, status: "PAGO" },
      _sum: { totalCents: true, feeCents: true, coupleCents: true },
      _count: true,
    }),
    db.order.findMany({
      where: { weddingId: wedding.id, status: "PAGO", message: { not: null } },
      orderBy: { paidAt: "desc" },
      take: 6,
      select: { id: true, buyerName: true, message: true, paidAt: true },
    }),
  ]);

  return (
    <>
      <PageHeader title="Pedidos" description="Cada presente pago aparece aqui na hora, com o recado de quem presenteou." />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Figure label="Presentes pagos" value={paid._count} />
        <Figure label="Total recebido" value={formatBRL(paid._sum.totalCents ?? 0)} hint="Valor pago pelos convidados" />
        <Figure label="Para vocês" value={formatBRL(paid._sum.coupleCents ?? 0)} hint="Já descontada a taxa" />
        <Figure label="Taxa da plataforma" value={formatBRL(paid._sum.feeCents ?? 0)} />
      </div>

      {messages.length > 0 && (
        <section className="mb-6">
          <h2 className="t-section mb-3">Recados dos convidados</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {messages.map((m) => (
              <Card key={m.id} className="bg-brand-soft/40">
                <p className="t-body italic">“{m.message}”</p>
                <p className="t-meta mt-2">
                  {m.buyerName}
                  {m.paidAt ? ` · ${formatDateTime(m.paidAt)}` : ""}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1 sm:w-fit">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/painel/pedidos?status=${f.key}`}
            className={cn("t-label rounded-lg px-3 py-1.5", filter.key === f.key ? "bg-brand-soft text-brand" : "text-muted hover:text-ink")}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState title="Nenhum pedido por aqui" text="Quando um convidado escolher um presente, o pedido aparece nesta lista." />
      ) : (
        <ul className="flex flex-col gap-2">
          {orders.map((o) => {
            const badge = STATUS_BADGE[o.status];
            return (
              <li key={o.id}>
                <Card className="p-4">
                  <details>
                    <summary className="flex cursor-pointer list-none flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="t-item">
                            #{String(o.number).padStart(3, "0")} · {o.buyerName}
                          </p>
                          <Badge tone={badge.tone}>{badge.label}</Badge>
                        </div>
                        <p className="t-meta truncate">
                          {formatDateTime(o.createdAt)} · {o.items.map((i) => (i.quantity > 1 ? `${i.quantity}× ${i.title}` : i.title)).join(", ")}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="t-item tabular-nums">{formatBRL(o.totalCents)}</p>
                        <p className="t-meta tabular-nums">para vocês {formatBRL(o.coupleCents)}</p>
                      </div>
                    </summary>
                    <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
                      <div>
                        <p className="t-label mb-2">Itens</p>
                        <ul className="flex flex-col gap-1">
                          {o.items.map((i) => (
                            <li key={i.id} className="t-body flex justify-between gap-4">
                              <span>
                                {i.quantity > 1 ? `${i.quantity}× ` : ""}
                                {i.title}
                              </span>
                              <span className="tabular-nums">{formatBRL(i.unitCents * i.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                        <dl className="t-meta mt-3 flex flex-col gap-1">
                          <div className="flex justify-between"><dt>Taxa da plataforma</dt><dd className="tabular-nums">{formatBRL(o.feeCents)}</dd></div>
                          <div className="flex justify-between"><dt>Para vocês</dt><dd className="tabular-nums">{formatBRL(o.coupleCents)}</dd></div>
                          <div className="flex justify-between"><dt>Forma de pagamento</dt><dd>{o.method === "PIX" ? "Pix" : "Cartão"}</dd></div>
                          {o.paidAt && <div className="flex justify-between"><dt>Pago em</dt><dd>{formatDateTime(o.paidAt)}</dd></div>}
                        </dl>
                      </div>
                      <div>
                        <p className="t-label mb-2">Recado</p>
                        <p className="t-body italic text-muted">{o.message ? `“${o.message}”` : "Sem recado."}</p>
                        <p className="t-meta mt-3">{o.buyerEmail}</p>
                      </div>
                    </div>
                  </details>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
