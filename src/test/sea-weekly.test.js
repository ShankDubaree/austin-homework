import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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
afterEach(() => vi.useRealTimers());

// Local-time dates (the tablet's clock).
const at = (y, m, d, h = 12, min = 0) => new Date(y, m - 1, d, h, min);
const loadAppAt = (date) => { vi.useFakeTimers(); vi.setSystemTime(date); return sea.weeklyReset(); };

describe("week names", () => {
  it("names each week after its Saturday", () => {
    expect(sea.weekId(at(2026, 10, 10))).toBe("week-2026-10-10"); // Saturday
    expect(sea.weekId(at(2026, 10, 10, 0, 0))).toBe("week-2026-10-10"); // just after midnight
    expect(sea.weekId(at(2026, 10, 11))).toBe("week-2026-10-10"); // Sunday
    expect(sea.weekId(at(2026, 10, 16, 23, 59))).toBe("week-2026-10-10"); // Friday night
    expect(sea.weekId(at(2026, 10, 9, 23, 59))).toBe("week-2026-10-03"); // the Friday before
    expect(sea.weekId(at(2026, 10, 17))).toBe("week-2026-10-17"); // next Saturday
  });
  it("copes with month and year ends and the clocks going back", () => {
    expect(sea.weekId(at(2026, 11, 2))).toBe("week-2026-10-31"); // Monday after a month end
    expect(sea.weekId(at(2027, 1, 1))).toBe("week-2026-12-26"); // New Year's Day (Friday)
    expect(sea.weekId(at(2026, 10, 25, 3))).toBe("week-2026-10-24"); // Sunday the clocks go back
  });
});

describe("weekly sea creature reset", () => {
  function collectThree() { sea.unlockNext(); sea.unlockNext(); sea.unlockSpecial(); }

  it("Friday → Saturday: clears the collection (puffers too), once", () => {
    loadAppAt(at(2026, 10, 9, 18)); // Friday: first load names the week
    collectThree();
    expect(loadAppAt(at(2026, 10, 9, 23, 59))).toBe(false); // still Friday
    expect(sea.collection()).toHaveLength(3);
    expect(loadAppAt(at(2026, 10, 10, 0, 1))).toBe(true); // Saturday
    expect(sea.collection()).toHaveLength(0);
    expect(localStorage.getItem("austin-sea-reset")).toBe("week-2026-10-10");
  });

  it("Saturday → Sunday → the following Friday: keeps what he collects", () => {
    loadAppAt(at(2026, 10, 10, 9));
    collectThree();
    for (const d of [at(2026, 10, 10, 20), at(2026, 10, 11, 8), at(2026, 10, 14), at(2026, 10, 16, 23, 59)]) {
      expect(loadAppAt(d)).toBe(false);
    }
    expect(sea.collection()).toHaveLength(3);
  });

  it("the next Saturday clears again", () => {
    loadAppAt(at(2026, 10, 10, 9));
    collectThree();
    expect(loadAppAt(at(2026, 10, 17, 7))).toBe(true);
    expect(sea.collection()).toHaveLength(0);
    sea.unlockNext();
    expect(loadAppAt(at(2026, 10, 18))).toBe(false);
    expect(sea.collection()).toHaveLength(1);
  });

  it("clears today on Austin's tablet, which still has last week's one-time marker", () => {
    localStorage.setItem("austin-sea-reset", "reset-2026-10-09");
    collectThree();
    expect(loadAppAt(at(2026, 10, 10, 10))).toBe(true);
    expect(sea.collection()).toHaveLength(0);
  });

  it("leaves night ticks, spelling scores and handwriting stars alone", () => {
    loadAppAt(at(2026, 10, 9));
    collectThree();
    done.markDone(0, "sigMon", 13, 15);
    localStorage.setItem("austin-scores", "[{\"spell\":30,\"spellMax\":52}]");
    localStorage.setItem("austin-handwriting", "{\"letters\":{\"o\":{\"best\":3}}}");
    const keep = ["austin-test-nights", "austin-scores", "austin-handwriting"].map((k) => localStorage.getItem(k));
    expect(loadAppAt(at(2026, 10, 10))).toBe(true);
    expect(["austin-test-nights", "austin-scores", "austin-handwriting"].map((k) => localStorage.getItem(k))).toEqual(keep);
  });

  it("is safe if storage is blocked", () => {
    globalThis.localStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
    expect(() => loadAppAt(at(2026, 10, 10))).not.toThrow();
    expect(loadAppAt(at(2026, 10, 10))).toBe(false);
  });
});
