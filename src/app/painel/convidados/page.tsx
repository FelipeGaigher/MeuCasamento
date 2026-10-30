import type { Metadata } from "next";
import Link from "next/link";
import { Download, MessageCircle } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { requireWedding } from "@/server/auth/current";
import { guestToken } from "@/lib/guest-link";
import { normalizePhone } from "@/server/notify/evolution";
import { cn } from "@/lib/cn";
import { Badge, Card, EmptyState, Figure, FORM_GRID, Input, PageHeader, buttonClass } from "@/components/ui";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { CopyButton } from "@/components/panel/CopyButton";
import { GuestFields } from "./GuestFields";
import { RsvpEditor } from "./RsvpEditor";
import { addGuest, deleteGuest, importGuests, updateGuest } from "./actions";

export const metadata: Metadata = { title: "Convidados" };

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "confirmados", label: "Confirmados" },
  { key: "recusados", label: "Não vão" },
  { key: "sem-resposta", label: "Sem resposta" },
] as const;

type Props = { searchParams: Promise<{ filtro?: string; q?: string }> };

export default async function GuestsPage({ searchParams }: Props) {
  const { wedding } = await requireWedding();
  const { filtro = "todos", q = "" } = await searchParams;
  const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

  const where: Prisma.GuestWhereInput = { weddingId: wedding.id };
  if (q.trim()) where.name = { contains: q.trim(), mode: "insensitive" };
  if (filtro === "confirmados") where.rsvp = { status: "CONFIRMADO" };
  if (filtro === "recusados") where.rsvp = { status: "RECUSADO" };
  if (filtro === "sem-resposta") where.OR = [{ rsvp: null }, { rsvp: { status: "PENDENTE" } }];

  const [guests, total, confirmed, declined] = await Promise.all([
    db.guest.findMany({ where, include: { rsvp: true }, orderBy: [{ group: "asc" }, { name: "asc" }] }),
    db.guest.count({ where: { weddingId: wedding.id } }),
    db.rsvp.aggregate({ where: { weddingId: wedding.id, status: "CONFIRMADO" }, _sum: { adults: true, children: true }, _count: true }),
    db.rsvp.count({ where: { weddingId: wedding.id, status: "RECUSADO" } }),
  ]);
  const adults = confirmed._sum.adults ?? 0;
  const children = confirmed._sum.children ?? 0;
  const pending = total - confirmed._count - declined;

  return (
    <>
      <PageHeader
        title="Convidados"
        description="Cada convidado tem um link próprio de confirmação. Envie pelo WhatsApp e acompanhe as respostas aqui."
        actions={
          <Link href="/painel/convidados/exportar" className={buttonClass("secondary")}>
            <Download className="size-4" aria-hidden /> Exportar CSV
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Figure label="Convidados" value={total} hint={`${pending} sem resposta`} />
        <Figure label="Pessoas confirmadas" value={adults + children} hint={`${confirmed._count} convites`} />
        <Figure label="Adultos" value={adults} />
        <Figure label="Crianças" value={children} hint={`${declined} não vão`} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="t-section mb-4">Adicionar convidado</h2>
          <ActionForm action={addGuest} className={FORM_GRID} resetOnSuccess>
            <GuestFields />
            <div className="sm:col-span-2">
              <SubmitButton>Adicionar</SubmitButton>
            </div>
          </ActionForm>
        </Card>
        <Card>
          <h2 className="t-section mb-1">Colar uma lista</h2>
          <p className="t-meta mb-4">Uma pessoa por linha: Nome; telefone; e-mail; grupo. Só o nome é obrigatório.</p>
          <ActionForm action={importGuests} className="flex flex-col gap-4" resetOnSuccess>
            <textarea
              name="lines"
              rows={7}
              className="t-body w-full rounded-lg border border-line bg-surface px-3 py-2 focus:border-brand focus:outline-none"
              placeholder={"Mariana Costa; (27) 99999-0000; mariana@email.com; Família da noiva\nPedro Alves"}
            />
            <div>
              <SubmitButton pendingText="Importando...">Importar lista</SubmitButton>
            </div>
          </ActionForm>
        </Card>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={`/painel/convidados?filtro=${f.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={cn("t-label rounded-lg px-3 py-1.5", filtro === f.key ? "bg-brand-soft text-brand" : "text-muted hover:text-ink")}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <form className="flex gap-2">
          <input type="hidden" name="filtro" value={filtro} />
          <Input name="q" defaultValue={q} placeholder="Buscar pelo nome" className="sm:w-64" />
          <button className={buttonClass("secondary")}>Buscar</button>
        </form>
      </div>

      {guests.length === 0 ? (
        <EmptyState
          title={total === 0 ? "Nenhum convidado ainda" : "Ninguém encontrado"}
          text={total === 0 ? "Adicione os convidados um a um ou cole a lista inteira de uma vez." : "Tente outro filtro ou outra busca."}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {guests.map((g) => {
            const link = `${appUrl}/${wedding.slug}/c/${guestToken(g.id)}`;
            const phone = g.phone ? normalizePhone(g.phone) : null;
            const first = g.name.split(/\s+/)[0];
            const wa = phone
              ? `https://wa.me/${phone}?text=${encodeURIComponent(
                  `Olá, ${first}! Este é o seu convite para o casamento de ${wedding.coupleNames}. Confirme sua presença por aqui: ${link}`,
                )}`
              : null;
            const status = g.rsvp?.status ?? "PENDENTE";
            return (
              <li key={g.id}>
                <Card className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="t-item">{g.name}</p>
                        {status === "CONFIRMADO" && (
                          <Badge tone="ok">
                            Confirmado · {g.rsvp!.adults + g.rsvp!.children} {g.rsvp!.adults + g.rsvp!.children === 1 ? "pessoa" : "pessoas"}
                          </Badge>
                        )}
                        {status === "RECUSADO" && <Badge tone="danger">Não vai</Badge>}
                        {status === "PENDENTE" && <Badge>Sem resposta</Badge>}
                      </div>
                      <p className="t-meta">
                        {[g.group, g.household, g.maxCompanions > 0 ? `até ${g.maxCompanions} acompanhante(s)` : null].filter(Boolean).join(" · ") || "Sem grupo"}
                      </p>
                      {g.rsvp?.message && <p className="t-body mt-1 italic text-muted">“{g.rsvp.message}”</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <CopyButton text={link} />
                      {wa && (
                        <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "h-9 px-3")}>
                          <MessageCircle className="size-4" aria-hidden /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                  <details className="mt-3 border-t border-line pt-3">
                    <summary className="t-label cursor-pointer text-muted hover:text-ink">Editar e marcar resposta</summary>
                    <div className="mt-4 grid gap-6 lg:grid-cols-2">
                      <ActionForm action={updateGuest} className={FORM_GRID}>
                        <input type="hidden" name="id" value={g.id} />
                        <GuestFields guest={g} />
                        <div className="flex gap-2 sm:col-span-2">
                          <SubmitButton>Salvar</SubmitButton>
                        </div>
                      </ActionForm>
                      <div className="flex flex-col gap-4">
                        <RsvpEditor guestId={g.id} limit={1 + g.maxCompanions} rsvp={g.rsvp} />
                        <form action={deleteGuest}>
                          <input type="hidden" name="id" value={g.id} />
                          <SubmitButton variant="danger" pendingText="Removendo...">Remover convidado</SubmitButton>
                        </form>
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
