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

let screen = "home";
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

function clearTimers() {
  timers.forEach((id) => clearTimeout(id));
  timers = [];
  speechSynthesis.cancel();
}

function later(ms, fn) {
  timers.push(setTimeout(fn, ms));
}

function speak(text) {
  const say = new SpeechSynthesisUtterance(text);
  say.rate = 0.75;
  speechSynthesis.speak(say);
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

function startSpelling() {
  screen = "spelling";
  index = 0;
  startSequence(words[0]);
}

function startSequence(word) {
  clearTimers();
  covered = false;
  listening = true;
  typed = "";
  tiles = makeTiles(word);
  render();

  later(5000, () => {
    speak(word);
    later(2000, () => {
      speak(word);
      later(2000, () => {
        speak(word);
        later(1200, () => {
          covered = true;
          listening = false;
          render();
        });
      });
    });
  });
}

function startMaths() {
  clearTimers();
  screen = "maths";
  mathsIndex = 0;
  tensGuess = "";
  onesGuess = "";
  mathsField = "tens";
  render();
}

function cubes(count, kind) {
  return Array.from({ length: count }, () =>
    kind === "ten" ? `<span class="rod"></span>` : `<span class="cube"></span>`
  ).join("");
}

function renderHome() {
  app.innerHTML = `
    <main class="card">
      <p class="week">Austin</p>
      <h1 class="word">Homework</h1>
      <p class="progress">Pick one</p>
      <button class="big next" id="spell">Spellings</button>
      <button class="big next-word" id="maths">Maths</button>
    </main>
  `;
  document.querySelector("#spell").onclick = startSpelling;
  document.querySelector("#maths").onclick = startMaths;
}

function renderSpelling() {
  const word = words[index];
  const canType = covered && !listening;
  const canCheck = canType && typed.length > 0;

  app.innerHTML = `
    <main class="card">
      <p class="week">Spellings</p>
      <p class="progress">Word ${index + 1} of ${words.length}</p>
      <h1 class="word">${covered ? "⭐".repeat(Math.min(word.length, 6)) : word}</h1>
      <div class="answer">${typed || (canType ? "tap the letters" : "watch and listen")}</div>
      <p id="result"></p>
      <div class="tiles">
        ${tiles
          .map(
            (letter) =>
              `<button class="tile" ${canType ? "" : "disabled"}>${letter}</button>`
          )
          .join("")}
      </div>
      <button class="big next" id="check" ${canCheck ? "" : "disabled"}>Check</button>
      <div class="row">
        <button class="big" id="again">Again</button>
        <button class="big next-word" id="next">Next word</button>
      </div>
      <button class="big" id="home">Home</button>
    </main>
  `;

  document.querySelectorAll(".tile").forEach((button) => {
    button.onclick = () => {
      if (!canType) return;
      typed += button.textContent;
      render();
    };
  });

  document.querySelector("#check").onclick = () => {
    if (!canCheck) return;
    const result = document.querySelector("#result");
    if (typed === word) {
      result.textContent = "Yes! Well done";
      result.className = "ok";
      speak("Well done");
    } else {
      typed = "";
      tiles = makeTiles(word);
      render();
      document.querySelector("#result").textContent = "Try again";
      document.querySelector("#result").className = "no";
    }
  };

  document.querySelector("#again").onclick = () => startSequence(word);
  document.querySelector("#next").onclick = () => {
    index = (index + 1) % words.length;
    startSequence(words[index]);
  };
  document.querySelector("#home").onclick = () => {
    clearTimers();
    screen = "home";
    render();
  };
}

function renderMaths() {
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
        <button class="big" id="pick-tens">Tens</button>
        <button class="big" id="pick-ones">Ones</button>
      </div>
      <div class="tiles">
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
          .map((n) => `<button class="tile num">${n}</button>`)
          .join("")}
      </div>
      <button class="big next" id="check" ${canCheck ? "" : "disabled"}>Check</button>
      <div class="row">
        <button class="big" id="clear">Clear</button>
        <button class="big next-word" id="next">Next</button>
      </div>
      <button class="big" id="home">Home</button>
    </main>
  `;

  document.querySelector("#pick-tens").onclick = () => {
    mathsField = "tens";
    render();
  };
  document.querySelector("#pick-ones").onclick = () => {
    mathsField = "ones";
    render();
  };

  document.querySelectorAll(".num").forEach((button) => {
    button.onclick = () => {
      if (mathsField === "tens") tensGuess = button.textContent;
      else onesGuess = button.textContent;
      render();
    };
  });

  document.querySelector("#check").onclick = () => {
    const result = document.querySelector("#result");
    if (Number(tensGuess) === q.tens && Number(onesGuess) === q.ones) {
      result.textContent = "Yes! Well done";
      result.className = "ok";
      speak("Well done");
    } else {
      result.textContent = "Try again";
      result.className = "no";
    }
  };

  document.querySelector("#clear").onclick = () => {
    tensGuess = "";
    onesGuess = "";
    mathsField = "tens";
    render();
  };

  document.querySelector("#next").onclick = () => {
    mathsIndex = (mathsIndex + 1) % maths.length;
    tensGuess = "";
    onesGuess = "";
    mathsField = "tens";
    render();
  };

  document.querySelector("#home").onclick = () => {
    screen = "home";
    render();
  };
}

function render() {
  if (screen === "home") renderHome();
  else if (screen === "spelling") renderSpelling();
  else renderMaths();
}

render();