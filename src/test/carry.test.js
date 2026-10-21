import { describe, it, expect, beforeEach } from "vitest";
import { planNights, nightSignature } from "./nights.js";
import { parseSums } from "../sums.js";
import * as done from "./done.js";
import { carryTicks, SUMS_BEFORE } from "./carry.js";

let store;
beforeEach(() => {
  store = new Map();
  globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
});
const base = { spell: ["dreaming", "sleeping", "painted", "shouted", "played", "talked", "hunter", "singer", "what", "when"], world: ["a", "b", "c", "d", "e", "f", "g"], command: ["c1"], noun: ["n1"], suffix: ["s1"], join: ["j1"], letters: ["d", "s", "p", "t", "w", "h", "a", "i"] };
const now = { ...base, maths: parseSums(["35+24", "42+31", "16+52", "27+61", "60+17", "67-25", "78-43", "59-36", "87-51", "94-30"]) };
const before = { ...base, maths: parseSums(SUMS_BEFORE) };

describe("changing the sums mid-week", () => {
  it("keeps Monday and Tuesday ticks and scores done with last week's sums", () => {
    const old = planNights(before);
    done.markDone(0, nightSignature(old[0], { withMaths: true }), 13, 15);
    done.markDone(1, nightSignature(old[1], { withMaths: true }), 15, 15);
    expect(carryTicks(now)).toEqual([true, true, false, false]);
    const plans = planNights(now);
    expect(done.nightResult(0, nightSignature(plans[0]))).toMatchObject({ score: 13, max: 15 });
    expect(done.nightResult(1, nightSignature(plans[1]))).toMatchObject({ score: 15, max: 15 });
    expect(done.nightResult(2, nightSignature(plans[2]))).toBeNull();
    expect(carryTicks(now)).toEqual([false, false, false, false]); // nothing more to do on the next load
  });
  it("doesn't bring back ticks from an older week (different spellings)", () => {
    const older = planNights({ ...before, spell: ["olive", "sleeve", "wings", "pencils", "dishes", "foxes", "sunshine", "raindrop", "school", "friend"] });
    done.markDone(0, nightSignature(older[0], { withMaths: true }), 12, 15);
    expect(carryTicks(now)).toEqual([false, false, false, false]);
    expect(done.nightResult(0, nightSignature(planNights(now)[0]))).toBeNull();
  });
  it("signature ignores the sums but still changes with the spellings", () => {
    const a = planNights(now)[0], b = planNights(before)[0];
    expect(nightSignature(a)).toBe(nightSignature(b));
    expect(nightSignature(a, { withMaths: true })).not.toBe(nightSignature(b, { withMaths: true }));
    expect(nightSignature(planNights({ ...now, spell: ["x", ...base.spell.slice(1)] })[0])).not.toBe(nightSignature(a));
  });
  it("is safe if storage is blocked", () => {
    globalThis.localStorage = { getItem() { throw new Error("no"); }, setItem() { throw new Error("no"); } };
    expect(() => carryTicks(now)).not.toThrow();
  });
});
