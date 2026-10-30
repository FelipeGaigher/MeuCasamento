import { describe, expect, it } from "vitest";
import { isValidSlug, slugify } from "@/lib/slug";

describe("slug", () => {
  it("gera slug sem acento e com e no lugar de &", () => {
    expect(slugify("Pâmela & Márcio")).toBe("pamela-e-marcio");
  });

  it("recusa reservados e formatos invalidos", () => {
    expect(isValidSlug("painel")).toBe(false);
    expect(isValidSlug("-ana")).toBe(false);
    expect(isValidSlug("a")).toBe(false);
    expect(isValidSlug("ana-e-pedro")).toBe(true);
  });
});
