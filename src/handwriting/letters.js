// Letter shapes for handwriting practice.
//
// Units: the writing lines are 50 units apart.
//   y = 0   top line (tall letters reach here)
//   y = 50  dashed middle line (small letters start here)
//   y = 100 baseline (letters sit here)
//   y = 150 tail line (g j p q y hang down to here)
// x runs left to right; each letter is centred on the pad when drawn.
//
// A letter is a list of strokes (pen down ... pen up), in the order they are written.
// Each stroke is a list of [x, y] points. The style is the school print style:
// plain starts, with a small exit flick on letters such as a d h i k l m n t u.

const STEP = 3; // degrees per arc sample

// A straight line from (x1, y1) to (x2, y2).
function line(x1, y1, x2, y2) {
  const n = Math.max(2, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 2));
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push([x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n]);
  return pts;
}

// An arc of an ellipse. Angles in degrees, 0 = right, 90 = down, 180 = left, 270 = up.
// Going from a bigger angle to a smaller one draws anticlockwise (like c and o).
function arc(cx, cy, rx, ry, from, to) {
  const n = Math.max(2, Math.ceil(Math.abs(to - from) / STEP));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = ((from + ((to - from) * i) / n) * Math.PI) / 180;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return pts;
}

// A downstroke that ends with a small exit flick to the right.
function downFlick(x, yTop, yBottom = 100) {
  return [...line(x, yTop, x, yBottom - 9), ...arc(x + 8, yBottom - 9, 8, 9, 180, 90), ...line(x + 8, yBottom, x + 15, yBottom - 7)];
}

// Join pieces into one stroke, dropping duplicate points where pieces meet.
function join(...parts) {
  const out = [];
  for (const part of parts) {
    for (const p of part) {
      const last = out[out.length - 1];
      if (!last || Math.hypot(last[0] - p[0], last[1] - p[1]) > 0.01) out.push(p);
    }
  }
  return out;
}

// The round "bowl" shared by a d g q: starts just under the middle line on the right,
// goes anticlockwise all the way round, and comes back up to the middle line.
const bowl = () => join(arc(28, 75, 20, 25, 330, -30), line(45.3, 62.5, 48, 50));

const dot = (x, y) => line(x, y - 2, x, y + 2);

export const LETTERS = {
  // Curly caterpillar letters
  c: { strokes: [arc(28, 75, 20, 25, 315, 45)], hint: "Start at the dot. Curl over the top, round and stop." },
  a: { strokes: [join(bowl(), downFlick(48, 50))], hint: "Curl round like a c, up to the line, then down and flick." },
  d: { strokes: [join(bowl(), line(48, 50, 48, 0), downFlick(48, 0))], hint: "Curl round like a c, all the way up tall, then down and flick." },
  g: { strokes: [join(bowl(), line(48, 50, 48, 130), arc(34, 130, 14, 17, 0, 165))], hint: "Curl round like a c, up, then down under the line and curl back." },
  o: { strokes: [arc(28, 75, 20, 25, 290, -75)], hint: "Start at the top. Curl all the way round and join up." },
  q: { strokes: [join(bowl(), downFlick(48, 50, 150))], hint: "Curl round like a c, up, then down under the line and flick." },
  e: { strokes: [join(line(9, 77, 47, 77), arc(28, 75, 19, 25, 360, 45))], hint: "Go across the middle, then curl over the top and round." },
  s: { strokes: [join(arc(28, 62.5, 16, 12.5, 330, 90), arc(28, 87.5, 16, 12.5, 270, 510))], hint: "Start at the top. Curl back like a snake, then round the other way." },
  f: { strokes: [join(arc(32, 14, 12, 14, 330, 180), line(20, 14, 20, 100)), line(8, 50, 34, 50)], hint: "Start at the top, curl over and go straight down. Then a line across." },

  // Ladder letters
  l: { strokes: [downFlick(20, 0)], hint: "Start at the top. Straight down and flick." },
  i: { strokes: [downFlick(20, 50), dot(20, 30)], hint: "Straight down and flick. Then a dot on top." },
  t: { strokes: [downFlick(20, 15), line(8, 50, 34, 50)], hint: "Start high. Straight down and flick. Then a line across." },
  u: { strokes: [join(line(10, 50, 10, 83), arc(27, 83, 17, 17, 180, 0), line(44, 83, 44, 50), downFlick(44, 50))], hint: "Down, round the bottom, up, then down and flick." },
  j: { strokes: [join(line(24, 50, 24, 130), arc(12, 130, 12, 17, 0, 165)), dot(24, 30)], hint: "Straight down under the line and curl back. Then a dot on top." },
  y: { strokes: [join(line(10, 50, 10, 83), arc(27, 83, 17, 17, 180, 0), line(44, 83, 44, 50), line(44, 50, 44, 130), arc(30, 130, 14, 17, 0, 165))], hint: "Down, round, up, then down under the line and curl back." },

  // One-armed robot letters
  r: { strokes: [join(line(10, 50, 10, 100), line(10, 100, 10, 68), arc(26, 68, 16, 16, 180, 305))], hint: "Down, back up, and over like an arm." },
  n: { strokes: [join(line(10, 50, 10, 100), line(10, 100, 10, 68), arc(27, 68, 17, 17, 180, 360), downFlick(44, 68))], hint: "Down, back up, over the hill, down and flick." },
  m: { strokes: [join(line(8, 50, 8, 100), line(8, 100, 8, 66), arc(21, 66, 13, 15, 180, 360), line(34, 66, 34, 100), line(34, 100, 34, 66), arc(47, 66, 13, 15, 180, 360), downFlick(60, 66))], hint: "Down, up and over, down, up and over again, down and flick." },
  h: { strokes: [join(line(10, 0, 10, 100), line(10, 100, 10, 68), arc(27, 68, 17, 17, 180, 360), downFlick(44, 68))], hint: "Start at the top. Down, back up, over, down and flick." },
  b: { strokes: [join(line(10, 0, 10, 100), line(10, 100, 10, 70), arc(28, 75, 18, 25, 192, 528))], hint: "Start at the top. Down, back up and round the tummy." },
  k: { strokes: [line(10, 0, 10, 100), join(line(36, 50, 11, 76), line(11, 76, 32, 97), arc(36, 92, 6, 6, 120, 30))], hint: "Down from the top. Then in to the middle, out and flick." },
  p: { strokes: [join(line(10, 50, 10, 150), line(10, 150, 10, 70), arc(28, 75, 18, 25, 192, 528))], hint: "Down under the line, back up and round." },

  // Zigzag letters
  v: { strokes: [join(line(6, 50, 24, 100), line(24, 100, 42, 50))], hint: "Down the slope and back up." },
  w: { strokes: [join(line(4, 50, 16, 100), line(16, 100, 28, 62), line(28, 62, 40, 100), line(40, 100, 52, 50))], hint: "Down, up, down, up." },
  x: { strokes: [line(8, 50, 40, 100), line(40, 50, 8, 100)], hint: "One slope down, then the other slope across it." },
  z: { strokes: [join(line(8, 50, 40, 50), line(40, 50, 8, 100), line(8, 100, 42, 100))], hint: "Across, down the slope, and across again." },
};

export const FAMILIES = [
  { id: "curly", name: "Curly caterpillar", letters: ["c", "a", "d", "g", "o", "q", "e", "s", "f"], color: "#f4d35e" },
  { id: "ladder", name: "Ladder letters", letters: ["l", "i", "t", "u", "j", "y"], color: "#7dff9a" },
  { id: "robot", name: "One-armed robots", letters: ["r", "b", "n", "h", "m", "k", "p"], color: "#5aa7ff" },
  { id: "zigzag", name: "Zigzag letters", letters: ["v", "w", "x", "z"], color: "#c9a0ff" },
];

export const LINES = { top: 0, mid: 50, base: 100, tail: 150 };

// Left/right edges of a letter, so it can be centred.
export function letterBounds(letter) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const stroke of LETTERS[letter].strokes) {
    for (const [x, y] of stroke) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  }
  return { minX, maxX, minY, maxY };
}

// Spread points evenly along a stroke (every `gap` units) so scoring isn't biased
// by how densely a stroke happens to be described.
export function resample(points, gap = 2) {
  if (points.length < 2) return points.map((p) => [...p]);
  const out = [[...points[0]]];
  let carry = 0;
  for (let i = 1; i < points.length; i++) {
    let [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    let seg = Math.hypot(x1 - x0, y1 - y0);
    while (carry + seg >= gap) {
      const t = (gap - carry) / seg;
      x0 += (x1 - x0) * t; y0 += (y1 - y0) * t;
      out.push([x0, y0]);
      seg = Math.hypot(x1 - x0, y1 - y0);
      carry = 0;
    }
    carry += seg;
  }
  const last = points[points.length - 1];
  const end = out[out.length - 1];
  if (Math.hypot(last[0] - end[0], last[1] - end[1]) > 0.5) out.push([...last]);
  return out;
}

export function strokeLength(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) len += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  return len;
}

// A small picture of a letter (SVG), drawn from the same shapes as the pad,
// so buttons show the school-style letters (single-storey a and g, exit flicks).
export function letterSvg(letter, height = 60, color = "#0b1b4a") {
  const b = letterBounds(letter);
  const x0 = b.minX - 8, w = b.maxX - b.minX + 16;
  const lines = LETTERS[letter].strokes
    .map((st) => `<polyline points="${st.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}" />`)
    .join("");
  return `<svg class="letter-svg" viewBox="${x0.toFixed(1)} -8 ${w.toFixed(1)} 166" height="${height}" width="${Math.round((height * w) / 166)}" aria-label="${letter}" role="img"><g fill="none" stroke="${color}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round">${lines}</g></svg>`;
}
