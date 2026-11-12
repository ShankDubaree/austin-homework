import { describe, it, expect } from "vitest";
import { bigUnlocked, bigWords, bigPlan, bigSignature } from "./big.js";
import { nightQuestions } from "./nights.js";

const WORDS = ["Tuesday","Wednesday","February","Friday","January","July","August","Spring","Summer","once"];
// 1 Nov 2026 is a Sunday
const day = (d) => new Date(2026, 10, d, 18, 0);

describe("Big Spelling Test unlock", () => {
  it("is unlocked every day of the week", () => {
    for (const d of [1, 2, 3, 4, 5, 6, 7]) expect(bigUnlocked(day(d))).toBe(true);
  });
  it("is unlocked all day, including Friday", () => {
    expect(bigUnlocked(new Date(2026, 10, 6, 0, 1))).toBe(true);
    expect(bigUnlocked(new Date(2026, 10, 6, 23, 59))).toBe(true);
  });
  it("is unlocked whether or not Thursday's test is done", () => {
    expect(bigUnlocked(day(5), true)).toBe(true);
    expect(bigUnlocked(day(5), false)).toBe(true);
    expect(bigUnlocked(day(4), true)).toBe(true);
    expect(bigUnlocked(day(7), true)).toBe(true);
  });
});

describe("Big Spelling Test words", () => {
  it("has all 10 words exactly once", () => {
    const w = bigWords(WORDS);
    expect(w).toHaveLength(10);
    expect(w.slice().sort()).toEqual(WORDS.slice().sort());
  });
  it("shuffles and leaves the list alone", () => {
    const copy = WORDS.slice();
    const w = bigWords(WORDS, () => 0);
    expect(w).not.toEqual(WORDS);
    expect(WORDS).toEqual(copy);
  });
  it("is spellings only (no sums)", () => {
    const qs = nightQuestions(bigPlan(WORDS));
    expect(qs).toHaveLength(10);
    expect(qs.every((q) => q.kind === "spell")).toBe(true);
  });
  it("signature ignores order but changes with new words", () => {
    expect(bigSignature(bigWords(WORDS))).toBe(bigSignature(WORDS));
    expect(bigSignature(["have"])).not.toBe(bigSignature(WORDS));
  });
});
