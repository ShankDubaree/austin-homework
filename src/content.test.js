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
    expect(C.sums).toEqual(["21+6", "34+5", "47+2", "63+4", "72+3", "49-7", "58-3", "67-5", "86-4", "95-2"]);
    expect(parseSums(C.sums)).toHaveLength(C.sums.length); // every sum can be read
  });

  it("this week's sums are 2-digit and 1-digit, no crossing tens, answers 0-99, none from last week", () => {
    const last = ["13+5", "26+3", "38+1", "42+4", "54+2", "55-3", "48-4", "36-2", "29-5", "18-6"];
    const ps = parseSums(C.sums);
    expect(ps.filter((s) => s.op === "+")).toHaveLength(5);
    expect(ps.filter((s) => s.op === "-")).toHaveLength(5);
    for (const s of ps) {
      expect(s.a).toBeGreaterThanOrEqual(10); expect(s.a).toBeLessThanOrEqual(99);
      expect(s.b).toBeGreaterThanOrEqual(1); expect(s.b).toBeLessThanOrEqual(9);
      expect(s.answer).toBeGreaterThanOrEqual(0); expect(s.answer).toBeLessThanOrEqual(99);
      expect(Math.floor(s.answer / 10)).toBe(Math.floor(s.a / 10)); // stays in the same ten
    }
    expect(new Set(ps.map((s) => s.text)).size).toBe(10);
    expect(C.sums.filter((s) => last.includes(s))).toEqual([]);
  });

  it("no longer has Greater or less anywhere", () => {
    expect(block).not.toMatch(/compares/);
    expect(src).not.toMatch(/Greater or less|compares|cmpSign|data-act="maths"/);
  });

  it("builds the nightly tests' maths from the sums", () => {
    expect(src).toMatch(/planNights\(\{[^)]*maths: parseSums\(sums\)/);
  });
});
