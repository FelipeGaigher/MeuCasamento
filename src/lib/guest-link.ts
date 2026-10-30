import { createHmac, timingSafeEqual } from "node:crypto";

// Link privado do convidado, sem login: <guestId>.<assinatura>. Nada e guardado
// no banco; trocar GUEST_LINK_SECRET invalida todos os links.

function secret() {
  const s = process.env.GUEST_LINK_SECRET;
  if (!s || s.length < 32) throw new Error("GUEST_LINK_SECRET ausente ou curto (minimo 32 caracteres)");
  return s;
}

function sign(guestId: string) {
  return createHmac("sha256", secret()).update(`guest:${guestId}`).digest("base64url").slice(0, 22);
}

export function guestToken(guestId: string): string {
  return `${guestId}.${sign(guestId)}`;
}

export function readGuestToken(token: string): string | null {
  const [guestId, sig] = token.split(".");
  if (!guestId || !sig) return null;
  const expected = Buffer.from(sign(guestId));
  const got = Buffer.from(sig);
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return null;
  return guestId;
}
