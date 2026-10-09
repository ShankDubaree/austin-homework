// Adding and taking away: turns the simple weekly list in main.js ("13+5", "55-3", ...)
// into questions, and makes a few answer buttons that are close to the right answer.
// Pure functions so they are easy to test.

// "13+5" -> { a: 13, op: "+", b: 5, answer: 18, text: "13 + 5" }. Returns null if it can't read it.
export function parseSum(raw) {
  const m = String(raw).replace(/\s+/g, "").replace(/[−–]/g, "-").match(/^(\d+)([+-])(\d+)$/);
  if (!m) return null;
  const a = Number(m[1]), op = m[2], b = Number(m[3]);
  return { a, op, b, answer: op === "+" ? a + b : a - b, text: `${a} ${op} ${b}` };
}

export function parseSums(list) {
  return (list || []).map(parseSum).filter(Boolean);
}

// The right answer plus (count - 1) close wrong ones: one or two away first, then ten away
// (a common slip with tens), never below zero, all different. Shuffled.
export function sumOptions(answer, count = 4, rand = Math.random) {
  const near = [answer - 1, answer + 1, answer - 2, answer + 2].filter((n) => n >= 0);
  const far = [answer + 10, answer - 10, answer + 3, answer - 3].filter((n) => n >= 0);
  const pick = (list, n) => list.map((v) => ({ v, r: rand() })).sort((x, y) => x.r - y.r).slice(0, n).map((x) => x.v);
  const wrong = pick(near, Math.min(2, count - 1));
  for (const v of pick(far, far.length)) if (wrong.length < count - 1 && !wrong.includes(v)) wrong.push(v);
  for (const v of near) if (wrong.length < count - 1 && !wrong.includes(v)) wrong.push(v);
  return pick([answer, ...wrong], count).map(String);
}

// For reading aloud: "13 add 5" / "55 take away 3"
export function sumWords(s) {
  return `${s.a} ${s.op === "+" ? "add" : "take away"} ${s.b}`;
}
