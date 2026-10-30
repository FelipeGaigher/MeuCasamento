import Link from "next/link";
import { cn } from "@/lib/cn";

// Componentes base do painel e da LP. Formulario usa FORM_GRID + Field.

export const FORM_GRID = "grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand/90",
  secondary: "border border-line bg-surface text-ink hover:bg-canvas",
  ghost: "text-ink hover:bg-canvas",
  danger: "border border-danger/30 bg-surface text-danger hover:bg-danger-soft",
};

export function buttonClass(variant: ButtonVariant = "primary", extra?: string) {
  return cn(
    "t-label inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 transition disabled:cursor-not-allowed disabled:opacity-50",
    buttonStyles[variant],
    extra,
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

const inputClass =
  "t-body w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, "h-10", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} {...props} className={cn(inputClass, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputClass, "h-10", props.className)} />;
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
    <label className={cn("flex flex-col gap-1.5", wide && "sm:col-span-2")}>
      <span className="t-label text-ink">{label}</span>
      {children}
      {hint && <span className="t-meta">{hint}</span>}
    </label>
  );
}

export function Checkbox({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="t-body flex items-center gap-2 text-ink">
      <input type="checkbox" className="size-4 accent-brand" {...props} />
      {label}
    </label>
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-line bg-surface p-5", className)} {...props} />;
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
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="t-page">{title}</h1>
        {description && <p className="t-body mt-1 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Figure({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <Card>
      <p className="t-meta">{label}</p>
      <p className="t-value mt-1">{value}</p>
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

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={cn("t-label inline-flex items-center rounded-full border px-2.5 py-0.5", toneStyles[tone])}>{children}</span>;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <Card className="flex flex-col items-center gap-2 py-12 text-center">
      <p className="t-section">{title}</p>
      <p className="t-body max-w-md text-muted">{text}</p>
      {action && <div className="mt-3">{action}</div>}
    </Card>
  );
}

export function Notice({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return <div className={cn("t-body rounded-xl border px-4 py-3", toneStyles[tone])}>{children}</div>;
}
