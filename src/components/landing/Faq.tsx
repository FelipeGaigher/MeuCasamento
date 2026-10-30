const ITEMS: [string, string][] = [
  [
    "Quando o dinheiro dos presentes cai?",
    "Assim que o convidado paga o Pix, o valor do presente, já sem a taxa, vai para a conta de recebimento do casal. Vocês sacam por Pix quando quiserem.",
  ],
  [
    "Precisa de CNPJ?",
    "Não. A conta de recebimento é aberta no CPF de um dos noivos, com verificação de documentos feita pelo nosso parceiro de pagamentos.",
  ],
  [
    "O convidado precisa criar conta?",
    "Não. Ele abre o link, confirma a presença e escolhe o presente. Quem recebe um link pessoal já chega com o nome preenchido.",
  ],
  [
    "Posso mudar o tema depois?",
    "Pode, a qualquer momento. Textos, datas e presentes continuam no lugar: só a aparência muda, no convite e no site ao mesmo tempo.",
  ],
];

export function Faq() {
  return (
    <div className="divide-y divide-line rounded-xl border border-line bg-surface">
      {ITEMS.map(([q, a]) => (
        <details key={q} className="group px-5 py-4">
          <summary className="t-item flex cursor-pointer list-none items-center justify-between gap-4">
            {q}
            <span aria-hidden className="text-brand transition group-open:rotate-45">+</span>
          </summary>
          <p className="t-body mt-2 text-muted">{a}</p>
        </details>
      ))}
    </div>
  );
}
