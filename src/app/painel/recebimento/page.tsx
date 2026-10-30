import type { Metadata } from "next";
import { db } from "@/server/db";
import { requireWedding } from "@/server/auth/current";
import { isDemoPayments } from "@/server/payment/asaas";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Badge, Card, FORM_GRID, Field, Input, Notice, PageHeader } from "@/components/ui";
import { formatBRL } from "@/lib/money";
import { computeSplit, splitConfigFromEnv } from "@/lib/split";
import { activateDemoAccount, createPayoutAccount } from "./actions";

export const metadata: Metadata = { title: "Recebimento" };

const STATUS = {
  PENDENTE: { label: "Não criada", tone: "neutral" },
  EM_ANALISE: { label: "Em análise", tone: "warn" },
  ATIVA: { label: "Ativa", tone: "ok" },
  RECUSADA: { label: "Recusada", tone: "danger" },
} as const;

export default async function RecebimentoPage() {
  const { wedding } = await requireWedding();
  const payout = await db.payoutAccount.findUnique({ where: { weddingId: wedding.id } });
  const status = payout?.status ?? "PENDENTE";
  const demo = isDemoPayments();
  const cfg = splitConfigFromEnv();
  const example = computeSplit(25_000, cfg);

  return (
    <>
      <PageHeader
        title="Recebimento"
        description="A conta onde o dinheiro dos presentes cai. Ela fica no nome de um dos noivos."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="t-section">Conta de recebimento</h2>
              <Badge tone={STATUS[status].tone}>{STATUS[status].label}</Badge>
            </div>
            {status === "EM_ANALISE" && (
              <p className="t-body mt-3 text-muted">
                O Asaas está conferindo os documentos. Confira o e-mail do titular: pode haver um pedido de foto do documento.
                Os presentes já podem ser pagos enquanto isso.
              </p>
            )}
            {status === "ATIVA" && (
              <p className="t-body mt-3 text-muted">
                {payout?.walletId === "demo"
                  ? "Conta de demonstração ativa. Os pagamentos são simulados e nenhum dinheiro é movimentado."
                  : "Tudo certo. O valor de cada presente cai nesta conta assim que o convidado paga."}
              </p>
            )}
            {status === "RECUSADA" && (
              <p className="t-body mt-3 text-muted">
                O Asaas recusou o cadastro. Fale com a gente pelo suporte para revisar os dados.
              </p>
            )}
            {status === "PENDENTE" && <p className="t-body mt-3 text-muted">Ainda não criada.</p>}
          </Card>

          {status === "PENDENTE" && demo && (
            <Card>
              <Notice tone="warn">
                Os pagamentos estão em modo de demonstração: nenhuma cobrança real é criada. Ative a conta de demonstração para
                testar a lista de presentes de ponta a ponta.
              </Notice>
              <ActionForm action={activateDemoAccount} className="mt-4">
                <SubmitButton pendingText="Ativando...">Ativar conta de demonstração</SubmitButton>
              </ActionForm>
            </Card>
          )}

          {status === "PENDENTE" && !demo && (
            <Card>
              <h2 className="t-section">Dados do titular</h2>
              <p className="t-body mt-1 mb-4 text-muted">
                Usamos estes dados só para abrir a conta no Asaas, nosso parceiro de pagamentos. Não guardamos CPF nem endereço.
              </p>
              <ActionForm action={createPayoutAccount} className={FORM_GRID}>
                <Field label="Nome completo" wide>
                  <Input name="name" autoComplete="name" required />
                </Field>
                <Field label="E-mail">
                  <Input name="email" type="email" autoComplete="email" required />
                </Field>
                <Field label="CPF">
                  <Input name="cpfCnpj" inputMode="numeric" required />
                </Field>
                <Field label="Data de nascimento">
                  <Input name="birthDate" type="date" required />
                </Field>
                <Field label="Celular">
                  <Input name="mobilePhone" type="tel" inputMode="tel" placeholder="27 99999-9999" required />
                </Field>
                <Field label="Renda mensal" hint="Exigência do Asaas para abrir a conta.">
                  <Input name="incomeValue" inputMode="decimal" placeholder="R$ 5.000,00" required />
                </Field>
                <Field label="CEP">
                  <Input name="postalCode" inputMode="numeric" autoComplete="postal-code" required />
                </Field>
                <Field label="Rua">
                  <Input name="address" autoComplete="address-line1" required />
                </Field>
                <Field label="Número">
                  <Input name="addressNumber" required />
                </Field>
                <Field label="Bairro">
                  <Input name="province" required />
                </Field>
                <div className="sm:col-span-2">
                  <SubmitButton pendingText="Criando conta...">Criar conta de recebimento</SubmitButton>
                </div>
              </ActionForm>
            </Card>
          )}
        </div>

        <Card className="h-fit">
          <h2 className="t-section">Como o dinheiro anda</h2>
          <ol className="t-body mt-3 flex list-decimal flex-col gap-2 pl-5 text-muted">
            <li>O convidado escolhe o presente e paga no Pix.</li>
            <li>O valor do presente, menos a taxa da plataforma, vai direto para a conta do casal.</li>
            <li>Vocês sacam por Pix quando quiserem, sem custo para conta de pessoa física.</li>
          </ol>
          <div className="mt-4 rounded-xl bg-canvas p-4">
            <p className="t-meta">Exemplo: presente de {formatBRL(example.totalCents)}</p>
            <div className="t-body mt-2 flex justify-between">
              <span>Taxa da plataforma</span>
              <span className="tabular-nums">{formatBRL(example.feeCents)}</span>
            </div>
            <div className="t-item mt-1 flex justify-between">
              <span>Vocês recebem</span>
              <span className="tabular-nums">{formatBRL(example.coupleCents)}</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
