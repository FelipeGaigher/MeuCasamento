import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection, themeVars } from "@/collections";
import { readSections, type SiteSectionKey } from "@/collections/content";
import GiftsSection from "@/components/public/GiftsSection";
import RsvpSection from "@/components/public/RsvpSection";
import { Ornament } from "@/components/site/Ornaments";
import { Paper } from "@/components/site/Paper";
import { loadPublicWedding, shareDescription, shareTitle } from "@/components/site/data";
import { mapsHref, splitNames } from "@/components/site/types";
import { daysUntil, formatDateLong, formatTime } from "@/lib/dates";

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

const NAV_LABELS: Record<SiteSectionKey, string> = {
  historia: "Nossa história",
  eventos: "Quando e onde",
  rsvp: "Confirmar presença",
  presentes: "Presentes",
  galeria: "Fotos",
};

const SECTION_IDS: Record<SiteSectionKey, string> = {
  historia: "historia",
  eventos: "quando-e-onde",
  rsvp: "confirmar",
  presentes: "presentes",
  galeria: "fotos",
};

const display: React.CSSProperties = { fontFamily: "var(--w-display)" };
const script: React.CSSProperties = { fontFamily: "var(--w-script)" };

function SectionTitle({ children, kind }: { children: React.ReactNode; kind: "cereja" | "oliva" | "mar" }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-[2rem] uppercase tracking-[0.08em] sm:text-[2.5rem]" style={{ ...display, color: "var(--w-accent)", fontWeight: 500 }}>
        {children}
      </h2>
      <Ornament kind={kind} slot="divider" className="mx-auto mt-3 h-6 w-40" />
    </div>
  );
}

export default async function WeddingSite({ params }: Params) {
  const { slug } = await params;
  const data = await loadPublicWedding(slug);
  if (!data) notFound();
  const { wedding, events } = data;
  const site = wedding.site;
  const collectionKey = site?.collectionKey ?? "cereja";
  const kind = getCollection(collectionKey).ornament;
  const sections = readSections(site?.sections).filter((s) => s.enabled);
  const first = events[0];
  const days = first ? daysUntil(first.startsAt) : null;
  const [nameA, nameB] = splitNames(site?.heroTitle || wedding.coupleNames);

  return (
    <div
      style={{ ...themeVars(collectionKey, site?.fontPairKey), background: "var(--w-bg)", color: "var(--w-ink)", fontFamily: "var(--w-body)" }}
      className="min-h-dvh text-[1.0625rem]"
    >
      {wedding.status === "DRAFT" && (
        <div className="px-4 py-2 text-center text-[0.9375rem]" style={{ background: "var(--w-accent)", color: "var(--w-accent-ink)" }}>
          Rascunho: só você vê o link. Publique em Site e tema quando estiver pronto.
        </div>
      )}

      <nav
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ background: "color-mix(in srgb, var(--w-paper) 88%, transparent)", borderColor: "var(--w-line)" }}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-2 text-[0.9375rem] whitespace-nowrap">
          <a href="#inicio" className="mr-2 text-[1.375rem] leading-none" style={{ ...script, color: "var(--w-accent)" }}>
            {wedding.coupleNames}
          </a>
          {sections.map((s) => (
            <a key={s.key} href={`#${SECTION_IDS[s.key]}`} className="rounded-full px-3 py-2 hover:underline" style={{ color: "var(--w-ink)" }}>
              {NAV_LABELS[s.key]}
            </a>
          ))}
          <Link href={`/${slug}/convite`} className="rounded-full px-3 py-2 hover:underline" style={{ color: "var(--w-accent)" }}>
            Ver convite
          </Link>
        </div>
      </nav>

      <header id="inicio" className="relative overflow-hidden">
        {site?.heroImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={site.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        )}
        <Ornament kind={kind} slot="side" className="absolute inset-y-8 left-4 hidden w-44 lg:block" />
        <Ornament kind={kind} slot="side" className="absolute inset-y-8 right-4 hidden w-44 -scale-x-100 lg:block" />
        <div className="relative mx-auto flex min-h-[78dvh] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
          {site?.heroSubtitle && (
            <p className="text-[1rem] uppercase tracking-[0.3em]" style={{ ...display, color: "var(--w-muted)" }}>
              {site.heroSubtitle}
            </p>
          )}
          <h1 className="mt-5 leading-[0.95]" style={{ ...script, color: "var(--w-accent)", fontSize: "clamp(3.5rem, 12vw, 6.5rem)" }}>
            <span className="block">{nameA}</span>
            {nameB && <span className="block">{nameB}</span>}
          </h1>
          {first && (
            <>
              <p className="mt-8 text-[1.5rem]" style={display}>{formatDateLong(first.startsAt)}</p>
              <p className="text-[1.125rem] uppercase tracking-[0.16em]" style={display}>
                às {formatTime(first.startsAt)} · {first.venueName}
              </p>
            </>
          )}
          {days !== null && (
            <p className="mt-6 rounded-full px-5 py-2 text-[1rem]" style={{ border: "1px solid var(--w-line)", background: "var(--w-paper)" }}>
              {days > 1 ? `Faltam ${days} dias` : days === 1 ? "Falta 1 dia" : days === 0 ? "É hoje!" : "Obrigado por celebrar com a gente"}
            </p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {sections.some((s) => s.key === "rsvp") && (
              <a
                href="#confirmar"
                className="inline-flex min-h-12 items-center rounded-full px-6 text-[1rem] uppercase tracking-[0.12em]"
                style={{ ...display, background: "var(--w-accent)", color: "var(--w-accent-ink)", fontWeight: 600 }}
              >
                Confirmar presença
              </a>
            )}
            {sections.some((s) => s.key === "presentes") && (
              <a
                href="#presentes"
                className="inline-flex min-h-12 items-center rounded-full px-6 text-[1rem] uppercase tracking-[0.12em]"
                style={{ ...display, border: "1px solid var(--w-accent)", color: "var(--w-accent)", fontWeight: 600 }}
              >
                Lista de presentes
              </a>
            )}
          </div>
        </div>
      </header>

      {sections.map((s) => (
        <section key={s.key} id={SECTION_IDS[s.key]} className="scroll-mt-16 px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl">
            {s.key === "historia" && (
              <>
                <SectionTitle kind={kind}>Nossa história</SectionTitle>
                <Paper className="mx-auto max-w-2xl">
                  <div className="px-7 py-10 sm:px-12">
                    <p className="text-[1.125rem] leading-[1.75] whitespace-pre-line">
                      {site?.story || "Em breve contaremos aqui a nossa história."}
                    </p>
                  </div>
                </Paper>
              </>
            )}
            {s.key === "eventos" && (
              <>
                <SectionTitle kind={kind}>Quando e onde</SectionTitle>
                <div className="grid gap-5 sm:grid-cols-2">
                  {events.map((e) => (
                    <Paper key={e.id} className={events.length === 1 ? "sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-md" : undefined}>
                      <div className="px-6 py-8 text-center">
                        <p className="text-[1rem] uppercase tracking-[0.2em]" style={{ ...display, color: "var(--w-accent)", fontWeight: 600 }}>
                          {e.title}
                        </p>
                        <p className="mt-2 text-[1.25rem]" style={display}>{formatDateLong(e.startsAt)}</p>
                        <p className="text-[1.125rem]" style={display}>às {formatTime(e.startsAt)}</p>
                        <p className="mt-3" style={{ fontWeight: 600 }}>{e.venueName}</p>
                        <p style={{ color: "var(--w-muted)" }}>{e.address}</p>
                        {e.dressCode && <p className="mt-1" style={{ color: "var(--w-muted)" }}>Traje: {e.dressCode}</p>}
                        {e.notes && <p className="mt-2 whitespace-pre-line">{e.notes}</p>}
                        <a
                          href={mapsHref(e)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex min-h-11 items-center rounded-full px-5"
                          style={{ border: "1px solid var(--w-accent)", color: "var(--w-accent)" }}
                        >
                          Ver no mapa
                        </a>
                      </div>
                    </Paper>
                  ))}
                </div>
              </>
            )}
            {s.key === "rsvp" && (
              <>
                <SectionTitle kind={kind}>Confirme sua presença</SectionTitle>
                <RsvpSection weddingId={wedding.id} slug={slug} />
              </>
            )}
            {s.key === "presentes" && (
              <>
                <SectionTitle kind={kind}>Lista de presentes</SectionTitle>
                <GiftsSection weddingId={wedding.id} slug={slug} />
              </>
            )}
            {s.key === "galeria" && (
              <>
                <SectionTitle kind={kind}>Fotos</SectionTitle>
                <p className="text-center" style={{ color: "var(--w-muted)" }}>Em breve, as fotos do nosso grande dia.</p>
              </>
            )}
          </div>
        </section>
      ))}

      <footer className="px-4 py-10 text-center text-[0.9375rem]" style={{ color: "var(--w-muted)" }}>
        Feito com{" "}
        <Link href="/" className="underline underline-offset-4">
          Meu Casamento
        </Link>
      </footer>
    </div>
  );
}
