import type { Metadata } from "next";
import { db } from "@/server/db";
import { requireWedding } from "@/server/auth/current";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Badge, Card, Checkbox, EmptyState, FORM_GRID, Field, Input, Notice, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/dates";
import { saveNotificationSettings } from "./actions";

export const metadata: Metadata = { title: "Notificações" };

const CHANNEL = { WHATSAPP: "WhatsApp", EMAIL: "E-mail" } as const;
const KIND = { PEDIDO_PAGO: "Presente pago", RSVP: "Confirmação de presença" } as const;
const STATUS = {
  ENVIADA: { label: "Enviada", tone: "ok" },
  FALHOU: { label: "Falhou", tone: "danger" },
  IGNORADA: { label: "Não enviada", tone: "neutral" },
} as const;

function displayPhone(phone: string | null) {
  if (!phone) return "";
  return phone.startsWith("55") && phone.length >= 12 ? phone.slice(2) : phone;
}

export default async function NotificacoesPage() {
  const { wedding } = await requireWedding();
  const history = await db.notification.findMany({
    where: { weddingId: wedding.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // So verifica se a variavel existe; o valor nunca vai para a tela.
  const whatsappReady = !!(process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY && process.env.EVOLUTION_INSTANCE);
  const emailReady = !!process.env.BREVO_API_KEY;

  return (
    <>
      <PageHeader
        title="Notificações"
        description="Avisamos vocês a cada presente pago e a cada resposta de convidado."
      />

      {(!whatsappReady || !emailReady) && (
        <div className="mb-6">
          <Notice tone="warn">
            {!whatsappReady && !emailReady
              ? "O envio por WhatsApp e por e-mail ainda não está configurado na plataforma. Os avisos aparecem no histórico como não enviados."
              : !whatsappReady
                ? "O envio por WhatsApp ainda não está configurado na plataforma. Os avisos por e-mail funcionam normalmente."
                : "O envio por e-mail ainda não está configurado na plataforma. Os avisos por WhatsApp funcionam normalmente."}
          </Notice>
        </div>
      )}

      <Card className="mb-6">
        <h2 className="t-section mb-4">Para onde avisar</h2>
        <ActionForm action={saveNotificationSettings} className={FORM_GRID}>
          <Field label="WhatsApp" hint="DDD + número. Só o casal recebe; nunca enviamos para convidados por aqui.">
            <Input name="notifyPhone" type="tel" inputMode="tel" defaultValue={displayPhone(wedding.notifyPhone)} placeholder="27 99999-9999" />
          </Field>
          <Field label="E-mail">
            <Input name="notifyEmail" type="email" defaultValue={wedding.notifyEmail ?? ""} />
          </Field>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Checkbox name="notifyOnOrder" label="Avisar quando um presente for pago" defaultChecked={wedding.notifyOnOrder} />
            <Checkbox name="notifyOnRsvp" label="Avisar quando um convidado responder" defaultChecked={wedding.notifyOnRsvp} />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>Salvar</SubmitButton>
          </div>
        </ActionForm>
      </Card>

      <h2 className="t-section mb-3">Histórico</h2>
      {history.length === 0 ? (
        <EmptyState title="Nenhum aviso ainda" text="Quando chegar o primeiro presente ou a primeira confirmação, o aviso aparece aqui." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[560px]">
            <thead className="border-b border-line">
              <tr className="t-label text-left text-muted">
                <th className="px-5 py-3">Data</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Canal</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {history.map((n) => (
                <tr key={n.id} className="t-body align-top">
                  <td className="px-5 py-3 whitespace-nowrap tabular-nums">{formatDateTime(n.createdAt)}</td>
                  <td className="px-5 py-3">{KIND[n.kind]}</td>
                  <td className="px-5 py-3">{CHANNEL[n.channel]}</td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS[n.status].tone}>{STATUS[n.status].label}</Badge>
                    {n.error && <p className="t-meta mt-1">{n.error}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
