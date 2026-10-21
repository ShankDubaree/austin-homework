import { describe, it, expect } from "vitest";
import { blocksModel, blocksHtml } from "./blocks.js";
import { parseSum } from "./sums.js";

describe("base-ten blocks", () => {
  it("adding shows both numbers as tens rods and ones cubes", () => {
    const m = blocksModel(parseSum("35+24"));
    expect(m.op).toBe("+");
    expect(m.groups.map((g) => [g.value, g.tens.length, g.ones.length])).toEqual([[35, 3, 5], [24, 2, 4]]);
    expect(m.groups.flatMap((g) => [...g.tens, ...g.ones]).some(Boolean)).toBe(false); // nothing crossed out
  });
  it("taking away shows the first number with the taken-away blocks crossed out", () => {
    const m = blocksModel(parseSum("67-25"));
    expect(m.groups).toHaveLength(1);
    const [g] = m.groups;
    expect(g.tens).toEqual([false, false, false, false, true, true]);
    expect(g.ones).toEqual([false, false, true, true, true, true, true]);
    expect(g.tens.filter((x) => !x).length * 10 + g.ones.filter((x) => !x).length).toBe(42);
  });
  it("copes with a 0 in the ones (94 - 30, 60 + 17)", () => {
    expect(blocksModel(parseSum("94-30")).groups[0].ones).toEqual([false, false, false, false]);
    expect(blocksModel(parseSum("60+17")).groups[0].ones).toEqual([]);
  });
  it("draws 10 small squares in each rod", () => {
    const html = blocksHtml(parseSum("42+31"));
    expect(html.match(/class="bt-rod/g)).toHaveLength(7);
    expect(html.match(/<i><\/i>/g)).toHaveLength(70);
    expect(html.match(/class="bt-one[" ]/g)).toHaveLength(3);
    expect(blocksHtml(parseSum("78-43")).match(/ gone"/g)).toHaveLength(7);
  });
});
