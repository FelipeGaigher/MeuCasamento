import type { Metadata } from "next";
import type { Event } from "@prisma/client";
import { MapPin } from "lucide-react";
import { db } from "@/server/db";
import { requireWedding } from "@/server/auth/current";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Card, FORM_GRID, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { formatDateLong, formatTime, toLocalInput } from "@/lib/dates";
import { deleteEvent, saveEvent, saveWedding } from "./actions";
import { mapsLink } from "./maps";

export const metadata: Metadata = { title: "Evento" };

const KINDS = [
  ["CERIMONIA", "Cerimônia"],
  ["RECEPCAO", "Recepção"],
  ["NOIVADO", "Noivado"],
  ["CHA", "Chá"],
  ["OUTRO", "Outro"],
] as const;

function EventForm({ event }: { event?: Event }) {
  const local = event ? toLocalInput(event.startsAt) : { date: "", time: "16:00" };
  return (
    <ActionForm action={saveEvent} className={FORM_GRID} resetOnSuccess={!event}>
      {event && <input type="hidden" name="id" value={event.id} />}
      <Field label="Tipo">
        <Select name="kind" defaultValue={event?.kind ?? "RECEPCAO"}>
          {KINDS.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
      </Field>
      <Field label="Título" hint="Como aparece no convite e no site.">
        <Input name="title" defaultValue={event?.title} required />
      </Field>
      <Field label="Data">
        <Input name="date" type="date" defaultValue={local.date} required />
      </Field>
      <Field label="Horário">
        <Input name="time" type="time" defaultValue={local.time} required />
      </Field>
      <Field label="Local">
        <Input name="venueName" defaultValue={event?.venueName} required />
      </Field>
      <Field label="Endereço">
        <Input name="address" defaultValue={event?.address} required />
      </Field>
      <Field label="Link do mapa" hint="Opcional. Se ficar vazio, o site gera o link pelo endereço." wide>
        <Input name="mapsUrl" type="url" defaultValue={event?.mapsUrl ?? ""} placeholder="https://maps.app.goo.gl/..." />
      </Field>
      <Field label="Traje">
        <Input name="dressCode" defaultValue={event?.dressCode ?? ""} placeholder="Esporte fino" />
      </Field>
      <Field label="Ordem" hint="Menor aparece primeiro.">
        <Input name="order" type="number" min={0} max={99} defaultValue={event?.order ?? 0} />
      </Field>
      <Field label="Observações" wide>
        <Textarea name="notes" rows={2} defaultValue={event?.notes ?? ""} />
      </Field>
      <div className="sm:col-span-2">
        <SubmitButton>{event ? "Salvar evento" : "Adicionar evento"}</SubmitButton>
      </div>
    </ActionForm>
  );
}

export default async function EventoPage() {
  const { wedding } = await requireWedding();
  const events = await db.event.findMany({ where: { weddingId: wedding.id }, orderBy: [{ order: "asc" }, { startsAt: "asc" }] });

  return (
    <>
      <PageHeader
        title="Evento"
        description="Data, horário e local ficam só aqui. O convite, o site e os lembretes leem desta tela, então tudo aparece igual em todo lugar."
      />

      <Card className="mb-6">
        <h2 className="t-section mb-4">Casamento</h2>
        <ActionForm action={saveWedding} className={FORM_GRID}>
          <Field label="Nome do casal">
            <Input name="coupleNames" defaultValue={wedding.coupleNames} required />
          </Field>
          <Field label="Endereço do site" hint="Letras, números e hífen. Trocar o endereço quebra links já enviados.">
            <Input name="slug" defaultValue={wedding.slug} required />
          </Field>
          <div className="sm:col-span-2">
            <SubmitButton>Salvar</SubmitButton>
          </div>
        </ActionForm>
      </Card>

      <div className="flex flex-col gap-6">
        {events.map((e) => (
          <Card key={e.id}>
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="t-section">{e.title}</h2>
                <p className="t-meta">
                  {formatDateLong(e.startsAt)} · {formatTime(e.startsAt)} · {e.venueName}
                </p>
              </div>
              <a href={mapsLink(e)} target="_blank" rel="noreferrer" className="t-label inline-flex items-center gap-1 text-brand">
                <MapPin className="size-4" aria-hidden /> Ver no mapa
              </a>
            </div>
            <EventForm event={e} />
            {events.length > 1 && (
              <ActionForm action={deleteEvent} className="mt-4 border-t border-line pt-4">
                <input type="hidden" name="id" value={e.id} />
                <SubmitButton variant="danger" pendingText="Removendo...">Remover evento</SubmitButton>
              </ActionForm>
            )}
          </Card>
        ))}

        <Card>
          <h2 className="t-section mb-4">Adicionar evento</h2>
          <p className="t-body mb-4 text-muted">Recepção em outro lugar, chá, noivado: cada um com seu horário e local.</p>
          <EventForm />
        </Card>
      </div>
    </>
  );
}
