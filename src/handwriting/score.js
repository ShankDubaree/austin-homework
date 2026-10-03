// Gentle scoring for a traced letter. Pure functions: no screen, no storage.
//
// Four checks:
//   near      - most of Austin's ink is close to the letter
//   coverage  - most of the letter has ink on it
//   start     - he started at the green dot
//   direction - each stroke goes the way the arrows point
// plus scribble guards: lots of extra ink, or strokes that don't follow the letter in order, don't count as a good shape.
// Stars: 1 for a good shape (near + coverage), +1 for the right direction, +1 for the right start.
// A rough shape that's at least half there still gets 1 star. Otherwise 0 stars = "Try again".

import { LETTERS, resample, strokeLength } from "./letters.js";

export const DEFAULTS = { tolerance: 14, startTolerance: 20 };

function nearestDist(p, pts) {
  let best = Infinity;
  for (const q of pts) {
    const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}

// Cost of matching a user stroke to the best-fitting stretch of a model stroke,
// keeping the order of points (subsequence dynamic time warping). Lower = better.
function matchCost(user, model) {
  const n = user.length, m = model.length;
  let prev = new Array(m).fill(0);
  let cur = new Array(m);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const d = Math.hypot(user[i][0] - model[j][0], user[i][1] - model[j][1]);
      const up = i === 0 ? 0 : prev[j];
      const left = j === 0 ? Infinity : cur[j - 1];
      const diag = i === 0 ? 0 : j === 0 ? Infinity : prev[j - 1];
      cur[j] = d + Math.min(up, left, diag);
    }
    [prev, cur] = [cur, prev];
  }
  return Math.min(...prev) / n;
}

// userStrokes: [[[x, y], ...], ...] in letter units (same units as letters.js).
export function scoreTrace(letter, userStrokes, options = {}) {
  const { tolerance, startTolerance } = { ...DEFAULTS, ...options };
  const modelStrokes = LETTERS[letter].strokes.map((s) => resample(s, 2));
  const modelAll = modelStrokes.flat();
  const strokes = userStrokes.filter((s) => s.length > 0).map((s) => (s.length > 1 ? resample(s, 2) : s));
  const userAll = strokes.flat();
  const result = { stars: 0, near: 0, coverage: 0, ink: 0, flow: Infinity, start: false, direction: false, tip: "" };
  if (userAll.length === 0) { result.tip = "Start at the green dot"; return result; }

  result.near = userAll.filter((p) => nearestDist(p, modelAll) <= tolerance).length / userAll.length;
  // How much ink compared with the letter itself (1 = just right, going over it twice = 2).
  const modelLen = modelStrokes.reduce((sum, ms) => sum + strokeLength(ms), 0);
  result.ink = strokes.reduce((sum, us) => sum + strokeLength(us), 0) / Math.max(1, modelLen);
  result.coverage = modelAll.filter((p) => nearestDist(p, userAll) <= tolerance).length / modelAll.length;

  const firstStart = modelStrokes[0][0];
  const u0 = strokes[0][0];
  result.start = Math.hypot(u0[0] - firstStart[0], u0[1] - firstStart[1]) <= startTolerance;

  // Direction: match each real user stroke (not a dot/tap) to the model stroke it lies on,
  // then check it fits better going forwards than backwards.
  // "flow" is how closely, on average, the strokes follow the letter in order (a scribble can't).
  let checked = 0, forwards = 0, flowSum = 0, flowPts = 0;
  for (const s of strokes) {
    if (strokeLength(s) < 12) continue;
    let bestIdx = -1, bestFit = Infinity, bestNear = Infinity;
    modelStrokes.forEach((ms, idx) => {
      if (strokeLength(ms) < 12) return;
      // How close the user stroke is to this model stroke, plus (less strongly) how much of it it covers.
      const near = s.reduce((sum, p) => sum + nearestDist(p, ms), 0) / s.length;
      const cover = ms.reduce((sum, p) => sum + nearestDist(p, s), 0) / ms.length;
      const fit = near + 0.5 * cover;
      if (fit < bestFit) { bestFit = fit; bestIdx = idx; bestNear = near; }
    });
    if (bestIdx < 0 || bestNear > tolerance * 1.5) continue;
    const ms = modelStrokes[bestIdx];
    checked += 1;
    const fwd = matchCost(s, ms), back = matchCost(s, [...ms].reverse());
    // Where the stroke starts and ends is the clearest clue; if that's unclear
    // (an o starts and ends in the same place) use how well it follows the path in order.
    const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const u0 = s[0], u1 = s[s.length - 1], m0 = ms[0], m1 = ms[ms.length - 1];
    const endsFwd = d(u0, m0) + d(u1, m1), endsBack = d(u0, m1) + d(u1, m0);
    const goesForwards = Math.abs(endsFwd - endsBack) > 12 ? endsFwd < endsBack : fwd <= back;
    if (goesForwards) forwards += 1;
    flowSum += Math.min(fwd, back) * s.length;
    flowPts += s.length;
  }
  result.flow = flowPts ? flowSum / flowPts : Infinity;
  result.direction = checked > 0 && forwards === checked;

  const goodShape = result.near >= 0.7 && result.coverage >= 0.7 && result.ink <= 2.2 && result.flow <= tolerance * 0.6;
  const roughShape = result.near >= 0.5 && result.coverage >= 0.5 && result.ink <= 4;
  if (goodShape) result.stars = 1 + (result.direction ? 1 : 0) + (result.start ? 1 : 0);
  else if (roughShape) result.stars = 1;

  if (result.ink > 2.2 && result.coverage >= 0.5) result.tip = "Nice and slow, just one line";
  else if (!roughShape) result.tip = result.coverage < 0.5 ? "Trace the whole letter" : "Stay close to the grey letter";
  else if (!goodShape) result.tip = "Stay close to the grey letter";
  else if (!result.start) result.tip = "Start at the green dot";
  else if (!result.direction) result.tip = "Follow the arrows";
  else result.tip = "Perfect!";
  return result;
}
