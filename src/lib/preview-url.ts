import { COLLECTIONS, FONT_PAIRS } from "@/collections";
import {
  DEFAULT_SECTIONS,
  PAGE_LABELS,
  SECTION_LABELS,
  type InvitationPageKind,
  type SiteSection,
  type SiteSectionKey,
} from "@/collections/content";

// Estrutura do rascunho que vai na URL da previa (o texto vai por postMessage).
// Mudou a estrutura, o iframe recarrega; mudou so o texto, nao.
//   c   colecao                  f   par de fontes
//   s   secoes do site, em ordem; "!" na frente = desligada
//   p   paginas do convite ligadas/desligadas, mesmo formato
//   img foto do topo do site

type Order<K extends string> = { key: K; enabled: boolean }[];

export function encodeOrder<K extends string>(list: Order<K>): string {
  return list.map((s) => (s.enabled ? s.key : `!${s.key}`)).join(",");
}

function decodeOrder<K extends string>(raw: string | undefined, known: readonly K[]): Order<K> | null {
  if (!raw) return null;
  const out: Order<K> = [];
  for (const part of raw.split(",")) {
    const enabled = !part.startsWith("!");
    const key = (enabled ? part : part.slice(1)) as K;
    if (!known.includes(key) || out.some((s) => s.key === key)) return null;
    out.push({ key, enabled });
  }
  return out;
}

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function readCollection(p: Params): string | null {
  const c = one(p.c);
  return c && COLLECTIONS.some((x) => x.key === c) ? c : null;
}

export function readFontPair(p: Params): string | null {
  const f = one(p.f);
  return f && f in FONT_PAIRS ? f : null;
}

export function readSiteSections(p: Params): SiteSection[] | null {
  const list = decodeOrder(one(p.s), Object.keys(SECTION_LABELS) as SiteSectionKey[]);
  if (!list) return null;
  return [...list, ...DEFAULT_SECTIONS.filter((d) => !list.some((s) => s.key === d.key))];
}

export function readPageToggles(p: Params): Map<InvitationPageKind, boolean> | null {
  const list = decodeOrder(one(p.p), Object.keys(PAGE_LABELS) as InvitationPageKind[]);
  return list ? new Map(list.map((s) => [s.key, s.enabled])) : null;
}

export function readImage(p: Params): string | null | undefined {
  const img = one(p.img);
  if (img === undefined) return undefined;
  return /^https:\/\/\S+$/.test(img) && img.length <= 1000 ? img : null;
}
