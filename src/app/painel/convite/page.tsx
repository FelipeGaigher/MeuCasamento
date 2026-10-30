import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { COLLECTIONS } from "@/collections";
import { PAGE_FIELDS, PAGE_LABELS, readPages } from "@/collections/content";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ButtonLink, Card, Checkbox, Field, FORM_GRID, Input, Notice, PageHeader, Textarea } from "@/components/ui";
import { CollectionSwatch } from "@/components/site/CollectionSwatch";
import { InvitationView } from "@/components/site/InvitationView";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/dates";
import { requireWedding } from "@/server/auth/current";
import { db } from "@/server/db";
import { markInvitationReviewed, saveInvitationPages, setInvitationCollection } from "./actions";

export const metadata = { title: "Convite" };

export default async function InvitationEditor() {
  const { wedding } = await requireWedding();
  const [invitation, events, site] = await Promise.all([
    db.invitation.findUnique({ where: { weddingId: wedding.id } }),
    db.event.findMany({ where: { weddingId: wedding.id }, orderBy: [{ startsAt: "asc" }, { order: "asc" }] }),
    db.siteSettings.findUnique({ where: { weddingId: wedding.id }, select: { fontPairKey: true } }),
  ]);
  const collectionKey = invitation?.collectionKey ?? "cereja";
  const pages = readPages(invitation?.pages, wedding.coupleNames);

  return (
    <>
      <PageHeader
        title="Convite"
        description="Escolha a coleção e revise os textos. O convite se adapta ao celular e ao computador, e todo texto continua editável."
        actions={
          <>
            <ButtonLink href={`/${wedding.slug}/convite`} target="_blank" variant="secondary">
              Abrir convite <ExternalLink className="size-4" aria-hidden />
            </ButtonLink>
            <form action={markInvitationReviewed}>
              <SubmitButton pendingText="Marcando...">Marcar como revisado</SubmitButton>
            </form>
          </>
        }
      />

      <div className="mb-6 flex flex-col gap-3">
        <Notice tone="brand">
          Data, horário e local vêm da página{" "}
          <Link href="/painel/evento" className="underline underline-offset-2">
            Evento
          </Link>
          . Mude lá e o convite, o site e os lembretes se atualizam juntos.
        </Notice>
        {invitation?.publishedAt && <p className="t-meta">Revisado em {formatDateTime(invitation.publishedAt)}.</p>}
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="t-section mb-3">Coleção</h2>
            <ActionForm action={setInvitationCollection} className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {COLLECTIONS.map((c) => (
                  <label
                    key={c.key}
                    className={cn(
                      "flex cursor-pointer flex-col gap-3 rounded-xl border bg-surface p-3 transition has-[:checked]:border-brand has-[:checked]:ring-2 has-[:checked]:ring-brand/20",
                      "border-line hover:border-brand/40",
                    )}
                  >
                    <input type="radio" name="collectionKey" value={c.key} defaultChecked={c.key === collectionKey} className="sr-only" />
                    <CollectionSwatch collectionKey={c.key} names={wedding.coupleNames} />
                    <span className="t-item">{c.name}</span>
                    <span className="t-meta">{c.mood}</span>
                  </label>
                ))}
              </div>
              <Checkbox name="applyToSite" label="Usar a mesma coleção no site" defaultChecked />
              <div>
                <SubmitButton>Aplicar coleção</SubmitButton>
              </div>
            </ActionForm>
          </section>

          <section>
            <h2 className="t-section mb-3">Textos das páginas</h2>
            <ActionForm action={saveInvitationPages} className="flex flex-col gap-4">
              {pages.map((page) => (
                <Card key={page.kind} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="t-item">{PAGE_LABELS[page.kind]}</h3>
                    <Checkbox name={`${page.kind}.enabled`} label="Mostrar" defaultChecked={page.enabled} />
                  </div>
                  <div className={FORM_GRID}>
                    {PAGE_FIELDS[page.kind].map(([key, label, type]) => (
                      <Field key={key} label={label} wide={type === "textarea"}>
                        {type === "textarea" ? (
                          <Textarea name={`${page.kind}.${key}`} defaultValue={page.fields[key] ?? ""} maxLength={2000} />
                        ) : (
                          <Input name={`${page.kind}.${key}`} defaultValue={page.fields[key] ?? ""} maxLength={200} />
                        )}
                      </Field>
                    ))}
                  </div>
                </Card>
              ))}
              <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-line bg-surface/95 p-3 shadow-lg backdrop-blur">
                <p className="t-meta">As mudanças aparecem no convite depois de salvar.</p>
                <SubmitButton>Salvar textos</SubmitButton>
              </div>
            </ActionForm>
          </section>
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="t-section">Prévia</h2>
            <span className="t-meta">Com os dados salvos</span>
          </div>
          <div className="h-[75dvh] overflow-y-auto rounded-xl border border-line">
            <InvitationView
              preview
              slug={wedding.slug}
              coupleNames={wedding.coupleNames}
              events={events}
              pages={pages}
              collectionKey={collectionKey}
              fontPairKey={site?.fontPairKey}
            />
          </div>
        </aside>
      </div>
    </>
  );
}
