import { getCollection, themeVars } from "@/collections";
import type { InvitationPage } from "@/collections/content";
import { cn } from "@/lib/cn";
import { formatDateLong, formatTime } from "@/lib/dates";
import { Ornament, type OrnamentKind } from "./Ornaments";
import { Paper, TagLink } from "./Paper";
import { mapsHref, splitNames, type EventLite } from "./types";

// Convite digital. Todo texto e texto de verdade; data, horario e local vem dos
// eventos. No celular cada pagina ocupa a tela; no computador a folha fica
// centralizada (max 560px) com a arte nas laterais.

type Props = {
  slug: string;
  coupleNames: string;
  events: EventLite[];
  pages: InvitationPage[];
  collectionKey: string;
  fontPairKey?: string | null;
  preview?: boolean;
};

type PageProps = {
  fields: Record<string, string>;
  slug: string;
  coupleNames: string;
  events: EventLite[];
  kind: OrnamentKind;
};

const display: React.CSSProperties = { fontFamily: "var(--w-display)" };
const script: React.CSSProperties = { fontFamily: "var(--w-script)" };

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.9375rem] uppercase tracking-[0.32em]" style={{ ...display, color: "var(--w-muted)" }}>
      {children}
    </p>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[2rem] leading-tight uppercase tracking-[0.06em] sm:text-[2.375rem]" style={{ ...display, color: "var(--w-accent)", fontWeight: 500 }}>
      {children}
    </h2>
  );
}

function Body({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[1.125rem] leading-[1.7] whitespace-pre-line", className)} style={{ color: "var(--w-ink)" }}>
      {children}
    </p>
  );
}

function Capa({ fields, coupleNames, events, kind }: PageProps) {
  const [first, second] = splitNames(coupleNames);
  const e = events[0];
  return (
    <div className="px-7 pt-16 pb-10 text-center sm:px-12">
      {fields.kicker && <Kicker>{fields.kicker}</Kicker>}
      <h1 className="mt-6 leading-[0.95]" style={{ ...script, color: "var(--w-accent)", fontSize: "clamp(3.25rem, 13vw, 4.75rem)" }}>
        <span className="block">{first}</span>
        {second && <span className="block">{second}</span>}
      </h1>
      {e && (
        <div className="mt-8 space-y-1" style={{ color: "var(--w-ink)" }}>
          <p className="text-[1.375rem] sm:text-[1.5rem]" style={display}>{formatDateLong(e.startsAt)}</p>
          <p className="text-[1.125rem] uppercase tracking-[0.18em]" style={display}>às {formatTime(e.startsAt)}</p>
          <p className="pt-3 text-[1.0625rem] uppercase tracking-[0.12em]" style={display}>{e.venueName}</p>
          <p className="text-[1rem]" style={{ color: "var(--w-muted)" }}>{e.address}</p>
        </div>
      )}
      <Ornament kind={kind} slot="divider" className="mx-auto mt-8 h-6 w-40" />
      {fields.phrase && <Body className="mx-auto mt-6 max-w-sm">{fields.phrase}</Body>}
      <Ornament kind={kind} slot="seal" className="mx-auto mt-8 h-16 w-16" />
    </div>
  );
}

function Historia({ fields, kind }: PageProps) {
  return (
    <div className="px-7 pt-14 pb-10 sm:px-12">
      <div className="text-center">
        <Title>{fields.title}</Title>
        <Ornament kind={kind} slot="divider" className="mx-auto mt-4 h-6 w-40" />
      </div>
      {fields.text && <Body className="mt-6">{fields.text}</Body>}
      {fields.note && (
        <p className="mt-8 text-right text-[1.75rem]" style={{ ...script, color: "var(--w-accent)" }}>
          {fields.note}
        </p>
      )}
    </div>
  );
}

function Evento({ fields, events, kind }: PageProps) {
  return (
    <div className="px-7 pt-14 pb-10 text-center sm:px-12">
      <Title>{fields.title}</Title>
      <Ornament kind={kind} slot="divider" className="mx-auto mt-4 h-6 w-40" />
      {fields.text && <Body className="mx-auto mt-5 max-w-sm">{fields.text}</Body>}
      <ul className="mt-8 space-y-8">
        {events.map((e) => (
          <li key={e.id}>
            <p className="text-[1.0625rem] uppercase tracking-[0.2em]" style={{ ...display, color: "var(--w-accent)", fontWeight: 600 }}>
              {e.title}
            </p>
            <p className="mt-2 text-[1.25rem]" style={display}>{formatDateLong(e.startsAt)}</p>
            <p className="text-[1.125rem]" style={display}>às {formatTime(e.startsAt)}</p>
            <p className="mt-2 text-[1.125rem]" style={{ fontWeight: 600 }}>{e.venueName}</p>
            <p className="text-[1rem]" style={{ color: "var(--w-muted)" }}>{e.address}</p>
            {e.dressCode && <p className="mt-1 text-[1rem]" style={{ color: "var(--w-muted)" }}>Traje: {e.dressCode}</p>}
            <a
              href={mapsHref(e)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center rounded-full px-5 text-[1rem] underline-offset-4 hover:underline"
              style={{ border: "1px solid var(--w-accent)", color: "var(--w-accent)" }}
            >
              Ver no mapa
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Step({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-4 rounded-xl px-4 py-3" style={{ background: "color-mix(in srgb, var(--w-bg) 45%, var(--w-paper))" }}>
      <span className="text-[1.75rem] leading-none" style={{ ...display, color: "var(--w-accent)", fontWeight: 600 }}>{n}</span>
      <Body>{children}</Body>
    </div>
  );
}

function Option({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-2 rounded-xl px-4 py-4" style={{ border: "1px solid var(--w-line)", background: "var(--w-paper)" }}>
      <span className="text-[1.75rem] leading-none" style={{ ...display, color: "var(--w-accent)", fontWeight: 600 }}>{n}</span>
      <Body>{children}</Body>
    </div>
  );
}

function Presentes({ fields, slug, kind }: PageProps) {
  return (
    <div className="px-6 pt-14 pb-10 sm:px-10">
      <div className="text-center">
        <Title>{fields.title}</Title>
        {fields.intro && <Body className="mx-auto mt-4 max-w-sm italic">{fields.intro}</Body>}
        <Ornament kind={kind} slot="divider" className="mx-auto mt-4 h-6 w-40" />
      </div>
      <div className="mt-6 space-y-3">
        {fields.step1 && <Step n="01">{fields.step1}</Step>}
        {fields.step2 && <Step n="02">{fields.step2}</Step>}
      </div>
      <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {fields.optionOnline && <Option n="03">{fields.optionOnline}</Option>}
        {fields.optionOnline && fields.optionFree && (
          <span className="self-center text-[1.5rem]" style={{ ...script, color: "var(--w-accent)" }}>ou</span>
        )}
        {fields.optionFree && <Option n="04">{fields.optionFree}</Option>}
      </div>
      {fields.button && (
        <div className="mt-8 text-center">
          <TagLink href={`/${slug}/presentes`}>{fields.button}</TagLink>
        </div>
      )}
      {fields.note && (
        <div className="mt-8 flex justify-center">
          <p
            className="-rotate-1 px-6 py-2 text-[1.5rem]"
            style={{ ...script, background: "var(--w-accent)", color: "var(--w-accent-ink)", clipPath: "polygon(0 8%, 100% 0, 98% 100%, 2% 92%)" }}
          >
            {fields.note}
          </p>
        </div>
      )}
    </div>
  );
}

function Rsvp({ fields, slug, kind }: PageProps) {
  return (
    <div className="px-7 pt-14 pb-12 text-center sm:px-12">
      <Title>{fields.title}</Title>
      <Ornament kind={kind} slot="divider" className="mx-auto mt-4 h-6 w-40" />
      {fields.text && <Body className="mx-auto mt-5 max-w-sm">{fields.text}</Body>}
      {fields.button && (
        <div className="mt-8">
          <TagLink href={`/${slug}#confirmar`}>{fields.button}</TagLink>
        </div>
      )}
    </div>
  );
}

function Encerramento({ fields, kind }: PageProps) {
  return (
    <div className="px-7 pt-14 pb-10 text-center sm:px-12">
      <Title>{fields.title}</Title>
      <Ornament kind={kind} slot="divider" className="mx-auto mt-4 h-6 w-40" />
      {fields.text && <Body className="mx-auto mt-5 max-w-sm italic">{fields.text}</Body>}
      {fields.signature && (
        <p className="mt-3 text-[2.5rem] leading-tight" style={{ ...script, color: "var(--w-accent)" }}>
          {fields.signature}
        </p>
      )}
      <Ornament kind={kind} slot="seal" className="mx-auto mt-8 h-16 w-16" />
    </div>
  );
}

const RENDER = {
  capa: Capa,
  historia: Historia,
  evento: Evento,
  presentes: Presentes,
  rsvp: Rsvp,
  encerramento: Encerramento,
} as const;

export function InvitationView({ slug, coupleNames, events, pages, collectionKey, fontPairKey, preview }: Props) {
  const collection = getCollection(collectionKey);
  const kind = collection.ornament;
  const visible = pages.filter((p) => p.enabled);
  return (
    <div style={{ ...themeVars(collection.key, fontPairKey), background: "var(--w-bg)", fontFamily: "var(--w-body)", color: "var(--w-ink)" }}>
      {visible.map((page, i) => {
        const Render = RENDER[page.kind];
        return (
          <section
            key={page.kind}
            id={`pagina-${page.kind}`}
            className={cn(
              "relative flex justify-center overflow-x-clip px-4",
              preview ? "py-8" : "min-h-dvh items-center py-12",
            )}
          >
            {!preview && (
              <>
                <Ornament kind={kind} slot="side" className="absolute inset-y-10 left-[max(1rem,calc(50%-560px))] hidden w-48 lg:block" />
                <Ornament kind={kind} slot="side" className="absolute inset-y-10 right-[max(1rem,calc(50%-560px))] hidden w-48 -scale-x-100 lg:block" />
              </>
            )}
            <div className="relative w-full max-w-[560px]">
              <Ornament kind={kind} slot="corner" className="absolute -top-8 -right-5 z-10 h-24 w-24 sm:-right-8 sm:h-28 sm:w-28" />
              <Paper>
                <Render fields={page.fields} slug={slug} coupleNames={coupleNames} events={events} kind={kind} />
              </Paper>
              {!preview && i === 0 && visible.length > 1 && (
                <a
                  href={`#pagina-${visible[1].kind}`}
                  className="mx-auto mt-6 flex w-fit items-center gap-2 text-[1rem]"
                  style={{ color: "var(--w-muted)" }}
                >
                  Continue rolando <span aria-hidden>↓</span>
                </a>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
