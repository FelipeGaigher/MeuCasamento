const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// Valores sempre em centavos no banco e no codigo.
export const formatBRL = (cents: number) => brl.format(cents / 100);

// "1.234,56" | "1234,56" | "1234.56" | "R$ 50" -> centavos
export function parseBRL(input: string): number | null {
  const clean = input.replace(/[^\d,.-]/g, "").trim();
  if (!clean) return null;
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}
