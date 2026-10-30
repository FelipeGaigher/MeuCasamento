// Estrutura do convite e das secoes do site. Os textos padrao sao sugestoes;
// data, horario e local nunca ficam aqui: vem da tabela Event.

export type InvitationPageKind = "capa" | "historia" | "evento" | "presentes" | "rsvp" | "encerramento";

export type InvitationPage = {
  kind: InvitationPageKind;
  enabled: boolean;
  fields: Record<string, string>;
};

export const PAGE_LABELS: Record<InvitationPageKind, string> = {
  capa: "Capa",
  historia: "Nossa historia",
  evento: "Quando e onde",
  presentes: "Como nos presentear",
  rsvp: "Confirmacao de presenca",
  encerramento: "Encerramento",
};

// Campos editaveis de cada pagina: [chave, rotulo, tipo]
export const PAGE_FIELDS: Record<InvitationPageKind, [string, string, "text" | "textarea"][]> = {
  capa: [
    ["kicker", "Chamada acima dos nomes", "text"],
    ["phrase", "Frase", "textarea"],
  ],
  historia: [
    ["title", "Titulo", "text"],
    ["text", "Texto", "textarea"],
    ["note", "Nota manuscrita", "text"],
  ],
  evento: [
    ["title", "Titulo", "text"],
    ["text", "Texto", "textarea"],
  ],
  presentes: [
    ["title", "Titulo", "text"],
    ["intro", "Introducao", "textarea"],
    ["step1", "Passo 1", "text"],
    ["step2", "Passo 2", "text"],
    ["optionOnline", "Opcao: comprar pela lista", "textarea"],
    ["optionFree", "Opcao: escolher por conta propria", "textarea"],
    ["button", "Texto do botao", "text"],
    ["note", "Faixa final", "text"],
  ],
  rsvp: [
    ["title", "Titulo", "text"],
    ["text", "Texto", "textarea"],
    ["button", "Texto do botao", "text"],
  ],
  encerramento: [
    ["title", "Titulo", "text"],
    ["text", "Agradecimento", "textarea"],
    ["signature", "Assinatura", "text"],
  ],
};

export function defaultInvitationPages(coupleNames: string): InvitationPage[] {
  return [
    {
      kind: "capa",
      enabled: true,
      fields: {
        kicker: "Casamento",
        phrase: "Cada detalhe da nossa historia nos trouxe ate aqui. Agora queremos celebrar esse novo capitulo com voce.",
      },
    },
    {
      kind: "historia",
      enabled: true,
      fields: { title: "Nossa historia", text: "Conte aqui como tudo comecou.", note: "E foi aqui que tudo mudou." },
    },
    { kind: "evento", enabled: true, fields: { title: "Quando e onde", text: "Esperamos voce para celebrar com a gente." } },
    {
      kind: "presentes",
      enabled: true,
      fields: {
        title: "Como nos presentear?",
        intro: "Preparamos uma lista de presentes pensando no nosso novo lar.",
        step1: "Escolha um presente da nossa lista.",
        step2: "Confirme a sua escolha.",
        optionOnline: "Prefere comprar pela lista on-line? Acesse o link e escolha seu presente.",
        optionFree: "Prefere escolher por conta propria? Leve seu presente no dia da festa.",
        button: "Acessar lista de presentes",
        note: "Um pedacinho do nosso novo lar.",
      },
    },
    {
      kind: "rsvp",
      enabled: true,
      fields: { title: "Confirme sua presenca", text: "Sua resposta nos ajuda a preparar tudo com carinho.", button: "Confirmar presenca" },
    },
    {
      kind: "encerramento",
      enabled: true,
      fields: { title: "Nos vemos la!", text: "Com carinho,", signature: coupleNames },
    },
  ];
}

export type SiteSectionKey = "historia" | "eventos" | "rsvp" | "presentes" | "galeria";

export type SiteSection = { key: SiteSectionKey; enabled: boolean };

export const SECTION_LABELS: Record<SiteSectionKey, string> = {
  historia: "Nossa historia",
  eventos: "Quando e onde",
  rsvp: "Confirmacao de presenca",
  presentes: "Lista de presentes",
  galeria: "Galeria de fotos",
};

export const DEFAULT_SECTIONS: SiteSection[] = [
  { key: "historia", enabled: true },
  { key: "eventos", enabled: true },
  { key: "rsvp", enabled: true },
  { key: "presentes", enabled: true },
  { key: "galeria", enabled: false },
];

// Le o JSON do banco com tolerancia: chave desconhecida cai fora, faltante entra no fim.
export function readSections(raw: unknown): SiteSection[] {
  const list = Array.isArray(raw) ? (raw as SiteSection[]) : [];
  const known = list.filter((s) => s && s.key in SECTION_LABELS);
  const missing = DEFAULT_SECTIONS.filter((d) => !known.some((s) => s.key === d.key));
  return [...known.map((s) => ({ key: s.key, enabled: !!s.enabled })), ...missing];
}

export function readPages(raw: unknown, coupleNames: string): InvitationPage[] {
  const defaults = defaultInvitationPages(coupleNames);
  const list = Array.isArray(raw) ? (raw as InvitationPage[]) : [];
  return defaults.map((d) => {
    const saved = list.find((p) => p && p.kind === d.kind);
    return saved ? { kind: d.kind, enabled: saved.enabled !== false, fields: { ...d.fields, ...(saved.fields ?? {}) } } : d;
  });
}
