// WhatsApp via Evolution. Configuracao so por variavel de ambiente.

export const evolutionConfigured = () =>
  !!(process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY && process.env.EVOLUTION_INSTANCE);

// Telefone brasileiro em digitos com DDI: "(27) 99999-0000" -> "5527999990000"
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) return digits;
  return null;
}

export async function sendWhatsApp(phone: string, text: string): Promise<void> {
  const number = normalizePhone(phone);
  if (!number) throw new Error("Telefone invalido");
  const base = process.env.EVOLUTION_API_URL!.replace(/\/$/, "");
  const res = await fetch(`${base}/message/sendText/${process.env.EVOLUTION_INSTANCE}`, {
    method: "POST",
    headers: { apikey: process.env.EVOLUTION_API_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify({ number, text }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Evolution HTTP ${res.status}`);
}
