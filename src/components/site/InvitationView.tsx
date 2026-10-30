import { getCollection, themeVars } from "@/collections";
import type { InvitationPage, InvitationPageKind } from "@/collections/content";
import { cmsAttrs, cmsBox } from "@/lib/cms";
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
};

type PageProps = {
  page: InvitationPageKind;
  fields: Record<string, string>;
  slug: string;
  coupleNames: string;
  events: EventLite[];
  kind: OrnamentKind;
};

const display: React.CSSProperties = { fontFamily: "var(--w-display)" };
const script: React.CSSProperties = { fontFamily: "var(--w-script)" };

type Cms = Record<string, string | boolean>;

// Caminho do campo para o preview e a edicao na pagina: pages.<pagina>.<campo>
const at = (page: InvitationPageKind, key: string) => `pages.${page}.${key}`;

function Kicker({ children, cms }: { children: React.ReactNode; cms?: Cms }) {
  return (
    <p {...cms} className="text-[0.9375rem] uppercase tracking-[0.32em]" style={{ ...display, color: "var(--w-muted)" }}>
      {children}
    </p>
  );
}

function Title({ children, cms }: { children: React.ReactNode; cms?: Cms }) {
  return (
    <h2 {...cms} className="text-[2rem] leading-tight uppercase tracking-[0.06em] sm:text-[2.375rem]" style={{ ...display, color: "var(--w-accent)", fontWeight: 500 }}>
      {children}
    </h2>
  );
}

function Body({ children, className, cms }: { children: React.ReactNode; className?: string; cms?: Cms }) {
  return (
    <p {...cms} className={cn("text-[1.125rem] leading-[1.7] whitespace-pre-line", className)} style={{ color: "var(--w-ink)" }}>
      {children}
    </p>
  );
}

function Capa({ page, fields, coupleNames, events, kind }: PageProps) {
  const [first, second] = splitNames(coupleNames);
  const e = events[0];
  return (
    <div className="px-7 pt-16 pb-10 text-center sm:px-12">
      <Kicker cms={cmsAttrs(at(page, "kicker"), fields.kicker, { optional: true })}>{fields.kicker}</Kicker>
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
      <Body className="mx-auto mt-6 max-w-sm" cms={cmsAttrs(at(page, "phrase"), fields.phrase, { optional: true, multiline: true })}>{fields.phrase}</Body>
      <Ornament kind={kind} slot="seal" className="mx-auto mt-8 h-16 w-16" />
    </div>
  );
}

function Historia({ page, fields, kind }: PageProps) {
  return (
    <div className="px-7 pt-14 pb-10 sm:px-12">
      <div className="text-center">
        <Title cms={cmsAttrs(at(page, "title"), fields.title)}>{fields.title}</Title>
        <Ornament kind={kind} slot="divider" className="mx-auto mt-4 h-6 w-40" />
      </div>
      <Body className="mt-6" cms={cmsAttrs(at(page, "text"), fields.text, { optional: true, multiline: true })}>{fields.text}</Body>
      <p {...cmsAttrs(at(page, "note"), fields.note, { optional: true })} className="mt-8 text-right text-[1.75rem]" style={{ ...script, color: "var(--w-accent)" }}>
        {fields.note}
      </p>
    </div>
  );
}

function Evento({ page, fields, events, kind }: PageProps) {
  return (
    <div className="px-7 pt-14 pb-10 text-center sm:px-12">
      <Title cms={cmsAttrs(at(page, "title"), fields.title)}>{fields.title}</Title>
      <Ornament kind={kind} slot="divider" className="mx-auto mt-4 h-6 w-40" />
      <Body className="mx-auto mt-5 max-w-sm" cms={cmsAttrs(at(page, "text"), fields.text, { optional: true, multiline: true })}>{fields.text}</Body>
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

function Step({ n, children, value, cms }: { n: string; children: React.ReactNode; value?: string; cms: Cms }) {
  return (
    <div {...cmsBox(value)} className="flex items-baseline gap-4 rounded-xl px-4 py-3" style={{ background: "color-mix(in srgb, var(--w-bg) 45%, var(--w-paper))" }}>
      <span className="text-[1.75rem] leading-none" style={{ ...display, color: "var(--w-accent)", fontWeight: 600 }}>{n}</span>
      <Body cms={cms}>{children}</Body>
    </div>
  );
}

function Option({ n, children, value, cms }: { n: string; children: React.ReactNode; value?: string; cms: Cms }) {
  return (
    <div {...cmsBox(value)} className="flex flex-1 flex-col gap-2 rounded-xl px-4 py-4" style={{ border: "1px solid var(--w-line)", background: "var(--w-paper)" }}>
      <span className="text-[1.75rem] leading-none" style={{ ...display, color: "var(--w-accent)", fontWeight: 600 }}>{n}</span>
      <Body cms={cms}>{children}</Body>
    </div>
  );
}

// Campo opcional dentro de uma caixa que some junto com ele.
const boxed = (page: InvitationPageKind, key: string, value?: string) =>
  ({ value, cms: cmsAttrs(at(page, key), value, { optional: true, boxed: true, multiline: true }) });

function Presentes({ page, fields, slug, kind }: PageProps) {
  return (
    <div className="px-6 pt-14 pb-10 sm:px-10">
      <div className="text-center">
        <Title cms={cmsAttrs(at(page, "title"), fields.title)}>{fields.title}</Title>
        <Body className="mx-auto mt-4 max-w-sm italic" cms={cmsAttrs(at(page, "intro"), fields.intro, { optional: true, multiline: true })}>{fields.intro}</Body>
        <Ornament kind={kind} slot="divider" className="mx-auto mt-4 h-6 w-40" />
      </div>
      <div className="mt-6 space-y-3">
        <Step n="01" {...boxed(page, "step1", fields.step1)}>{fields.step1}</Step>
        <Step n="02" {...boxed(page, "step2", fields.step2)}>{fields.step2}</Step>
      </div>
      <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Option n="03" {...boxed(page, "optionOnline", fields.optionOnline)}>{fields.optionOnline}</Option>
        {fields.optionOnline && fields.optionFree && (
          <span className="self-center text-[1.5rem]" style={{ ...script, color: "var(--w-accent)" }}>ou</span>
        )}
        <Option n="04" {...boxed(page, "optionFree", fields.optionFree)}>{fields.optionFree}</Option>
      </div>
      <div {...cmsBox(fields.button)} className="mt-8 text-center">
        <TagLink href={`/${slug}/presentes`}>
          <span {...cmsAttrs(at(page, "button"), fields.button, { optional: true, boxed: true })}>{fields.button}</span>
        </TagLink>
      </div>
      <div {...cmsBox(fields.note)} className="mt-8 flex justify-center">
          <p
            {...cmsAttrs(at(page, "note"), fields.note, { optional: true, boxed: true })}
            className="-rotate-1 px-6 py-2 text-[1.5rem]"
            style={{ ...script, background: "var(--w-accent)", color: "var(--w-accent-ink)", clipPath: "polygon(0 8%, 100% 0, 98% 100%, 2% 92%)" }}
          >
            {fields.note}
          </p>
      </div>
    </div>
  );
}

function Rsvp({ page, fields, slug, kind }: PageProps) {
  return (
    <div className="px-7 pt-14 pb-12 text-center sm:px-12">
      <Title cms={cmsAttrs(at(page, "title"), fields.title)}>{fields.title}</Title>
      <Ornament kind={kind} slot="divider" className="mx-auto mt-4 h-6 w-40" />
      <Body className="mx-auto mt-5 max-w-sm" cms={cmsAttrs(at(page, "text"), fields.text, { optional: true, multiline: true })}>{fields.text}</Body>
      <div {...cmsBox(fields.button)} className="mt-8">
        <TagLink href={`/${slug}#confirmar`}>
          <span {...cmsAttrs(at(page, "button"), fields.button, { optional: true, boxed: true })}>{fields.button}</span>
        </TagLink>
      </div>
    </div>
  );
}

function Encerramento({ page, fields, kind }: PageProps) {
  return (
    <div className="px-7 pt-14 pb-10 text-center sm:px-12">
      <Title cms={cmsAttrs(at(page, "title"), fields.title)}>{fields.title}</Title>
      <Ornament kind={kind} slot="divider" className="mx-auto mt-4 h-6 w-40" />
      <Body className="mx-auto mt-5 max-w-sm italic" cms={cmsAttrs(at(page, "text"), fields.text, { optional: true, multiline: true })}>{fields.text}</Body>
      <p {...cmsAttrs(at(page, "signature"), fields.signature, { optional: true })} className="mt-3 text-[2.5rem] leading-tight" style={{ ...script, color: "var(--w-accent)" }}>
        {fields.signature}
      </p>
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

export function InvitationView({ slug, coupleNames, events, pages, collectionKey, fontPairKey }: Props) {
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
            className="relative flex min-h-dvh items-center justify-center overflow-x-clip px-4 py-12"
          >
            <Ornament kind={kind} slot="side" className="absolute inset-y-10 left-[max(1rem,calc(50%-560px))] hidden w-48 lg:block" />
            <Ornament kind={kind} slot="side" className="absolute inset-y-10 right-[max(1rem,calc(50%-560px))] hidden w-48 -scale-x-100 lg:block" />
            <div className="relative w-full max-w-[560px]">
              <Ornament kind={kind} slot="corner" className="absolute -top-8 -right-5 z-10 h-24 w-24 sm:-right-8 sm:h-28 sm:w-28" />
              <Paper>
                <Render page={page.kind} fields={page.fields} slug={slug} coupleNames={coupleNames} events={events} kind={kind} />
              </Paper>
              {i === 0 && visible.length > 1 && (
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
