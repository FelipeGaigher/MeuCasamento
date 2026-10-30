import Link from "next/link";
import { CalendarCheck, Gift, MonitorSmartphone, PenLine, Type, Wallet } from "lucide-react";
import { COLLECTIONS } from "@/collections";
import { CollectionCard } from "@/components/landing/CollectionCard";
import { Faq } from "@/components/landing/Faq";
import { ButtonLink } from "@/components/ui";

const STEPS = [
  { n: "01", title: "Conte a história e escolha o estilo", text: "Nome do casal, data, local e um pouco de vocês. Escolha a coleção que tem a cara do casamento." },
  { n: "02", title: "Revise os textos", text: "Os textos ficam num formulário, não dentro de uma imagem. O que vocês escrevem é exatamente o que o convidado lê." },
  { n: "03", title: "Compartilhe", text: "Um link só para o convite, o site, a confirmação de presença e a lista de presentes. Pronto para o WhatsApp." },
];

const PAINS = [
  { icon: Type, title: "Texto de verdade, não imagem", text: "Nada de frase cortada ou palavra trocada pela arte. O texto é editável até o último dia." },
  { icon: MonitorSmartphone, title: "Bonito no celular e no computador", text: "O convite se adapta à tela. Nada de arte esticada nem botão que some." },
  { icon: CalendarCheck, title: "Dados do evento num lugar só", text: "Data, horário e local são cadastrados uma vez e aparecem iguais no convite, no site e nos lembretes." },
  { icon: PenLine, title: "Confirmação em destaque", text: "A resposta do convidado é a ação principal, com link pessoal para cada família." },
  { icon: Wallet, title: "Presente em dinheiro direto para o casal", text: "O convidado escolhe o presente e paga no Pix. O valor cai na conta de vocês." },
  { icon: Gift, title: "Lista montada sem caçar link", text: "Cadastre cotas e produtos num só lugar e acompanhe cada presente recebido." },
];

export default function Home() {
  return (
    <div className="bg-canvas">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <Link href="/" className="font-serif text-2xl text-brand">Meu Casamento</Link>
        <nav className="flex items-center gap-2">
          <Link href="/entrar" className="t-label px-3 py-2 text-muted hover:text-ink">Entrar</Link>
          <ButtonLink href="/criar">Criar grátis</ButtonLink>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-8 pb-16 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
        <div>
          <p className="t-label uppercase tracking-[0.2em] text-brand">Convite · Site · Confirmação · Presentes</p>
          <h1 className="t-display mt-4 text-ink">Convite, site, confirmação e lista de presentes num lugar só.</h1>
          <p className="t-body mt-5 max-w-xl text-muted">
            Vocês contam a história e escolhem o estilo. A gente entrega tudo pronto e ligado: o convite abre bem em
            qualquer tela, o convidado confirma em um toque e o presente cai direto na conta do casal.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/criar" className="h-12 px-6">Criar meu casamento</ButtonLink>
            <ButtonLink href="#como-funciona" variant="secondary" className="h-12 px-6">Como funciona</ButtonLink>
          </div>
          <p className="t-meta mt-4">Grátis para começar. Sem cartão de crédito.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="translate-y-6"><CollectionCard collection={COLLECTIONS[0]} /></div>
          <CollectionCard collection={COLLECTIONS[1]} names="Júlia & Rafa" />
        </div>
      </section>

      <section id="como-funciona" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
          <h2 className="font-serif text-4xl text-ink">Como funciona</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-xl border border-line bg-canvas p-6">
                <p className="font-serif text-4xl text-brand">{s.n}</p>
                <p className="t-section mt-3">{s.title}</p>
                <p className="t-body mt-2 text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
        <h2 className="font-serif text-4xl text-ink">O que deixa de dar dor de cabeça</h2>
        <p className="t-body mt-2 max-w-2xl text-muted">
          Montar convite num editor de imagem, lista em outro site e confirmação numa planilha dá trabalho e confunde o convidado.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PAINS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-line bg-surface p-5">
              <Icon className="size-5 text-brand" aria-hidden />
              <p className="t-item mt-3">{title}</p>
              <p className="t-body mt-1 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
          <h2 className="font-serif text-4xl text-ink">Coleções</h2>
          <p className="t-body mt-2 max-w-2xl text-muted">Cada coleção veste o convite e o site ao mesmo tempo. Troque quando quiser.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {COLLECTIONS.map((c) => (
              <div key={c.key}>
                <CollectionCard collection={c} />
                <p className="t-item mt-3">{c.name}</p>
                <p className="t-body text-muted">{c.mood}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
        <h2 className="font-serif text-4xl text-ink">Preço</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-line bg-surface p-6">
            <p className="t-section">Grátis</p>
            <p className="t-body mt-2 text-muted">Site do casamento, convite digital e confirmação de presença, sem limite de convidados.</p>
          </div>
          <div className="rounded-xl border-2 border-brand bg-brand-soft p-6">
            <p className="t-section text-brand">3,5% por presente</p>
            <p className="t-body mt-2 text-ink">Cobrado só quando um presente é pago no Pix, com mínimo de R$ 3 por presente. O resto vai para o casal.</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-6">
            <p className="t-section">Coleções premium</p>
            <p className="t-body mt-2 text-muted">Em breve: coleções exclusivas e arte personalizada a partir da história de vocês.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
          <h2 className="font-serif text-4xl text-ink">Perguntas frequentes</h2>
          <div className="mt-8"><Faq /></div>
        </div>
      </section>

      <section className="bg-brand">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-8 md:flex-row md:items-center md:justify-between">
          <h2 className="font-serif text-4xl text-white">Comece hoje. Leva poucos minutos.</h2>
          <Link href="/criar" className="t-label inline-flex h-12 items-center rounded-lg bg-white px-6 text-brand hover:bg-canvas">
            Criar meu casamento
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <p className="t-meta">© {new Date().getFullYear()} Meu Casamento</p>
      </footer>
    </div>
  );
}
