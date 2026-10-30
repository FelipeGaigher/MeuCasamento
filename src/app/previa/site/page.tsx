import type { Metadata } from "next";
import { readSections } from "@/collections/content";
import { CmsCopyProvider } from "@/components/cms/CmsCopyProvider";
import { WeddingSiteView } from "@/components/site/WeddingSiteView";
import { loadPublicWedding } from "@/components/site/data";
import { readCollection, readFontPair, readImage, readSiteSections } from "@/lib/preview-url";
import { requireWedding } from "@/server/auth/current";

export const metadata: Metadata = { title: "Prévia do site", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Previa do site dentro do painel: o casamento vem da sessao (funciona em
// rascunho), a estrutura do rascunho vem da URL e o texto chega por postMessage.
export default async function SitePreview({ searchParams }: Props) {
  const { wedding } = await requireWedding();
  const params = await searchParams;
  const data = await loadPublicWedding(wedding.slug);
  if (!data) return null;
  const site = data.wedding.site;
  const image = readImage(params);
  return (
    <CmsCopyProvider mode="preview" slug={wedding.slug}>
      <WeddingSiteView
        preview
        slug={wedding.slug}
        wedding={data.wedding}
        events={data.events}
        site={{
          collectionKey: readCollection(params) ?? site?.collectionKey ?? "cereja",
          fontPairKey: readFontPair(params) ?? site?.fontPairKey ?? null,
          sections: readSiteSections(params) ?? readSections(site?.sections),
          heroTitle: site?.heroTitle ?? null,
          heroSubtitle: site?.heroSubtitle ?? null,
          heroImageUrl: image === undefined ? (site?.heroImageUrl ?? null) : image,
          story: site?.story ?? null,
        }}
      />
    </CmsCopyProvider>
  );
}
