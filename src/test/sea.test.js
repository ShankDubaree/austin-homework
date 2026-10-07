import { describe, it, expect } from "vitest";
import { CREATURES, SPECIAL, pickNext, addTo, creatureById, creatureArt } from "./sea.js";

describe("sea creatures", () => {
  it("has a good pool of friends with different names", () => {
    expect(CREATURES.length).toBeGreaterThanOrEqual(25);
    expect(new Set(CREATURES.map((c) => c.id)).size).toBe(CREATURES.length);
    expect(new Set(CREATURES.map((c) => c.name)).size).toBe(CREATURES.length);
    for (const c of CREATURES) expect(c.emoji || c.svg, c.id).toBeTruthy();
  });

  it("keeps the Golden Puffer Fish special (never a normal reward)", () => {
    expect(SPECIAL.special).toBe(true);
    expect(CREATURES.some((c) => c.id === SPECIAL.id || c.emoji === SPECIAL.emoji)).toBe(false);
    let data = { counts: {}, order: [] };
    for (let i = 0; i < CREATURES.length * 3; i++) {
      const next = pickNext(data.counts);
      expect(next.special).toBeFalsy();
      data = addTo(data, next.id);
    }
    expect(creatureById(SPECIAL.id)).toBe(SPECIAL);
  });

  it("gives a new friend for every right answer until he has them all", () => {
    let data = { counts: {}, order: [] };
    const seen = [];
    for (let i = 0; i < CREATURES.length; i++) {
      const next = pickNext(data.counts);
      expect(seen).not.toContain(next.id);
      seen.push(next.id);
      data = addTo(data, next.id);
    }
    expect(data.order).toHaveLength(CREATURES.length);
    // then repeats go to whoever he has fewest of
    const again = pickNext(data.counts);
    expect(again.id).toBe(CREATURES[0].id);
    data = addTo(data, again.id);
    expect(pickNext(data.counts).id).toBe(CREATURES[1].id);
    expect(data.counts[CREATURES[0].id]).toBe(2);
    expect(data.order).toHaveLength(CREATURES.length);
  });

  it("15 right answers a night means 15 creatures a night", () => {
    let data = { counts: {}, order: [] };
    for (let i = 0; i < 15; i++) data = addTo(data, pickNext(data.counts).id);
    expect(Object.values(data.counts).reduce((a, b) => a + b, 0)).toBe(15);
    expect(data.order).toHaveLength(15);
  });

  it("can draw every creature", () => {
    for (const c of [...CREATURES, SPECIAL]) expect(creatureArt(c, 40)).toMatch(/<(span|svg)/);
  });
});
