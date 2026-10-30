// Classes do site publico, sempre sobre as variaveis --w-* do tema.
export const pub = {
  paper: "rounded-xl border border-[var(--w-line)] bg-[var(--w-paper)]",
  title: "[font-family:var(--w-display)] text-[var(--w-accent)] text-3xl sm:text-4xl leading-tight tracking-wide",
  kicker: "[font-family:var(--w-script)] text-[var(--w-accent)] text-2xl",
  body: "[font-family:var(--w-body)] text-[var(--w-ink)] text-[17px] leading-relaxed",
  muted: "[font-family:var(--w-body)] text-[var(--w-muted)] text-base leading-relaxed",
  label: "[font-family:var(--w-body)] text-[var(--w-ink)] text-base",
  input:
    "w-full rounded-lg border border-[var(--w-line)] bg-white/80 px-3 py-2.5 text-base text-[var(--w-ink)] [font-family:var(--w-body)] focus:border-[var(--w-accent)] focus:outline-none",
  button:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--w-accent)] px-6 text-base tracking-wide text-[var(--w-accent-ink)] [font-family:var(--w-body)] transition hover:opacity-90 disabled:opacity-50",
  buttonGhost:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--w-accent)] px-6 text-base tracking-wide text-[var(--w-accent)] [font-family:var(--w-body)] transition hover:bg-[var(--w-accent)]/5 disabled:opacity-50",
};
