import { describe, it, expect } from "vitest";
import fs from "fs";
import { parseSums } from "./sums.js";
import { parseMaths } from "./money.js";

// Reads the content lists at the top of main.js, the same way Daniel edits them.
const src = fs.readFileSync(new URL("./main.js", import.meta.url), "utf8");
const block = src.slice(src.indexOf("const words"), src.indexOf("const extras"));
const C = new Function(block + "return { words, sums, continents, commands, nouns, suffixes, joins };")();

describe("this week's content", () => {
  it("has this week's spellings and fireworks money questions", () => {
    expect(C.words).toEqual(["shorter", "louder", "slowest", "fastest", "rain", "train", "paint", "join", "coin", "people"]);
    expect(C.words.every((w) => w === w.toLowerCase())).toBe(true);
    expect(C.sums).toHaveLength(6);
    const ps = parseMaths(C.sums);
    expect(ps).toHaveLength(C.sums.length); // every question can be read
    expect(ps.filter((q) => q.type === "add")).toHaveLength(4);
    expect(ps.filter((q) => q.type === "exact")).toHaveLength(2);
  });

  it("the 4 altogether questions use sheet 1 prices and the 2 exact-£1 questions have one 100p option", () => {
    const ps = parseMaths(C.sums);
    const adds = ps.filter((q) => q.type === "add");
    expect(adds.map((q) => [q.a.cost, q.b.cost, q.answer])).toEqual([
      [15, 35, 50], [10, 25, 35], [35, 30, 65], [25, 30, 55],
    ]);
    for (const q of adds) {
      expect([15, 35, 10, 25, 30]).toContain(q.a.cost);
      expect([15, 35, 10, 25, 30]).toContain(q.b.cost);
    }
    const exacts = ps.filter((q) => q.type === "exact");
    expect(exacts.map((q) => q.answer)).toEqual([
      "🧨 40p + 🎆 30p + 🎆 30p",
      "✨ 20p + ✨ 20p + ✨ 20p + 🧨 40p",
    ]);
    for (const q of exacts) {
      expect(q.options.filter((o) => o.total === 100)).toHaveLength(1);
      expect(q.shop.map((fw) => fw.cost).sort()).toEqual([20, 30, 40, 45]);
    }
    expect(new Set(ps.map((q) => q.text)).size).toBe(6);
  });

  it("changing only the maths keeps night ticks (signature ignores maths) and every night still gets 3 questions", async () => {
    const { planNights, nightSignature, PER_NIGHT } = await import("./test/nights.js");
    const old = ["23+45", "52+36", "14+73", "62+15", "30+48", "86-24", "97-53", "75-41", "68-32", "49-18"];
    const content = { spell: C.words, world: C.continents, command: C.commands, noun: C.nouns, suffix: C.suffixes, join: C.joins };
    const a = planNights({ ...content, maths: parseSums(old) });
    const b = planNights({ ...content, maths: parseMaths(C.sums) });
    expect(b.map((p) => nightSignature(p))).toEqual(a.map((p) => nightSignature(p)));
    for (const p of b) {
      expect(p.maths).toHaveLength(PER_NIGHT.maths);
      expect(new Set(p.maths.map((s) => s.text)).size).toBe(3);
    }
    const uses = b.flatMap((p) => p.maths.map((s) => s.text));
    for (const s of parseMaths(C.sums)) expect(uses.filter((text) => text === s.text)).toHaveLength(2);
    expect(b[2].maths).toEqual(b[0].maths);
    expect(b[3].maths).toEqual(b[1].maths);
  });

  it("new spellings reset every night's tick and the Big Test, which uses all 10 new words", async () => {
    const { planNights, nightSignature } = await import("./test/nights.js");
    const { bigPlan, bigSignature } = await import("./test/big.js");
    const oldWords = ["Tuesday", "Wednesday", "February", "Friday", "January", "July", "August", "Spring", "Summer", "once"];
    const content = { spell: C.words, maths: parseMaths(C.sums), world: C.continents, command: C.commands, noun: C.nouns, suffix: C.suffixes, join: C.joins };
    const old = planNights({ ...content, spell: oldWords });
    planNights(content).forEach((p, i) => expect(nightSignature(p)).not.toBe(nightSignature(old[i])));
    expect(bigSignature(C.words)).not.toBe(bigSignature(oldWords));
    expect(bigPlan(C.words).spell.slice().sort()).toEqual(C.words.slice().sort());
    expect(src).toContain("bigPlan(words)");
  });

  it("extra spelling tiles cannot repeat a word letter in either case", () => {
    const tileCode = src.slice(src.indexOf("function shuffle("), src.indexOf("function choicesFor("));
    const makeTiles = new Function('const extras = "abcdefghijklmnopqrstuvwxyz";' + tileCode + "return makeTiles;")();
    for (const word of C.words) {
      const orders = new Set();
      for (let i = 0; i < 30; i++) {
        const tiles = makeTiles(word);
        orders.add(tiles.join(""));
        expect(tiles).toHaveLength(word.length + (word.length < 5 ? 3 : 2));
        for (const letter of new Set(word)) {
          expect(tiles.filter((tile) => tile === letter)).toHaveLength([...word].filter((ch) => ch === letter).length);
        }
        const extras = tiles.filter((letter) => !word.includes(letter));
        expect(new Set(extras).size).toBe(extras.length);
        expect(extras.every((letter) => !word.toLowerCase().includes(letter.toLowerCase()))).toBe(true);
      }
      expect(orders.size).toBeGreaterThan(1);
    }
  });

  it("no longer has Greater or less anywhere", () => {
    expect(block).not.toMatch(/compares/);
    expect(src).not.toMatch(/Greater or less|compares|cmpSign|data-act="maths"/);
  });

  it("builds the nightly tests' maths from the sums", () => {
    expect(src).toMatch(/maths: parseMaths\(sums\)/);
    expect(src).toMatch(/planNights\(testContent\(\)\)/);
  });
});
