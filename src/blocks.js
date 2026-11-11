// Base-ten blocks for the sums: tens rods (a stick of 10 small squares) and ones cubes.
// Adding: both numbers' blocks side by side, plus an exchange hint when ones make a ten.
// Taking away: the first number's blocks,
// with the ones being taken away crossed out (taken from the end, no exchanging needed).
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
  if (s.op === "-") return { op: "-", groups: [group(s.a, s.b)] };
  const ones = (s.a % 10) + (s.b % 10);
  return {
    op: "+", groups: [group(s.a), group(s.b)],
    exchange: ones >= 10 ? { ones, tens: 1, remainingOnes: ones - 10 } : null,
  };
}

export function blocksHtml(s) {
  const m = blocksModel(s);
  const rod = (gone) => `<span class="bt-rod${gone ? " gone" : ""}">${"<i></i>".repeat(10)}</span>`;
  const cube = (gone) => `<span class="bt-one${gone ? " gone" : ""}"></span>`;
  const g = (x) => `<div class="bt-group"><div class="bt-blocks"><div class="bt-tens">${x.tens.map(rod).join("")}</div><div class="bt-ones">${x.ones.map(cube).join("")}</div></div><div class="bt-num">${x.value}</div></div>`;
  const body = m.op === "+" ? `${g(m.groups[0])}<div class="bt-plus">+</div>${g(m.groups[1])}` : g(m.groups[0]);
  // A separate, labelled example of the swap, not extra blocks to add to the operands.
  // Keep the final answer hidden so Austin still counts the tens and leftover ones.
  const exchange = m.exchange ? `<div class="bt-exchange"><p class="bt-note">${s.a % 10} + ${s.b % 10} makes ${m.exchange.ones} ones.</p><p class="bt-note">Swap 10 ones for 1 ten:</p><div class="bt-swap"><div class="bt-bundle">${Array.from({ length: 10 }, () => cube(false)).join("")}</div><span class="bt-arrow">→</span>${rod(false)}</div><p class="bt-note">${m.exchange.remainingOnes} ones left. Count the tens, including your new ten!</p></div>` : "";
  const note = m.op === "-" ? `<p class="bt-note">Cross out ${s.b}: ${Math.floor(s.b / 10)} tens and ${s.b % 10} ones</p>` : "";
  return `<div class="blocks" aria-hidden="true"><div class="bt-row">${body}</div>${note}${exchange}<div class="bt-key"><span class="bt-key-ten"></span>10 <span class="bt-key-one"></span>1</div></div>`;
}
