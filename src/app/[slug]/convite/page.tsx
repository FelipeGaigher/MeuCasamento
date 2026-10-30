import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readPages } from "@/collections/content";
import { InvitationView } from "@/components/site/InvitationView";
import { loadPublicWedding, shareDescription, shareTitle } from "@/components/site/data";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadPublicWedding(slug);
  if (!data) return { title: "Convite não encontrado" };
  const { wedding, events } = data;
  const title = `Convite · ${shareTitle(wedding.coupleNames, events[0])}`;
  const description = shareDescription(events[0]);
  return {
    title: { absolute: title },
    description,
    openGraph: { title, description, type: "website", locale: "pt_BR", url: `/${slug}/convite` },
    twitter: { card: "summary_large_image", title, description },
    robots: wedding.status === "DRAFT" ? { index: false, follow: false } : undefined,
  };
}

export default async function InvitationPage({ params }: Params) {
  const { slug } = await params;
  const data = await loadPublicWedding(slug);
  if (!data) notFound();
  const { wedding, events } = data;
  return (
    <main>
      <InvitationView
        slug={slug}
        coupleNames={wedding.coupleNames}
        events={events}
        pages={readPages(wedding.invitation?.pages, wedding.coupleNames)}
        collectionKey={wedding.invitation?.collectionKey ?? "cereja"}
        fontPairKey={wedding.site?.fontPairKey}
      />
    </main>
  );
}
