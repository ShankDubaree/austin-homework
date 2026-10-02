import "./style.css";

const words = ["have","give","smells","jumps","catches","splashes","playground","bedroom","some","come"];
const compares = [
  { left: 14, right: 41 }, { left: 9, right: 6 }, { left: 52, right: 52 },
  { left: 33, right: 39 }, { left: 70, right: 17 }, { left: 25, right: 85 },
  { left: 64, right: 46 }, { left: 19, right: 19 }, { left: 81, right: 18 },
  { left: 47, right: 74 }, { left: 90, right: 99 }, { left: 31, right: 13 },
  { left: 55, right: 55 }, { left: 26, right: 62 },
];
const continents = [
  { id: "europe", name: "Europe", fact: "We live in Europe." },
  { id: "africa", name: "Africa", fact: "Africa is hot." },
  { id: "asia", name: "Asia", fact: "Asia is the biggest." },
  { id: "namerica", name: "North America", fact: "North America is above South America." },
  { id: "samerica", name: "South America", fact: "South America is below North America." },
  { id: "australia", name: "Australia", fact: "Australia is an island continent." },
  { id: "antarctica", name: "Antarctica", fact: "Antarctica is ice." },
];
const commands = [
  { text: "Wash your hands.", yes: true },
  { text: "The dog jumps.", yes: false },
  { text: "Sit down.", yes: true },
  { text: "She smells the flowers.", yes: false },
  { text: "Give me the ball.", yes: true },
];
const nouns = [
  { line: "The dog splashes in the puddle.", words: ["The", "dog", "puddle"], answer: "dog" },
  { line: "Austin jumps on the playground.", words: ["Austin", "jumps", "playground"], answer: "playground" },
  { line: "The cat sleeps in the bedroom.", words: ["cat", "sleeps", "bedroom"], answer: "bedroom" },
  { line: "Give the ball to Sam.", words: ["Give", "ball", "Sam"], answer: "ball" },
  { line: "Some birds catch worms.", words: ["birds", "catch", "worms"], answer: "birds" },
];
const suffixes = [
  { stem: "splash", end: "es", choices: ["s", "es", "ing"] },
  { stem: "jump", end: "s", choices: ["s", "es", "ed"] },
  { stem: "catch", end: "es", choices: ["s", "es", "ing"] },
  { stem: "smell", end: "s", choices: ["s", "es", "ed"] },
  { stem: "play", end: "ground", choices: ["s", "ing", "ground"] },
];
const joins = [
  { line: "I have a ball", join: "and", rest: "I give it to you.", choices: ["and", "but", "because"] },
  { line: "I want to play", join: "but", rest: "it is raining.", choices: ["and", "but", "because"] },
  { line: "I come inside", join: "because", rest: "I am cold.", choices: ["and", "but", "because"] },
  { line: "The dog smells food", join: "and", rest: "the cat jumps.", choices: ["and", "but", "because"] },
  { line: "We go to the playground", join: "because", rest: "it is sunny.", choices: ["and", "but", "because"] },
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
let worldIndex = 0, worldOrder = [], grammarKind = "menu", grammarIndex = 0, suffixPick = "", note = "";

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
function flashWellDone(done) {
  const box = document.createElement("div");
  box.className = "flash-ok";
  box.textContent = "Correct Well Done!";
  document.body.appendChild(box);
  later(1400, () => { box.remove(); done(); });
}
function clearTimers() {
  timers.forEach((id) => clearTimeout(id));
  timers = [];
  try { speechSynthesis.cancel(); } catch (e) {}
}
function later(ms, fn) { timers.push(setTimeout(fn, ms)); }
function speak(text) {
  pulsing = true;
  if (view === "spell") draw();
  later(850, () => { pulsing = false; if (view === "spell") draw(); });
  try {
    speechSynthesis.cancel();
    const say = new SpeechSynthesisUtterance(text);
    say.rate = 0.75;
    speechSynthesis.speak(say);
  } catch (e) {}
}
function shuffle(list) {
  return list.map((item) => ({ item, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ item }) => item);
}
function makeTiles(word) {
  const extraLetters = shuffle(extras.split("")).filter((letter) => !word.includes(letter)).slice(0, word.length < 5 ? 3 : 2);
  return shuffle([...word.split(""), ...extraLetters]);
}
function choicesFor(name) {
  const others = shuffle(continents.filter((c) => c.name !== name)).slice(0, 2);
  return shuffle([name, ...others.map((c) => c.name)]);
}
function mapSvg(onId) {
  const fill = (id) => (id === onId ? "#f4d35e" : "#35508a");
  return `
    <svg class="map" viewBox="0 0 200 120" aria-hidden="true">
      <rect width="200" height="120" rx="12" fill="#0c2048"/>
      <path fill="${fill("namerica")}" d="M18 28l18-8 16 6 8 14-6 10-14 4-16-2-10-10z"/>
      <path fill="${fill("samerica")}" d="M48 62l12-4 8 16 2 18-8 10-10-6-6-16z"/>
      <path fill="${fill("europe")}" d="M96 30l14-4 8 8-4 8-12 2-8-6z"/>
      <path fill="${fill("africa")}" d="M100 46l16 2 8 18-2 22-12 8-14-6-4-18z"/>
      <path fill="${fill("asia")}" d="M118 24l28-6 24 10 8 16-10 12-22 4-18-8-8-14z"/>
      <path fill="${fill("australia")}" d="M150 78l16-2 8 8-4 8-14 2-8-6z"/>
      <path fill="${fill("antarctica")}" d="M30 104h140l-8 8H40z"/>
    </svg>`;
}
function startSequence() {
  const word = words[index];
  clearTimers();
  covered = false; listening = true; typed = ""; tiles = makeTiles(word); count = 5; pulsing = false;
  draw();
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
function finishGrammar() {
  lastKind = "grammar"; view = "result"; draw();
  const max = grammarKind === "command" ? commands.length : grammarKind === "noun" ? nouns.length : grammarKind === "suffix" ? suffixes.length : joins.length;
  if (grammarScore === max) fireConfetti();
}
function nextGrammar(len) {
  flashWellDone(() => {
    note = "";
    if (grammarIndex >= len - 1) finishGrammar();
    else { grammarIndex += 1; suffixPick = ""; draw(); }
  });
}

function draw() {
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
    app.innerHTML = `<main class="card"><div class="login-wrap"><div class="hero-btn"><img src="${HERO}" alt="Austin" /></div></div><p class="week">Austin</p><h1 class="word">Homework</h1><p class="progress">${last ? `Last time: spellings ${last.spell}/${last.spellMax} · maths ${last.maths}/${last.mathsMax}` : "Pick one"}</p><div class="big spell-btn" data-act="spell">Spellings</div><div class="big maths-btn" data-act="maths">Greater or less</div><div class="big world-btn" data-act="world">Continents</div><div class="big grammar-btn" data-act="grammar">Grammar hunt</div><div class="big" data-act="logout">Log out</div></main>`;
    return;
  }
  if (view === "result") {
    let got = spellScore, max = spellMax();
    if (lastKind === "maths") { got = mathsScore; max = compares.length; }
    if (lastKind === "world") { got = worldScore; max = continents.length; }
    if (lastKind === "grammar") {
      got = grammarScore;
      max = grammarKind === "command" ? commands.length : grammarKind === "noun" ? nouns.length : grammarKind === "suffix" ? suffixes.length : joins.length;
    }
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
    app.innerHTML = `<main class="card"><p class="week">Continents · ${worldScore} pts</p><p class="progress">${worldIndex + 1} of ${continents.length}</p><h1 class="word">Which continent?</h1>${mapSvg(item.id)}<div class="fact">${item.fact}</div><p id="result" class="${note ? "no" : ""}">${note}</p>${opts.map((name) => `<div class="big world-btn" data-act="world-pick" data-val="${name}">${name}</div>`).join("")}<div class="big" data-act="home">Home</div></main>`;
    return;
  }
  if (view === "grammar" && grammarKind === "menu") {
    app.innerHTML = `<main class="card"><p class="week">Grammar hunt</p><h1 class="word">Pick one</h1><div class="big grammar-btn" data-act="g-command">Commands</div><div class="big grammar-btn" data-act="g-noun">Nouns</div><div class="big grammar-btn" data-act="g-suffix">Suffixes</div><div class="big grammar-btn" data-act="g-join">Joining words</div><div class="big" data-act="home">Home</div></main>`;
    return;
  }
  if (view === "grammar" && grammarKind === "command") {
    const q = commands[grammarIndex];
    app.innerHTML = `<main class="card"><p class="week">Commands · ${grammarScore} pts</p><p class="progress">${grammarIndex + 1} of ${commands.length}</p><h1 class="word">Is this a command?</h1><div class="line">${q.text}</div><p id="result" class="${note ? "no" : ""}">${note}</p><div class="big spell-btn" data-act="cmd" data-val="yes">Command</div><div class="big world-btn" data-act="cmd" data-val="no">Not a command</div><div class="big" data-act="home">Home</div></main>`;
    return;
  }
  if (view === "grammar" && grammarKind === "noun") {
    const q = nouns[grammarIndex];
    app.innerHTML = `<main class="card"><p class="week">Nouns · ${grammarScore} pts</p><p class="progress">${grammarIndex + 1} of ${nouns.length}</p><h1 class="word">Tap the noun</h1><div class="line">${q.line}</div><p class="hint">A noun is a person, place or thing</p><p id="result" class="${note ? "no" : ""}">${note}</p><div class="row3">${q.words.map((w) => `<div class="cmp-btn cmp-same" data-act="noun" data-val="${w}">${w}</div>`).join("")}</div><div class="big" data-act="home">Home</div></main>`;
    return;
  }
  if (view === "grammar" && grammarKind === "suffix") {
    const q = suffixes[grammarIndex];
    app.innerHTML = `<main class="card"><p class="week">Suffixes · ${grammarScore} pts</p><p class="progress">${grammarIndex + 1} of ${suffixes.length}</p><h1 class="word">Build the word</h1><div class="build-word"><span class="stem">${q.stem}</span><span>+</span><span class="stem">${suffixPick || "?"}</span></div><p id="result" class="${note ? "no" : ""}">${note}</p><div class="row3">${q.choices.map((c) => `<div class="cmp-btn cmp-more" data-act="suf" data-val="${c}">${c}</div>`).join("")}</div><div class="big next ${suffixPick ? "" : "off"}" data-act="suf-check">Check</div><div class="big" data-act="home">Home</div></main>`;
    return;
  }
  if (view === "grammar" && grammarKind === "join") {
    const q = joins[grammarIndex];
    app.innerHTML = `<main class="card"><p class="week">Joining words · ${grammarScore} pts</p><p class="progress">${grammarIndex + 1} of ${joins.length}</p><h1 class="word">Tap the joining word</h1><div class="line">${q.line} ___ ${q.rest}</div><p id="result" class="${note ? "no" : ""}">${note}</p><div class="row3">${q.choices.map((c) => `<div class="cmp-btn cmp-less" data-act="join" data-val="${c}">${c}</div>`).join("")}</div><div class="big" data-act="home">Home</div></main>`;
    return;
  }
  const q = compares[cmpIndex];
  app.innerHTML = `<main class="card"><p class="week">Which is bigger?</p><p class="progress">${cmpIndex + 1} of ${compares.length} · ${mathsScore} pts</p><div class="compare"><span class="cmp-num">${q.left}</span><span class="cmp-box">${cmpGuess || "?"}</span><span class="cmp-num">${q.right}</span></div><p class="hint">The open side eats the bigger number</p><p id="result"></p><div class="row3"><div class="cmp-btn cmp-less" data-act="cmp" data-val="&lt;"><span class="sign">&lt;</span><span>less</span></div><div class="cmp-btn cmp-same" data-act="cmp" data-val="="><span class="sign">=</span><span>same</span></div><div class="cmp-btn cmp-more" data-act="cmp" data-val="&gt;"><span class="sign">&gt;</span><span>more</span></div></div><div class="big" data-act="home">Home</div></main>`;
}

function markWrong() {
  note = "Try again";
  draw();
}

function handle(act, val) {
  if (!act) return;
  if (act === "logout") { view = "login"; passGuess = ""; loginError = ""; clearTimers(); draw(); return; }
  if (act === "pick-austin") { view = "pass"; passGuess = ""; loginError = ""; draw(); return; }
  if (act === "pass-letter") { passGuess += val; loginError = ""; draw(); return; }
  if (act === "pass-clear") { passGuess = ""; loginError = ""; draw(); return; }
  if (act === "pass-go") {
    if (passGuess === PASSWORD) { view = "home"; passGuess = ""; loginError = ""; } else { loginError = "Try again"; passGuess = ""; }
    draw(); return;
  }
  if (act === "home") { view = "home"; note = ""; clearTimers(); draw(); return; }
  if (act === "spell") { view = "spell"; index = 0; spellScore = 0; spellDone = {}; startSequence(); return; }
  if (act === "maths") { view = "maths"; cmpIndex = 0; cmpGuess = ""; mathsScore = 0; mathsDone = {}; clearTimers(); draw(); return; }
  if (act === "world") { view = "world"; worldIndex = 0; worldScore = 0; note = ""; worldOrder = shuffle(continents.map((_, i) => i)); clearTimers(); draw(); return; }
  if (act === "grammar") { view = "grammar"; grammarKind = "menu"; grammarScore = 0; grammarIndex = 0; note = ""; clearTimers(); draw(); return; }
  if (act === "g-command" || act === "g-noun" || act === "g-suffix" || act === "g-join") {
    grammarKind = act === "g-command" ? "command" : act === "g-noun" ? "noun" : act === "g-suffix" ? "suffix" : "join";
    grammarIndex = 0; grammarScore = 0; suffixPick = ""; note = ""; draw(); return;
  }
  if (act === "world-pick") {
    const item = continents[worldOrder[worldIndex]];
    if (val === item.name) {
      worldScore += 1; note = ""; speak(item.name);
      flashWellDone(() => { if (worldIndex >= continents.length - 1) finishWorld(); else { worldIndex += 1; draw(); } });
    } else markWrong();
    return;
  }
  if (act === "cmd") {
    const q = commands[grammarIndex];
    if ((val === "yes") === q.yes) { grammarScore += 1; note = ""; nextGrammar(commands.length); } else markWrong();
    return;
  }
  if (act === "noun") {
    if (val === nouns[grammarIndex].answer) { grammarScore += 1; note = ""; nextGrammar(nouns.length); } else markWrong();
    return;
  }
  if (act === "suf") { suffixPick = val; note = ""; draw(); return; }
  if (act === "suf-check") {
    if (suffixPick === suffixes[grammarIndex].end) { grammarScore += 1; note = ""; nextGrammar(suffixes.length); }
    else { suffixPick = ""; markWrong(); }
    return;
  }
  if (act === "join") {
    if (val === joins[grammarIndex].join) { grammarScore += 1; note = ""; nextGrammar(joins.length); } else markWrong();
    return;
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
    const item = compares[cmpIndex];
    if (val === cmpSign(item)) {
      if (!mathsDone[cmpIndex]) { mathsScore += 1; mathsDone[cmpIndex] = true; }
      speak("Well done");
      flashWellDone(() => { if (cmpIndex >= compares.length - 1) finishMaths(); else { cmpIndex += 1; cmpGuess = ""; draw(); } });
    } else {
      const result = document.querySelector("#result");
      result.textContent = "Try again"; result.className = "no";
    }
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