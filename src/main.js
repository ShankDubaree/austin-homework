import "./style.css";

const words = [
  "have",
  "give",
  "smells",
  "jumps",
  "catches",
  "splashes",
  "playground",
  "bedroom",
  "some",
  "come",
];

const compares = [
  { left: 14, right: 41 },
  { left: 9, right: 6 },
  { left: 52, right: 52 },
  { left: 33, right: 39 },
  { left: 70, right: 17 },
  { left: 25, right: 85 },
  { left: 64, right: 46 },
  { left: 19, right: 19 },
  { left: 81, right: 18 },
  { left: 47, right: 74 },
  { left: 90, right: 99 },
  { left: 31, right: 13 },
  { left: 55, right: 55 },
  { left: 26, right: 62 },
];

const extras = "abcdefghijklmnopqrstuvwxyz";
const app = document.querySelector("#app");
const PASSWORD = "baxter";
const HERO = "/austin-homework/hero.png";

let index = 0;
let covered = false;
let listening = false;
let typed = "";
let tiles = [];
let timers = [];
let cmpIndex = 0;
let cmpGuess = "";
let view = "login";
let count = 0;
let pulsing = false;
let passGuess = "";
let loginError = "";
let spellScore = 0;
let mathsScore = 0;
let spellDone = {};
let mathsDone = {};
let lastKind = "spell";

function wordPoints(word) {
  return word.length;
}

function spellMax() {
  return words.reduce((sum, word) => sum + word.length, 0);
}

function cmpSign(item) {
  if (item.left > item.right) return ">";
  if (item.left < item.right) return "<";
  return "=";
}

function scores() {
  try {
    return JSON.parse(localStorage.getItem("austin-scores") || "[]");
  } catch (e) {
    return [];
  }
}

function saveScore() {
  const list = scores();
  list.unshift({
    when: new Date().toLocaleString(),
    spell: spellScore,
    spellMax: spellMax(),
    maths: mathsScore,
    mathsMax: compares.length,
  });
  localStorage.setItem("austin-scores", JSON.stringify(list.slice(0, 20)));
}

function lastScore() {
  return scores()[0];
}

function stars(got, max) {
  const n = max ? Math.round((got / max) * 5) : 0;
  return "★".repeat(n) + "☆".repeat(5 - n);
}

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
  const note = document.createElement("div");
  note.className = "flash-ok";
  note.textContent = "Correct Well Done!";
  document.body.appendChild(note);
  later(1400, () => {
    note.remove();
    done();
  });
}

function clearTimers() {
  timers.forEach((id) => clearTimeout(id));
  timers = [];
  try {
    speechSynthesis.cancel();
  } catch (e) {}
}

function later(ms, fn) {
  timers.push(setTimeout(fn, ms));
}

function speak(text) {
  pulsing = true;
  if (view === "spell") draw();
  later(850, () => {
    pulsing = false;
    if (view === "spell") draw();
  });
  try {
    speechSynthesis.cancel();
    const say = new SpeechSynthesisUtterance(text);
    say.rate = 0.75;
    speechSynthesis.speak(say);
  } catch (e) {}
}

function shuffle(list) {
  return list
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function makeTiles(word) {
  const extraLetters = shuffle(extras.split(""))
    .filter((letter) => !word.includes(letter))
    .slice(0, word.length < 5 ? 3 : 2);
  return shuffle([...word.split(""), ...extraLetters]);
}

function startSequence() {
  const word = words[index];
  clearTimers();
  covered = false;
  listening = true;
  typed = "";
  tiles = makeTiles(word);
  count = 5;
  pulsing = false;
  draw();

  function tick() {
    later(1000, () => {
      count -= 1;
      if (count > 0) {
        draw();
        tick();
      } else {
        speak(word);
        later(2000, () => {
          speak(word);
          later(2000, () => {
            speak(word);
            later(800, () => {
              covered = true;
              listening = false;
              draw();
            });
          });
        });
        draw();
      }
    });
  }
  tick();
}

function finishSpell() {
  lastKind = "spell";
  saveScore();
  view = "result";
  draw();
  if (spellScore === spellMax()) fireConfetti();
}

function finishMaths() {
  lastKind = "maths";
  saveScore();
  view = "result";
  draw();
  if (mathsScore === compares.length) fireConfetti();
}

function draw() {
  if (view === "login") {
    app.innerHTML = `
      <main class="card">
        <p class="week">Homework</p>
        <h1 class="word">Who is it?</h1>
        <div class="login-wrap">
          <div class="hero-btn" data-act="pick-austin">
            <img src="${HERO}" alt="Austin" />
          </div>
          <div class="big next" data-act="pick-austin">Austin</div>
        </div>
      </main>
    `;
    return;
  }

  if (view === "pass") {
    app.innerHTML = `
      <main class="card">
        <p class="week">Austin</p>
        <div class="login-wrap">
          <div class="hero-btn"><img src="${HERO}" alt="Austin" /></div>
        </div>
        <p class="progress">Type the password</p>
        <div class="answer">${passGuess || "••••••"}</div>
        <p id="result" class="${loginError ? "no" : ""}">${loginError}</p>
        <div class="tiles">
          ${"abcdefghijklmnopqrstuvwxyz"
            .split("")
            .map(
              (letter) =>
                `<div class="tile" data-act="pass-letter" data-val="${letter}">${letter}</div>`
            )
            .join("")}
        </div>
        <div class="big next" data-act="pass-go">Go</div>
        <div class="row">
          <div class="big" data-act="pass-clear">Clear</div>
          <div class="big next-word" data-act="logout">Back</div>
        </div>
      </main>
    `;
    return;
  }

  if (view === "home") {
    const last = lastScore();
    app.innerHTML = `
      <main class="card">
        <div class="login-wrap">
          <div class="hero-btn"><img src="${HERO}" alt="Austin" /></div>
        </div>
        <p class="week">Austin</p>
        <h1 class="word">Homework</h1>
        <p class="progress">${
          last
            ? `Last time: spellings ${last.spell}/${last.spellMax} · maths ${last.maths}/${last.mathsMax}`
            : "Pick one"
        }</p>
        <div class="big spell-btn" data-act="spell">Spellings</div>
        <div class="big maths-btn" data-act="maths">Greater or less</div>
        <div class="big" data-act="logout">Log out</div>
      </main>
    `;
    return;
  }

  if (view === "result") {
    const got = lastKind === "spell" ? spellScore : mathsScore;
    const max = lastKind === "spell" ? spellMax() : compares.length;
    app.innerHTML = `
      <main class="card">
        <p class="week">Hero score</p>
        <div class="login-wrap">
          <div class="hero-btn"><img src="${HERO}" alt="Austin" /></div>
        </div>
        <div class="score-big">${got} / ${max}</div>
        <div class="stars">${stars(got, max)}</div>
        <p class="progress">Saved on this tablet</p>
        <div class="big next" data-act="home">Home</div>
        <div class="big next-word" data-act="${lastKind}">Play again</div>
      </main>
    `;
    return;
  }

  if (view === "spell") {
    const word = words[index];
    const canType = covered && !listening && count === 0;
    const canCheck = canType && typed.length > 0;
    app.innerHTML = `
      <main class="card">
        <p class="week">Spellings · ${spellScore} pts</p>
        <p class="progress">Word ${index + 1} of ${words.length} · ${wordPoints(word)} pts</p>
        ${count > 0 ? `<div class="count">${count}</div>` : ""}
        <h1 class="word ${pulsing ? "pulse" : ""}">${
          covered ? "⭐".repeat(Math.min(word.length, 6)) : word
        }</h1>
        <div class="answer">${
          count > 0
            ? "look at the word"
            : typed || (canType ? "tap the letters" : "watch and listen")
        }</div>
        <p id="result"></p>
        <div class="tiles">
          ${tiles
            .map(
              (letter) =>
                `<div class="tile ${canType ? "" : "off"}" data-act="letter" data-val="${letter}">${letter}</div>`
            )
            .join("")}
        </div>
        <div class="big next-word" data-act="hear">Hear the word</div>
        <div class="big next ${canCheck ? "" : "off"}" data-act="check-spell">Check</div>
        <div class="row">
          <div class="big" data-act="again">Again</div>
          <div class="big next-word" data-act="next-word">Next word</div>
        </div>
        <div class="big" data-act="home">Home</div>
      </main>
    `;
    return;
  }

  const q = compares[cmpIndex];
  app.innerHTML = `
    <main class="card">
      <p class="week">Which is bigger?</p>
      <p class="progress">${cmpIndex + 1} of ${compares.length} · ${mathsScore} pts</p>
      <div class="compare">
        <span class="cmp-num">${q.left}</span>
        <span class="cmp-box">${cmpGuess || "?"}</span>
        <span class="cmp-num">${q.right}</span>
      </div>
      <p class="hint">The open side eats the bigger number</p>
      <p id="result"></p>
      <div class="row3">
        <div class="cmp-btn cmp-less" data-act="cmp" data-val="&lt;">
          <span class="sign">&lt;</span>
          <span>less</span>
        </div>
        <div class="cmp-btn cmp-same" data-act="cmp" data-val="=">
          <span class="sign">=</span>
          <span>same</span>
        </div>
        <div class="cmp-btn cmp-more" data-act="cmp" data-val="&gt;">
          <span class="sign">&gt;</span>
          <span>more</span>
        </div>
      </div>
      <div class="big" data-act="home">Home</div>
    </main>
  `;
}

function handle(act, val) {
  if (!act) return;

  if (act === "logout") {
    view = "login";
    passGuess = "";
    loginError = "";
    clearTimers();
    draw();
    return;
  }
  if (act === "pick-austin") {
    view = "pass";
    passGuess = "";
    loginError = "";
    draw();
    return;
  }
  if (act === "pass-letter") {
    passGuess += val;
    loginError = "";
    draw();
    return;
  }
  if (act === "pass-clear") {
    passGuess = "";
    loginError = "";
    draw();
    return;
  }
  if (act === "pass-go") {
    if (passGuess === PASSWORD) {
      view = "home";
      passGuess = "";
      loginError = "";
    } else {
      loginError = "Try again";
      passGuess = "";
    }
    draw();
    return;
  }
  if (act === "home") {
    view = "home";
    clearTimers();
    draw();
    return;
  }
  if (act === "spell") {
    view = "spell";
    index = 0;
    spellScore = 0;
    spellDone = {};
    startSequence();
    return;
  }
  if (act === "maths") {
    view = "maths";
    cmpIndex = 0;
    cmpGuess = "";
    mathsScore = 0;
    mathsDone = {};
    clearTimers();
    draw();
    return;
  }
  if (act === "hear") {
    speak(words[index]);
    return;
  }
  if (act === "letter") {
    if (!covered || listening || count > 0) return;
    typed += val;
    draw();
    return;
  }
  if (act === "check-spell") {
    const word = words[index];
    const result = document.querySelector("#result");
    if (typed === word) {
      if (!spellDone[index]) {
        spellScore += wordPoints(word);
        spellDone[index] = true;
      }
      result.textContent = "Correct Well Done!";
      result.className = "ok";
      speak("Well done");
      flashWellDone(() => {
        if (index >= words.length - 1) finishSpell();
        else {
          index += 1;
          startSequence();
        }
      });
    } else {
      typed = "";
      tiles = makeTiles(word);
      draw();
      document.querySelector("#result").textContent = "Try again";
      document.querySelector("#result").className = "no";
    }
    return;
  }
  if (act === "again") {
    startSequence();
    return;
  }
  if (act === "next-word") {
    if (index >= words.length - 1) finishSpell();
    else {
      index += 1;
      startSequence();
    }
    return;
  }
  if (act === "cmp") {
    cmpGuess = val;
    draw();
    const q = compares[cmpIndex];
    if (val === cmpSign(q)) {
      if (!mathsDone[cmpIndex]) {
        mathsScore += 1;
        mathsDone[cmpIndex] = true;
      }
      speak("Well done");
      flashWellDone(() => {
        if (cmpIndex >= compares.length - 1) finishMaths();
        else {
          cmpIndex += 1;
          cmpGuess = "";
          draw();
        }
      });
    } else {
      const result = document.querySelector("#result");
      result.textContent = "Try again";
      result.className = "no";
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