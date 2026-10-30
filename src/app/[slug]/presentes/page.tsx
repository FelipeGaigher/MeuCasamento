import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadPublicWedding } from "@/components/public/data";
import { loadPublicGifts } from "@/components/public/gifts";
import { PublicShell } from "@/components/public/PublicShell";
import { GiftGrid } from "@/components/public/GiftGrid";
import { CartBar } from "@/components/public/CartBar";
import { pub } from "@/components/public/styles";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await loadPublicWedding((await params).slug);
  return { title: data ? `Lista de presentes · ${data.wedding.coupleNames}` : "Lista de presentes" };
}

export default async function GiftsPage({ params }: Props) {
  const { slug } = await params;
  const data = await loadPublicWedding(slug);
  if (!data) notFound();
  const gifts = await loadPublicGifts(data.wedding.id);
  return (
    <PublicShell slug={slug} coupleNames={data.wedding.coupleNames} vars={data.vars}>
      <div className="mb-8 text-center">
        <h1 className={pub.title}>Lista de presentes</h1>
        <p className={`${pub.muted} mx-auto mt-3 max-w-xl`}>
          Escolha um ou mais presentes e pague com Pix. O valor chega direto para o casal.
        </p>
      </div>
      {gifts.length === 0 ? (
        <p className={`${pub.muted} text-center`}>A lista de presentes ainda está sendo montada.</p>
      ) : (
        <GiftGrid slug={slug} gifts={gifts} />
      )}
      <CartBar slug={slug} />
    </PublicShell>
  );
}
