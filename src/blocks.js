// Base-ten blocks for the sums: tens rods (a stick of 10 small squares) and ones cubes.
// Adding: both numbers' blocks side by side. Taking away: the first number's blocks,
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
  return { op: "+", groups: [group(s.a), group(s.b)] };
}

export function blocksHtml(s) {
  const m = blocksModel(s);
  const rod = (gone) => `<span class="bt-rod${gone ? " gone" : ""}">${"<i></i>".repeat(10)}</span>`;
  const cube = (gone) => `<span class="bt-one${gone ? " gone" : ""}"></span>`;
  const g = (x) => `<div class="bt-group"><div class="bt-blocks"><div class="bt-tens">${x.tens.map(rod).join("")}</div><div class="bt-ones">${x.ones.map(cube).join("")}</div></div><div class="bt-num">${x.value}</div></div>`;
  const body = m.op === "+" ? `${g(m.groups[0])}<div class="bt-plus">+</div>${g(m.groups[1])}` : g(m.groups[0]);
  const note = m.op === "-" ? `<p class="bt-note">Cross out ${s.b}: ${Math.floor(s.b / 10)} tens and ${s.b % 10} ones</p>` : "";
  return `<div class="blocks" aria-hidden="true"><div class="bt-row">${body}</div>${note}<div class="bt-key"><span class="bt-key-ten"></span>10 <span class="bt-key-one"></span>1</div></div>`;
}
