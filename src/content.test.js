import { describe, it, expect } from "vitest";
import fs from "fs";
import { parseSums } from "./sums.js";
import { parseMaths } from "./money.js";

// Reads the content lists at the top of main.js, the same way Daniel edits them.
const src = fs.readFileSync(new URL("./main.js", import.meta.url), "utf8");
const block = src.slice(src.indexOf("const words"), src.indexOf("const extras"));
const C = new Function(block + "return { words, sums, continents, commands, nouns, suffixes, joins };")();

describe("this week's content", () => {
  it("has this week's spellings and the school's 10 regrouping sums", () => {
    expect(C.words).toEqual(["play", "spray", "enjoy", "destroy", "rule", "mute", "flute", "rescue", "flew", "again"]);
    expect(C.words.every((w) => w === w.toLowerCase())).toBe(true);
    expect(C.sums).toEqual(["25+26", "85-56", "31+29", "34+57", "62-38", "72-26", "83-48", "54+38", "74+18", "95-47"]);
    const ps = parseMaths(C.sums);
    expect(ps).toHaveLength(10);
    expect(ps.map((q) => q.answer)).toEqual([51, 29, 60, 91, 24, 46, 35, 92, 92, 48]); // checked against the sheet
    expect(ps.every((q) => q.type === undefined && q.a >= 10 && q.b >= 10 && q.a < 100 && q.b < 100)).toBe(true);
    expect(ps.filter((q) => q.op === "+")).toHaveLength(5);
    expect(ps.filter((q) => q.op === "-")).toHaveLength(5);
    // every taking away here needs a ten exchanging (not enough ones)
    for (const q of ps.filter((q) => q.op === "-")) expect(q.a % 10).toBeLessThan(q.b % 10);
    expect(new Set(ps.map((q) => q.text)).size).toBe(10);
  });

  it("practice says Adding & taking away (not Fireworks) and the sums are typed with the number keypad", () => {
    expect(src).toContain('data-act="sums">Adding &amp; taking away');
    expect(src).not.toMatch(/Fireworks/);
    expect(src).toMatch(/inputmode="numeric"/);
    expect(src).not.toMatch(/sumOptions\(/);
  });

  it("changing only the maths keeps night ticks, every night gets 3 sums and all 10 are used", async () => {
    const { planNights, nightSignature, PER_NIGHT } = await import("./test/nights.js");
    const old = ["23+45", "52+36", "14+73", "62+15", "30+48", "86-24", "97-53", "75-41", "68-32", "49-18"];
    const content = { spell: C.words, world: C.continents, command: C.commands, noun: C.nouns, suffix: C.suffixes, join: C.joins };
    const a = planNights({ ...content, maths: parseSums(old) });
    const b = planNights({ ...content, maths: parseMaths(C.sums) });
    expect(b.map((p) => nightSignature(p))).toEqual(a.map((p) => nightSignature(p)));
    for (const p of b) {
      expect(p.maths).toHaveLength(PER_NIGHT.maths);
      expect(new Set(p.maths.map((s) => s.text)).size).toBe(3);
      expect(p.maths.some((s) => s.op === "+")).toBe(true); // a mix of adding and taking away every night
      expect(p.maths.some((s) => s.op === "-")).toBe(true);
      expect(p.spell).toHaveLength(5);
    }
    expect(new Set(b.flatMap((p) => p.maths.map((s) => s.text))).size).toBe(10);
    expect(b[0].spell).toEqual(["play", "spray", "enjoy", "destroy", "rule"]);
    expect(b[1].spell).toEqual(["mute", "flute", "rescue", "flew", "again"]);
    expect(b[3].maths.map((s) => s.text)).toEqual(["95 - 47", "25 + 26", "85 - 56"]);
  });

  it("new spellings reset every night's tick and the Big Test, which uses all 10 new words", async () => {
    const { planNights, nightSignature } = await import("./test/nights.js");
    const { bigPlan, bigSignature } = await import("./test/big.js");
    const oldWords = ["shorter", "louder", "slowest", "fastest", "rain", "train", "paint", "join", "coin", "people"];
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

  it("has 5 of each grammar kind, with one answer in the choices", () => {
    expect(C.commands).toHaveLength(5);
    expect(C.nouns).toHaveLength(5);
    expect(C.suffixes).toHaveLength(5);
    expect(C.joins).toHaveLength(5);
    expect(C.commands.some((q) => q.yes)).toBe(true);
    expect(C.commands.some((q) => !q.yes)).toBe(true);
    for (const q of C.nouns) {
      expect(q.options).toHaveLength(3);
      expect(q.options).toContain(q.answer);
      expect(q.line.toLowerCase()).toContain(q.answer.toLowerCase());
    }
    for (const q of C.suffixes) {
      expect(q.choices).toHaveLength(3);
      expect(q.choices).toContain(q.answer);
    }
    for (const q of C.joins) {
      expect(q.choices).toHaveLength(3);
      expect(q.choices).toContain(q.answer);
    }
  });
});
