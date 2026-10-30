import { describe, expect, it } from "vitest";
import { computeSplit } from "@/lib/split";

const cfg = { feeBps: 350, minFeeCents: 300 };

describe("computeSplit", () => {
  it("aplica 3,5% em um presente de R$ 250", () => {
    expect(computeSplit(25_000, cfg)).toEqual({ totalCents: 25_000, feeCents: 875, coupleCents: 24_125 });
  });

  it("usa a taxa minima em presentes pequenos", () => {
    expect(computeSplit(5_000, cfg)).toEqual({ totalCents: 5_000, feeCents: 300, coupleCents: 4_700 });
  });

  it("nunca deixa o valor do casal negativo", () => {
    for (const total of [1, 100, 299, 300, 301, 999]) {
      const s = computeSplit(total, cfg);
      expect(s.coupleCents).toBeGreaterThanOrEqual(0);
      expect(s.feeCents + s.coupleCents).toBe(total);
    }
  });

  it("recusa total invalido", () => {
    expect(() => computeSplit(0, cfg)).toThrow();
    expect(() => computeSplit(10.5, cfg)).toThrow();
  });
});
