import { describe, it, expect } from "vitest";
import { LETTERS, FAMILIES, resample } from "./letters.js";
import { scoreTrace } from "./score.js";

// Small repeatable random numbers, so tests give the same result every run.
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// Pretend Austin traced the letter: follow each stroke with a little wobble.
function trace(letter, wobble = 2, seed = 1) {
  const r = rng(seed);
  return LETTERS[letter].strokes.map((s) => resample(s, 3).map(([x, y]) => [x + (r() - 0.5) * 2 * wobble, y + (r() - 0.5) * 2 * wobble]));
}

const ALL = "abcdefghijklmnopqrstuvwxyz".split("");

describe("letter shapes", () => {
  it("has shape data for every lowercase letter", () => {
    for (const l of ALL) {
      expect(LETTERS[l], l).toBeTruthy();
      expect(LETTERS[l].strokes.length, l).toBeGreaterThan(0);
      expect(LETTERS[l].hint.length, l).toBeGreaterThan(5);
      for (const stroke of LETTERS[l].strokes) {
        expect(stroke.length, l).toBeGreaterThan(1);
        for (const [x, y] of stroke) {
          expect(Number.isFinite(x) && Number.isFinite(y), l).toBe(true);
          expect(y, l).toBeGreaterThanOrEqual(-1);
          expect(y, l).toBeLessThanOrEqual(151);
        }
      }
    }
  });

  it("puts every letter in exactly one family", () => {
    const listed = FAMILIES.flatMap((f) => f.letters);
    expect([...listed].sort()).toEqual(ALL);
    expect(FAMILIES.map((f) => f.letters.join(""))).toEqual(["cadgoqesf", "lituj" + "y", "rbnhmkp", "vwxz"]);
  });

  it("small letters sit between the middle line and baseline; tall letters reach the top", () => {
    const top = (l) => Math.min(...LETTERS[l].strokes.flat().map((p) => p[1]));
    for (const l of "acemnorsuvwxz") expect(top(l), l).toBeGreaterThanOrEqual(49);
    for (const l of "bdfhkl") expect(top(l), l).toBeLessThanOrEqual(1);
  });
});

describe("scoring", () => {
  it("gives 3 stars for a neat trace of every letter", () => {
    for (const l of ALL) {
      const res = scoreTrace(l, trace(l, 2, l.charCodeAt(0)));
      expect(res.stars, `${l}: ${JSON.stringify(res)}`).toBe(3);
    }
  });

  it("is forgiving about a wobbly hand (drifting up to 8 units, about a sixth of a line gap, off the letter)", () => {
    for (const l of ALL) {
      for (let k = 0; k < 4; k++) {
        const r = rng(k * 13 + l.charCodeAt(0));
        const p1 = r() * 6, p2 = r() * 6;
        const wobbly = LETTERS[l].strokes.map((s) => resample(s, 1).map(([x, y], i) => [x + 8 * Math.sin(i / 9 + p1) + r() - 0.5, y + 8 * Math.cos(i / 11 + p2) + r() - 0.5]));
        const res = scoreTrace(l, wobbly);
        expect(res.stars, `${l}: ${JSON.stringify(res)}`).toBe(3);
      }
    }
  });

  it("still counts a trace done in more than one go", () => {
    const [stroke] = trace("l");
    const half = Math.floor(stroke.length / 2);
    expect(scoreTrace("l", [stroke.slice(0, half), stroke.slice(half)]).stars).toBe(3);
  });

  it("gives 0 or 1 star for a scribble", () => {
    for (const l of ALL) {
      const r = rng(99 + l.charCodeAt(0));
      const scribble = [Array.from({ length: 80 }, () => [r() * 70 - 5, r() * 160 - 5])];
      const res = scoreTrace(l, scribble);
      expect(res.stars, `${l}: ${JSON.stringify(res)}`).toBeLessThanOrEqual(1);
    }
  });

  it("gives 0 or 1 star for a small scribble in the middle, or the wrong letter", () => {
    for (const l of ALL) {
      const r = rng(5 + l.charCodeAt(0));
      const blob = [Array.from({ length: 25 }, () => [10 + r() * 30, 55 + r() * 40])];
      expect(scoreTrace(l, blob).stars, l).toBeLessThanOrEqual(1);
    }
    expect(scoreTrace("o", trace("l")).stars).toBeLessThanOrEqual(1);
    expect(scoreTrace("b", trace("x")).stars).toBeLessThanOrEqual(1);
  });

  it("gives 0 stars and a tip when nothing or just a dot is drawn", () => {
    expect(scoreTrace("a", []).stars).toBe(0);
    const tap = scoreTrace("a", [[[45, 62]]]);
    expect(tap.stars).toBe(0);
    expect(tap.tip).toBeTruthy();
  });

  it("loses a star for going the wrong way round (o clockwise from the right start)", () => {
    const backwards = trace("o").map((s) => [...s].reverse());
    const res = scoreTrace("o", backwards);
    expect(res.start).toBe(true);
    expect(res.direction).toBe(false);
    expect(res.stars).toBe(2);
    expect(res.tip).toBe("Follow the arrows");
  });

  it("loses a star for drawing the cross of a t the wrong way", () => {
    const [down, cross] = trace("t");
    const res = scoreTrace("t", [down, [...cross].reverse()]);
    expect(res.direction).toBe(false);
    expect(res.stars).toBe(2);
  });

  it("loses stars for starting at the wrong end (l drawn bottom to top)", () => {
    const res = scoreTrace("l", trace("l").map((s) => [...s].reverse()));
    expect(res.start).toBe(false);
    expect(res.direction).toBe(false);
    expect(res.stars).toBe(1);
  });

  it("notices letters that retrace (n goes down, back up, then over)", () => {
    expect(scoreTrace("n", trace("n")).stars).toBe(3);
    expect(scoreTrace("n", trace("n").map((s) => [...s].reverse())).direction).toBe(false);
  });
});
