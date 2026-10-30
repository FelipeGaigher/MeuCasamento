import Link from "next/link";
import { cn } from "@/lib/cn";

// Componentes base do painel e da LP, na estrutura do DS da Flovi e da Nautica:
// cartao rounded-2xl com shadow-card, controle rounded-lg, item interno rounded-xl,
// chip rounded-full. Formulario usa FORM_GRID + Field.

export const FORM_GRID = "grid w-full grid-cols-1 gap-4 sm:grid-cols-2";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "sm" | "lg";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white shadow-card hover:bg-brand/90 hover:shadow-elevated",
  secondary: "border border-line bg-surface text-ink hover:bg-canvas hover:shadow-card",
  ghost: "text-muted hover:bg-brand/5 hover:text-ink",
  danger: "border border-danger/30 bg-surface text-danger hover:bg-danger-soft",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3",
  md: "h-9 px-4",
  lg: "h-12 px-6",
};

export function buttonClass(variant: ButtonVariant = "primary", extra?: string, size: ButtonSize = "md") {
  return cn(
    "t-action inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg whitespace-nowrap transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
    buttonSizes[size],
    buttonStyles[variant],
    extra,
  );
}

export function Button({
  variant = "primary",
  size,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={buttonClass(variant, className, size)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size,
  className,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link className={buttonClass(variant, className, size)} {...props} />;
}

const inputClass =
  "t-body w-full rounded-lg border border-line bg-canvas/60 px-3 text-ink transition-colors placeholder:text-muted/70 focus:border-brand/50 focus:bg-surface focus:ring-2 focus:ring-brand/20 focus:outline-none disabled:opacity-50";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, "h-10", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} {...props} className={cn(inputClass, "py-2", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputClass, "h-10 cursor-pointer", props.className)} />;
}

export function Field({
  label,
  hint,
  wide,
  children,
}: {
  label: string;
  hint?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", wide && "sm:col-span-full")}>
      <span className="t-label text-ink">{label}</span>
      {children}
      {hint && <span className="t-meta">{hint}</span>}
    </label>
  );
}

export function Checkbox({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="t-body inline-flex w-fit min-h-6 cursor-pointer items-center gap-2 text-ink">
      <input type="checkbox" className="size-4 cursor-pointer accent-brand" {...props} />
      {label}
    </label>
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-line bg-surface p-4 shadow-card", className)} {...props} />;
}

// Bloco de conteudo do painel: titulo, explicacao curta e acao no canto.
export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5", className)}>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <h2 className="t-section">{title}</h2>
          {description && <p className="t-meta mt-0.5 max-w-2xl">{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1 className="t-page">{title}</h1>
        {description && <p className="t-body mt-1 max-w-3xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex max-w-full shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Figure({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <Card>
      <p className="t-meta">{label}</p>
      <p className="t-result mt-1">{value}</p>
      {hint && <p className="t-meta mt-1">{hint}</p>}
    </Card>
  );
}

type Tone = "neutral" | "ok" | "warn" | "danger" | "brand";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-canvas text-muted border-line",
  ok: "bg-ok-soft text-ok border-ok/20",
  warn: "bg-warn-soft text-warn border-warn/20",
  danger: "bg-danger-soft text-danger border-danger/20",
  brand: "bg-brand-soft text-brand border-brand/20",
};

// Chip de status (StatusChip da Nautica): pilula pequena, sem borda.
const chipStyles: Record<Tone, string> = {
  neutral: "bg-line/60 text-muted",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  brand: "bg-brand-soft text-brand",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={cn("t-chip inline-flex items-center gap-1 rounded-full px-2 py-0.5 whitespace-nowrap", chipStyles[tone])}>
      {children}
    </span>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface/60 px-6 py-10 text-center">
      <p className="t-section">{title}</p>
      <p className="t-body mt-1.5 max-w-sm text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Notice({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return <div className={cn("t-body rounded-xl border px-4 py-3", toneStyles[tone])}>{children}</div>;
}

// Controle segmentado (Segmented da Nautica): troca de visao no mesmo lugar.
export function Segmented<K extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: { key: K; label: React.ReactNode; title?: string }[];
  value: K;
  onChange: (key: K) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn("flex items-center gap-1 rounded-lg bg-line/50 p-1", className)}>
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          title={o.title}
          aria-pressed={value === o.key}
          onClick={() => onChange(o.key)}
          className={cn(
            "t-action flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-1 transition-colors [&_svg]:size-3.5",
            value === o.key ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Botao so com icone (barra de ferramentas, ordenacao). O rotulo vai no aria-label.
export function IconButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { "aria-label": string }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        // sem-plastico-ignore: icone-em-caixa — botao de ferramenta: fundo so no hover, area de clique de 32px
        "inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-brand/5 hover:text-ink disabled:pointer-events-none disabled:opacity-30 [&_svg]:size-4",
        className,
      )}
    />
  );
}
