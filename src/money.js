// This week's maths: Fireworks money, adding pence of the same unit.
// Pure functions so they are easy to test.

import { parseSum, sumWords } from "./sums.js";

// "50", "50p", "50 P" -> 50. Anything else -> null.
export function parsePence(input) {
  const s = String(input ?? "").trim().toLowerCase().replace(/\s+/g, "");
  const m = s.match(/^(\d+)p?$/);
  return m ? Number(m[1]) : null;
}

export function samePence(input, answer) {
  const n = parsePence(input);
  return n !== null && n === Number(answer);
}

// Greedy 20p, 10p, 5p, then 2p and 1p if needed.
export function coinsFor(pence) {
  const out = [];
  let left = Number(pence) || 0;
  for (const v of [20, 10, 5, 2, 1]) {
    while (left >= v) { out.push(v); left -= v; }
  }
  return out;
}

function fwPhrase(fw) {
  const name = fw.article ? `${fw.article} ${fw.emoji} ${fw.name}` : `${fw.emoji} ${fw.name}`;
  return `${name} ${fw.verb} ${fw.cost}p`;
}

export function addPrompt(q) {
  return `${fwPhrase(q.a)} and ${fwPhrase(q.b)}. How much altogether?`;
}

function normalizeAdd(raw) {
  const a = raw.a, b = raw.b;
  if (!a || !b) return null;
  const answer = a.cost + b.cost;
  return { type: "add", a, b, answer, text: `${a.cost}p + ${b.cost}p`, prompt: addPrompt({ a, b }) };
}

function normalizeExact(raw) {
  const options = Array.isArray(raw.options) ? raw.options : [];
  const winners = options.filter((o) => o.total === 100);
  const answer = raw.answer || (winners[0] && winners[0].label);
  if (!answer) return null;
  return {
    type: "exact",
    shop: raw.shop || [],
    options,
    answer,
    text: `exactly £1.00: ${answer}`,
    prompt: raw.prompt || "Which fireworks could you buy with exactly £1.00?",
  };
}

// Turns the weekly list in main.js into questions the tests and screens can use.
// String sums like "17+19" still work, so older tests keep running.
export function parseMaths(list) {
  return (list || []).map((raw) => {
    if (raw && raw.type === "add") return normalizeAdd(raw);
    if (raw && raw.type === "exact") return normalizeExact(raw);
    return parseSum(raw);
  }).filter(Boolean);
}

export function moneySpeak(q) {
  if (q.type === "add") return q.prompt;
  if (q.type === "exact") return `${q.prompt} One pound is 100 pence.`;
  return `What is ${sumWords(q)}?`;
}

export function moneyShown(q) {
  if (q.type === "add") return `This one is <b>${q.a.cost}p + ${q.b.cost}p = ${q.answer}p</b> — let's keep going!`;
  if (q.type === "exact") return `This one is <b>${q.answer}</b>, which is exactly £1.00 — let's keep going!`;
  return `This one is <b>${q.text} = ${q.answer}</b> — let's keep going!`;
}

export function moneyShownSpeech(q) {
  if (q.type === "add") return `${q.a.cost}p add ${q.b.cost}p is ${q.answer}p. Let's keep going!`;
  if (q.type === "exact") return `This one is ${q.answer}, which is exactly 1 pound. Let's keep going!`;
  return `${sumWords(q)} is ${q.answer}. Let's keep going!`;
}

function coinSpan(v) {
  return `<span class="coin c${v}">${v}p</span>`;
}

function fwCard(fw) {
  const coins = coinsFor(fw.cost).map(coinSpan).join("");
  return `<div class="fw-card"><div class="fw-emoji">${fw.emoji}</div><div class="fw-name">${fw.name}</div><div class="fw-price">${fw.cost}p</div><div class="fw-coins">${coins}</div></div>`;
}

export function moneyVisual(q) {
  if (q.type === "add") {
    return `<div class="fw-sum" aria-hidden="true">${fwCard(q.a)}<div class="fw-plus">+</div>${fwCard(q.b)}</div><div class="fw-key">${[20, 10, 5].map(coinSpan).join("")}</div>`;
  }
  if (q.type === "exact") {
    const shop = (q.shop || []).map((fw) => `<div class="fw-shop-item"><span class="fw-emoji">${fw.emoji}</span><span class="fw-name">${fw.name}</span><span class="fw-price">${fw.cost}p</span></div>`).join("");
    return `<div class="fw-shop">${shop}</div><p class="fw-hint">£1.00 is 100p</p>`;
  }
  return "";
}
