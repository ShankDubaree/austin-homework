import { describe, it, expect } from "vitest";
import { parseSum, parseSums, sumOptions, sumWords } from "./sums.js";

const WEEK = ["13+5", "26+3", "38+1", "42+4", "54+2", "55-3", "48-4", "36-2", "29-5", "18-6"];

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

describe("reading the sums list", () => {
  it("works out this week's sums", () => {
    expect(parseSums(WEEK).map((s) => s.answer)).toEqual([18, 29, 39, 46, 56, 52, 44, 34, 24, 12]);
    expect(parseSum("55-3")).toEqual({ a: 55, op: "-", b: 3, answer: 52, text: "55 - 3" });
  });
  it("copes with spaces and different minus signs, skips anything it can't read", () => {
    expect(parseSum(" 13 + 5 ").answer).toBe(18);
    expect(parseSum("18 − 6").answer).toBe(12);
    expect(parseSums(["13+5", "oops", ""])).toHaveLength(1);
  });
  it("says them in words", () => {
    expect(sumWords(parseSum("13+5"))).toBe("13 add 5");
    expect(sumWords(parseSum("55-3"))).toBe("55 take away 3");
  });
});

describe("answer buttons", () => {
  it("always has the right answer once, 4 different buttons, close by and never below zero", () => {
    for (const s of parseSums([...WEEK, "1+0", "3-3", "2-1"])) {
      for (let seed = 1; seed < 40; seed++) {
        const opts = sumOptions(s.answer, 4, rng(seed)).map(Number);
        expect(opts).toHaveLength(4);
        expect(new Set(opts).size).toBe(4);
        expect(opts.filter((n) => n === s.answer)).toHaveLength(1);
        for (const n of opts) { expect(n).toBeGreaterThanOrEqual(0); expect(Math.abs(n - s.answer)).toBeLessThanOrEqual(10); }
        expect(opts.filter((n) => Math.abs(n - s.answer) <= 2).length).toBeGreaterThanOrEqual(3); // at least 2 near misses
      }
    }
  });
  it("mixes up where the right answer goes", () => {
    const spots = new Set();
    for (let seed = 1; seed < 40; seed++) spots.add(sumOptions(18, 4, rng(seed)).indexOf("18"));
    expect(spots.size).toBeGreaterThan(2);
  });
  it("can make 3 buttons instead of 4", () => {
    expect(sumOptions(18, 3, rng(3))).toHaveLength(3);
  });
});
