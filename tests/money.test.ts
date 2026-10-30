import { describe, expect, it } from "vitest";
import { formatBRL, parseBRL } from "@/lib/money";

describe("money", () => {
  it("formata centavos em reais", () => {
    expect(formatBRL(123456).replace(/\s/g, " ")).toBe("R$ 1.234,56");
  });

  it("entende os formatos comuns", () => {
    expect(parseBRL("1.234,56")).toBe(123456);
    expect(parseBRL("1234,5")).toBe(123450);
    expect(parseBRL("1234.56")).toBe(123456);
    expect(parseBRL("R$ 50")).toBe(5000);
  });

  it("recusa vazio e lixo", () => {
    expect(parseBRL("")).toBeNull();
    expect(parseBRL("abc")).toBeNull();
  });
});
