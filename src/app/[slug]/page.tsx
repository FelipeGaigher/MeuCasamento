import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readSections } from "@/collections/content";
import { CmsCopyProvider } from "@/components/cms/CmsCopyProvider";
import { WeddingSiteView } from "@/components/site/WeddingSiteView";
import { loadPublicWedding, shareDescription, shareTitle } from "@/components/site/data";
import { canEditWedding } from "@/server/auth/current";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadPublicWedding(slug);
  if (!data) return { title: "Casamento não encontrado" };
  const { wedding, events } = data;
  const title = shareTitle(wedding.coupleNames, events[0]);
  const description = shareDescription(events[0]);
  return {
    title: { absolute: title },
    description,
    openGraph: { title, description, type: "website", locale: "pt_BR", url: `/${slug}` },
    twitter: { card: "summary_large_image", title, description },
    robots: wedding.status === "DRAFT" ? { index: false, follow: false } : undefined,
  };
}

export default async function WeddingSite({ params }: Params) {
  const { slug } = await params;
  const data = await loadPublicWedding(slug);
  if (!data) notFound();
  const { wedding, events } = data;
  const site = wedding.site;
  const view = (
    <WeddingSiteView
      slug={slug}
      wedding={wedding}
      events={events}
      site={{
        collectionKey: site?.collectionKey ?? "cereja",
        fontPairKey: site?.fontPairKey ?? null,
        sections: readSections(site?.sections),
        heroTitle: site?.heroTitle ?? null,
        heroSubtitle: site?.heroSubtitle ?? null,
        heroImageUrl: site?.heroImageUrl ?? null,
        story: site?.story ?? null,
      }}
    />
  );
  // O casal logado edita os textos direto aqui (tecla E). Quem decide e o servidor.
  if (!(await canEditWedding(wedding.id))) return view;
  return (
    <CmsCopyProvider mode="inline" slug={slug}>
      {view}
    </CmsCopyProvider>
  );
}
