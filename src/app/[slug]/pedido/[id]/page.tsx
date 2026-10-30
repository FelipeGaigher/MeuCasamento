import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { formatBRL } from "@/lib/money";
import { isDemoPayments } from "@/server/payment/asaas";
import { loadPublicWedding } from "@/components/public/data";
import { PublicShell } from "@/components/public/PublicShell";
import { PixPanel } from "@/components/public/PixPanel";
import { pub } from "@/components/public/styles";

type Props = { params: Promise<{ slug: string; id: string }> };

export const metadata: Metadata = { title: "Seu presente", robots: { index: false } };

export default async function OrderPage({ params }: Props) {
  const { slug, id } = await params;
  const data = await loadPublicWedding(slug);
  if (!data) notFound();
  const order = await db.order.findFirst({ where: { id, weddingId: data.wedding.id }, include: { items: true } });
  if (!order) notFound();
  return (
    <PublicShell slug={slug} coupleNames={data.wedding.coupleNames} vars={data.vars}>
      <div className="mx-auto max-w-xl">
        <div className={`${pub.paper} p-6 sm:p-10`}>
          <h1 className={`${pub.title} text-center`}>Seu presente</h1>
          <ul className="mt-6 flex flex-col gap-1">
            {order.items.map((i) => (
              <li key={i.id} className={`${pub.body} flex justify-between gap-4`}>
                <span>
                  {i.quantity > 1 ? `${i.quantity}× ` : ""}
                  {i.title}
                </span>
                <span>{formatBRL(i.unitCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t border-[var(--w-line)] pt-3 [font-family:var(--w-display)] text-2xl text-[var(--w-accent)]">
            <span>Total</span>
            <span>{formatBRL(order.totalCents)}</span>
          </p>
          <div className="mt-8">
            <PixPanel
              orderId={order.id}
              slug={slug}
              initialStatus={order.status}
              copyPaste={order.pixCopyPaste}
              qrBase64={order.pixQrBase64}
              demo={isDemoPayments()}
            />
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
