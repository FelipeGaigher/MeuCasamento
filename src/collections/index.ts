// Colecoes: identidade visual compartilhada por convite e site.
// A arte e desenhada por CSS/SVG em src/components/site/Ornaments.tsx; o texto
// nunca faz parte da arte (ver docs/decisoes.md).

export type Palette = {
  bg: string; // fundo da pagina
  paper: string; // papel onde o texto fica
  ink: string; // texto principal
  muted: string; // texto secundario
  accent: string; // titulos, numeros, botoes
  accentInk: string; // texto sobre o accent
  leaf: string; // detalhe botanico
  line: string; // bordas e filetes
};

export type Collection = {
  key: string;
  name: string;
  mood: string;
  ornament: "cereja" | "oliva" | "mar";
  palette: Palette;
  defaultFontPair: FontPairKey;
};

export const COLLECTIONS: Collection[] = [
  {
    key: "cereja",
    name: "Cereja",
    mood: "Papel creme, vermelho-cereja e folhas oliva. Romantica e editorial.",
    ornament: "cereja",
    palette: {
      bg: "#efe6da",
      paper: "#fbf6ee",
      ink: "#3b1f22",
      muted: "#6e5552",
      accent: "#8c1d2c",
      accentInk: "#fbf3e8",
      leaf: "#7d8a5a",
      line: "#d9c5b2",
    },
    defaultFontPair: "classica",
  },
  {
    key: "oliva",
    name: "Oliva",
    mood: "Verde-oliva, off-white e linho. Casamento no campo, leve e natural.",
    ornament: "oliva",
    palette: {
      bg: "#e9e7dc",
      paper: "#fbfaf4",
      ink: "#2c3222",
      muted: "#5f6652",
      accent: "#55633a",
      accentInk: "#f7f6ee",
      leaf: "#8a9a62",
      line: "#cfd2bd",
    },
    defaultFontPair: "romantica",
  },
  {
    key: "mar",
    name: "Mar",
    mood: "Azul profundo, areia e branco. Casamento na praia, limpo e solar.",
    ornament: "mar",
    palette: {
      bg: "#e6e4dc",
      paper: "#fdfcf8",
      ink: "#1c2a3a",
      muted: "#4f5d6b",
      accent: "#1f4e79",
      accentInk: "#f6f3ea",
      leaf: "#c2a878",
      line: "#cdd3d8",
    },
    defaultFontPair: "moderna",
  },
];

export function getCollection(key: string | null | undefined): Collection {
  return COLLECTIONS.find((c) => c.key === key) ?? COLLECTIONS[0];
}

export type FontPairKey = "classica" | "romantica" | "moderna";

// As variaveis CSS sao definidas em src/app/layout.tsx (next/font).
export const FONT_PAIRS: Record<FontPairKey, { name: string; display: string; script: string; body: string }> = {
  classica: {
    name: "Classica",
    display: "var(--font-cormorant)",
    script: "var(--font-pinyon)",
    body: "var(--font-cormorant)",
  },
  romantica: {
    name: "Romantica",
    display: "var(--font-cormorant)",
    script: "var(--font-greatvibes)",
    body: "var(--font-cormorant)",
  },
  moderna: {
    name: "Moderna",
    display: "var(--font-playfair)",
    script: "var(--font-pinyon)",
    body: "var(--font-inter)",
  },
};

export function getFontPair(key: string | null | undefined) {
  return FONT_PAIRS[(key as FontPairKey) in FONT_PAIRS ? (key as FontPairKey) : "classica"];
}

// Variaveis CSS que o convite e o site usam (style={themeVars(...)})
export function themeVars(collectionKey: string, fontPairKey?: string | null): Record<string, string> {
  const c = getCollection(collectionKey);
  const f = getFontPair(fontPairKey ?? c.defaultFontPair);
  const p = c.palette;
  return {
    "--w-bg": p.bg,
    "--w-paper": p.paper,
    "--w-ink": p.ink,
    "--w-muted": p.muted,
    "--w-accent": p.accent,
    "--w-accent-ink": p.accentInk,
    "--w-leaf": p.leaf,
    "--w-line": p.line,
    "--w-display": f.display,
    "--w-script": f.script,
    "--w-body": f.body,
  };
}
