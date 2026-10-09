import { describe, it, expect, beforeEach } from "vitest";
import { planNights, nightSignature } from "./nights.js";
import * as done from "./done.js";
import * as sea from "./sea.js";

// A pretend localStorage, like the tablet's.
beforeEach(() => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
});

const content = (words, maths) => ({
  spell: words, maths,
  world: [{ id: "europe" }, { id: "asia" }], command: [{ text: "Sit down." }], noun: [{ line: "The dog." }],
  suffix: [{ stem: "jump" }], join: [{ line: "I run" }], letters: "abcdefghijklmnopqrstuvwxyz".split(""),
});
const lastWeek = content(["have", "give", "smells", "jumps"], [{ text: "14 + 4", answer: 18 }]);
const thisWeek = content(["olive", "sleeve", "wings", "pencils"], [{ text: "13 + 5", answer: 18 }]);

describe("a new week's homework", () => {
  it("clears last week's ticks but keeps the sea creature collection", () => {
    const old = planNights(lastWeek)[0];
    done.markDone(0, nightSignature(old), 12, 15);
    sea.unlockNext(); sea.unlockNext(); sea.unlockSpecial();
    expect(done.nightResult(0, nightSignature(old))).toMatchObject({ score: 12, max: 15 });

    const fresh = planNights(thisWeek)[0];
    expect(nightSignature(fresh)).not.toBe(nightSignature(old));
    expect(done.nightResult(0, nightSignature(fresh))).toBeNull(); // Monday shows no tick any more
    expect(sea.collection()).toHaveLength(3); // his creatures (and the Golden Puffer) are still there
  });
});
