import { describe, it, expect } from "vitest";
import { NIGHTS, PER_NIGHT, HW_PER_NIGHT, splitAcrossNights, planNights, nightQuestions, nightSignature, handwritingLetters } from "./nights.js";
import { LETTERS } from "../handwriting/letters.js";

const list = (prefix, n) => Array.from({ length: n }, (_, i) => `${prefix}${i}`);
const count = (nights) => nights.flat().reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());

// Same sizes as this week's lists in main.js: 10 words, 14 number pairs, 7 continents, 5 of each grammar kind.
const week = () => ({
  spell: list("w", 10),
  maths: list("m", 14).map((id, i) => ({ id, left: i, right: 20 - i })),
  world: list("c", 7).map((id) => ({ id, name: id })),
  command: list("cmd", 5).map((text) => ({ text, yes: true })),
  noun: list("noun", 5).map((line) => ({ line, options: ["a", "b", "c"], answer: "a" })),
  suffix: list("st", 5).map((stem) => ({ stem, answer: "s", choices: ["s", "ful", "less"] })),
  join: list("j", 5).map((line) => ({ line, rest: "x", answer: "and", choices: ["and", "but", "or"] })),
  letters: Object.keys(LETTERS),
});
// This week's real spellings, only used to check the handwriting letters make sense.
const realWords = ["have", "give", "smells", "jumps", "catches", "splashes", "playground", "bedroom", "some", "come"];

describe("splitAcrossNights", () => {
  it("gives every night the right number of items", () => {
    for (const [n, per] of [[10, 4], [14, 3], [7, 2], [5, 1], [4, 4], [16, 4], [40, 4]]) {
      const nights = splitAcrossNights(list("x", n), per);
      expect(nights).toHaveLength(4);
      for (const night of nights) expect(night).toHaveLength(per);
    }
  });

  it("never repeats an item inside one night", () => {
    for (const [n, per] of [[10, 4], [7, 2], [5, 4], [4, 4], [3, 2]]) {
      for (const night of splitAcrossNights(list("x", n), per)) expect(new Set(night).size).toBe(night.length);
    }
  });

  it("uses all different items when there are enough", () => {
    for (const [n, per] of [[16, 4], [14, 3], [12, 3], [5, 1], [8, 2]]) {
      const all = splitAcrossNights(list("x", n), per).flat();
      expect(new Set(all).size).toBe(all.length);
    }
  });

  it("only reuses when short, uses every item first, and spreads repeats evenly", () => {
    for (const [n, per] of [[10, 4], [7, 2], [3, 1], [6, 4]]) {
      const counts = count(splitAcrossNights(list("x", n), per));
      expect(counts.size).toBe(n); // every item used at least once
      const uses = [...counts.values()];
      expect(Math.max(...uses) - Math.min(...uses)).toBeLessThanOrEqual(1);
    }
  });

  it("is the same every time (no randomness)", () => {
    expect(splitAcrossNights(list("x", 10), 4)).toEqual(splitAcrossNights(list("x", 10), 4));
    expect(splitAcrossNights(list("x", 10), 4)).toEqual([
      ["x0", "x1", "x2", "x3"], ["x4", "x5", "x6", "x7"], ["x8", "x9", "x0", "x1"], ["x2", "x3", "x4", "x5"],
    ]);
  });

  it("copes with short or empty lists", () => {
    expect(splitAcrossNights(list("x", 2), 4)).toEqual([["x0", "x1"], ["x0", "x1"], ["x0", "x1"], ["x0", "x1"]]);
    expect(splitAcrossNights([], 4)).toEqual([[], [], [], []]);
    expect(splitAcrossNights(undefined, 4)).toEqual([[], [], [], []]);
  });
});

describe("planNights with this week's list sizes", () => {
  const plans = planNights(week());

  it("makes Monday to Thursday", () => {
    expect(plans.map((p) => p.name)).toEqual(NIGHTS);
    expect(NIGHTS).toEqual(["Monday", "Tuesday", "Wednesday", "Thursday"]);
  });

  it("puts 4 spellings, 3 maths, 2 continents and 1 of each grammar kind in every night", () => {
    for (const p of plans) {
      expect(p.spell).toHaveLength(4);
      expect(p.maths).toHaveLength(3);
      expect(p.world).toHaveLength(2);
      for (const kind of ["command", "noun", "suffix", "join"]) expect(p[kind]).toHaveLength(1);
      expect(p.hw).toHaveLength(2);
      expect(nightQuestions(p)).toHaveLength(15);
    }
    expect(PER_NIGHT).toMatchObject({ spell: 4, maths: 3, world: 2, command: 1, noun: 1, suffix: 1, join: 1 });
  });

  it("gives each night different maths and grammar (there are enough of those)", () => {
    for (const kind of ["maths", "command", "noun", "suffix", "join"]) {
      const all = plans.flatMap((p) => p[kind]);
      expect(new Set(all).size, kind).toBe(all.length);
    }
  });

  it("uses all 10 words before repeating any, and all 7 continents with just one repeat", () => {
    const words = count(plans.map((p) => p.spell));
    expect(words.size).toBe(10);
    expect([...words.values()].filter((n) => n === 2)).toHaveLength(6); // 16 slots, 10 words
    const places = count(plans.map((p) => p.world.map((c) => c.id)));
    expect(places.size).toBe(7);
    expect([...places.values()].filter((n) => n === 2)).toHaveLength(1); // 8 slots, 7 continents
  });

  it("orders a night spellings, handwriting, maths, continents, then grammar", () => {
    expect(nightQuestions(plans[0]).map((q) => q.kind)).toEqual([
      "spell", "spell", "spell", "spell", "hw", "hw", "maths", "maths", "maths", "world", "world", "command", "noun", "suffix", "join",
    ]);
  });

  it("follows the lists, so new spellings give new nights", () => {
    const next = week();
    next.spell = list("new", 10);
    const plansNext = planNights(next);
    expect(plansNext[0].spell).toEqual(["new0", "new1", "new2", "new3"]);
    expect(nightSignature(plansNext[0])).not.toBe(nightSignature(plans[0]));
    expect(nightSignature(planNights(week())[0])).toBe(nightSignature(plans[0]));
  });

  it("is not thrown by the answer buttons being shuffled", () => {
    const w = week();
    const before = nightSignature(planNights(w)[1]);
    w.noun.forEach((q) => q.options.reverse());
    w.join.forEach((q) => q.choices.reverse());
    expect(nightSignature(planNights(w)[1])).toBe(before);
  });
});

describe("handwriting letters for each night", () => {
  const nights = splitAcrossNights(realWords, 4);
  const hw = handwritingLetters(nights, Object.keys(LETTERS));

  it("gives two letters a night, each from that night's spelling words", () => {
    expect(HW_PER_NIGHT).toBe(2);
    hw.forEach((picks, n) => {
      expect(picks).toHaveLength(2);
      for (const { letter, word } of picks) {
        expect(nights[n]).toContain(word);
        expect(word).toContain(letter);
        expect(LETTERS[letter]).toBeTruthy();
      }
    });
  });

  it("starts with the first letters of the words, and uses different letters each night", () => {
    expect(hw[0].map((p) => p.letter)).toEqual(["h", "g"]); // have, give
    expect(hw[1].map((p) => p.letter)).toEqual(["c", "s"]); // catches, splashes
    const all = hw.flat().map((p) => p.letter);
    expect(new Set(all).size).toBe(all.length);
  });

  it("is the same every time and follows the spellings", () => {
    expect(handwritingLetters(nights, Object.keys(LETTERS))).toEqual(hw);
    const other = handwritingLetters([["zip"], ["zip"], ["zip"], ["zip"]], Object.keys(LETTERS));
    expect(other[0].map((p) => p.letter)).toEqual(["z", "i"]);
    expect(other[1].map((p) => p.letter)).toEqual(["p", "c"]); // runs out of word letters, then the next fresh letter in family order
  });

  it("only repeats letters when it has to", () => {
    const tiny = handwritingLetters([["ab"], ["ab"], ["ab"], ["ab"]], ["a", "b"]);
    expect(tiny).toEqual([0, 1, 2, 3].map(() => [{ letter: "a", word: "ab" }, { letter: "b", word: "ab" }]));
    expect(handwritingLetters([[], [], [], []], [])).toEqual([[], [], [], []]);
  });
});
