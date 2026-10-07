// Which nightly tests Austin has finished, saved on this device only (localStorage).
// Kept under its own key, separate from the practice scores and handwriting stars.
// Shape: { "0": { score: 11, max: 13, when: "...", sig: "abc123" }, ... } (0 = Monday)

const KEY = "austin-test-nights";

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; }
}

// The saved result for a night, but only if the night still has the same questions.
export function nightResult(night, sig) {
  const entry = load()[night];
  return entry && entry.sig === sig ? entry : null;
}

export function markDone(night, sig, score, max) {
  const data = load();
  data[night] = { score, max, sig, when: new Date().toLocaleString() };
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
}
