// Sea creatures Austin collects in the nightly tests: one for every question he gets right,
// plus a special Golden Puffer Fish for a night with full marks.
// All art is emoji (older emoji only, so they show on Fire tablets) or tiny SVGs drawn here,
// with colour twists for extra friends. No downloaded pictures.

export const CREATURES = [
  { id: "tropical", name: "Finn the Tropical Fish", emoji: "🐠" },
  { id: "octopus", name: "Ollie the Octopus", emoji: "🐙" },
  { id: "crab", name: "Snappy the Crab", emoji: "🦀" },
  { id: "starfish", name: "Twinkle the Starfish", svg: "star", color: "#ff9f43" },
  { id: "dolphin", name: "Flip the Dolphin", emoji: "🐬" },
  { id: "turtle", name: "Shelly the Turtle", emoji: "🐢" },
  { id: "jelly", name: "Wobble the Jellyfish", svg: "jelly", color: "#ff7eb6" },
  { id: "whale", name: "Spout the Whale", emoji: "🐳" },
  { id: "shrimp", name: "Tiny the Shrimp", emoji: "🦐" },
  { id: "fish", name: "Splash the Fish", emoji: "🐟" },
  { id: "shark", name: "Chomp the Shark", emoji: "🦈" },
  { id: "squid", name: "Inky the Squid", emoji: "🦑" },
  { id: "lobster", name: "Clawdia the Lobster", emoji: "🦞" },
  { id: "shell", name: "Swirl the Shell", emoji: "🐚" },
  { id: "penguin", name: "Pip the Penguin", emoji: "🐧" },
  { id: "bluewhale", name: "Big Blue the Whale", emoji: "🐋" },
  { id: "purplestar", name: "Violet the Starfish", svg: "star", color: "#b57bff" },
  { id: "bluetang", name: "Bubbles the Blue Fish", emoji: "🐠", hue: 160 },
  { id: "greenocto", name: "Ziggy the Green Octopus", emoji: "🐙", hue: 100 },
  { id: "moonjelly", name: "Glow the Moon Jelly", svg: "jelly", color: "#7fd6ff" },
  { id: "bluecrab", name: "Bella the Blue Crab", emoji: "🦀", hue: 200 },
  { id: "pinkdolphin", name: "Rosie the Pink Dolphin", emoji: "🐬", hue: 290 },
  { id: "goldfish", name: "Goldie the Fish", emoji: "🐟", hue: 180 },
  { id: "seaturtle", name: "Sunny the Sea Turtle", emoji: "🐢", hue: 50 },
  { id: "redstar", name: "Ruby the Starfish", svg: "star", color: "#ff5b6e" },
  { id: "purplesquid", name: "Captain Squiggle", emoji: "🦑", hue: 240 },
  { id: "glowshrimp", name: "Glimmer the Shrimp", emoji: "🦐", hue: 120 },
  { id: "greenjelly", name: "Jiggle the Jellyfish", svg: "jelly", color: "#8dff9a" },
  { id: "pinkshell", name: "Pearl the Shell", emoji: "🐚", hue: 300 },
  { id: "mintwhale", name: "Misty the Whale", emoji: "🐳", hue: 120 },
  { id: "lanternshark", name: "Sparky the Lantern Shark", emoji: "🦈", glow: true },
];

// The full-marks bonus. Only ever given by unlockSpecial(), never by a normal answer.
export const SPECIAL = { id: "golden-puffer", name: "Sparkle the Golden Puffer Fish", emoji: "🐡", special: true };

export function creatureById(id) {
  return id === SPECIAL.id ? SPECIAL : CREATURES.find((c) => c.id === id) || null;
}

// Who comes next: the first friend he hasn't met yet. Once he has them all,
// the one he has fewest of (so the collection keeps growing evenly).
export function pickNext(counts = {}, pool = CREATURES) {
  let best = null;
  for (const c of pool) {
    const n = counts[c.id] || 0;
    if (n === 0) return c;
    if (!best || n < (counts[best.id] || 0)) best = c;
  }
  return best;
}

// Pure: add one of a creature to a collection { counts, order } and return the new one.
export function addTo(data, id) {
  const counts = { ...(data.counts || {}) };
  const order = (data.order || []).slice();
  counts[id] = (counts[id] || 0) + 1;
  if (!order.includes(id)) order.push(id);
  return { counts, order };
}

// Pictures. size is in px.
function svgArt(c, size) {
  if (c.svg === "star") {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 19 : 46, a = (Math.PI / 5) * i - Math.PI / 2;
      pts.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(52 + r * Math.sin(a)).toFixed(1)}`);
    }
    return `<svg class="sea-svg" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true"><polygon points="${pts.join(" ")}" fill="${c.color}" stroke="#0b1b4a" stroke-width="4" stroke-linejoin="round"/><circle cx="42" cy="46" r="4" fill="#0b1b4a"/><circle cx="58" cy="46" r="4" fill="#0b1b4a"/><path d="M42 58 Q50 65 58 58" stroke="#0b1b4a" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`;
  }
  return `<svg class="sea-svg" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="${c.color}" stroke-width="5" stroke-linecap="round"><path d="M30 55 q-6 10 0 20 t0 20"/><path d="M45 57 q-6 10 0 20 t0 20"/><path d="M58 57 q6 10 0 20 t0 20"/><path d="M72 55 q6 10 0 20 t0 20"/></g><path d="M16 58 Q16 14 50 14 Q84 14 84 58 Z" fill="${c.color}" stroke="#0b1b4a" stroke-width="4" stroke-linejoin="round"/><circle cx="40" cy="40" r="4.5" fill="#0b1b4a"/><circle cx="60" cy="40" r="4.5" fill="#0b1b4a"/><path d="M42 49 Q50 55 58 49" stroke="#0b1b4a" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`;
}
export function creatureArt(c, size = 56) {
  if (c.svg) return svgArt(c, size);
  const style = [`font-size:${Math.round(size * 0.86)}px`];
  if (c.hue) style.push(`filter:hue-rotate(${c.hue}deg) saturate(1.3)`);
  if (c.glow) style.push("filter:drop-shadow(0 0 6px #7fd6ff) drop-shadow(0 0 12px #7fd6ff)");
  if (c.special) style.push("filter:sepia(1) saturate(4) hue-rotate(-12deg) drop-shadow(0 0 8px #ffe066)");
  return `<span class="sea-emoji" style="${style.join(";")}" aria-hidden="true">${c.emoji}</span>`;
}

// ---- Saved on this device (localStorage), its own key ----
const KEY = "austin-sea";
export function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || "{}") || {};
    return { counts: d.counts || {}, order: d.order || [] };
  } catch (e) { return { counts: {}, order: [] }; }
}
function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }

// One creature for one right answer. Returns { creature, isNew }.
export function unlockNext() {
  const d = load();
  const creature = pickNext(d.counts);
  const isNew = !d.counts[creature.id];
  save(addTo(d, creature.id));
  return { creature, isNew };
}
export function unlockSpecial() {
  const d = load();
  const isNew = !d.counts[SPECIAL.id];
  save(addTo(d, SPECIAL.id));
  return { creature: SPECIAL, isNew };
}
// Everything collected so far, Golden Puffer first, then in the order he found them.
export function collection() {
  const d = load();
  const ids = d.order.filter((id) => creatureById(id));
  ids.sort((a, b) => (b === SPECIAL.id) - (a === SPECIAL.id));
  return ids.map((id) => ({ creature: creatureById(id), count: d.counts[id] || 0 }));
}

// ---- One-time reset of the collection ----
// main.js passes in a reset id. The first time a device sees a new id, the sea collection
// (including Golden Puffers) is emptied and the id is remembered, so it only happens once.
// Nothing else is touched: night ticks, practice scores and handwriting stars stay.
const RESET_KEY = "austin-sea-reset";
export function resetOnce(id) {
  if (!id) return false;
  try {
    if (localStorage.getItem(RESET_KEY) === id) return false;
    localStorage.removeItem(KEY);
    localStorage.setItem(RESET_KEY, id);
    return true;
  } catch (e) { return false; }
}
