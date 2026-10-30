// Cliente Asaas da conta da plataforma. A chave fica so em variavel de ambiente.
// Sem ASAAS_API_KEY o produto roda em modo demonstracao (isDemoPayments()).

export class AsaasError extends Error {
  constructor(message: string, public detail?: string) {
    super(message);
  }
}

export const isDemoPayments = () => !process.env.ASAAS_API_KEY;

function baseUrl() {
  return process.env.ASAAS_SANDBOX === "false" ? "https://api.asaas.com/v3" : "https://sandbox.asaas.com/api/v3";
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = process.env.ASAAS_API_KEY;
  if (!key) throw new AsaasError("Pagamentos nao configurados.");
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: { access_token: key, "Content-Type": "application/json", ...(init.headers ?? {}) },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    let message = "Nao foi possivel falar com o Asaas.";
    try {
      const first = JSON.parse(text)?.errors?.[0];
      if (first?.description) message = first.description;
    } catch {}
    throw new AsaasError(message, `${path} HTTP ${res.status}`);
  }
  return JSON.parse(text) as T;
}

// --- Subconta do casal (recebe o split) ---

export type SubaccountInput = {
  name: string;
  email: string;
  cpfCnpj: string;
  birthDate: string; // AAAA-MM-DD
  mobilePhone: string;
  incomeValue: number; // renda mensal em reais, exigida pelo Asaas
  address: string;
  addressNumber: string;
  province: string; // bairro
  postalCode: string;
};

// Devolve so o id e o walletId. A apiKey da subconta e descartada de proposito.
export async function createSubaccount(input: SubaccountInput): Promise<{ accountId: string; walletId: string }> {
  const data = await call<{ id: string; walletId: string }>("/accounts", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return { accountId: data.id, walletId: data.walletId };
}

// --- Cobranca Pix com split ---

export type PixChargeInput = {
  externalReference: string; // id do pedido
  description: string;
  totalCents: number;
  buyerName: string;
  buyerEmail: string;
  buyerCpf?: string;
  coupleWalletId: string | null;
  coupleCents: number;
};

export type PixCharge = { gatewayId: string; copyPaste: string; qrBase64: string };

async function findOrCreateCustomer(name: string, email: string, cpf?: string): Promise<string> {
  const found = await call<{ data: { id: string }[] }>(`/customers?email=${encodeURIComponent(email)}`);
  if (found.data?.[0]) return found.data[0].id;
  const body: Record<string, unknown> = { name, email, notificationDisabled: true };
  if (cpf) body.cpfCnpj = cpf;
  const created = await call<{ id: string }>("/customers", { method: "POST", body: JSON.stringify(body) });
  return created.id;
}

export async function createPixCharge(input: PixChargeInput): Promise<PixCharge> {
  const customer = await findOrCreateCustomer(input.buyerName, input.buyerEmail, input.buyerCpf);
  const body: Record<string, unknown> = {
    customer,
    billingType: "PIX",
    value: input.totalCents / 100,
    dueDate: new Date().toISOString().slice(0, 10),
    description: input.description,
    externalReference: input.externalReference,
  };
  // Valor fixo para o casal; o restante do liquido fica na plataforma.
  if (input.coupleWalletId) body.split = [{ walletId: input.coupleWalletId, fixedValue: input.coupleCents / 100 }];
  const payment = await call<{ id: string }>("/payments", { method: "POST", body: JSON.stringify(body) });
  const qr = await call<{ encodedImage: string; payload: string }>(`/payments/${payment.id}/pixQrCode`);
  return { gatewayId: payment.id, copyPaste: qr.payload, qrBase64: qr.encodedImage };
}
