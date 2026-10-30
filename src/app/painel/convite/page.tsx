import { ExternalLink } from "lucide-react";
import { readPages } from "@/collections/content";
import { ButtonLink, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { formatDateTime } from "@/lib/dates";
import { requireWedding } from "@/server/auth/current";
import { db } from "@/server/db";
import { markInvitationReviewed } from "./actions";
import { InvitationEditor } from "./InvitationEditor";

export const metadata = { title: "Convite" };

export default async function InvitationPanel() {
  const { wedding } = await requireWedding();
  const [invitation, site] = await Promise.all([
    db.invitation.findUnique({ where: { weddingId: wedding.id } }),
    db.siteSettings.findUnique({ where: { weddingId: wedding.id }, select: { fontPairKey: true } }),
  ]);

  return (
    <>
      <PageHeader
        title="Convite"
        description={
          invitation?.publishedAt
            ? `Revisado em ${formatDateTime(invitation.publishedAt)}. Todo texto continua editável.`
            : "Escolha a coleção e revise os textos. Quando estiver tudo certo, marque como revisado."
        }
        actions={
          <>
            <ButtonLink href={`/${wedding.slug}/convite`} target="_blank" variant="secondary">
              Abrir convite <ExternalLink aria-hidden />
            </ButtonLink>
            <form action={markInvitationReviewed}>
              <SubmitButton pendingText="Marcando...">Marcar como revisado</SubmitButton>
            </form>
          </>
        }
      />
      <InvitationEditor
        slug={wedding.slug}
        coupleNames={wedding.coupleNames}
        fontPairKey={site?.fontPairKey ?? null}
        initial={{
          collectionKey: invitation?.collectionKey ?? "cereja",
          pages: readPages(invitation?.pages, wedding.coupleNames),
        }}
      />
    </>
  );
}
