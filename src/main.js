import "./style.css";
import { LETTERS, FAMILIES, letterSvg } from "./handwriting/letters.js";
import { scoreTrace } from "./handwriting/score.js";
import * as pad from "./handwriting/pad.js";
import * as hwProgress from "./handwriting/progress.js";

const words = ["have","give","smells","jumps","catches","splashes","playground","bedroom","some","come"];
const compares = [
  { left: 14, right: 41 }, { left: 9, right: 6 }, { left: 52, right: 52 },
  { left: 33, right: 39 }, { left: 70, right: 17 }, { left: 25, right: 85 },
  { left: 64, right: 46 }, { left: 19, right: 19 }, { left: 81, right: 18 },
  { left: 47, right: 74 }, { left: 90, right: 99 }, { left: 31, right: 13 },
  { left: 55, right: 55 }, { left: 26, right: 62 },
];
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
let cmpIndex = 0, cmpGuess = "", view = "login", count = 0, pulsing = false;
let passGuess = "", loginError = "";
let spellScore = 0, mathsScore = 0, worldScore = 0, grammarScore = 0;
let spellDone = {}, mathsDone = {}, lastKind = "spell";
let worldIndex = 0, worldOrder = [], grammarKind = "menu", grammarIndex = 0, note = "";
let hwFam = FAMILIES[0].id, hwLetter = "c";

function wordPoints(word) { return word.length; }
function spellMax() { return words.reduce((sum, word) => sum + word.length, 0); }
function cmpSign(item) { if (item.left > item.right) return ">"; if (item.left < item.right) return "<"; return "="; }
function scores() { try { return JSON.parse(localStorage.getItem("austin-scores") || "[]"); } catch (e) { return []; } }
function saveScore() {
  const list = scores();
  list.unshift({ when: new Date().toLocaleString(), spell: spellScore, spellMax: spellMax(), maths: mathsScore, mathsMax: compares.length });
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
  if (view === "spell") draw();
  later(850, () => { pulsing = false; if (view === "spell") draw(); });
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
function startSequence() {
  const word = words[index];
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
function finishMaths() { lastKind = "maths"; saveScore(); view = "result"; draw(); if (mathsScore === compares.length) fireConfetti(); }
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
function backGrammar() { return `<div class="big" data-act="g-menu">Back</div>`; }
function draw() {
  pad.unmount(); // the writing pad re-attaches below if we're on a letter; Austin's ink is kept
  if (view === "hw-menu") {
    app.innerHTML = `<main class="card"><p class="week">Handwriting</p><h1 class="word hw-title">Pick a family</h1>${FAMILIES.map((f) => {
      const { got, max } = hwProgress.familyStars(f.letters);
      return `<div class="big hw-fam" style="background:${f.color}" data-act="hw-fam" data-val="${f.id}"><span class="hw-fam-name">${f.name}</span><span class="hw-fam-letters">${f.letters.map((l) => letterSvg(l, 44)).join("")}</span><span class="hw-fam-stars">★ ${got} / ${max}</span></div>`;
    }).join("")}<div class="big" data-act="home">Home</div></main>`;
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
  if (view === "login") {
    app.innerHTML = `<main class="card"><p class="week">Homework</p><h1 class="word">Who is it?</h1><div class="login-wrap"><div class="hero-btn" data-act="pick-austin"><img src="${HERO}" alt="Austin" /></div><div class="big next" data-act="pick-austin">Austin</div></div></main>`;
    return;
  }
  if (view === "pass") {
    app.innerHTML = `<main class="card"><p class="week">Austin</p><div class="login-wrap"><div class="hero-btn"><img src="${HERO}" alt="Austin" /></div></div><p class="progress">Type the password</p><div class="answer">${passGuess || "••••••"}</div><p id="result" class="${loginError ? "no" : ""}">${loginError}</p><div class="tiles">${"abcdefghijklmnopqrstuvwxyz".split("").map((letter) => `<div class="tile" data-act="pass-letter" data-val="${letter}">${letter}</div>`).join("")}</div><div class="big next" data-act="pass-go">Go</div><div class="row"><div class="big" data-act="pass-clear">Clear</div><div class="big next-word" data-act="logout">Back</div></div></main>`;
    return;
  }
  if (view === "home") {
    const last = lastScore();
    app.innerHTML = `<main class="card"><div class="login-wrap"><div class="hero-btn"><img src="${HERO}" alt="Austin" /></div></div><p class="week">Austin</p><h1 class="word">Homework</h1><p class="progress">${last ? `Last time: spellings ${last.spell}/${last.spellMax} · maths ${last.maths}/${last.mathsMax}` : "Pick one"}</p><div class="big spell-btn" data-act="spell">Spellings</div><div class="big maths-btn" data-act="maths">Greater or less</div><div class="big world-btn" data-act="world">Continents</div><div class="big grammar-btn" data-act="grammar">Grammar hunt</div><div class="big hand-btn" data-act="hw">Handwriting</div><div class="big" data-act="logout">Log out</div></main>`;
    return;
  }
  if (view === "result") {
    let got = spellScore, max = spellMax();
    if (lastKind === "maths") { got = mathsScore; max = compares.length; }
    if (lastKind === "world") { got = worldScore; max = continents.length; }
    if (lastKind === "grammar") { got = grammarScore; max = grammarMax(); }
    app.innerHTML = `<main class="card"><p class="week">Hero score</p><div class="login-wrap"><div class="hero-btn"><img src="${HERO}" alt="Austin" /></div></div><div class="score-big">${got} / ${max}</div><div class="stars">${stars(got, max)}</div><div class="big next" data-act="home">Home</div><div class="big next-word" data-act="${lastKind === "grammar" ? "grammar" : lastKind}">Play again</div></main>`;
    return;
  }
  if (view === "spell") {
    const word = words[index];
    const canType = covered && !listening && count === 0;
    const canCheck = canType && typed.length > 0;
    app.innerHTML = `<main class="card"><p class="week">Spellings · ${spellScore} pts</p><p class="progress">Word ${index + 1} of ${words.length} · ${wordPoints(word)} pts</p>${count > 0 ? `<div class="count">${count}</div>` : ""}<h1 class="word ${pulsing ? "pulse" : ""}">${covered ? "⭐".repeat(Math.min(word.length, 6)) : word}</h1><div class="answer">${count > 0 ? "look at the word" : typed || (canType ? "tap the letters" : "watch and listen")}</div><p id="result"></p><div class="tiles">${tiles.map((letter) => `<div class="tile ${canType ? "" : "off"}" data-act="letter" data-val="${letter}">${letter}</div>`).join("")}</div><div class="big next-word" data-act="hear">Hear the word</div><div class="big next ${canCheck ? "" : "off"}" data-act="check-spell">Check</div><div class="row"><div class="big" data-act="again">Again</div><div class="big next-word" data-act="next-word">Next word</div></div><div class="big" data-act="home">Home</div></main>`;
    return;
  }
  if (view === "world") {
    const item = continents[worldOrder[worldIndex]];
    const opts = choicesFor(item.name);
    app.innerHTML = `<main class="card"><p class="week">Continents · ${worldScore} pts</p><p class="progress">${worldIndex + 1} of ${continents.length}</p><p class="ask">Which continent is gold?</p><img class="map" src="/austin-homework/${item.id}.jpg" alt="map" /><p id="result" class="${note ? "no" : ""}">${note}</p>${opts.map((name) => `<div class="big world-btn" data-act="world-pick" data-val="${name}">${name}</div>`).join("")}<div class="big" data-act="home">Home</div></main>`;
    return;
  }
  if (view === "grammar" && grammarKind === "menu") {
    app.innerHTML = `<main class="card"><p class="week">Grammar hunt</p><h1 class="word">Pick one</h1><div class="big grammar-btn" data-act="g-command">Commands</div><div class="big grammar-btn" data-act="g-noun">Nouns</div><div class="big grammar-btn" data-act="g-suffix">Suffixes</div><div class="big grammar-btn" data-act="g-join">Joining words</div><div class="big" data-act="home">Home</div></main>`;
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
  const q = compares[cmpIndex];
  app.innerHTML = `<main class="card"><p class="week">Which is bigger?</p><p class="progress">${cmpIndex + 1} of ${compares.length} · ${mathsScore} pts</p><div class="compare"><span class="cmp-num">${q.left}</span><span class="cmp-box">${cmpGuess || "?"}</span><span class="cmp-num">${q.right}</span></div><p class="hint">The open side eats the bigger number</p><p id="result"></p><div class="row3"><div class="cmp-btn cmp-less" data-act="cmp" data-val="&lt;"><span class="sign">&lt;</span><span>less</span></div><div class="cmp-btn cmp-same" data-act="cmp" data-val="="><span class="sign">=</span><span>same</span></div><div class="cmp-btn cmp-more" data-act="cmp" data-val="&gt;"><span class="sign">&gt;</span><span>more</span></div></div><div class="big" data-act="home">Home</div></main>`;
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
  if (act === "maths") { view = "maths"; cmpIndex = 0; cmpGuess = ""; mathsScore = 0; mathsDone = {}; clearTimers(); draw(); return; }
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
  if (act === "cmp") {
    cmpGuess = val; draw();
    const q = compares[cmpIndex];
    if (val === cmpSign(q)) {
      if (!mathsDone[cmpIndex]) { mathsScore += 1; mathsDone[cmpIndex] = true; }
      speak("Well done");
      flashWellDone(() => { if (cmpIndex >= compares.length - 1) finishMaths(); else { cmpIndex += 1; cmpGuess = ""; draw(); } });
    } else {
      const result = document.querySelector("#result");
      result.textContent = "Try again"; result.className = "no";
    }
    return;
  }
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
draw();