import { describe, it, expect, beforeEach } from "vitest";
import * as sea from "./sea.js";
import * as done from "./done.js";

let store;
beforeEach(() => {
  store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
});

function seedEverything() {
  sea.unlockNext(); sea.unlockNext(); sea.unlockSpecial();
  done.markDone(0, "sigMon", 12, 15);
  localStorage.setItem("austin-scores", JSON.stringify([{ spell: 30, spellMax: 52 }]));
  localStorage.setItem("austin-handwriting", JSON.stringify({ letters: { a: { best: 3, tries: 2 } }, voice: true }));
}

describe("one-time sea creature reset", () => {
  it("empties the collection (puffers too) the first time", () => {
    seedEverything();
    expect(sea.collection()).toHaveLength(3);
    expect(sea.resetOnce("reset-2026-10-09")).toBe(true);
    expect(sea.collection()).toHaveLength(0);
    expect(localStorage.getItem("austin-sea-reset")).toBe("reset-2026-10-09");
  });

  it("doesn't clear again on the next load, so new creatures are kept", () => {
    seedEverything();
    sea.resetOnce("reset-2026-10-09");
    sea.unlockNext();
    expect(sea.resetOnce("reset-2026-10-09")).toBe(false);
    expect(sea.resetOnce("reset-2026-10-09")).toBe(false);
    expect(sea.collection()).toHaveLength(1);
  });

  it("leaves night ticks, spelling scores and handwriting stars alone", () => {
    seedEverything();
    const before = ["austin-test-nights", "austin-scores", "austin-handwriting"].map((k) => localStorage.getItem(k));
    sea.resetOnce("reset-2026-10-09");
    expect(["austin-test-nights", "austin-scores", "austin-handwriting"].map((k) => localStorage.getItem(k))).toEqual(before);
    expect(done.nightResult(0, "sigMon")).toMatchObject({ score: 12 });
  });

  it("runs again only when the id is changed", () => {
    sea.resetOnce("reset-2026-10-09");
    sea.unlockNext();
    expect(sea.resetOnce("reset-2026-10-16")).toBe(true);
    expect(sea.collection()).toHaveLength(0);
  });

  it("does nothing without an id, and never crashes if storage is blocked", () => {
    sea.unlockNext();
    expect(sea.resetOnce("")).toBe(false);
    expect(sea.collection()).toHaveLength(1);
    globalThis.localStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() {} };
    expect(() => sea.resetOnce("reset-2026-10-09")).not.toThrow();
  });
});
