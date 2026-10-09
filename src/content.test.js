import { describe, it, expect } from "vitest";
import fs from "fs";
import { parseSums } from "./sums.js";

// Reads the content lists at the top of main.js, the same way Daniel edits them.
const src = fs.readFileSync(new URL("./main.js", import.meta.url), "utf8");
const block = src.slice(src.indexOf("const words"), src.indexOf("const extras"));
const C = new Function(block + "return { words, sums, continents, commands, nouns, suffixes, joins };")();

describe("this week's content", () => {
  it("has the spellings and sums lists", () => {
    expect(C.words).toEqual(["olive", "sleeve", "wings", "pencils", "dishes", "foxes", "sunshine", "raindrop", "school", "friend"]);
    expect(parseSums(C.sums)).toHaveLength(C.sums.length); // every sum can be read
  });

  it("no longer has Greater or less anywhere", () => {
    expect(block).not.toMatch(/compares/);
    expect(src).not.toMatch(/Greater or less|compares|cmpSign|data-act="maths"/);
  });

  it("builds the nightly tests' maths from the sums", () => {
    expect(src).toMatch(/planNights\(\{[^)]*maths: parseSums\(sums\)/);
  });
});
