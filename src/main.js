import "./style.css";

const words = [
  "some",
  "come",
  "were",
  "your",
  "school",
  "where",
  "said",
  "are",
  "house",
  "friend",
];

const maths = [
  { tens: 2, ones: 1 },
  { tens: 1, ones: 5 },
  { tens: 3, ones: 4 },
  { tens: 4, ones: 5 },
  { tens: 6, ones: 2 },
];

const extras = "abcdefghijklmnopqrstuvwxyz";
const app = document.querySelector("#app");

let index = 0;
let covered = false;
let listening = false;
let typed = "";
let tiles = [];
let timers = [];
let mathsIndex = 0;
let tensGuess = "";
let onesGuess = "";
let mathsField = "tens";
let view = "home";
let count = 0;
let pulsing = false;

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

  const hasFile = words.indexOf(text) !== -1;
  if (hasFile) {
    const audio = new Audio("/austin-homework/sounds/" + text + ".mp3");
    audio.playsInline = true;
    const play = audio.play();
    if (play && play.catch) play.catch(function () {});
  }
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

function cubes(n, kind) {
  return Array.from({ length: n }, () =>
    kind === "ten" ? `<span class="rod"></span>` : `<span class="cube"></span>`
  ).join("");
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

function draw() {
  if (view === "home") {
    app.innerHTML = `
      <main class="card">
        <p class="week">Austin</p>
        <h1 class="word">Homework</h1>
        <p class="progress">Pick one</p>
        <div class="big next" data-act="spell">Spellings</div>
        <div class="big next-word" data-act="maths">Maths</div>
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
        <p class="week">Spellings</p>
        <p class="progress">Word ${index + 1} of ${words.length}</p>
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

  const q = maths[mathsIndex];
  const canCheck = tensGuess !== "" && onesGuess !== "";
  app.innerHTML = `
    <main class="card">
      <p class="week">Make and Count</p>
      <p class="progress">Question ${mathsIndex + 1} of ${maths.length}</p>
      <div class="build">
        <div class="rods">${cubes(q.tens, "ten")}</div>
        <div class="ones">${cubes(q.ones, "one")}</div>
      </div>
      <p class="sum-line ${mathsField === "tens" ? "on" : ""}">
        There ${q.tens === 1 ? "is" : "are"}
        <span class="blank">${tensGuess || "?"}</span>
        ${q.tens === 1 ? "ten" : "tens"}.
      </p>
      <p class="sum-line ${mathsField === "ones" ? "on" : ""}">
        There ${q.ones === 1 ? "is" : "are"}
        <span class="blank">${onesGuess || "?"}</span>
        ${q.ones === 1 ? "one" : "ones"}.
      </p>
      <p id="result"></p>
      <div class="row">
        <div class="big" data-act="tens">Tens</div>
        <div class="big" data-act="ones">Ones</div>
      </div>
      <div class="tiles">
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
          .map((n) => `<div class="tile num" data-act="num" data-val="${n}">${n}</div>`)
          .join("")}
      </div>
      <div class="big next ${canCheck ? "" : "off"}" data-act="check-maths">Check</div>
      <div class="row">
        <div class="big" data-act="clear">Clear</div>
        <div class="big next-word" data-act="next-maths">Next</div>
      </div>
      <div class="big" data-act="home">Home</div>
    </main>
  `;
}

function handle(act, val) {
  if (!act) return;

  if (act === "home") {
    view = "home";
    clearTimers();
    draw();
    return;
  }
  if (act === "spell") {
    view = "spell";
    index = 0;
    startSequence();
    return;
  }
  if (act === "maths") {
    view = "maths";
    mathsIndex = 0;
    tensGuess = "";
    onesGuess = "";
    mathsField = "tens";
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
      result.textContent = "Yes! Well done";
      result.className = "ok";
      speak("Well done");
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
    index = (index + 1) % words.length;
    startSequence();
    return;
  }
  if (act === "tens") {
    mathsField = "tens";
    draw();
    return;
  }
  if (act === "ones") {
    mathsField = "ones";
    draw();
    return;
  }
  if (act === "num") {
    if (mathsField === "tens") tensGuess = val;
    else onesGuess = val;
    draw();
    return;
  }
  if (act === "check-maths") {
    const q = maths[mathsIndex];
    const result = document.querySelector("#result");
    if (Number(tensGuess) === q.tens && Number(onesGuess) === q.ones) {
      result.textContent = "Yes! Well done";
      result.className = "ok";
      speak("Well done");
    } else {
      result.textContent = "Try again";
      result.className = "no";
    }
    return;
  }
  if (act === "clear") {
    tensGuess = "";
    onesGuess = "";
    mathsField = "tens";
    draw();
    return;
  }
  if (act === "next-maths") {
    mathsIndex = (mathsIndex + 1) % maths.length;
    tensGuess = "";
    onesGuess = "";
    mathsField = "tens";
    draw();
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