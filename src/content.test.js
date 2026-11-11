import { describe, it, expect } from "vitest";
import fs from "fs";
import { parseSums } from "./sums.js";

// Reads the content lists at the top of main.js, the same way Daniel edits them.
const src = fs.readFileSync(new URL("./main.js", import.meta.url), "utf8");
const block = src.slice(src.indexOf("const words"), src.indexOf("const extras"));
const C = new Function(block + "return { words, sums, continents, commands, nouns, suffixes, joins };")();

describe("this week's content", () => {
  it("has the spellings and sums lists", () => {
    expect(C.words).toEqual(["well", "socks", "watch", "live", "splashes", "hunting", "jumped", "helper", "playground", "school"]);
    expect(C.sums).toEqual(["17+19", "28+26", "46+17", "26+45", "18+25", "39+48"]);
    expect(parseSums(C.sums)).toHaveLength(C.sums.length); // every sum can be read
  });

  it("this week's six additions exchange 10 ones for a ten, with the school answers", () => {
    const last = ["23+45", "52+36", "14+73", "62+15", "30+48", "86-24", "97-53", "75-41", "68-32", "49-18"];
    const ps = parseSums(C.sums);
    expect(ps.filter((s) => s.op === "+")).toHaveLength(6);
    expect(ps.filter((s) => s.op === "-")).toHaveLength(0);
    expect(ps.map((s) => s.answer)).toEqual([36, 54, 63, 71, 43, 87]);
    for (const s of ps) {
      for (const n of [s.a, s.b]) { expect(n).toBeGreaterThanOrEqual(10); expect(n).toBeLessThanOrEqual(99); }
      expect(s.answer).toBeGreaterThanOrEqual(10); expect(s.answer).toBeLessThanOrEqual(99);
      expect((s.a % 10) + (s.b % 10)).toBeGreaterThanOrEqual(10);
    }
    expect(new Set(ps.map((s) => s.text)).size).toBe(6);
    expect(new Set(ps.map((s) => s.answer)).size).toBe(6); // varied
    expect(C.sums.filter((s) => last.includes(s))).toEqual([]);
  });

  it("changing only the sums keeps night ticks (signature ignores maths) and every night still gets 3 sums", async () => {
    const { planNights, nightSignature, PER_NIGHT } = await import("./test/nights.js");
    const old = ["23+45", "52+36", "14+73", "62+15", "30+48", "86-24", "97-53", "75-41", "68-32", "49-18"];
    const content = { spell: C.words, world: C.continents, command: C.commands, noun: C.nouns, suffix: C.suffixes, join: C.joins };
    const a = planNights({ ...content, maths: parseSums(old) });
    const b = planNights({ ...content, maths: parseSums(C.sums) });
    expect(b.map((p) => nightSignature(p))).toEqual(a.map((p) => nightSignature(p)));
    for (const p of b) {
      expect(p.maths).toHaveLength(PER_NIGHT.maths);
      expect(new Set(p.maths.map((s) => s.text)).size).toBe(3);
    }
    const uses = b.flatMap((p) => p.maths.map((s) => s.text));
    for (const s of parseSums(C.sums)) expect(uses.filter((text) => text === s.text)).toHaveLength(2);
    expect(b[2].maths).toEqual(b[0].maths);
    expect(b[3].maths).toEqual(b[1].maths);
  });

  it("new spellings reset every night's tick and the Big Test, which uses all 10 new words", async () => {
    const { planNights, nightSignature } = await import("./test/nights.js");
    const { bigPlan, bigSignature } = await import("./test/big.js");
    const oldWords = ["Tuesday", "Wednesday", "February", "Friday", "January", "July", "August", "Spring", "Summer", "once"];
    const content = { spell: C.words, maths: parseSums(C.sums), world: C.continents, command: C.commands, noun: C.nouns, suffix: C.suffixes, join: C.joins };
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
    expect(src).toMatch(/maths: parseSums\(sums\)/);
    expect(src).toMatch(/planNights\(testContent\(\)\)/);
  });
});
