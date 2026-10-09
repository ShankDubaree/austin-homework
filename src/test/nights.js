// Nightly tests: share this week's practice content out across Monday to Thursday.
// Pure functions (no screen, no storage) so they are easy to unit test.
//
// Each night gets the same mix of questions. Items are handed out in list order, so
// every item is used once before anything is used again. Things only repeat when a
// list is too short to fill all four nights. Because it works straight from the lists
// in main.js, the nights change automatically when the weekly spellings change.

export const NIGHTS = ["Monday", "Tuesday", "Wednesday", "Thursday"];

// How many questions of each kind go into one night.
export const PER_NIGHT = { spell: 4, maths: 3, world: 2, command: 1, noun: 1, suffix: 1, join: 1 };
// Handwriting letters per night (picked from that night's spelling words, see below).
export const HW_PER_NIGHT = 2;

// The order Austin meets them in. Grammar is one section made of the four grammar kinds.
export const SECTIONS = [
  { id: "spell", name: "Spellings", kinds: ["spell"] },
  { id: "hw", name: "Handwriting", kinds: ["hw"] },
  { id: "maths", name: "Maths", kinds: ["maths"] },
  { id: "world", name: "Continents", kinds: ["world"] },
  { id: "grammar", name: "Grammar hunt", kinds: ["command", "noun", "suffix", "join"] },
];

// Split one list across the nights. Night n takes the next `perNight` items, wrapping
// back to the start only once the list runs out. A night never gets the same item twice
// (if the list is shorter than perNight, that night just gets every item once).
export function splitAcrossNights(items, perNight, nights = NIGHTS.length) {
  const list = Array.isArray(items) ? items : [];
  const take = Math.min(perNight, list.length);
  const out = [];
  for (let night = 0; night < nights; night++) {
    const picks = [];
    for (let k = 0; k < take; k++) picks.push(list[(night * take + k) % list.length]);
    out.push(picks);
  }
  return out;
}

// Handwriting letters to trace, tied to each night's spelling words: first the first
// letters of the words ("h" for have), then other letters in the words. A letter used on
// an earlier night is skipped while there are fresh ones, so nights get different letters.
// Falls back to any letter we have shapes for if the words don't give enough.
// Returns per night: [{ letter: "h", word: "have" }, ...]
export function handwritingLetters(spellByNight, available, perNight = HW_PER_NIGHT) {
  const known = new Set(available || []);
  const used = new Set();
  return spellByNight.map((words) => {
    const candidates = [];
    const add = (letter, word) => { if (known.has(letter) && !candidates.some((c) => c.letter === letter)) candidates.push({ letter, word }); };
    for (const w of words) add(String(w)[0], w);
    for (const w of words) for (const ch of String(w)) add(ch, w);
    for (const l of available || []) add(l, null);
    const fresh = candidates.filter((c) => !used.has(c.letter));
    const picks = [...fresh, ...candidates.filter((c) => used.has(c.letter))].slice(0, perNight);
    picks.forEach((c) => used.add(c.letter));
    return picks;
  });
}

// content: { spell: [...words], maths: [...], world: [...], command: [...], noun: [...], suffix: [...], join: [...],
//            letters: [...letters we have handwriting shapes for] }
// Returns one plan per night: { name, spell: [...], hw: [...], maths: [...], ... }
export function planNights(content, perNight = PER_NIGHT) {
  const split = {};
  for (const kind of Object.keys(perNight)) split[kind] = splitAcrossNights(content[kind], perNight[kind]);
  const hw = handwritingLetters(split.spell || NIGHTS.map(() => []), content.letters || []);
  return NIGHTS.map((name, n) => {
    const plan = { name };
    for (const kind of Object.keys(perNight)) plan[kind] = split[kind][n];
    plan.hw = hw[n];
    return plan;
  });
}

// The questions for one night, in order: spellings, handwriting, sums, continents, then grammar.
export function nightQuestions(plan) {
  const qs = [];
  for (const section of SECTIONS) {
    for (const kind of section.kinds) for (const item of plan[kind] || []) qs.push({ section: section.id, kind, item });
  }
  return qs;
}

// A short fingerprint of a night's questions. A saved "done" tick only counts while the
// night still has the same questions, so new weekly spellings clear old ticks by themselves.
function itemKey(kind, item) {
  if (typeof item === "string") return item;
  if (kind === "maths") return item.text; // a sum, e.g. "13 + 5"
  if (kind === "world") return item.id;
  if (kind === "hw") return item.letter;
  return item.text || item.line || item.stem || JSON.stringify(item);
}
export function nightSignature(plan) {
  const text = nightQuestions(plan).map((q) => `${q.kind}:${itemKey(q.kind, q.item)}`).join("|");
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
