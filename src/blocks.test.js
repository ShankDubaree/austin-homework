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

describe("exchanging ones in addition", () => {
  it.each([
    ["17+19", 16, 6, 36], ["28+26", 14, 4, 54], ["46+17", 13, 3, 63],
    ["26+45", 11, 1, 71], ["18+25", 13, 3, 43], ["39+48", 17, 7, 87],
    ["15+25", 10, 0, 40], ["19+29", 18, 8, 48],
  ])("%s makes one new ten and keeps the right leftover ones", (raw, ones, left, answer) => {
    const sum = parseSum(raw), m = blocksModel(sum);
    expect(sum.answer).toBe(answer);
    expect(m.exchange).toEqual({ ones, tens: 1, remainingOnes: left });
    const originalTens = m.groups.reduce((total, g) => total + g.tens.length, 0);
    expect((originalTens + m.exchange.tens) * 10 + left).toBe(answer);
    expect(m.groups.reduce((total, g) => total + g.ones.length, 0)).toBe(ones);
    expect(m.groups.flatMap((g) => [...g.tens, ...g.ones]).some(Boolean)).toBe(false);
    const html = blocksHtml(sum);
    expect(html).toContain(`makes ${ones} ones.`);
    expect(html).toContain("Swap 10 ones for 1 ten:");
    expect(html).toContain(`${left} ones left.`);
    const swap = html.split('<div class="bt-swap">')[1].split('<p class="bt-note">')[0];
    expect(swap.match(/class="bt-one"/g)).toHaveLength(10);
    expect(swap.match(/class="bt-rod"/g)).toHaveLength(1);
    expect(swap.match(/<i><\/i>/g)).toHaveLength(10);
  });

  it("does not suggest an exchange for addition below ten ones or subtraction", () => {
    expect(blocksModel(parseSum("35+24")).exchange).toBeNull();
    expect(blocksHtml(parseSum("35+24"))).not.toContain("bt-exchange");
    expect(blocksHtml(parseSum("67-25"))).not.toContain("bt-exchange");
  });
});
