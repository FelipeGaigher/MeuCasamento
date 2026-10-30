import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadPublicWedding } from "@/components/public/data";
import { PublicShell } from "@/components/public/PublicShell";
import { CheckoutForm } from "@/components/public/CheckoutForm";
import { pub } from "@/components/public/styles";

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = { title: "Finalizar presente", robots: { index: false } };

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params;
  const data = await loadPublicWedding(slug);
  if (!data) notFound();
  return (
    <PublicShell slug={slug} coupleNames={data.wedding.coupleNames} vars={data.vars}>
      <div className="mx-auto max-w-2xl">
        <h1 className={`${pub.title} mb-6 text-center`}>Finalizar presente</h1>
        <CheckoutForm slug={slug} />
      </div>
    </PublicShell>
  );
}
