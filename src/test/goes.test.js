import { describe, it, expect } from "vitest";
import { MAX_GOES, wrongGo, rightGo, nightScore, creaturesFound, fullMarks } from "./goes.js";

describe("3 goes per question", () => {
  it("allows 3 goes", () => expect(MAX_GOES).toBe(3));

  it("lets him try again after the 1st and 2nd wrong go, then shows the answer after the 3rd", () => {
    expect(wrongGo(0)).toEqual({ misses: 1, show: false, goesLeft: 2 });
    expect(wrongGo(1)).toEqual({ misses: 2, show: false, goesLeft: 1 });
    expect(wrongGo(2)).toEqual({ misses: 3, show: true, goesLeft: 0 });
  });

  it("scores only right-first-time, but still gives a creature on go 2 or 3", () => {
    expect(rightGo(0)).toEqual({ firstTry: true, creature: true });
    expect(rightGo(1)).toEqual({ firstTry: false, creature: true });
    expect(rightGo(2)).toEqual({ firstTry: false, creature: true });
  });

  it("plays out a whole question: wrong, wrong, wrong means shown (no score, no creature)", () => {
    let misses = 0, step;
    for (let go = 1; go <= 3; go++) { step = wrongGo(misses); misses = step.misses; }
    expect(step.show).toBe(true);
    expect(nightScore(["shown"])).toBe(0);
    expect(creaturesFound(["shown"])).toBe(0);
  });
});

describe("night totals", () => {
  const night = ["first", "later", "shown", "first", "later", ...Array(10).fill("first")];

  it("counts the score as right first time", () => expect(nightScore(night)).toBe(12));
  it("gives a creature for every question got right within 3 goes", () => expect(creaturesFound(night)).toBe(14));

  it("only gives full marks (the puffer) when every question is right first time", () => {
    expect(fullMarks(night)).toBe(false);
    expect(fullMarks(Array(15).fill("first"))).toBe(true);
    expect(fullMarks([...Array(14).fill("first"), "later"])).toBe(false);
    expect(fullMarks([...Array(14).fill("first"), "shown"])).toBe(false);
    expect(fullMarks(Array(14).fill("first"), 15)).toBe(false); // unfinished night
    expect(fullMarks([])).toBe(false);
  });
});
