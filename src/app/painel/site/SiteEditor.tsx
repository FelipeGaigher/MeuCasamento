"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import type { FontPairKey } from "@/collections";
import { SECTION_LABELS, type SiteSection, type SiteSectionKey } from "@/collections/content";
import { EditorSplit } from "@/components/panel/editor/EditorSplit";
import { CollectionPicker, FontPairPicker, OrderList } from "@/components/panel/editor/pickers";
import { PreviewFrame } from "@/components/panel/editor/PreviewFrame";
import { SaveBar } from "@/components/panel/editor/SaveBar";
import { Button, Field, FORM_GRID, Input, SectionCard, Textarea } from "@/components/ui";
import { SITE_FIELDS } from "@/lib/cms";
import { encodeOrder } from "@/lib/preview-url";
import { saveSite } from "./actions";

export type SiteDraft = {
  collectionKey: string;
  fontPairKey: string;
  sections: SiteSection[];
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  story: string;
};

type Props = {
  initial: SiteDraft;
  slug: string;
  coupleNames: string;
  invitationCollection: { key: string; name: string };
};

// Editor do site: o rascunho mora aqui e vai para a previa a cada mudanca.
// Nada e salvo ate o casal clicar em Salvar.
export function SiteEditor({ initial, slug, coupleNames, invitationCollection }: Props) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, formAction] = useActionState(saveSite, undefined);
  const submitted = useRef(draft);

  // Salvou: o rascunho vira a base e a previa recarrega com o que esta salvo.
  useEffect(() => {
    if (!state?.ok) return;
    setSaved(submitted.current);
    setReloadKey((k) => k + 1);
  }, [state]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const set = <K extends keyof SiteDraft>(key: K, value: SiteDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const query = {
    c: draft.collectionKey,
    f: draft.fontPairKey,
    s: encodeOrder(draft.sections),
    img: draft.heroImageUrl.trim(),
  };
  const copy = {
    "site.heroTitle": draft.heroTitle,
    "site.heroSubtitle": draft.heroSubtitle,
    "site.story": draft.story,
  };

  return (
    <EditorSplit
      storageKey="painel_site_previa_w"
      editor={
        <form
          action={formAction}
          onSubmit={() => {
            submitted.current = draft;
          }}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="sections" value={JSON.stringify(draft.sections)} />

          <SectionCard
            title="Coleção"
            description="Cores, papel e ornamentos do site."
            action={
              draft.collectionKey !== invitationCollection.key && (
                <Button type="button" variant="ghost" size="sm" onClick={() => set("collectionKey", invitationCollection.key)}>
                  Usar a do convite ({invitationCollection.name})
                </Button>
              )
            }
          >
            <CollectionPicker
              value={draft.collectionKey}
              onChange={(v) => set("collectionKey", v)}
              coupleNames={coupleNames}
              fontPairKey={draft.fontPairKey}
            />
          </SectionCard>

          <SectionCard title="Fontes" description="Par de fontes dos nomes e dos títulos.">
            <FontPairPicker value={draft.fontPairKey} onChange={(v: FontPairKey) => set("fontPairKey", v)} coupleNames={coupleNames} />
          </SectionCard>

          <SectionCard title="Seções" description="Ligue, desligue e ordene. O menu do site segue esta ordem.">
            <OrderList<SiteSectionKey> items={draft.sections} labels={SECTION_LABELS} onChange={(v) => set("sections", v)} />
          </SectionCard>

          <SectionCard title="Topo do site" description="A primeira coisa que o convidado vê ao abrir o link.">
            <div className={FORM_GRID}>
              <Field label="Título" hint="Em branco, usa o nome do casal.">
                <Input
                  name="heroTitle"
                  data-cms-field="site.heroTitle"
                  value={draft.heroTitle}
                  onChange={(e) => set("heroTitle", e.target.value)}
                  placeholder={coupleNames}
                  maxLength={SITE_FIELDS.heroTitle}
                />
              </Field>
              <Field label="Chamada acima do título">
                <Input
                  name="heroSubtitle"
                  data-cms-field="site.heroSubtitle"
                  value={draft.heroSubtitle}
                  onChange={(e) => set("heroSubtitle", e.target.value)}
                  placeholder="Vamos casar!"
                  maxLength={SITE_FIELDS.heroSubtitle}
                />
              </Field>
              <Field label="Foto do topo" hint="Link da imagem, começando com https://" wide>
                <Input
                  name="heroImageUrl"
                  type="url"
                  value={draft.heroImageUrl}
                  onChange={(e) => set("heroImageUrl", e.target.value)}
                  placeholder="https://"
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Nossa história" description="Como vocês se conheceram, em poucas linhas.">
            <Textarea
              name="story"
              aria-label="Nossa história"
              data-cms-field="site.story"
              rows={8}
              value={draft.story}
              onChange={(e) => set("story", e.target.value)}
              maxLength={SITE_FIELDS.story}
            />
          </SectionCard>

          <SaveBar dirty={dirty} state={state} onDiscard={() => setDraft(saved)} />
        </form>
      }
      preview={
        <PreviewFrame
          title="Prévia do site"
          route="/previa/site"
          query={query}
          copy={copy}
          reloadKey={reloadKey}
          openHref={`/${slug}`}
        />
      }
    />
  );
}
