"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { PAGE_FIELDS, PAGE_LABELS, type InvitationPage } from "@/collections/content";
import { EditorSplit } from "@/components/panel/editor/EditorSplit";
import { CollectionPicker } from "@/components/panel/editor/pickers";
import { PreviewFrame } from "@/components/panel/editor/PreviewFrame";
import { SaveBar } from "@/components/panel/editor/SaveBar";
import { Badge, Checkbox, Field, FORM_GRID, Input, Notice, SectionCard, Textarea } from "@/components/ui";
import { PAGE_FIELD_MAX } from "@/lib/cms";
import { encodeOrder } from "@/lib/preview-url";
import { saveInvitation } from "./actions";

export type InvitationDraft = { collectionKey: string; pages: InvitationPage[] };

type Props = { initial: InvitationDraft; slug: string; coupleNames: string; fontPairKey: string | null };

// Editor do convite: colecao e textos de cada pagina, com previa ao vivo.
export function InvitationEditor({ initial, slug, coupleNames, fontPairKey }: Props) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [applyToSite, setApplyToSite] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, formAction] = useActionState(saveInvitation, undefined);
  const submitted = useRef(draft);

  useEffect(() => {
    if (!state?.ok) return;
    setSaved(submitted.current);
    setReloadKey((k) => k + 1);
  }, [state]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  const updatePage = (kind: InvitationPage["kind"], patch: (p: InvitationPage) => InvitationPage) =>
    setDraft((d) => ({ ...d, pages: d.pages.map((p) => (p.kind === kind ? patch(p) : p)) }));

  const copy = Object.fromEntries(
    draft.pages.flatMap((p) => PAGE_FIELDS[p.kind].map(([key]) => [`pages.${p.kind}.${key}`, p.fields[key] ?? ""])),
  );

  return (
    <EditorSplit
      storageKey="painel_convite_previa_w"
      editor={
        <form
          action={formAction}
          onSubmit={() => {
            submitted.current = draft;
          }}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="pages" value={JSON.stringify(draft.pages)} />

          <Notice>
            Data, horário e local vêm da tela{" "}
            <Link href="/painel/evento" className="underline underline-offset-2">
              Evento
            </Link>
            . Mude lá e o convite, o site e os lembretes se atualizam juntos.
          </Notice>

          <SectionCard title="Coleção" description="Cores, papel e ornamentos do convite.">
            <CollectionPicker
              value={draft.collectionKey}
              onChange={(v) => setDraft((d) => ({ ...d, collectionKey: v }))}
              coupleNames={coupleNames}
              fontPairKey={fontPairKey}
            />
            <div className="mt-3">
              <Checkbox
                name="applyToSite"
                label="Usar a mesma coleção no site"
                checked={applyToSite}
                onChange={(e) => setApplyToSite(e.target.checked)}
              />
            </div>
          </SectionCard>

          <SectionCard title="Páginas" description="Cada página é uma tela do convite. Desligue as que não fazem sentido para vocês.">
            <div className="flex flex-col gap-2">
              {draft.pages.map((page, i) => (
                <PageBlock
                  key={page.kind}
                  page={page}
                  open={i === 0}
                  onToggle={(enabled) => updatePage(page.kind, (p) => ({ ...p, enabled }))}
                  onField={(key, value) => updatePage(page.kind, (p) => ({ ...p, fields: { ...p.fields, [key]: value } }))}
                />
              ))}
            </div>
          </SectionCard>

          <SaveBar dirty={dirty} state={state} onDiscard={() => setDraft(saved)} />
        </form>
      }
      preview={
        <PreviewFrame
          title="Prévia do convite"
          route="/previa/convite"
          query={{ c: draft.collectionKey, p: encodeOrder(draft.pages.map((p) => ({ key: p.kind, enabled: p.enabled }))) }}
          copy={copy}
          reloadKey={reloadKey}
          openHref={`/${slug}/convite`}
        />
      }
    />
  );
}

// Uma pagina do convite: abre e fecha, liga e desliga, com os campos dela.
function PageBlock({
  page,
  open,
  onToggle,
  onField,
}: {
  page: InvitationPage;
  open: boolean;
  onToggle: (enabled: boolean) => void;
  onField: (key: string, value: string) => void;
}) {
  return (
    <details open={open} className="group rounded-xl border border-line bg-surface open:shadow-card">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5">
        <ChevronRight className="size-4 shrink-0 text-muted transition-transform group-open:rotate-90" strokeWidth={1.5} aria-hidden />
        <span className="t-item flex-1">{PAGE_LABELS[page.kind]}</span>
        {!page.enabled && <Badge>Desligada</Badge>}
      </summary>
      <div className="flex flex-col gap-4 border-t border-line px-3 pt-3 pb-4">
        <Checkbox label="Mostrar esta página no convite" checked={page.enabled} onChange={(e) => onToggle(e.target.checked)} />
        <div className={FORM_GRID}>
          {PAGE_FIELDS[page.kind].map(([key, label, type]) => {
            const path = `pages.${page.kind}.${key}`;
            const value = page.fields[key] ?? "";
            return (
              <Field key={key} label={label} wide={type === "textarea"}>
                {type === "textarea" ? (
                  <Textarea data-cms-field={path} value={value} onChange={(e) => onField(key, e.target.value)} maxLength={PAGE_FIELD_MAX} />
                ) : (
                  <Input data-cms-field={path} value={value} onChange={(e) => onField(key, e.target.value)} maxLength={200} />
                )}
              </Field>
            );
          })}
        </div>
      </div>
    </details>
  );
}
