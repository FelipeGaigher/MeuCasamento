import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { db } from "@/server/db";
import { requireWedding } from "@/server/auth/current";
import { formatBRL } from "@/lib/money";
import { Badge, Card, EmptyState, Figure, FORM_GRID, PageHeader, buttonClass } from "@/components/ui";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { GiftFields } from "./GiftFields";
import { SUGGESTIONS } from "./suggestions";
import { addSuggestion, createGift, deleteGift, updateGift } from "./actions";

export const metadata: Metadata = { title: "Presentes" };

export default async function GiftsPanelPage() {
  const { wedding } = await requireWedding();
  const [gifts, received] = await Promise.all([
    db.gift.findMany({ where: { weddingId: wedding.id }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    db.orderItem.groupBy({
      by: ["giftId"],
      where: { weddingId: wedding.id, order: { status: "PAGO" } },
      _sum: { quantity: true },
    }),
  ]);
  const paidItems = await db.orderItem.findMany({
    where: { weddingId: wedding.id, order: { status: "PAGO" } },
    select: { giftId: true, unitCents: true, quantity: true },
  });
  const receivedCents = new Map<string, number>();
  for (const i of paidItems) receivedCents.set(i.giftId, (receivedCents.get(i.giftId) ?? 0) + i.unitCents * i.quantity);
  const units = new Map(received.map((r) => [r.giftId, r._sum.quantity ?? 0]));
  const totalReceived = [...receivedCents.values()].reduce((s, v) => s + v, 0);
  const unused = SUGGESTIONS.filter((s) => !gifts.some((g) => g.title === s.title));

  return (
    <>
      <PageHeader
        title="Presentes"
        description="Monte a lista do jeito de vocês. O convidado escolhe, paga com Pix e o valor cai na conta de vocês."
        actions={
          <a href={`/${wedding.slug}/presentes`} target="_blank" className={buttonClass("secondary")}>
            Ver como o convidado vê
          </a>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Figure label="Presentes na lista" value={gifts.filter((g) => g.active).length} hint={`${gifts.length} cadastrados`} />
        <Figure label="Recebido em presentes" value={formatBRL(totalReceived)} hint="Valor bruto dos pedidos pagos" />
      </div>

      {unused.length > 0 && (
        <Card className="mb-6">
          <h2 className="t-section">Comece com uma ideia</h2>
          <p className="t-meta mb-4">Um clique adiciona o presente. Depois é só ajustar valor e foto.</p>
          <div className="flex flex-wrap gap-2">
            {unused.map((s) => (
              <form key={s.title} action={addSuggestion}>
                <input type="hidden" name="title" value={s.title} />
                <button className={buttonClass("secondary", "h-9 px-3")}>
                  <Plus className="size-4" aria-hidden /> {s.title} · {formatBRL(s.priceCents)}
                </button>
              </form>
            ))}
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <h2 className="t-section mb-4">Novo presente</h2>
        <ActionForm action={createGift} className={FORM_GRID} resetOnSuccess>
          <GiftFields />
          <div className="sm:col-span-2">
            <SubmitButton>Adicionar à lista</SubmitButton>
          </div>
        </ActionForm>
      </Card>

      {gifts.length === 0 ? (
        <EmptyState title="A lista está vazia" text="Adicione o primeiro presente acima ou comece por uma das ideias." />
      ) : (
        <ul className="flex flex-col gap-2">
          {gifts.map((g) => {
            const got = units.get(g.id) ?? 0;
            return (
              <li key={g.id}>
                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    {g.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={g.imageUrl} alt="" className="size-14 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="size-14 shrink-0 rounded-lg bg-canvas" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="t-item">{g.title}</p>
                        <Badge tone={g.kind === "PRODUTO" ? "brand" : "neutral"}>{g.kind === "PRODUTO" ? "Produto" : "Cota"}</Badge>
                        {!g.active && <Badge tone="warn">Oculto</Badge>}
                      </div>
                      <p className="t-meta">
                        {formatBRL(g.priceCents)}
                        {g.quantity !== null ? ` · ${got} de ${g.quantity} recebidos` : got > 0 ? ` · ${got} recebidos` : ""}
                      </p>
                    </div>
                    <p className="t-item hidden tabular-nums sm:block">{formatBRL(receivedCents.get(g.id) ?? 0)}</p>
                  </div>
                  <details className="mt-3 border-t border-line pt-3">
                    <summary className="t-label cursor-pointer text-muted hover:text-ink">Editar</summary>
                    <ActionForm action={updateGift} className={`${FORM_GRID} mt-4`}>
                      <input type="hidden" name="id" value={g.id} />
                      <GiftFields gift={g} />
                      <div className="sm:col-span-2">
                        <SubmitButton>Salvar</SubmitButton>
                      </div>
                    </ActionForm>
                    <form action={deleteGift} className="mt-3">
                      <input type="hidden" name="id" value={g.id} />
                      <SubmitButton variant="danger" pendingText="Removendo...">
                        {got > 0 ? "Ocultar do site" : "Remover"}
                      </SubmitButton>
                    </form>
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
