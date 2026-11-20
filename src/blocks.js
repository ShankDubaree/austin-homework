// Base-ten blocks for the sums: tens rods (a stick of 10 small squares) and ones cubes.
// Adding: both numbers' blocks side by side, plus an exchange hint when ones make a ten.
// Taking away: the first number's blocks, with the blocks being taken away crossed out.
// If there aren't enough ones (e.g. 95 - 47: 5 ones, take 7), we first show the exchange:
// 1 ten swapped for 10 ones (the new ones are green), then the blocks after the swap with
// the take-away crossed out. The answer number itself is never shown; Austin counts what's left.
// No column method: the school teaches drawing tens and ones until juniors.
// Pure functions so they are easy to test.

// { op, groups: [{ value, tens: [gone?...], ones: [gone?...] }] }
export function blocksModel(s) {
  const split = (n) => ({ tens: Math.floor(n / 10), ones: n % 10 });
  const group = (n, take = 0) => {
    const { tens, ones } = split(n), t = split(take);
    return {
      value: n,
      tens: Array.from({ length: tens }, (_, i) => i >= tens - t.tens),
      ones: Array.from({ length: ones }, (_, i) => i >= ones - t.ones),
    };
  };
  if (s.op === "-") {
    if (s.a % 10 >= s.b % 10 || s.a < 10) return { op: "-", groups: [group(s.a, s.b)], exchange: null };
    // Exchange first: one fewer ten, ten more ones. The 10 new ones go at the end and are marked "fresh".
    const t = split(s.a), take = split(s.b);
    const tensAfter = t.tens - 1, onesAfter = t.ones + 10;
    const after = {
      value: s.a,
      tens: Array.from({ length: tensAfter }, (_, i) => i >= tensAfter - take.tens),
      ones: Array.from({ length: onesAfter }, (_, i) => i >= onesAfter - take.ones),
      fresh: Array.from({ length: onesAfter }, (_, i) => i >= t.ones),
    };
    return {
      op: "-", groups: [group(s.a)], after,
      exchange: { tens: 1, ones: 10, tensAfter, onesAfter, startOnes: t.ones, takeOnes: take.ones },
    };
  }
  const ones = (s.a % 10) + (s.b % 10);
  return {
    op: "+", groups: [group(s.a), group(s.b)],
    exchange: ones >= 10 ? { ones, tens: 1, remainingOnes: ones - 10 } : null,
  };
}

export function blocksHtml(s) {
  const m = blocksModel(s);
  const rod = (gone) => `<span class="bt-rod${gone ? " gone" : ""}">${"<i></i>".repeat(10)}</span>`;
  const cube = (gone, fresh) => `<span class="bt-one${fresh ? " fresh" : ""}${gone ? " gone" : ""}"></span>`;
  const g = (x, label = x.value) => `<div class="bt-group"><div class="bt-blocks"><div class="bt-tens">${x.tens.map((gone) => rod(gone)).join("")}</div><div class="bt-ones${x.ones.length > 10 ? " many" : ""}">${x.ones.map((gone, i) => cube(gone, x.fresh && x.fresh[i])).join("")}</div></div>${label === "" ? "" : `<div class="bt-num">${label}</div>`}</div>`;
  const key = `<div class="bt-key"><span class="bt-key-ten"></span>10 <span class="bt-key-one"></span>1</div>`;
  if (m.op === "-" && m.exchange) {
    // Taking away with exchanging: start number, the swap, then the blocks after the swap with the take-away crossed out.
    const e = m.exchange;
    const ones = (n) => `${n} ${n === 1 ? "one" : "ones"}`;
    return `<div class="blocks bt-sub" aria-hidden="true"><div class="bt-row">${g(m.groups[0])}</div>`
      + `<div class="bt-exchange"><p class="bt-note">Only ${ones(e.startOnes)}. Not enough to take away ${e.takeOnes}!</p><p class="bt-note">Swap 1 ten for 10 ones:</p><div class="bt-swap">${rod(false)}<span class="bt-arrow">→</span><div class="bt-bundle">${Array.from({ length: 10 }, () => cube(false, true)).join("")}</div></div><p class="bt-note">Now ${s.a} is ${e.tensAfter} tens and ${e.onesAfter} ones.</p></div>`
      + `<div class="bt-row">${g(m.after, "")}</div><p class="bt-note">Cross out ${s.b}: ${Math.floor(s.b / 10)} tens and ${ones(s.b % 10)}. Count what's left!</p>${key}</div>`;
  }
  const body = m.op === "+" ? `${g(m.groups[0])}<div class="bt-plus">+</div>${g(m.groups[1])}` : g(m.groups[0]);
  // A separate, labelled example of the swap, not extra blocks to add to the operands.
  // Keep the final answer hidden so Austin still counts the tens and leftover ones.
  const exchange = m.op === "+" && m.exchange ? `<div class="bt-exchange"><p class="bt-note">${s.a % 10} + ${s.b % 10} makes ${m.exchange.ones} ones.</p><p class="bt-note">Swap 10 ones for 1 ten:</p><div class="bt-swap"><div class="bt-bundle">${Array.from({ length: 10 }, () => cube(false)).join("")}</div><span class="bt-arrow">→</span>${rod(false)}</div><p class="bt-note">${m.exchange.remainingOnes} ones left. Count the tens, including your new ten!</p></div>` : "";
  const note = m.op === "-" ? `<p class="bt-note">Cross out ${s.b}: ${Math.floor(s.b / 10)} tens and ${s.b % 10} ones</p>` : "";
  return `<div class="blocks" aria-hidden="true"><div class="bt-row">${body}</div>${note}${exchange}${key}</div>`;
}
