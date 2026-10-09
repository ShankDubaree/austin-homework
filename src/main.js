import "./style.css";
import { LETTERS, FAMILIES, letterSvg } from "./handwriting/letters.js";
import { scoreTrace } from "./handwriting/score.js";
import * as pad from "./handwriting/pad.js";
import * as hwProgress from "./handwriting/progress.js";
import { NIGHTS, SECTIONS, planNights, nightQuestions, nightSignature } from "./test/nights.js";
import * as testDone from "./test/done.js";
import { parseSums, sumOptions, sumWords } from "./sums.js";
import * as sea from "./test/sea.js";
import { wrongGo, rightGo, nightScore, fullMarks } from "./test/goes.js";

const words = ["olive","sleeve","wings","pencils","dishes","foxes","sunshine","raindrop","school","friend"];
// This week's adding and taking away sums. Just type them like "13+5" or "55-3".
const sums = ["13+5","26+3","38+1","42+4","54+2","55-3","48-4","36-2","29-5","18-6"];
// To empty Austin's "My sea creatures" collection once on every device, change this to a new
// value (e.g. "reset-2026-10-16"). It runs once per device, then never again until it changes.
const SEA_RESET = "reset-2026-10-09";
const continents = [
  { id: "europe", name: "Europe" },
  { id: "africa", name: "Africa" },
  { id: "asia", name: "Asia" },
  { id: "namerica", name: "North America" },
  { id: "samerica", name: "South America" },
  { id: "australia", name: "Australia" },
  { id: "antarctica", name: "Antarctica" },
];
const commands = [
  { text: "Wash your hands.", yes: true },
  { text: "The dog jumps.", yes: false },
  { text: "Sit down.", yes: true },
  { text: "She smells the flowers.", yes: false },
  { text: "Give me the ball.", yes: true },
];
const nouns = [
  { line: "The dog splashes in the puddle.", options: ["dog", "splashes", "in"], answer: "dog" },
  { line: "Austin jumps on the playground.", options: ["jumps", "playground", "on"], answer: "playground" },
  { line: "The cat sleeps in the bedroom.", options: ["sleeps", "bedroom", "in"], answer: "bedroom" },
  { line: "Give the ball to Sam.", options: ["Give", "ball", "to"], answer: "ball" },
  { line: "Some birds catch worms.", options: ["catch", "worms", "some"], answer: "worms" },
];
const suffixes = [
  { stem: "jump", answer: "s", choices: ["s", "ful", "less"] },
  { stem: "splash", answer: "es", choices: ["es", "ful", "less"] },
  { stem: "play", answer: "ed", choices: ["ed", "ful", "less"] },
  { stem: "peace", answer: "ful", choices: ["ful", "es", "ed"] },
  { stem: "end", answer: "less", choices: ["less", "es", "ful"] },
];
const joins = [
  { line: "I have a ball", rest: "I give it to you.", answer: "and", choices: ["and", "but", "or"] },
  { line: "I want to play", rest: "it is raining.", answer: "but", choices: ["but", "and", "or"] },
  { line: "I come inside", rest: "I am cold.", answer: "because", choices: ["because", "or", "and"] },
  { line: "The dog smells food", rest: "the cat jumps.", answer: "and", choices: ["and", "because", "or"] },
  { line: "We stay in", rest: "it is raining.", answer: "because", choices: ["because", "or", "but"] },
];
const extras = "abcdefghijklmnopqrstuvwxyz";
const app = document.querySelector("#app");
const PASSWORD = "baxter";
const HERO = "/austin-homework/hero.png";

let index = 0, covered = false, listening = false, typed = "", tiles = [], timers = [];
let view = "login", count = 0, pulsing = false;
let passGuess = "", loginError = "";
let spellScore = 0, worldScore = 0, grammarScore = 0;
let spellDone = {}, lastKind = "spell";
let worldIndex = 0, worldOrder = [], grammarKind = "menu", grammarIndex = 0, note = "";
let hwFam = FAMILIES[0].id, hwLetter = "c";
let sumIndex = 0, sumScore = 0, sumDone = {}, sumOpts = []; // Adding & taking away practice
// Nightly test state
let tNight = 0, tQs = [], tPos = 0, tPhase = "q", tScore = 0, tMiss = 0, tTried = [], tWobble = "", tYay = "", tBusy = false, tFound = [], tBonus = null;
let tShown = false, tResults = []; // tShown: answer is being shown after 3 wrong goes. tResults: "first" | "later" | "shown" per question

function wordPoints(word) { return word.length; }
function spellMax() { return words.reduce((sum, word) => sum + word.length, 0); }
function scores() { try { return JSON.parse(localStorage.getItem("austin-scores") || "[]"); } catch (e) { return []; } }
function saveScore() {
  const list = scores();
  list.unshift({ when: new Date().toLocaleString(), spell: spellScore, spellMax: spellMax() });
  localStorage.setItem("austin-scores", JSON.stringify(list.slice(0, 20)));
}
function lastScore() { return scores()[0]; }
function stars(got, max) { const n = max ? Math.round((got / max) * 5) : 0; return "★".repeat(n) + "☆".repeat(5 - n); }
function fireConfetti() {
  for (let i = 0; i < 48; i++) {
    const bit = document.createElement("div");
    bit.className = "bit";
    bit.style.left = Math.random() * 100 + "vw";
    bit.style.background = ["#c41e3a", "#f4d35e", "#2d5bff", "#fff"][i % 4];
    bit.style.animationDelay = Math.random() * 0.4 + "s";
    document.body.appendChild(bit);
    setTimeout(() => bit.remove(), 2500);
  }
}
function flashWellDone(done, text) {
  const box = document.createElement("div");
  box.className = "flash-ok";
  box.textContent = text || "Correct Well Done!";
  document.body.appendChild(box);
  later(1400, () => { box.remove(); done(); });
}
function clearTimers() { timers.forEach((id) => clearTimeout(id)); timers = []; try { speechSynthesis.cancel(); } catch (e) {} }
function later(ms, fn) { timers.push(setTimeout(fn, ms)); }
function speak(text) {
  pulsing = true;
  if (spellOnScreen()) draw();
  later(850, () => { pulsing = false; if (spellOnScreen()) draw(); });
  try { speechSynthesis.cancel(); const say = new SpeechSynthesisUtterance(text); say.rate = 0.75; speechSynthesis.speak(say); } catch (e) {}
}
function shuffle(list) { return list.map((item) => ({ item, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ item }) => item); }
function makeTiles(word) {
  const extraLetters = shuffle(extras.split("")).filter((letter) => !word.includes(letter)).slice(0, word.length < 5 ? 3 : 2);
  return shuffle([...word.split(""), ...extraLetters]);
}
function choicesFor(name) {
  const others = shuffle(continents.filter((c) => c.name !== name)).slice(0, 2);
  return shuffle([name, ...others.map((c) => c.name)]);
}
function grammarMax() {
  if (grammarKind === "command") return commands.length;
  if (grammarKind === "noun") return nouns.length;
  if (grammarKind === "suffix") return suffixes.length;
  return joins.length;
}
function spellOnScreen() { return view === "spell" || (view === "test" && tPhase === "q" && tQs[tPos] && tQs[tPos].kind === "spell"); }
function startSequence(word = words[index]) {
  clearTimers(); covered = false; listening = true; typed = ""; tiles = makeTiles(word); count = 5; pulsing = false; draw();
  function tick() {
    later(1000, () => {
      count -= 1;
      if (count > 0) { draw(); tick(); }
      else {
        speak(word);
        later(2000, () => { speak(word); later(2000, () => { speak(word); later(800, () => { covered = true; listening = false; draw(); }); }); });
        draw();
      }
    });
  }
  tick();
}
function finishSpell() { lastKind = "spell"; saveScore(); view = "result"; draw(); if (spellScore === spellMax()) fireConfetti(); }
function finishWorld() { lastKind = "world"; view = "result"; draw(); if (worldScore === continents.length) fireConfetti(); }
function finishGrammar() { lastKind = "grammar"; view = "result"; draw(); if (grammarScore === grammarMax()) fireConfetti(); }
function nextGrammar(len) {
  flashWellDone(() => { note = ""; if (grammarIndex >= len - 1) finishGrammar(); else { grammarIndex += 1; draw(); } });
}
function hwFamily() { return FAMILIES.find((f) => f.id === hwFam) || FAMILIES[0]; }
function hwStars(n) { return "★".repeat(n) + "☆".repeat(3 - n); }
function hwNote(html) { const el = document.querySelector("#hw-note"); if (el) el.innerHTML = html; }
function hwClearLabel(text) { const el = document.querySelector("#hw-clear"); if (el) el.textContent = text; }
function hwWatch() {
  clearTimers();
  hwNote("Watch the pen");
  hwClearLabel("Clear");
  pad.watch();
  if (hwProgress.voiceOn()) speak(LETTERS[hwLetter].hint);
}
function hwOpen(letter) { hwLetter = letter; pad.reset(letter); view = "hw-letter"; clearTimers(); window.scrollTo(0, 0); draw(); hwWatch(); }
function hwCheck() {
  if (pad.isWatching()) return;
  const strokes = pad.strokes();
  if (!strokes.length) { hwNote("Trace the letter first. Start at the green dot"); return; }
  // Be a bit more forgiving when the letter is drawn small (phones).
  const res = scoreTrace(hwLetter, strokes, { tolerance: Math.max(14, 20 / pad.scale()) });
  hwProgress.saveResult(hwLetter, res.stars);
  pad.finish();
  const fam = hwFamily();
  const best = document.querySelector("#hw-best");
  if (best) best.textContent = `Letter ${fam.letters.indexOf(hwLetter) + 1} of ${fam.letters.length} · best ${hwStars(hwProgress.bestStars(hwLetter))}`;
  hwClearLabel("Try again");
  if (res.stars === 0) {
    hwNote(`<span class="hw-stars">${hwStars(0)}</span><span class="no">Try again! ${res.tip}</span>`);
    if (hwProgress.voiceOn()) speak("Try again. " + res.tip);
    return;
  }
  const praise = ["", "Good try!", "Great writing!", "Brilliant!"][res.stars];
  hwNote(`<span class="hw-stars">${hwStars(res.stars)}</span><span class="ok">${praise}</span>${res.stars < 3 ? `<span class="hw-tip">${res.tip}</span>` : ""}`);
  if (hwProgress.voiceOn()) speak(res.stars === 3 ? "Brilliant, well done" : res.stars === 2 ? "Well done" : "Good try");
  flashWellDone(() => {}, `${"⭐".repeat(res.stars)} ${praise}`);
  if (res.stars === 3) fireConfetti();
}
// ---------- Nightly tests (Monday to Thursday) ----------
// The nights are worked out fresh from the lists at the top of this file every time,
// so changing the weekly spellings changes the tests too (see src/test/nights.js).
function testPlans() { return planNights({ spell: words, maths: parseSums(sums), world: continents, command: commands, noun: nouns, suffix: suffixes, join: joins, letters: Object.keys(LETTERS) }); }
const SECTION_ICON = { spell: "🔤", hw: "✏️", maths: "🔢", world: "🌍", grammar: "🔎" };
const PRAISE = ["Correct Well Done!", "Brilliant! ⭐", "Super star! ⭐", "Well done! ⭐", "Amazing! ⭐"];
function canTalk() { return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined"; }
// Read something out loud. Never waits for the voice, so if the tablet has no voices it just stays quiet.
function say(text) {
  if (!canTalk()) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.8;
    const voices = speechSynthesis.getVoices() || [];
    const gb = voices.find((v) => /en[-_]GB/i.test(v.lang)) || voices.find((v) => /^en/i.test(v.lang));
    if (gb) u.voice = gb;
    u.lang = gb ? gb.lang : "en-GB";
    speechSynthesis.speak(u);
  } catch (e) {}
}
function tq() { return tQs[tPos]; }
function sectionOf(q) { return SECTIONS.find((s) => s.id === q.section); }
function tOptions(kind, item) {
  if (kind === "world") return shuffle([item.name, ...shuffle(continents.filter((c) => c.name !== item.name)).slice(0, 2).map((c) => c.name)]);
  if (kind === "noun") return shuffle(item.options.slice());
  if (kind === "suffix" || kind === "join") return shuffle(item.choices.slice());
  if (kind === "command") return ["yes", "no"];
  if (kind === "maths") return sumOptions(item.answer);
  return [];
}
function tAnswer(q) {
  const it = q.item;
  if (q.kind === "maths") return String(it.answer);
  if (q.kind === "world") return it.name;
  if (q.kind === "command") return it.yes ? "yes" : "no";
  return it.answer;
}
function tReadText(q) {
  const it = q.item, opts = q.options;
  const list = (xs) => xs.slice(0, -1).join(", ") + ", or " + xs[xs.length - 1];
  if (q.kind === "maths") return `What is ${sumWords(it)}? ${opts.slice(0, -1).join(", ")}, or ${opts[opts.length - 1]}?`;
  if (q.kind === "world") return `Which continent is gold? ${list(opts)}?`;
  if (q.kind === "command") return `Is this a command? ${it.text}`;
  if (q.kind === "noun") return `Tap a noun. ${it.line} ${list(opts)}?`;
  if (q.kind === "suffix") return `Which ending makes a real word? ${list(opts.map((e) => it.stem + e))}?`;
  if (q.kind === "join") return `Which word joins these? ${it.line}, blank, ${it.rest} ${list(opts)}?`;
  if (q.kind === "hw") return `Trace the letter ${it.letter}${it.word ? `, like in ${it.word}` : ""}. ${LETTERS[it.letter].hint}`;
  return "";
}
function tStartQuestion(fresh = true) {
  clearTimers();
  if (fresh) { tMiss = 0; tTried = []; } // coming back from "Stop for now?" keeps the goes he has used
  tWobble = ""; tYay = ""; tBusy = false; tShown = false;
  const q = tq();
  window.scrollTo(0, 0);
  if (q.kind === "spell") startSequence(q.item); // same look, listen, cover, tap as the Spellings practice
  else if (q.kind === "hw") { pad.reset(q.item.letter); draw(); tHwWatch(); } // same pad as Handwriting practice
  else draw();
}
function tStartNight(n) {
  const plan = testPlans()[n];
  tNight = n; tPos = 0; tScore = 0; tFound = []; tBonus = null; tResults = [];
  tQs = nightQuestions(plan).map((q) => ({ ...q, options: tOptions(q.kind, q.item) }));
  view = "test";
  if (!tQs.length) { tFinish(); return; }
  tPhase = "q";
  tStartQuestion();
}
function tFinish() {
  clearTimers();
  const plan = testPlans()[tNight];
  tScore = nightScore(tResults); // right first time
  testDone.markDone(tNight, nightSignature(plan), tScore, tQs.length);
  const perfect = fullMarks(tResults, tQs.length);
  // Full marks (every question right first time) earns the special Golden Puffer Fish,
  // once for each time a night is finished with full marks.
  tBonus = perfect ? sea.unlockSpecial() : null;
  tPhase = "reward"; view = "test"; draw(); window.scrollTo(0, 0);
  fireConfetti();
  if (perfect) { say(`You did it, Austin! Full marks! You found ${sea.SPECIAL.name}!`); seaReveal(tBonus, true, () => {}); }
  else say("You did it, Austin!");
}
function tNext() {
  const prev = tq();
  tPos += 1;
  if (tPos >= tQs.length) { tFinish(); return; }
  if (tq().section !== prev.section) { clearTimers(); tPhase = "break"; draw(); window.scrollTo(0, 0); say(`Great job! Next, ${sectionOf(tq()).name}.`); return; }
  tStartQuestion();
}
function tRight(val) {
  if (tBusy) return;
  tBusy = true;
  const go = rightGo(tMiss);
  tResults[tPos] = go.firstTry ? "first" : "later";
  if (go.firstTry) tScore += 1; // only right first time counts towards the score
  if (tq().kind === "hw") { const el = document.querySelector("#hw-pad"); if (el) el.classList.add("yay"); }
  else { tYay = val || "answer"; draw(); tYay = ""; }
  if (!go.creature) { later(900, () => tNext()); return; }
  const found = sea.unlockNext(); // one sea creature for every right answer (within 3 goes)
  tFound.push(found.creature.id);
  say(`Well done! ${found.isNew ? "You found" : "Another"} ${found.creature.name}`);
  seaReveal(found, false, () => tNext());
}
// The fun bit: bubbles, and a sea creature swims in.
function seaReveal(found, special, done) {
  const c = found.creature;
  const box = document.createElement("div");
  box.className = "sea-reveal" + (special ? " special" : "");
  let bubbles = "";
  for (let i = 0; i < 14; i++) bubbles += `<span class="bubble" style="left:${(i * 37) % 100}%;animation-delay:${((i * 0.13) % 0.9).toFixed(2)}s;width:${10 + (i % 4) * 6}px;height:${10 + (i % 4) * 6}px"></span>`;
  box.innerHTML = `${bubbles}<div class="sea-reveal-inner">${special ? `<div class="sea-badge">✨ SPECIAL ✨</div><div class="sea-praise">Full marks!</div>` : `<div class="sea-praise">${PRAISE[tPos % PRAISE.length]}</div>`}<div class="sea-swim">${sea.creatureArt(c, special ? 150 : 110)}</div><div class="sea-name">${special ? "Bonus! " : found.isNew ? "You found " : "Another "}${c.name}!</div></div>`;
  document.body.appendChild(box);
  if (special) { box.style.pointerEvents = "auto"; box.onclick = () => box.remove(); }
  const ms = special ? 3200 : 1900;
  setTimeout(() => box.remove(), ms); // always tidies itself away, even if he leaves the screen
  later(ms, done);
}
function seaGrid(list, fresh = []) {
  if (!list.length) return `<p class="progress">Get answers right to find sea creatures!</p>`;
  return `<div class="sea-grid">${list.map(({ creature, count }) => `<div class="sea-cell ${creature.special ? "special" : ""} ${fresh.includes(creature.id) ? "new" : ""}">${sea.creatureArt(creature, 52)}<span class="sea-cell-name">${creature.name}</span>${count > 1 ? `<span class="sea-count">×${count}</span>` : ""}${creature.special ? `<span class="sea-tag">SPECIAL</span>` : fresh.includes(creature.id) ? `<span class="sea-tag new">NEW</span>` : ""}</div>`).join("")}</div>`;
}
function tHwNote(html) { const el = document.querySelector("#hw-note"); if (el) el.innerHTML = html; }
function tHwWatch() {
  pad.watch();
  tHwNote("Watch the pen");
  const clear = document.querySelector("#hw-clear"); if (clear) clear.textContent = "Clear";
}
function tHwCheck() {
  const q = tq();
  if (pad.isWatching() || tBusy) return;
  const strokes = pad.strokes();
  if (!strokes.length) { tHwNote("Trace the letter. Start at the green dot"); return; }
  const res = scoreTrace(q.item.letter, strokes, { tolerance: Math.max(14, 20 / pad.scale()) });
  hwProgress.saveResult(q.item.letter, res.stars); // counts towards his Handwriting practice stars too
  pad.finish();
  if (res.stars >= 1) {
    tHwNote(`<span class="hw-stars">${hwStars(res.stars)}</span>`);
    tRight("hw");
    return;
  }
  // No stars yet: gentle wobble and a tip. After 3 goes, kindly show the letter and move on.
  const go = wrongGo(tMiss);
  tMiss = go.misses;
  if (go.show) { tShowAnswer(); return; }
  const el = document.querySelector("#hw-pad");
  if (el) { el.classList.remove("wobble"); void el.offsetWidth; el.classList.add("wobble"); }
  tHwNote(`<span class="t-hint">Nearly! Have another go 🙂</span><span class="hw-tip">${res.tip}</span>`);
  const clear = document.querySelector("#hw-clear"); if (clear) clear.textContent = "Try again";
  say("Nearly! Have another go. " + res.tip);
}
function tWrong(val) {
  const go = wrongGo(tMiss);
  tMiss = go.misses;
  if (val && !tTried.includes(val)) tTried.push(val);
  if (go.show) { tShowAnswer(); return; }
  tWobble = val || "answer"; draw(); tWobble = "";
}
// After 3 wrong goes: show the answer gently (gold, no red, no creature), then a big Next button.
function tShownMessage(q) {
  const it = q.item;
  const keep = " — let's keep going!";
  if (q.kind === "spell") return `This one is spelt <b>${it}</b>${keep}`;
  if (q.kind === "hw") return `Good trying! Watch how <b>${it.letter}</b> goes${keep}`;
  if (q.kind === "maths") return `This one is <b>${it.text} = ${it.answer}</b>${keep}`;
  if (q.kind === "command") return it.yes ? `This one <b>is a command</b>${keep}` : `This one is <b>not a command</b>${keep}`;
  if (q.kind === "suffix") return `This one is <b>${it.stem}${it.answer}</b>${keep}`;
  return `This one is <b>${tAnswer(q)}</b>${keep}`;
}
function tShownSpeech(q) {
  const it = q.item;
  if (q.kind === "maths") return `${sumWords(it)} is ${it.answer}. Let's keep going!`;
  if (q.kind === "spell") return `This one is spelt ${it.split("").join(", ")}. ${it}. Let's keep going!`;
  return tShownMessage(q).replace(/<[^>]+>/g, "").replace(" — ", ". ");
}
function tShowAnswer() {
  const q = tq();
  clearTimers();
  tShown = true; tBusy = false;
  tResults[tPos] = "shown";
  if (q.kind === "spell") { covered = false; listening = false; count = 0; pulsing = false; typed = q.item; }
  draw();
  if (q.kind === "hw") { tHwNote(""); pad.watch(); } // the pen shows him how the letter goes
  say(tShownSpeech(q));
}
function tDots() {
  let html = "", lastSection = "";
  tQs.forEach((q, i) => {
    if (lastSection && q.section !== lastSection) html += `<span class="t-gap"></span>`;
    lastSection = q.section;
    const done = i < tPos;
    const pop = tPhase === "break" && i === tPos - 1;
    const shown = done && tResults[i] === "shown";
    html += `<span class="t-dot ${done ? "done" : ""} ${shown ? "shown" : ""} ${i === tPos && tPhase === "q" ? "now" : ""} ${pop ? "pop" : ""}">${done && !shown ? "★" : ""}</span>`;
  });
  return `<div class="t-dots" aria-label="Question ${Math.min(tPos + 1, tQs.length)} of ${tQs.length}">${html}</div>`;
}
function tBtn(cls, val, label) {
  if (tShown) return `<div class="big t-opt ${cls} ${val === tAnswer(tq()) ? "shown" : "dim"}">${label}</div>`;
  const state = tYay === val ? "yay" : tTried.includes(val) ? (tWobble === val ? "tried wobble" : "tried") : "";
  return `<div class="big t-opt ${cls} ${state}" data-act="t-pick" data-val="${val}">${label}</div>`;
}
function tQuestionHtml(q) {
  const it = q.item;
  if (q.kind === "spell" && tShown) {
    return `<p class="ask">Spell the word</p><h1 class="word">${it}</h1><div class="answer shown">${it}</div>`;
  }
  if (q.kind === "spell") {
    const canType = covered && !listening && count === 0;
    const canCheck = canType && typed.length > 0;
    return `<p class="ask">Spell the word</p>${count > 0 ? `<div class="count">${count}</div>` : ""}<h1 class="word ${pulsing ? "pulse" : ""}">${covered ? "⭐".repeat(Math.min(it.length, 6)) : it}</h1><div class="answer ${tWobble === "answer" ? "wobble" : ""} ${tYay === "answer" ? "yay" : ""}">${count > 0 ? "look at the word" : typed || (canType ? "tap the letters" : "watch and listen")}</div><div class="tiles">${tiles.map((letter) => `<div class="tile ${canType ? "" : "off"}" data-act="t-letter" data-val="${letter}">${letter}</div>`).join("")}</div><div class="big next ${canCheck ? "" : "off"}" data-act="t-check">Check</div><div class="row"><div class="big next-word" data-act="t-hear">Hear it</div><div class="big ${canType && typed ? "" : "off"}" data-act="t-rub">Rub out</div></div><div class="big" data-act="t-look">Look again</div>`;
  }
  if (q.kind === "hw") {
    const w = it.word ? it.word.replace(it.letter, `<b class="t-hw-letter">${it.letter}</b>`) : "";
    return `<p class="ask">Trace the letter</p>${w ? `<p class="t-hw-word">${it.letter} as in ${w}</p>` : ""}<canvas id="hw-pad" class="hw-pad t-pad" aria-label="Writing pad for the letter ${it.letter}"></canvas><p id="hw-note" class="hw-note">${tShown ? "" : "Watch the pen"}</p>${tShown ? "" : `<div class="row"><div class="big next-word" data-act="t-hw-watch">Watch</div><div class="big" id="hw-clear" data-act="t-hw-clear">Clear</div></div><div class="big next" data-act="t-hw-done">Done</div>`}`;
  }
  if (q.kind === "maths") {
    const shownAns = tShown ? it.answer : tYay ? tYay : "?";
    return `<p class="ask">What is the answer?</p><div class="sum-line"><span class="sum-text">${it.text} =</span><span class="sum-box ${tYay ? "yay" : ""} ${tShown ? "shown" : ""}">${shownAns}</span></div><div class="t-opts sum-opts">${q.options.map((n) => tBtn("sum-btn", n, n)).join("")}</div>`;
  }
  if (q.kind === "world") return `<p class="ask">Which continent is gold?</p><img class="map" src="/austin-homework/${it.id}.jpg" alt="map" /><div class="t-opts">${q.options.map((name) => tBtn("world-btn", name, name)).join("")}</div>`;
  if (q.kind === "command") return `<p class="ask">Is this a command?</p><div class="line">${it.text}</div><p class="hint">A command tells you to do something</p><div class="t-opts">${tBtn("spell-btn", "yes", "Command")}${tBtn("world-btn", "no", "Not a command")}</div>`;
  if (q.kind === "noun") return `<p class="ask">Tap a noun</p><div class="line">${it.line}</div><p class="hint">A noun is a person, place or thing</p><div class="t-opts">${q.options.map((w) => tBtn("grammar-btn", w, w)).join("")}</div>`;
  if (q.kind === "suffix") return `<p class="ask">Which ending makes a real word?</p><div class="line">${it.stem} + ?</div><div class="t-opts">${q.options.map((end) => tBtn("grammar-btn", end, it.stem + end)).join("")}</div>`;
  return `<p class="ask">Which word joins these?</p><div class="line">${it.line} ___ ${it.rest}</div><div class="t-opts">${q.options.map((w) => tBtn("grammar-btn", w, w)).join("")}</div>`;
}
function drawTest() {
  if (view === "test-menu") {
    const plans = testPlans();
    const today = new Date().getDay() - 1; // Monday = 0
    app.innerHTML = `<main class="card"><p class="week">Test</p><h1 class="word">Pick a night</h1><div class="t-nights">${plans.map((plan, n) => {
      const res = testDone.nightResult(n, nightSignature(plan));
      return `<div class="big t-night t-night-${n} ${res ? "is-done" : ""}" data-act="t-night" data-val="${n}"><span class="t-night-name">${NIGHTS[n]}</span>${res ? `<span class="t-tick">✔</span><span class="t-night-sub">${res.score} / ${res.max} · tap to do again</span>` : n === today ? `<span class="t-night-sub">Tonight</span>` : ""}</div>`;
    }).join("")}</div><div class="big t-sea-btn" data-act="t-sea">🐠 My sea creatures (${sea.collection().length})</div><div class="big" data-act="home">Back</div></main>`;
    return;
  }
  if (view === "sea") {
    const all = sea.collection();
    app.innerHTML = `<main class="card"><p class="week">Test</p><h1 class="word t-sea-h1">My sea creatures</h1><p class="progress">${all.length} of ${sea.CREATURES.length + 1} found</p>${seaGrid(all)}<div class="big" data-act="test-menu">Back</div></main>`;
    return;
  }
  if (tPhase === "reward") {
    const all = sea.collection();
    app.innerHTML = `<main class="card t-card"><div class="login-wrap"><div class="hero-btn t-hero"><img src="${HERO}" alt="Austin" /></div></div><h1 class="word t-reward">You did it, Austin!</h1><p class="week">${NIGHTS[tNight]} test done ✔</p><div class="score-big">${tScore} / ${tQs.length}</div><p class="t-score-words">${tScore === tQs.length ? "Full marks! All right first time!" : "right first time"}</p><div class="stars">${stars(tScore, tQs.length)}</div>${tBonus ? `<div class="t-bonus"><span class="sea-tag">SPECIAL</span>${sea.creatureArt(sea.SPECIAL, 96)}<span>Bonus: ${sea.SPECIAL.name}!</span></div>` : ""}<div class="big next" data-act="test-menu">Back to tests</div><div class="big next-word" data-act="home">Home</div><h2 class="t-sea-title">Your sea creatures (${all.length})</h2><p class="progress">You found ${tFound.length} tonight</p>${seaGrid(all, tFound)}</main>`;
    return;
  }
  if (tPhase === "quit") {
    app.innerHTML = `<main class="card t-card">${tDots()}<h1 class="word t-break-title">Stop for now?</h1><div class="big next" data-act="t-resume">Keep going</div><div class="big" data-act="test-menu">Stop</div></main>`;
    return;
  }
  if (tPhase === "break") {
    const done = SECTIONS.find((s) => s.id === tQs[tPos - 1].section);
    const next = sectionOf(tq());
    app.innerHTML = `<main class="card t-card">${tDots()}<div class="t-break-star">⭐</div><h1 class="word t-break-title">${done.name} done!</h1><p class="t-break-tip">Stretch up high! 🙌</p><p class="t-next">Next: ${SECTION_ICON[next.id]} ${next.name}</p><div class="big next t-go" data-act="t-go">Go!</div></main>`;
    return;
  }
  const q = tq();
  const speaker = q.kind !== "spell" && canTalk() ? `<div class="t-corner t-say" data-act="t-say" aria-label="Read it to me">🔊</div>` : `<span class="t-corner-space"></span>`;
  const hint = q.kind === "hw" || !tMiss ? "" : q.kind === "spell" ? "Nearly! Listen and try again 🙂" : "Nearly! Have another go 🙂";
  app.innerHTML = `<main class="card t-card"><div class="t-top"><div class="t-corner t-x" data-act="t-quit" aria-label="Stop">✕</div>${tDots()}${speaker}</div><p class="t-section">${SECTION_ICON[q.section]} ${sectionOf(q).name}</p>${tQuestionHtml(q)}${tShown ? `<div class="t-shown">${tShownMessage(q)}</div><div class="big next t-next-btn" data-act="t-next">Next ➜</div>` : q.kind === "hw" ? "" : `<p class="t-hint">${hint}</p>`}</main>`;
  if (q.kind === "hw") {
    pad.mount(document.querySelector("#hw-pad"), q.item.letter, {
      onWatchEnd: () => { if (!tShown) tHwNote("Your turn! Start at the green dot"); },
      onRestart: () => { tHwNote("Your turn! Start at the green dot"); const c = document.querySelector("#hw-clear"); if (c) c.textContent = "Clear"; },
    });
  }
}
function handleTest(act, val) {
  if (act === "test-menu") { view = "test-menu"; clearTimers(); draw(); window.scrollTo(0, 0); return; }
  if (act === "t-night") { tStartNight(Number(val)); return; }
  if (act === "t-sea") { view = "sea"; clearTimers(); draw(); window.scrollTo(0, 0); return; }
  if (act === "t-go") { tPhase = "q"; tStartQuestion(); return; }
  if (act === "t-quit") { if (tBusy) return; clearTimers(); tPhase = "quit"; draw(); return; }
  if (act === "t-resume") { tPhase = "q"; if (tResults[tPos] === "shown") tShowAnswer(); else tStartQuestion(false); return; }
  const q = tq();
  if (!q || tPhase !== "q") return;
  if (act === "t-say") {
    say(tShown ? tShownSpeech(q) : tReadText(q));
    const el = document.querySelector(".t-say");
    if (el) { el.classList.remove("talking"); void el.offsetWidth; el.classList.add("talking"); }
    return;
  }
  if (tShown) { if (act === "t-next") { tShown = false; tNext(); } return; }
  if (act === "t-pick") {
    if (tBusy || q.kind === "spell") return;
    if (val === tAnswer(q)) tRight(val); else tWrong(val);
    return;
  }
  if (q.kind === "hw") {
    if (tBusy) return;
    if (act === "t-hw-watch") tHwWatch();
    if (act === "t-hw-clear") { pad.clear(); tHwNote("Your turn! Start at the green dot"); const c = document.querySelector("#hw-clear"); if (c) c.textContent = "Clear"; }
    if (act === "t-hw-done") tHwCheck();
    return;
  }
  if (q.kind !== "spell") return;
  if (act === "t-hear") { speak(q.item); return; }
  if (act === "t-look") { if (!tBusy) startSequence(q.item); return; }
  if (!covered || listening || count > 0 || tBusy) return;
  if (act === "t-letter") { typed += val; draw(); return; }
  if (act === "t-rub") { typed = typed.slice(0, -1); draw(); return; }
  if (act === "t-check") {
    if (!typed) return;
    if (typed === q.item) { tRight("answer"); return; }
    typed = "";
    if (!wrongGo(tMiss).show) speak(q.item); // say the word again, then a gentle wobble
    tWrong("answer");
  }
}
function backGrammar() { return `<div class="big" data-act="g-menu">Back</div>`; }
function draw() {
  pad.unmount(); // the writing pad re-attaches below if we're on a letter; Austin's ink is kept
  if (view === "hw-menu") {
    app.innerHTML = `<main class="card"><p class="week">Handwriting</p><h1 class="word hw-title">Pick a family</h1>${FAMILIES.map((f) => {
      const { got, max } = hwProgress.familyStars(f.letters);
      return `<div class="big hw-fam" style="background:${f.color}" data-act="hw-fam" data-val="${f.id}"><span class="hw-fam-name">${f.name}</span><span class="hw-fam-letters">${f.letters.map((l) => letterSvg(l, 44)).join("")}</span><span class="hw-fam-stars">★ ${got} / ${max}</span></div>`;
    }).join("")}<div class="big" data-act="practice">Back</div></main>`;
    return;
  }
  if (view === "hw-family") {
    const fam = hwFamily();
    app.innerHTML = `<main class="card"><p class="week">Handwriting</p><h1 class="word hw-title">${fam.name}</h1><p class="progress">Pick a letter</p><div class="hw-grid">${fam.letters.map((l) => `<div class="hw-tile" style="background:${fam.color}" data-act="hw-letter" data-val="${l}"><span class="hw-tile-letter">${letterSvg(l, 76)}</span><span class="hw-tile-stars">${hwStars(hwProgress.bestStars(l))}</span></div>`).join("")}</div><div class="big" data-act="hw-back">Back</div></main>`;
    return;
  }
  if (view === "hw-letter") {
    const fam = hwFamily();
    const pos = fam.letters.indexOf(hwLetter);
    app.innerHTML = `<main class="card hw-card"><div class="hw-voice" data-act="hw-voice" aria-label="Voice on or off">${hwProgress.voiceOn() ? "🔊" : "🔇"}</div><p class="week">${fam.name}</p><p class="progress" id="hw-best">Letter ${pos + 1} of ${fam.letters.length} · best ${hwStars(hwProgress.bestStars(hwLetter))}</p><canvas id="hw-pad" class="hw-pad" aria-label="Writing pad for the letter ${hwLetter}"></canvas><p id="hw-note" class="hw-note">Watch the pen</p><div class="row"><div class="big next-word" data-act="hw-watch">Watch</div><div class="big" id="hw-clear" data-act="hw-clear">Clear</div></div><div class="big next" data-act="hw-done">Done</div><div class="row"><div class="big" data-act="hw-back">Back</div><div class="big next-word" data-act="hw-next">${pos >= fam.letters.length - 1 ? "Finish" : "Next letter"}</div></div></main>`;
    pad.mount(document.querySelector("#hw-pad"), hwLetter, {
      onWatchEnd: () => hwNote("Your turn! Start at the green dot"),
      onRestart: () => { hwNote("Your turn! Start at the green dot"); hwClearLabel("Clear"); },
    });
    return;
  }
  if (view === "test-menu" || view === "test" || view === "sea") { drawTest(); return; }
  if (view === "login") {
    app.innerHTML = `<main class="card"><p class="week">Homework</p><h1 class="word">Who is it?</h1><div class="login-wrap"><div class="hero-btn" data-act="pick-austin"><img src="${HERO}" alt="Austin" /></div><div class="big next" data-act="pick-austin">Austin</div></div></main>`;
    return;
  }
  if (view === "pass") {
    app.innerHTML = `<main class="card"><p class="week">Austin</p><div class="login-wrap"><div class="hero-btn"><img src="${HERO}" alt="Austin" /></div></div><p class="progress">Type the password</p><div class="answer">${passGuess || "••••••"}</div><p id="result" class="${loginError ? "no" : ""}">${loginError}</p><div class="tiles">${"abcdefghijklmnopqrstuvwxyz".split("").map((letter) => `<div class="tile" data-act="pass-letter" data-val="${letter}">${letter}</div>`).join("")}</div><div class="big next" data-act="pass-go">Go</div><div class="row"><div class="big" data-act="pass-clear">Clear</div><div class="big next-word" data-act="logout">Back</div></div></main>`;
    return;
  }
  if (view === "home") {
    app.innerHTML = `<main class="card"><div class="login-wrap"><div class="hero-btn"><img src="${HERO}" alt="Austin" /></div></div><p class="week">Austin</p><h1 class="word">Homework</h1><div class="big mode-btn practice-btn" data-act="practice"><span class="mode-icon">📚</span>Practice</div><div class="big mode-btn test-btn" data-act="test-menu"><span class="mode-icon">⭐</span>Test</div><div class="big" data-act="logout">Log out</div></main>`;
    return;
  }
  if (view === "practice") {
    const last = lastScore();
    app.innerHTML = `<main class="card"><div class="login-wrap"><div class="hero-btn"><img src="${HERO}" alt="Austin" /></div></div><p class="week">Austin</p><h1 class="word">Practice</h1><p class="progress">${last && last.spellMax ? `Last time: spellings ${last.spell}/${last.spellMax}` : "Pick one"}</p><div class="big spell-btn" data-act="spell">Spellings</div><div class="big sums-btn" data-act="sums">Adding &amp; taking away</div><div class="big world-btn" data-act="world">Continents</div><div class="big grammar-btn" data-act="grammar">Grammar hunt</div><div class="big hand-btn" data-act="hw">Handwriting</div><div class="big" data-act="home">Back</div></main>`;
    return;
  }
  if (view === "result") {
    let got = spellScore, max = spellMax();
    if (lastKind === "sums") { got = sumScore; max = parseSums(sums).length; }
    if (lastKind === "world") { got = worldScore; max = continents.length; }
    if (lastKind === "grammar") { got = grammarScore; max = grammarMax(); }
    app.innerHTML = `<main class="card"><p class="week">Hero score</p><div class="login-wrap"><div class="hero-btn"><img src="${HERO}" alt="Austin" /></div></div><div class="score-big">${got} / ${max}</div><div class="stars">${stars(got, max)}</div><div class="big next" data-act="practice">Back</div><div class="big next-word" data-act="${lastKind === "grammar" ? "grammar" : lastKind}">Play again</div></main>`;
    return;
  }
  if (view === "spell") {
    const word = words[index];
    const canType = covered && !listening && count === 0;
    const canCheck = canType && typed.length > 0;
    app.innerHTML = `<main class="card"><p class="week">Spellings · ${spellScore} pts</p><p class="progress">Word ${index + 1} of ${words.length} · ${wordPoints(word)} pts</p>${count > 0 ? `<div class="count">${count}</div>` : ""}<h1 class="word ${pulsing ? "pulse" : ""}">${covered ? "⭐".repeat(Math.min(word.length, 6)) : word}</h1><div class="answer">${count > 0 ? "look at the word" : typed || (canType ? "tap the letters" : "watch and listen")}</div><p id="result"></p><div class="tiles">${tiles.map((letter) => `<div class="tile ${canType ? "" : "off"}" data-act="letter" data-val="${letter}">${letter}</div>`).join("")}</div><div class="big next-word" data-act="hear">Hear the word</div><div class="big next ${canCheck ? "" : "off"}" data-act="check-spell">Check</div><div class="row"><div class="big" data-act="again">Again</div><div class="big next-word" data-act="next-word">Next word</div></div><div class="big" data-act="practice">Back</div></main>`;
    return;
  }
  if (view === "sums") {
    const list = parseSums(sums);
    const q = list[sumIndex];
    app.innerHTML = `<main class="card"><p class="week">Adding &amp; taking away · ${sumScore} pts</p><p class="progress">${sumIndex + 1} of ${list.length}</p><p class="ask">What is the answer?</p><div class="sum-line"><span class="sum-text">${q.text} =</span><span class="sum-box">?</span></div><p id="result" class="${note ? "no" : ""}">${note}</p><div class="t-opts sum-opts">${sumOpts.map((n) => `<div class="big t-opt sum-btn" data-act="sum-pick" data-val="${n}">${n}</div>`).join("")}</div><div class="big" data-act="practice">Back</div></main>`;
    return;
  }
  if (view === "world") {
    const item = continents[worldOrder[worldIndex]];
    const opts = choicesFor(item.name);
    app.innerHTML = `<main class="card"><p class="week">Continents · ${worldScore} pts</p><p class="progress">${worldIndex + 1} of ${continents.length}</p><p class="ask">Which continent is gold?</p><img class="map" src="/austin-homework/${item.id}.jpg" alt="map" /><p id="result" class="${note ? "no" : ""}">${note}</p>${opts.map((name) => `<div class="big world-btn" data-act="world-pick" data-val="${name}">${name}</div>`).join("")}<div class="big" data-act="practice">Back</div></main>`;
    return;
  }
  if (view === "grammar" && grammarKind === "menu") {
    app.innerHTML = `<main class="card"><p class="week">Grammar hunt</p><h1 class="word">Pick one</h1><div class="big grammar-btn" data-act="g-command">Commands</div><div class="big grammar-btn" data-act="g-noun">Nouns</div><div class="big grammar-btn" data-act="g-suffix">Suffixes</div><div class="big grammar-btn" data-act="g-join">Joining words</div><div class="big" data-act="practice">Back</div></main>`;
    return;
  }
  if (view === "grammar" && grammarKind === "command") {
    const q = commands[grammarIndex];
    app.innerHTML = `<main class="card"><p class="week">Commands · ${grammarScore} pts</p><p class="progress">${grammarIndex + 1} of ${commands.length}</p><p class="ask">Is this a command?</p><div class="line">${q.text}</div><p class="hint">A command tells you to do something</p><p id="result" class="${note ? "no" : ""}">${note}</p><div class="big spell-btn" data-act="cmd" data-val="yes">Command</div><div class="big world-btn" data-act="cmd" data-val="no">Not a command</div>${backGrammar()}</main>`;
    return;
  }
  if (view === "grammar" && grammarKind === "noun") {
    const q = nouns[grammarIndex];
    app.innerHTML = `<main class="card"><p class="week">Nouns · ${grammarScore} pts</p><p class="progress">${grammarIndex + 1} of ${nouns.length}</p><p class="ask">Tap a noun</p><div class="line">${q.line}</div><p class="hint">A noun is a person, place or thing</p><p id="result" class="${note ? "no" : ""}">${note}</p>${q.options.map((w) => `<div class="big grammar-btn" data-act="noun" data-val="${w}">${w}</div>`).join("")}${backGrammar()}</main>`;
    return;
  }
  if (view === "grammar" && grammarKind === "suffix") {
    const q = suffixes[grammarIndex];
    app.innerHTML = `<main class="card"><p class="week">Suffixes · ${grammarScore} pts</p><p class="progress">${grammarIndex + 1} of ${suffixes.length}</p><p class="ask">Which ending makes a real word?</p><div class="line">${q.stem} + ?</div><p id="result" class="${note ? "no" : ""}">${note}</p>${q.choices.map((end) => `<div class="big grammar-btn" data-act="suffix" data-val="${end}">${q.stem}${end}</div>`).join("")}${backGrammar()}</main>`;
    return;
  }
  if (view === "grammar" && grammarKind === "join") {
    const q = joins[grammarIndex];
    app.innerHTML = `<main class="card"><p class="week">Joining words · ${grammarScore} pts</p><p class="progress">${grammarIndex + 1} of ${joins.length}</p><p class="ask">Which word joins these?</p><div class="line">${q.line} ___ ${q.rest}</div><p id="result" class="${note ? "no" : ""}">${note}</p>${q.choices.map((w) => `<div class="big grammar-btn" data-act="join" data-val="${w}">${w}</div>`).join("")}${backGrammar()}</main>`;
    return;
  }
  // Anything else (e.g. an old screen name): go back to the Practice list.
  view = "practice";
  draw();
}
function handle(act, val) {
  if (!act) return;
  if (act === "logout") { view = "login"; passGuess = ""; loginError = ""; clearTimers(); draw(); return; }
  if (act === "pick-austin") { view = "pass"; passGuess = ""; loginError = ""; draw(); return; }
  if (act === "pass-letter") { passGuess += val; loginError = ""; draw(); return; }
  if (act === "pass-clear") { passGuess = ""; loginError = ""; draw(); return; }
  if (act === "pass-go") {
    if (passGuess === PASSWORD) { view = "home"; passGuess = ""; loginError = ""; }
    else { loginError = "Try again"; passGuess = ""; }
    draw(); return;
  }
  if (act === "home") { view = "home"; clearTimers(); draw(); return; }
  if (act === "practice") { view = "practice"; clearTimers(); draw(); window.scrollTo(0, 0); return; }
  if (act.startsWith("t-") || act === "test-menu") { handleTest(act, val); return; }
  if (act === "hw") { view = "hw-menu"; clearTimers(); draw(); window.scrollTo(0, 0); return; }
  if (act === "hw-fam") { hwFam = val; view = "hw-family"; clearTimers(); draw(); window.scrollTo(0, 0); return; }
  if (act === "hw-letter") { hwOpen(val); return; }
  if (act === "hw-watch") { hwWatch(); return; }
  if (act === "hw-clear") { clearTimers(); pad.clear(); hwClearLabel("Clear"); hwNote("Your turn! Start at the green dot"); return; }
  if (act === "hw-done") { hwCheck(); return; }
  if (act === "hw-next") {
    const fam = hwFamily();
    const pos = fam.letters.indexOf(hwLetter);
    if (pos >= fam.letters.length - 1) { view = "hw-family"; clearTimers(); draw(); }
    else hwOpen(fam.letters[pos + 1]);
    return;
  }
  if (act === "hw-back") { view = view === "hw-letter" ? "hw-family" : "hw-menu"; clearTimers(); draw(); window.scrollTo(0, 0); return; }
  if (act === "hw-voice") {
    const on = !hwProgress.voiceOn();
    hwProgress.setVoice(on);
    if (!on) clearTimers();
    const el = document.querySelector(".hw-voice");
    if (el) el.textContent = on ? "🔊" : "🔇";
    return;
  }
  if (act === "g-menu") { view = "grammar"; grammarKind = "menu"; note = ""; draw(); return; }
  if (act === "spell") { view = "spell"; index = 0; spellScore = 0; spellDone = {}; startSequence(); return; }
  if (act === "sums") {
    view = "sums"; sumIndex = 0; sumScore = 0; sumDone = {}; note = "";
    sumOpts = sumOptions(parseSums(sums)[0].answer); // shuffled once per sum, so a wrong tap doesn't move the buttons
    clearTimers(); draw(); window.scrollTo(0, 0); return;
  }
  if (act === "sum-pick") {
    if (document.querySelector(".flash-ok")) return; // already moving on
    const list = parseSums(sums);
    const q = list[sumIndex];
    if (val === String(q.answer)) {
      if (!sumDone[sumIndex]) { sumScore += 1; sumDone[sumIndex] = true; }
      note = ""; speak("Well done");
      flashWellDone(() => {
        if (sumIndex >= list.length - 1) { lastKind = "sums"; view = "result"; draw(); if (sumScore === list.length) fireConfetti(); }
        else { sumIndex += 1; sumOpts = sumOptions(list[sumIndex].answer); draw(); }
      });
    } else { note = "Try again"; draw(); }
    return;
  }
  if (act === "world") {
    view = "world"; worldIndex = 0; worldScore = 0; note = "";
    worldOrder = shuffle(continents.map((_, i) => i));
    clearTimers(); draw(); return;
  }
  if (act === "grammar") { view = "grammar"; grammarKind = "menu"; grammarScore = 0; note = ""; clearTimers(); draw(); return; }
  if (act === "g-command" || act === "g-noun" || act === "g-suffix" || act === "g-join") {
    grammarKind = act.slice(2); grammarIndex = 0; grammarScore = 0; note = "";
    // Mix up the answer buttons each time a section starts, so the right answer isn't always in the same place
    suffixes.forEach((q) => { q.choices = shuffle(q.choices); });
    joins.forEach((q) => { q.choices = shuffle(q.choices); });
    nouns.forEach((q) => { q.options = shuffle(q.options); });
    draw(); return;
  }
  if (act === "hear") { speak(words[index]); return; }
  if (act === "letter") { if (!covered || listening || count > 0) return; typed += val; draw(); return; }
  if (act === "check-spell") {
    const word = words[index];
    const result = document.querySelector("#result");
    if (typed === word) {
      if (!spellDone[index]) { spellScore += wordPoints(word); spellDone[index] = true; }
      result.textContent = "Correct Well Done!"; result.className = "ok"; speak("Well done");
      flashWellDone(() => { if (index >= words.length - 1) finishSpell(); else { index += 1; startSequence(); } });
    } else {
      typed = ""; tiles = makeTiles(word); draw();
      document.querySelector("#result").textContent = "Try again";
      document.querySelector("#result").className = "no";
    }
    return;
  }
  if (act === "again") { startSequence(); return; }
  if (act === "next-word") { if (index >= words.length - 1) finishSpell(); else { index += 1; startSequence(); } return; }
  if (act === "world-pick") {
    const item = continents[worldOrder[worldIndex]];
    if (val === item.name) {
      worldScore += 1; note = "";
      flashWellDone(() => { if (worldIndex >= continents.length - 1) finishWorld(); else { worldIndex += 1; draw(); } });
    } else { note = "Try again"; draw(); }
    return;
  }
  if (act === "cmd") {
    const q = commands[grammarIndex];
    if ((val === "yes") === q.yes) { grammarScore += 1; note = ""; nextGrammar(commands.length); }
    else { note = "Try again"; draw(); }
    return;
  }
  if (act === "noun") {
    const q = nouns[grammarIndex];
    if (val === q.answer) { grammarScore += 1; note = ""; nextGrammar(nouns.length); }
    else { note = "Try again"; draw(); }
    return;
  }
  if (act === "suffix") {
    const q = suffixes[grammarIndex];
    if (val === q.answer) { grammarScore += 1; note = ""; nextGrammar(suffixes.length); }
    else { note = "Try again"; draw(); }
    return;
  }
  if (act === "join") {
    const q = joins[grammarIndex];
    if (val === q.answer) { grammarScore += 1; note = ""; nextGrammar(joins.length); }
    else { note = "Try again"; draw(); }
  }
}
function findAct(node) {
  let el = node;
  while (el && el !== app) {
    if (el.getAttribute && el.getAttribute("data-act")) return el;
    el = el.parentNode;
  }
  return null;
}
app.onclick = function (event) {
  const el = findAct(event.target);
  if (!el || (el.className || "").indexOf("off") !== -1) return;
  handle(el.getAttribute("data-act"), el.getAttribute("data-val"));
};
sea.resetOnce(SEA_RESET);
draw();