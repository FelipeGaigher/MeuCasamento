import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Toda tabela de negocio pertence a um casamento. Excecoes ficam aqui.
const ALLOWLIST = new Set(["User", "WebhookEvent", "Wedding"]);

const schema = readFileSync(path.resolve(__dirname, "../prisma/schema.prisma"), "utf8");
const models = [...schema.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)].map((m) => ({ name: m[1], body: m[2] }));

describe("tenancy", () => {
  it("encontra os models do schema", () => {
    expect(models.length).toBeGreaterThan(5);
  });

  it.each(models.filter((m) => !ALLOWLIST.has(m.name)).map((m) => [m.name, m.body]))(
    "%s tem weddingId",
    (_name, body) => {
      expect(body).toMatch(/^\s+weddingId\s+String/m);
    },
  );
});
