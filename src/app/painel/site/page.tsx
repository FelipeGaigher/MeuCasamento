import { getCollection } from "@/collections";
import { readSections } from "@/collections/content";
import { PageHeader } from "@/components/ui";
import { PublishToggle } from "@/components/panel/PublishToggle";
import { requireWedding } from "@/server/auth/current";
import { db } from "@/server/db";
import { setPublished } from "./actions";
import { SiteEditor } from "./SiteEditor";

export const metadata = { title: "Site e tema" };

export default async function SiteThemePanel() {
  const { wedding } = await requireWedding();
  const [site, invitation] = await Promise.all([
    db.siteSettings.findUnique({ where: { weddingId: wedding.id } }),
    db.invitation.findUnique({ where: { weddingId: wedding.id }, select: { collectionKey: true } }),
  ]);
  const invitationCollection = getCollection(invitation?.collectionKey);
  const published = wedding.status === "PUBLISHED";

  return (
    <>
      <PageHeader
        title="Site e tema"
        description={
          published
            ? "O site está no ar. O que você salvar aqui aparece para os convidados na hora."
            : "Em rascunho, o site abre só pelo link, com uma faixa de aviso, e não aparece em buscas."
        }
        actions={<PublishToggle published={published} action={setPublished} />}
      />
      <SiteEditor
        slug={wedding.slug}
        coupleNames={wedding.coupleNames}
        invitationCollection={{ key: invitationCollection.key, name: invitationCollection.name }}
        initial={{
          collectionKey: site?.collectionKey ?? "cereja",
          fontPairKey: site?.fontPairKey ?? "classica",
          sections: readSections(site?.sections),
          heroTitle: site?.heroTitle ?? "",
          heroSubtitle: site?.heroSubtitle ?? "",
          heroImageUrl: site?.heroImageUrl ?? "",
          story: site?.story ?? "",
        }}
      />
    </>
  );
}
