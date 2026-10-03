// Handwriting progress, saved on this device only (localStorage), separate from the
// spelling/maths scores. Shape: { letters: { a: { best: 3, tries: 5, last: "..." } }, voice: true }

const KEY = "austin-handwriting";

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "{}");
    return { letters: data.letters || {}, voice: data.voice !== false };
  } catch (e) {
    return { letters: {}, voice: true };
  }
}

function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
}

export function bestStars(letter) {
  return (load().letters[letter] || {}).best || 0;
}

// Record a try. Returns true if this beat his best for the letter.
export function saveResult(letter, stars) {
  const data = load();
  const entry = data.letters[letter] || { best: 0, tries: 0 };
  const improved = stars > entry.best;
  data.letters[letter] = { best: Math.max(entry.best, stars), tries: entry.tries + 1, last: new Date().toLocaleString() };
  save(data);
  return improved;
}

export function familyStars(letters) {
  const data = load();
  const got = letters.reduce((sum, l) => sum + ((data.letters[l] || {}).best || 0), 0);
  return { got, max: letters.length * 3 };
}

export function voiceOn() { return load().voice; }
export function setVoice(on) { const data = load(); data.voice = on; save(data); }
