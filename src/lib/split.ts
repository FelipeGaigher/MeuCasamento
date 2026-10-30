// Divisao de um presente entre o casal e a plataforma.
// A cobranca sai da conta da plataforma com split de valor fixo para a subconta
// do casal. O Asaas desconta a tarifa dele antes do split, entao a plataforma
// absorve a tarifa: margem = taxa - tarifa do Asaas. A taxa minima garante que
// o valor fixo do casal nunca passe do liquido da cobranca.

export type SplitConfig = { feeBps: number; minFeeCents: number };

export type Split = { totalCents: number; feeCents: number; coupleCents: number };

export function computeSplit(totalCents: number, cfg: SplitConfig): Split {
  if (!Number.isInteger(totalCents) || totalCents <= 0) throw new Error("Total invalido");
  const pct = Math.round((totalCents * cfg.feeBps) / 10_000);
  const feeCents = Math.min(totalCents, Math.max(pct, cfg.minFeeCents));
  return { totalCents, feeCents, coupleCents: totalCents - feeCents };
}

export function splitConfigFromEnv(): SplitConfig {
  return {
    feeBps: Number(process.env.PLATFORM_FEE_BPS ?? 350),
    minFeeCents: Number(process.env.PLATFORM_MIN_FEE_CENTS ?? 300),
  };
}
