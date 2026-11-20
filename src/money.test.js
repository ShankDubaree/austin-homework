import { describe, it, expect } from "vitest";
import { parsePence, samePence, coinsFor, parseMaths, addPrompt, moneySpeak, moneyShown, moneyVisual } from "./money.js";

// The Fireworks money week (PR #14), kept here so the money helpers stay tested
// now that main.js is back to plain adding and taking away.
const fireworksShop = [
  { emoji: "🚀", name: "Rocket", cost: 45 },
  { emoji: "🧨", name: "Firecracker", cost: 40 },
  { emoji: "✨", name: "Sparkler", cost: 20 },
  { emoji: "🎆", name: "Fountain", cost: 30 },
];
const sums = [
  { type: "add", a: { emoji: "🧨", name: "Poppers", article: "", verb: "cost", cost: 15 }, b: { emoji: "🚀", name: "rocket", article: "a", verb: "costs", cost: 35 } },
  { type: "add", a: { emoji: "🎆", name: "fountain", article: "a", verb: "costs", cost: 10 }, b: { emoji: "🎇", name: "catherine wheel", article: "a", verb: "costs", cost: 25 } },
  { type: "exact", prompt: "Which fireworks could you buy with exactly £1.00?", shop: fireworksShop, options: [
    { label: "🧨 40p + 🎆 30p + 🎆 30p", total: 100 },
    { label: "🚀 45p + 🎆 30p + ✨ 20p", total: 95 },
    { label: "🚀 45p + 🧨 40p + ✨ 20p", total: 105 },
    { label: "✨ 20p + ✨ 20p + ✨ 20p + 🎆 30p", total: 90 },
  ] },
  { type: "add", a: { emoji: "🚀", name: "rocket", article: "a", verb: "costs", cost: 35 }, b: { emoji: "🎆", name: "bottle firework", article: "a", verb: "costs", cost: 30 } },
  { type: "add", a: { emoji: "🎇", name: "catherine wheel", article: "a", verb: "costs", cost: 25 }, b: { emoji: "🎆", name: "bottle firework", article: "a", verb: "costs", cost: 30 } },
  { type: "exact", prompt: "Which fireworks could you buy with exactly £1.00?", shop: fireworksShop, options: [
    { label: "✨ 20p + ✨ 20p + ✨ 20p + 🧨 40p", total: 100 },
    { label: "🚀 45p + 🚀 45p + ✨ 20p", total: 110 },
    { label: "🧨 40p + 🎆 30p + ✨ 20p", total: 90 },
    { label: "🚀 45p + 🧨 40p + ✨ 20p", total: 105 },
  ] },
];
const C = { sums };
const qs = parseMaths(C.sums);

describe("reading pence answers", () => {
  it("accepts a number with or without p, and ignores spaces and case", () => {
    expect(parsePence("50")).toBe(50);
    expect(parsePence("50p")).toBe(50);
    expect(parsePence("50P")).toBe(50);
    expect(parsePence(" 50 p ")).toBe(50);
    expect(parsePence("0")).toBe(0);
    expect(parsePence("100p")).toBe(100);
    expect(samePence("50p", 50)).toBe(true);
    expect(samePence("50", 50)).toBe(true);
    expect(samePence("49", 50)).toBe(false);
    expect(samePence("", 50)).toBe(false);
    expect(parsePence("")).toBe(null);
    expect(parsePence("fifty")).toBe(null);
    expect(parsePence("50px")).toBe(null);
  });
});

describe("coins for a price", () => {
  it("makes prices with 20p, 10p and 5p", () => {
    expect(coinsFor(15)).toEqual([10, 5]);
    expect(coinsFor(35)).toEqual([20, 10, 5]);
    expect(coinsFor(10)).toEqual([10]);
    expect(coinsFor(25)).toEqual([20, 5]);
    expect(coinsFor(30)).toEqual([20, 10]);
    expect(coinsFor(15).reduce((a, b) => a + b, 0)).toBe(15);
  });
});

describe("the fireworks money questions (PR #14)", () => {
  it("has 4 altogether questions from sheet 1 and 2 exactly-£1 questions from sheet 2", () => {
    expect(qs).toHaveLength(6);
    const adds = qs.filter((q) => q.type === "add");
    const exacts = qs.filter((q) => q.type === "exact");
    expect(adds).toHaveLength(4);
    expect(exacts).toHaveLength(2);
    expect(adds.map((q) => q.answer)).toEqual([50, 35, 65, 55]);
    expect(adds.every((q) => q.a.cost + q.b.cost === q.answer)).toBe(true);
    const sheet1 = new Set([15, 35, 10, 25, 30]);
    for (const q of adds) {
      expect(sheet1.has(q.a.cost)).toBe(true);
      expect(sheet1.has(q.b.cost)).toBe(true);
    }
    const sheet2 = new Set([45, 40, 20, 30]);
    for (const q of exacts) {
      expect(q.shop.map((fw) => fw.cost).sort()).toEqual([20, 30, 40, 45]);
      expect(q.shop.every((fw) => sheet2.has(fw.cost))).toBe(true);
      expect(q.options.filter((o) => o.total === 100)).toHaveLength(1);
      expect(q.options.filter((o) => o.total === 100)[0].label).toBe(q.answer);
      expect(q.options.every((o) => o.total !== 100 || o.label === q.answer)).toBe(true);
      expect(new Set(q.options.map((o) => o.total)).size).toBe(q.options.length);
      for (const o of q.options) {
        if (o.total !== 100) expect([90, 95, 105, 110, 85, 115].includes(o.total)).toBe(true);
      }
    }
    expect(new Set(qs.map((q) => q.text)).size).toBe(6);
  });

  it("says the altogether question in a child-friendly way and draws coins or a price list", () => {
    const q = qs[0];
    expect(addPrompt(q)).toMatch(/15p/);
    expect(addPrompt(q)).toMatch(/35p/);
    expect(addPrompt(q)).toMatch(/altogether/i);
    expect(moneySpeak(q)).toBe(q.prompt);
    expect(moneyShown(q)).toContain("50p");
    expect(moneyVisual(q)).toMatch(/coin/);
    expect(moneyVisual(q)).toMatch(/15p/);
    expect(moneyVisual(qs[2])).toMatch(/100p/);
    expect(moneySpeak(qs[2])).toMatch(/100 pence|one pound|£1/i);
  });
});
