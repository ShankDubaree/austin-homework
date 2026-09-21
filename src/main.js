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

function clearTimers() {
  timers.forEach((id) => clearTimeout(id));
  timers = [];
  speechSynthesis.cancel();
}

function later(ms, fn) {
  timers.push(setTimeout(fn, ms));
}

function speak(text) {
  try {
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
  drawSpelling();

  later(5000, () => {
    speak(word);
    later(2000, () => {
      speak(word);
      later(2000, () => {
        speak(word);
        later(1200, () => {
          covered = true;
          listening = false;
          drawSpelling();
        });
      });
    });
  });
}

function cubes(count, kind) {
  return Array.from({ length: count }, () =>
    kind === "ten" ? `<span class="rod"></span>` : `<span class="cube"></span>`
  ).join("");
}

function drawHome() {
  clearTimers();
  app.innerHTML = `
    <main class="card">
      <p class="week">Austin</p>
      <h1 class="word">Homework</h1>
      <p class="progress">Pick one</p>
      <a class="big next" href="#spell">Spellings</a>
      <a class="big next-word" href="#maths">Maths</a>
    </main>
  `;
}

function drawSpelling() {
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
            (letter, i) =>
              `<a class="tile ${canType ? "" : "off"}" href="#spell/l/${i}/${letter}">${letter}</a>`
          )
          .join("")}
      </div>
      <a class="big next ${canCheck ? "" : "off"}" href="#spell/check">Check</a>
      <div class="row">
        <a class="big" href="#spell/again">Again</a>
        <a class="big next-word" href="#spell/next">Next word</a>
      </div>
      <a class="big" href="#home">Home</a>
    </main>
  `;
}

function drawMaths() {
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
        <a class="big" href="#maths/tens">Tens</a>
        <a class="big" href="#maths/ones">Ones</a>
      </div>
      <div class="tiles">
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
          .map((n) => `<a class="tile num" href="#maths/n/${n}">${n}</a>`)
          .join("")}
      </div>
      <a class="big next ${canCheck ? "" : "off"}" href="#maths/check">Check</a>
      <div class="row">
        <a class="big" href="#maths/clear">Clear</a>
        <a class="big next-word" href="#maths/next">Next</a>
      </div>
      <a class="big" href="#home">Home</a>
    </main>
  `;
}

function route() {
  const hash = (location.hash || "#home").replace(/^#/, "");
  const parts = hash.split("/");

  if (parts[0] === "spell") {
    if (parts[1] === "l" && covered && !listening) {
      typed += parts[3] || "";
      history.replaceState(null, "", "#spell");
      drawSpelling();
      return;
    }
    if (parts[1] === "check") {
      const word = words[index];
      history.replaceState(null, "", "#spell");
      drawSpelling();
      const result = document.querySelector("#result");
      if (typed === word) {
        result.textContent = "Yes! Well done";
        result.className = "ok";
        speak("Well done");
      } else {
        typed = "";
        tiles = makeTiles(word);
        drawSpelling();
        document.querySelector("#result").textContent = "Try again";
        document.querySelector("#result").className = "no";
      }
      return;
    }
    if (parts[1] === "again") {
      history.replaceState(null, "", "#spell");
      startSequence();
      return;
    }
    if (parts[1] === "next") {
      index = (index + 1) % words.length;
      history.replaceState(null, "", "#spell");
      startSequence();
      return;
    }
    startSequence();
    return;
  }

  if (parts[0] === "maths") {
    if (parts[1] === "tens") mathsField = "tens";
    if (parts[1] === "ones") mathsField = "ones";
    if (parts[1] === "n") {
      if (mathsField === "tens") tensGuess = parts[2];
      else onesGuess = parts[2];
    }
    if (parts[1] === "clear") {
      tensGuess = "";
      onesGuess = "";
      mathsField = "tens";
    }
    if (parts[1] === "next") {
      mathsIndex = (mathsIndex + 1) % maths.length;
      tensGuess = "";
      onesGuess = "";
      mathsField = "tens";
    }
    if (parts[1] === "check") {
      history.replaceState(null, "", "#maths");
      drawMaths();
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
    history.replaceState(null, "", "#maths");
    drawMaths();
    return;
  }

  drawHome();
}

window.addEventListener("hashchange", route);
window.addEventListener("load", route);
route();