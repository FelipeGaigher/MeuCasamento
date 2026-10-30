import { PAGE_FIELDS, type InvitationPageKind } from "@/collections/content";

// Textos editaveis no preview do painel e na edicao direto na pagina.
// O caminho e o mesmo nos dois lados: data-cms-path na pagina e
// data-cms-field no formulario do painel.
//   site.heroTitle | site.heroSubtitle | site.story
//   pages.<pagina>.<campo>   (campos de PAGE_FIELDS)

export type CmsCopy = Record<string, string>;

// Mensagens trocadas entre o editor do painel e o iframe da previa.
export const EDITOR_SRC = "mc-editor";
export const PAGE_SRC = "mc-page";

export const SITE_FIELDS = { heroTitle: 120, heroSubtitle: 120, story: 6000 } as const;
export const PAGE_FIELD_MAX = 2000;

export function maxLengthFor(path: string): number | null {
  const site = /^site\.(\w+)$/.exec(path);
  if (site) return (SITE_FIELDS as Record<string, number>)[site[1]] ?? null;
  const page = /^pages\.(\w+)\.(\w+)$/.exec(path);
  if (page) {
    const fields = PAGE_FIELDS[page[1] as InvitationPageKind];
    return fields?.some(([key]) => key === page[2]) ? PAGE_FIELD_MAX : null;
  }
  return null;
}

// Payload vindo de postMessage ou do cliente: objeto plano so com strings,
// caminhos conhecidos e tamanho dentro do limite.
export function readCopy(raw: unknown): CmsCopy | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  if (Object.getPrototypeOf(raw) !== Object.prototype) return null;
  const out: CmsCopy = {};
  for (const [path, value] of Object.entries(raw)) {
    if (typeof value !== "string") return null;
    const max = maxLengthFor(path);
    if (max === null || value.length > max) return null;
    out[path] = value;
  }
  return out;
}

// "Ana & Pedro" -> ["Ana", "& Pedro"], para quebrar os nomes em duas linhas.
export function splitNames(coupleNames: string): [string, string | null] {
  const m = coupleNames.split(/\s*(?:&|\se\s)\s*/i);
  if (m.length >= 2 && m[0] && m[1]) return [m[0], `& ${m.slice(1).join(" & ")}`];
  return [coupleNames, null];
}

// Liga o editor na pagina publica: sempre em desenvolvimento; em producao so
// com a variavel exatamente "true" (variavel ausente = desligado).
export const INLINE_CMS_ENABLED =
  process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_INLINE_CMS === "true";

type CmsOptions = { optional?: boolean; multiline?: boolean; fallback?: string; format?: "names"; boxed?: boolean };

// Atributos do no editavel. Campo opcional vazio sai escondido (o no ou a
// caixa [data-cms-box] em volta dele), mas continua no DOM para o preview
// e a edicao na pagina conseguirem mostrar o texto novo.
export function cmsAttrs(path: string, value: string | null | undefined, opts: CmsOptions = {}) {
  const empty = !value?.trim();
  return {
    "data-cms-path": path,
    ...(opts.optional ? { "data-cms-optional": "" } : {}),
    ...(opts.optional && !opts.boxed && empty ? { hidden: true } : {}),
    ...(opts.multiline ? { "data-cms-multiline": "" } : {}),
    ...(opts.fallback ? { "data-cms-fallback": opts.fallback } : {}),
    ...(opts.format ? { "data-cms-format": opts.format } : {}),
  };
}

// Caixa em volta de um campo opcional: some junto com o texto.
export function cmsBox(value: string | null | undefined) {
  return { "data-cms-box": "", hidden: !value?.trim() };
}
