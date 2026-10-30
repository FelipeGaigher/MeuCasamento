import { describe, expect, it } from "vitest";
import { readCopy, splitNames } from "@/lib/cms";
import { readSiteSections } from "@/lib/preview-url";

describe("readCopy", () => {
  it("aceita caminhos conhecidos do site e do convite", () => {
    expect(readCopy({ "site.story": "Oi", "pages.capa.kicker": "Casamento" })).toEqual({
      "site.story": "Oi",
      "pages.capa.kicker": "Casamento",
    });
  });

  it("recusa caminho desconhecido, campo fora da pagina e valor que nao e texto", () => {
    expect(readCopy({ "site.slug": "x" })).toBeNull();
    expect(readCopy({ "pages.capa.title": "x" })).toBeNull();
    expect(readCopy({ "site.story": 1 })).toBeNull();
  });

  it("recusa texto acima do limite", () => {
    expect(readCopy({ "site.heroTitle": "a".repeat(121) })).toBeNull();
  });

  it("recusa objeto que nao e plano", () => {
    expect(readCopy(JSON.parse('{"__proto__": {"x": 1}}'))).toBeNull();
    expect(readCopy([])).toBeNull();
    expect(readCopy(Object.create({ "site.story": "x" }))).toBeNull();
  });
});

describe("splitNames", () => {
  it("quebra os nomes em duas linhas", () => {
    expect(splitNames("Ana & Pedro")).toEqual(["Ana", "& Pedro"]);
    expect(splitNames("Ana e Pedro")).toEqual(["Ana", "& Pedro"]);
    expect(splitNames("Ana")).toEqual(["Ana", null]);
  });
});

describe("readSiteSections", () => {
  it("le a ordem da URL e completa as que faltam", () => {
    const list = readSiteSections({ s: "rsvp,!historia" });
    expect(list?.slice(0, 2)).toEqual([
      { key: "rsvp", enabled: true },
      { key: "historia", enabled: false },
    ]);
    expect(list).toHaveLength(5);
  });

  it("recusa secao desconhecida ou repetida", () => {
    expect(readSiteSections({ s: "rsvp,hack" })).toBeNull();
    expect(readSiteSections({ s: "rsvp,rsvp" })).toBeNull();
  });
});
