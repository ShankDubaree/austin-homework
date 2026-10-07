// How many goes Austin gets at each test question, and what each go is worth.
// Pure functions so the rules are easy to test.
//
// - Right on the first go: counts towards the night's score ("right first time") and finds a sea creature.
// - Right on go 2 or 3: no score, but still finds a sea creature.
// - Wrong 3 times: the answer is shown kindly, no score and no creature, then he moves on.
// - Full marks (and the Golden Puffer Fish) means every question right first time.

export const MAX_GOES = 3;

// After a wrong go. misses = wrong goes so far on this question (before this one).
export function wrongGo(misses) {
  const now = misses + 1;
  return { misses: now, show: now >= MAX_GOES, goesLeft: Math.max(0, MAX_GOES - now) };
}

// After a right go.
export function rightGo(misses) {
  return { firstTry: misses === 0, creature: misses < MAX_GOES };
}

// results: one entry per question, "first" | "later" | "shown"
export function nightScore(results) {
  return results.filter((r) => r === "first").length;
}
export function creaturesFound(results) {
  return results.filter((r) => r === "first" || r === "later").length;
}
export function fullMarks(results, total = results.length) {
  return total > 0 && results.length === total && results.every((r) => r === "first");
}
