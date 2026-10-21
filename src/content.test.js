import { describe, it, expect } from "vitest";
import fs from "fs";
import { parseSums } from "./sums.js";

// Reads the content lists at the top of main.js, the same way Daniel edits them.
const src = fs.readFileSync(new URL("./main.js", import.meta.url), "utf8");
const block = src.slice(src.indexOf("const words"), src.indexOf("const extras"));
const C = new Function(block + "return { words, sums, continents, commands, nouns, suffixes, joins };")();

describe("this week's content", () => {
  it("has the spellings and sums lists", () => {
    expect(C.words).toEqual(["dreaming", "sleeping", "painted", "shouted", "played", "talked", "hunter", "singer", "what", "when"]);
    expect(C.sums).toEqual(["35+24", "42+31", "16+52", "27+61", "60+17", "67-25", "78-43", "59-36", "87-51", "94-30"]);
    expect(parseSums(C.sums)).toHaveLength(C.sums.length); // every sum can be read
  });

  it("this week's sums are 2-digit and 2-digit with no exchanging, answers 10-99, none from last week", () => {
    const last = ["21+6", "34+5", "47+2", "63+4", "72+3", "49-7", "58-3", "67-5", "86-4", "95-2"];
    const ps = parseSums(C.sums);
    expect(ps.filter((s) => s.op === "+")).toHaveLength(5);
    expect(ps.filter((s) => s.op === "-")).toHaveLength(5);
    for (const s of ps) {
      for (const n of [s.a, s.b]) { expect(n).toBeGreaterThanOrEqual(10); expect(n).toBeLessThanOrEqual(99); }
      expect(s.answer).toBeGreaterThanOrEqual(10); expect(s.answer).toBeLessThanOrEqual(99);
      if (s.op === "+") expect((s.a % 10) + (s.b % 10)).toBeLessThanOrEqual(9); // ones don't make a new ten
      else expect(s.a % 10).toBeGreaterThanOrEqual(s.b % 10); // no exchanging a ten for ones
    }
    expect(new Set(ps.map((s) => s.text)).size).toBe(10);
    expect(new Set(ps.map((s) => s.answer)).size).toBeGreaterThanOrEqual(8); // varied
    expect(C.sums.filter((s) => last.includes(s))).toEqual([]);
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
