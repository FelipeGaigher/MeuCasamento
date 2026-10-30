import Link from "next/link";
import { COLLECTIONS } from "@/collections";
import { CollectionCard } from "@/components/landing/CollectionCard";
import { Faq } from "@/components/landing/Faq";
import { InviteTryout } from "@/components/landing/InviteTryout";
import { ButtonLink } from "@/components/ui";
import { formatBRL } from "@/lib/money";
import { computeSplit, splitConfigFromEnv } from "@/lib/split";

// Casamento de demonstracao do seed (prisma/seed.ts).
const DEMO_SLUG = "ana-e-pedro";

const STEPS = [
  { title: "Conte a história e escolha o estilo", text: "Nome do casal, data, local e um pouco de vocês. A coleção veste o convite e o site juntos." },
  { title: "Revise os textos", text: "Os textos ficam num formulário, não dentro de uma imagem. O que vocês escrevem é o que o convidado lê." },
  { title: "Mande o link", text: "Um link só leva ao convite, ao site, à confirmação de presença e à lista de presentes." },
];

// O que o casal faz hoje e como fica aqui. Cada linha e uma dor real de quem ja casou.
const BEFORE_AFTER: [string, string][] = [
  ["Convite feito num editor de imagem. Errou a data, refaz a arte.", "Data, horário e local cadastrados uma vez. Mudou, o convite e o site mudam juntos."],
  ["Confirmação de presença numa planilha, preenchida a partir de mensagens no WhatsApp.", "Cada família recebe um link próprio e responde em um toque. A lista se atualiza sozinha."],
  ["Lista de presentes em outro site, separada do convite.", "O convidado escolhe o presente no mesmo link, paga no Pix e o valor cai na conta de vocês."],
  ["Texto do convite cortado ou ilegível no celular.", "Texto de verdade, que se ajusta à tela do celular e do computador."],
];

const EXAMPLES = [100_00, 250_00, 500_00];

export default function Home() {
  const cfg = splitConfigFromEnv();
  const pct = (cfg.feeBps / 100).toLocaleString("pt-BR");

  return (
    <div className="bg-canvas">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <Link href="/" className="font-serif text-2xl text-brand">Meu Casamento</Link>
        <nav className="flex items-center gap-2">
          <Link href="/entrar" className="t-action px-3 py-2 text-muted hover:text-ink">Entrar</Link>
          <ButtonLink href="/criar">Criar grátis</ButtonLink>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-6 pb-16 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:pt-14">
        <div>
          <h1 className="t-display text-ink">Convite, site, confirmação e lista de presentes num lugar só.</h1>
          <p className="t-body mt-5 max-w-xl text-muted">
            Vocês contam a história e escolhem o estilo. O convite abre bem em qualquer tela, o convidado confirma em um
            toque e o presente cai direto na conta do casal.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/criar" size="lg">Criar meu casamento</ButtonLink>
            <ButtonLink href={`/${DEMO_SLUG}`} variant="secondary" size="lg">Ver um casamento de exemplo</ButtonLink>
          </div>
          <p className="t-meta mt-4">Grátis para montar e publicar. Sem cartão de crédito.</p>
        </div>
        <InviteTryout />
      </section>

      <section id="como-funciona" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
          <h2 className="t-headline">Como funciona</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t-2 border-brand pt-4">
                <p className="t-group text-brand">Passo {i + 1}</p>
                <p className="t-section mt-1">{s.title}</p>
                <p className="t-body mt-2 text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
        <h2 className="t-headline">O que muda para vocês</h2>
        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <div className="hidden grid-cols-2 border-b border-line bg-canvas md:grid">
            <p className="t-group px-5 py-3">Como costuma ser</p>
            <p className="t-group px-5 py-3 text-brand">No Meu Casamento</p>
          </div>
          <ul className="divide-y divide-line">
            {BEFORE_AFTER.map(([before, after]) => (
              <li key={before} className="grid md:grid-cols-2">
                <p className="t-body px-5 pt-4 text-muted md:py-4">{before}</p>
                <p className="t-body px-5 pt-1 pb-4 text-ink md:py-4">{after}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
          <h2 className="t-headline">Coleções</h2>
          <p className="t-body mt-2 max-w-2xl text-muted">Cada coleção veste o convite e o site ao mesmo tempo. Troque quando quiser.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {COLLECTIONS.map((c) => (
              <div key={c.key}>
                <CollectionCard collection={c} />
                <p className="t-section mt-3">{c.name}</p>
                <p className="t-body text-muted">{c.mood}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <h2 className="t-headline">Preço</h2>
          <p className="t-body mt-3 max-w-md text-muted">
            Convite, site e confirmação de presença são grátis, sem limite de convidados. Cobramos {pct}% só quando um
            presente é pago no Pix, com mínimo de {formatBRL(cfg.minFeeCents)} por presente.
          </p>
        </div>
        <table className="w-full overflow-hidden rounded-2xl bg-surface shadow-card">
          <caption className="sr-only">Quanto o casal recebe por presente</caption>
          <thead>
            <tr className="border-b border-line bg-canvas text-left">
              <th scope="col" className="t-group px-5 py-3">Presente</th>
              <th scope="col" className="t-group px-5 py-3">Taxa</th>
              <th scope="col" className="t-group px-5 py-3 text-brand">Vocês recebem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {EXAMPLES.map((total) => {
              const s = computeSplit(total, cfg);
              return (
                <tr key={total}>
                  <td className="t-body px-5 py-3 tabular-nums">{formatBRL(s.totalCents)}</td>
                  <td className="t-body px-5 py-3 text-muted tabular-nums">{formatBRL(s.feeCents)}</td>
                  <td className="t-value px-5 py-3">{formatBRL(s.coupleCents)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
          <h2 className="t-headline">Perguntas frequentes</h2>
          <div className="mt-8"><Faq /></div>
        </div>
      </section>

      <section className="bg-brand">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="t-headline text-white">Montem o convite hoje e mandem o link amanhã.</h2>
            <p className="t-body mt-2 text-white/80">O cadastro pede o nome do casal, a data e o local. O convite já sai montado com eles.</p>
          </div>
          <Link href="/criar" className="t-action inline-flex h-12 shrink-0 items-center rounded-lg bg-white px-6 text-brand hover:bg-canvas">
            Criar meu casamento
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <p className="t-meta">Meu Casamento, {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
