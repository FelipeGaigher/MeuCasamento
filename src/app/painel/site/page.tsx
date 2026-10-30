import { ArrowDown, ArrowUp, ExternalLink } from "lucide-react";
import { COLLECTIONS, FONT_PAIRS, getCollection, type FontPairKey } from "@/collections";
import { readSections, SECTION_LABELS } from "@/collections/content";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Badge, ButtonLink, Card, Checkbox, Field, FORM_GRID, Input, PageHeader, Textarea } from "@/components/ui";
import { CollectionSwatch } from "@/components/site/CollectionSwatch";
import { cn } from "@/lib/cn";
import { requireWedding } from "@/server/auth/current";
import { db } from "@/server/db";
import { saveSections, saveSiteContent, saveTheme, setPublished } from "./actions";

export const metadata = { title: "Site e tema" };

const pickCard =
  "flex cursor-pointer flex-col gap-3 rounded-xl border border-line bg-surface p-3 transition hover:border-brand/40 has-[:checked]:border-brand has-[:checked]:ring-2 has-[:checked]:ring-brand/20";

export default async function SiteThemePanel() {
  const { wedding } = await requireWedding();
  const [site, invitation] = await Promise.all([
    db.siteSettings.findUnique({ where: { weddingId: wedding.id } }),
    db.invitation.findUnique({ where: { weddingId: wedding.id }, select: { collectionKey: true } }),
  ]);
  const collectionKey = site?.collectionKey ?? "cereja";
  const fontPairKey = (site?.fontPairKey ?? "classica") as FontPairKey;
  const sections = readSections(site?.sections);
  const published = wedding.status === "PUBLISHED";

  return (
    <>
      <PageHeader
        title="Site e tema"
        description="Cores, fontes, seções e textos do site do casamento. O site usa os mesmos dados do evento que o convite."
        actions={
          <ButtonLink href={`/${wedding.slug}`} target="_blank" variant="secondary">
            Abrir site <ExternalLink className="size-4" aria-hidden />
          </ButtonLink>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="t-section mb-3">Tema</h2>
            <ActionForm action={saveTheme} className="flex flex-col gap-5">
              <div>
                <p className="t-label mb-2">Coleção</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {COLLECTIONS.map((c) => (
                    <label key={c.key} className={pickCard}>
                      <input type="radio" name="collectionKey" value={c.key} defaultChecked={c.key === collectionKey} className="sr-only" />
                      <CollectionSwatch collectionKey={c.key} fontPairKey={fontPairKey} names={wedding.coupleNames} />
                      <span className="t-item">{c.name}</span>
                      <span className="t-meta">{c.mood}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Checkbox
                name="sameAsInvitation"
                label={`Usar a mesma coleção do convite (${getCollection(invitation?.collectionKey).name})`}
                defaultChecked={false}
              />
              <div>
                <p className="t-label mb-2">Fontes</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(Object.keys(FONT_PAIRS) as FontPairKey[]).map((key) => {
                    const f = FONT_PAIRS[key];
                    return (
                      <label key={key} className={pickCard}>
                        <input type="radio" name="fontPairKey" value={key} defaultChecked={key === fontPairKey} className="sr-only" />
                        <span className="text-[1.75rem] leading-none text-brand" style={{ fontFamily: f.script }}>
                          {wedding.coupleNames}
                        </span>
                        <span className="text-[1.0625rem] uppercase tracking-[0.12em]" style={{ fontFamily: f.display }}>
                          Nossa história
                        </span>
                        <span className="t-meta">{f.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <SubmitButton>Salvar tema</SubmitButton>
              </div>
            </ActionForm>
          </section>

          <section>
            <h2 className="t-section mb-3">Seções</h2>
            <ActionForm action={saveSections} className="flex flex-col gap-3">
              <Card className="flex flex-col divide-y divide-line p-0">
                {sections.map((s, i) => (
                  <div key={s.key} className="flex items-center justify-between gap-3 px-4 py-3">
                    <Checkbox name={`enabled.${s.key}`} label={SECTION_LABELS[s.key]} defaultChecked={s.enabled} />
                    <div className="flex gap-1 rounded-lg border border-line p-1">
                      <button
                        name="move"
                        value={`${s.key}:up`}
                        disabled={i === 0}
                        aria-label={`Subir ${SECTION_LABELS[s.key]}`}
                        className="rounded-md p-1.5 text-muted hover:bg-canvas hover:text-ink disabled:opacity-30"
                      >
                        <ArrowUp className="size-4" aria-hidden />
                      </button>
                      <button
                        name="move"
                        value={`${s.key}:down`}
                        disabled={i === sections.length - 1}
                        aria-label={`Descer ${SECTION_LABELS[s.key]}`}
                        className="rounded-md p-1.5 text-muted hover:bg-canvas hover:text-ink disabled:opacity-30"
                      >
                        <ArrowDown className="size-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                ))}
              </Card>
              <div>
                <SubmitButton>Salvar seções</SubmitButton>
              </div>
            </ActionForm>
          </section>

          <section>
            <h2 className="t-section mb-3">Textos do site</h2>
            <ActionForm action={saveSiteContent} className={FORM_GRID}>
              <Field label="Título do topo" hint="Em branco, usa o nome do casal.">
                <Input name="heroTitle" defaultValue={site?.heroTitle ?? ""} placeholder={wedding.coupleNames} maxLength={120} />
              </Field>
              <Field label="Chamada acima do título">
                <Input name="heroSubtitle" defaultValue={site?.heroSubtitle ?? ""} placeholder="Vamos casar!" maxLength={120} />
              </Field>
              <Field label="Foto do topo" hint="Link da imagem, começando com https://" wide>
                <Input name="heroImageUrl" type="url" defaultValue={site?.heroImageUrl ?? ""} placeholder="https://" />
              </Field>
              <Field label="Nossa história" wide>
                <Textarea name="story" rows={8} defaultValue={site?.story ?? ""} maxLength={6000} />
              </Field>
              <div className="sm:col-span-2">
                <SubmitButton>Salvar textos</SubmitButton>
              </div>
            </ActionForm>
          </section>
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-6 xl:self-start">
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="t-section">Publicação</h2>
              <Badge tone={published ? "ok" : "warn"}>{published ? "Publicado" : "Rascunho"}</Badge>
            </div>
            <p className="t-body text-muted">
              {published
                ? "O site está no ar e pode aparecer em buscas."
                : "Em rascunho, o site abre pelo link com uma faixa de aviso e não aparece em buscas."}
            </p>
            <ActionForm action={setPublished}>
              <input type="hidden" name="publish" value={published ? "0" : "1"} />
              <SubmitButton variant={published ? "secondary" : "primary"} pendingText="Atualizando...">
                {published ? "Voltar para rascunho" : "Publicar site"}
              </SubmitButton>
            </ActionForm>
          </Card>
          <Card className="flex flex-col gap-3">
            <h2 className="t-section">Prévia</h2>
            <CollectionSwatch collectionKey={collectionKey} fontPairKey={fontPairKey} names={wedding.coupleNames} />
            <p className="t-meta break-all">/{wedding.slug}</p>
            <ButtonLink href={`/${wedding.slug}`} target="_blank" variant="secondary" className={cn("w-full")}>
              Ver site completo <ExternalLink className="size-4" aria-hidden />
            </ButtonLink>
          </Card>
        </aside>
      </div>
    </>
  );
}
