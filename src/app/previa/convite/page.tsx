import type { Metadata } from "next";
import { readPages } from "@/collections/content";
import { CmsCopyProvider } from "@/components/cms/CmsCopyProvider";
import { InvitationView } from "@/components/site/InvitationView";
import { loadPublicWedding } from "@/components/site/data";
import { readCollection, readFontPair, readPageToggles } from "@/lib/preview-url";
import { requireWedding } from "@/server/auth/current";

export const metadata: Metadata = { title: "Prévia do convite", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Previa do convite dentro do painel. Mesmo componente da pagina publica.
export default async function InvitationPreview({ searchParams }: Props) {
  const { wedding } = await requireWedding();
  const params = await searchParams;
  const data = await loadPublicWedding(wedding.slug);
  if (!data) return null;
  const toggles = readPageToggles(params);
  const pages = readPages(data.wedding.invitation?.pages, wedding.coupleNames).map((p) =>
    toggles?.has(p.kind) ? { ...p, enabled: toggles.get(p.kind)! } : p,
  );
  return (
    <CmsCopyProvider mode="preview" slug={wedding.slug}>
      <main>
        <InvitationView
          slug={wedding.slug}
          coupleNames={wedding.coupleNames}
          events={data.events}
          pages={pages}
          collectionKey={readCollection(params) ?? data.wedding.invitation?.collectionKey ?? "cereja"}
          fontPairKey={readFontPair(params) ?? data.wedding.site?.fontPairKey}
        />
      </main>
    </CmsCopyProvider>
  );
}
