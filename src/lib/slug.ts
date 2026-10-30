const RESERVED = new Set([
  "api", "painel", "entrar", "criar", "sair", "admin", "convite", "presentes",
  "precos", "privacidade", "termos", "ajuda", "_next", "static", "favicon.ico",
]);

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, "e")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])$/.test(slug) && !RESERVED.has(slug);
}
