import { describe, it, expect } from "vitest";
import fs from "fs";
import { parseSums } from "./sums.js";

// Reads the content lists at the top of main.js, the same way Daniel edits them.
const src = fs.readFileSync(new URL("./main.js", import.meta.url), "utf8");
const block = src.slice(src.indexOf("const words"), src.indexOf("const extras"));
const C = new Function(block + "return { words, sums, continents, commands, nouns, suffixes, joins };")();

describe("this week's content", () => {
  it("has the spellings and sums lists", () => {
    expect(C.words).toEqual(["Tuesday", "Wednesday", "February", "Friday", "January", "July", "August", "Spring", "Summer", "once"]);
    expect(C.sums).toEqual(["33+24", "43+46", "32+17", "51+36", "65-32", "57-36", "85-42", "33-22"]);
    expect(parseSums(C.sums)).toHaveLength(C.sums.length); // every sum can be read
  });

  it("this week's sums are 2-digit and 2-digit with no exchanging, answers 10-99, none from last week", () => {
    const last = ["23+45", "52+36", "14+73", "62+15", "30+48", "86-24", "97-53", "75-41", "68-32", "49-18"];
    const ps = parseSums(C.sums);
    expect(ps.filter((s) => s.op === "+")).toHaveLength(4);
    expect(ps.filter((s) => s.op === "-")).toHaveLength(4);
    for (const s of ps) {
      for (const n of [s.a, s.b]) { expect(n).toBeGreaterThanOrEqual(10); expect(n).toBeLessThanOrEqual(99); }
      expect(s.answer).toBeGreaterThanOrEqual(10); expect(s.answer).toBeLessThanOrEqual(99);
      if (s.op === "+") expect((s.a % 10) + (s.b % 10)).toBeLessThanOrEqual(9); // ones don't make a new ten
      else expect(s.a % 10).toBeGreaterThanOrEqual(s.b % 10); // no exchanging a ten for ones
    }
    expect(new Set(ps.map((s) => s.text)).size).toBe(8);
    expect(new Set(ps.map((s) => s.answer)).size).toBeGreaterThanOrEqual(8); // varied
    expect(C.sums.filter((s) => last.includes(s))).toEqual([]);
  });

  it("changing only the sums keeps night ticks (signature ignores maths) and every night still gets 3 sums", async () => {
    const { planNights, nightSignature, PER_NIGHT } = await import("./test/nights.js");
    const old = ["23+45", "52+36", "14+73", "62+15", "30+48", "86-24", "97-53", "75-41", "68-32", "49-18"];
    const content = { spell: C.words, world: C.continents, command: C.commands, noun: C.nouns, suffix: C.suffixes, join: C.joins };
    const a = planNights({ ...content, maths: parseSums(old) });
    const b = planNights({ ...content, maths: parseSums(C.sums) });
    expect(b.map((p) => nightSignature(p))).toEqual(a.map((p) => nightSignature(p)));
    for (const p of b) expect(p.maths).toHaveLength(PER_NIGHT.maths);
  });

  it("capitalised spellings get their capital tile and no lowercase twin", () => {
    expect(src).toMatch(/word\.toLowerCase\(\)\.includes\(letter\.toLowerCase\(\)\)/);
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
