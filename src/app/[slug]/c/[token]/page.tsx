import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { readGuestToken } from "@/lib/guest-link";
import { formatDateLong, formatTime } from "@/lib/dates";
import { loadPublicWedding } from "@/components/public/data";
import { PublicShell } from "@/components/public/PublicShell";
import { RsvpForm } from "@/components/public/RsvpForm";
import { pub } from "@/components/public/styles";

type Props = { params: Promise<{ slug: string; token: string }> };

export const metadata: Metadata = { robots: { index: false } };

// Pagina pessoal do convidado: o link ja identifica quem esta respondendo.
export default async function GuestPage({ params }: Props) {
  const { slug, token } = await params;
  const data = await loadPublicWedding(slug);
  const guestId = readGuestToken(token);
  if (!data || !guestId) notFound();
  const guest = await db.guest.findFirst({ where: { id: guestId, weddingId: data.wedding.id }, include: { rsvp: true } });
  if (!guest) notFound();
  const { wedding, vars } = data;
  const first = guest.name.split(/\s+/)[0];
  const main = wedding.events[0];

  return (
    <PublicShell slug={slug} coupleNames={wedding.coupleNames} vars={vars}>
      <div className="mx-auto max-w-xl">
        <div className={`${pub.paper} p-6 sm:p-10`}>
          <p className={`${pub.kicker} text-center`}>Querido(a) {first},</p>
          <h1 className={`${pub.title} mt-2 text-center`}>Você é nosso convidado</h1>
          {main && (
            <p className={`${pub.muted} mt-3 text-center`}>
              {formatDateLong(main.startsAt)}, às {formatTime(main.startsAt)} · {main.venueName}
            </p>
          )}
          <div className="mt-8">
            <RsvpForm
              slug={slug}
              token={token}
              name={guest.name}
              limit={1 + guest.maxCompanions}
              initial={guest.rsvp ? { status: guest.rsvp.status, adults: guest.rsvp.adults, children: guest.rsvp.children, message: guest.rsvp.message } : null}
            />
          </div>
        </div>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href={`/${slug}`} className={pub.buttonGhost}>Ver o site do casamento</Link>
          <Link href={`/${slug}/presentes`} className={pub.buttonGhost}>Ver lista de presentes</Link>
        </div>
      </div>
    </PublicShell>
  );
}
