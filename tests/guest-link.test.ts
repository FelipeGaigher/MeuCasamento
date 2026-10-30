import { beforeAll, describe, expect, it } from "vitest";
import { guestToken, readGuestToken } from "@/lib/guest-link";

beforeAll(() => {
  process.env.GUEST_LINK_SECRET = "teste-0123456789abcdef0123456789abcdef";
});

describe("guest link", () => {
  it("assina e valida", () => {
    const token = guestToken("cl_abc123");
    expect(readGuestToken(token)).toBe("cl_abc123");
  });

  it("recusa assinatura adulterada", () => {
    const [id, sig] = guestToken("cl_abc123").split(".");
    const tampered = `${id}.${sig.slice(0, -1)}${sig.endsWith("A") ? "B" : "A"}`;
    expect(readGuestToken(tampered)).toBeNull();
  });

  it("recusa token de outro convidado", () => {
    const [, sig] = guestToken("cl_abc123").split(".");
    expect(readGuestToken(`cl_outro.${sig}`)).toBeNull();
  });

  it("recusa formato invalido", () => {
    expect(readGuestToken("semponto")).toBeNull();
    expect(readGuestToken("")).toBeNull();
  });
});
