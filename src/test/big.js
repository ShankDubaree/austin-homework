// Big Spelling Test: all of this week's spellings, spellings only (no sums).
// Pure functions so they are easy to unit test.

export const BIG = 4; // saved like a night, under its own slot after Monday(0)..Thursday(3)
export const BIG_NAME = "Big Spelling Test";

// Always unlocked, every day of the week. (date / thursdayDone are kept so older
// callers and tests still work, but they no longer affect availability.)
export function bigUnlocked(_date, _thursdayDone = false) {
  return true;
}

// Every word once, in a shuffled order. rand is injectable for tests.
export function bigWords(words, rand = Math.random) {
  const list = (Array.isArray(words) ? words : []).filter((w, i, a) => a.indexOf(w) === i);
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = list[i]; list[i] = list[j]; list[j] = t;
  }
  return list;
}

// The plan in the same shape as a night (spellings only), so the same screens and done ticks work.
export function bigPlan(words, rand) {
  return { name: BIG_NAME, spell: bigWords(words, rand) };
}

// Signature from the sorted words so the shuffle doesn't clear the tick.
export function bigSignature(words) {
  const text = "big|" + (words || []).slice().sort().join("|");
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
