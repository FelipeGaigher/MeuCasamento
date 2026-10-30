import { describe, expect, it } from "vitest";
import { DEFAULT_SECTIONS, readPages, readSections } from "@/collections/content";

describe("readSections", () => {
  it("devolve o padrao quando nao ha nada salvo", () => {
    expect(readSections(null)).toEqual(DEFAULT_SECTIONS);
  });

  it("mantem a ordem salva, descarta chave desconhecida e completa as faltantes", () => {
    const out = readSections([{ key: "presentes", enabled: true }, { key: "xyz", enabled: true }, { key: "rsvp", enabled: false }]);
    expect(out.slice(0, 2)).toEqual([
      { key: "presentes", enabled: true },
      { key: "rsvp", enabled: false },
    ]);
    expect(out.map((s) => s.key).sort()).toEqual(DEFAULT_SECTIONS.map((s) => s.key).sort());
  });
});

describe("readPages", () => {
  it("mescla campos salvos com os padroes", () => {
    const pages = readPages([{ kind: "capa", enabled: false, fields: { kicker: "Noivado" } }], "Ana & Pedro");
    const capa = pages.find((p) => p.kind === "capa")!;
    expect(capa.enabled).toBe(false);
    expect(capa.fields.kicker).toBe("Noivado");
    expect(capa.fields.phrase).toBeTruthy();
    expect(pages.find((p) => p.kind === "encerramento")!.fields.signature).toBe("Ana & Pedro");
  });
});
