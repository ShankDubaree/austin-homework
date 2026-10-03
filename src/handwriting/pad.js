// The writing pad: lined paper on a <canvas>, the grey letter to trace with start dots
// and arrows, the animated "Watch" pen, and finger / stylus / mouse input.
//
// Austin's ink is kept here in letter units (not pixels), outside the page HTML,
// so if the screen is redrawn or the device is rotated the pad simply repaints it.

import { LETTERS, LINES, letterBounds, resample, strokeLength } from "./letters.js";

const TOP_MARGIN = 8, BOTTOM_MARGIN = 8;
const SPAN = LINES.tail - LINES.top + TOP_MARGIN + BOTTOM_MARGIN;

const state = {
  letter: null,
  strokes: [], // Austin's strokes, letter units
  phase: "trace", // "watch" | "trace" | "done"
  watchStroke: 0,
  watchDist: 0,
};

let canvas = null, ctx = null, geo = null, raf = 0, endTimer = 0, observer = null;
let activeId = null, penSeen = false;
let hooks = {};

function computeGeo() {
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, rect.width), h = Math.max(1, rect.height);
  const b = letterBounds(state.letter);
  // Fit the four lines to the height; on very narrow pads, fit the letter width too.
  const s = Math.min(h / SPAN, (w * 0.8) / Math.max(40, b.maxX - b.minX + 30));
  const ox = w / 2 - ((b.minX + b.maxX) / 2) * s;
  const oy = (h - SPAN * s) / 2 + TOP_MARGIN * s;
  return { w, h, s, ox, oy };
}

function resize() {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  geo = computeGeo();
  canvas.width = Math.round(geo.w * dpr);
  canvas.height = Math.round(geo.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  canvas.dataset.scale = geo.s.toFixed(4);
  canvas.dataset.ox = geo.ox.toFixed(2);
  canvas.dataset.oy = geo.oy.toFixed(2);
  render();
}

const X = (x) => geo.ox + x * geo.s;
const Y = (y) => geo.oy + y * geo.s;

function path(points) {
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))));
}

function drawLines() {
  ctx.fillStyle = "#fffaf0";
  ctx.fillRect(0, 0, geo.w, geo.h);
  const row = (y, color, width, dash) => {
    ctx.beginPath();
    ctx.setLineDash(dash);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.moveTo(0, Y(y)); ctx.lineTo(geo.w, Y(y));
    ctx.stroke();
  };
  row(LINES.top, "#a9bde6", 2, []);
  row(LINES.mid, "#7f9be0", 2, [10, 8]);
  row(LINES.base, "#c41e3a", 3, []);
  row(LINES.tail, "#a9bde6", 2, []);
  ctx.setLineDash([]);
}

function arrowHead(x, y, dx, dy, size) {
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  ctx.beginPath();
  ctx.moveTo(x + ux * size, y + uy * size);
  ctx.lineTo(x - ux * size * 0.6 - uy * size * 0.75, y - uy * size * 0.6 + ux * size * 0.75);
  ctx.lineTo(x - ux * size * 0.6 + uy * size * 0.75, y - uy * size * 0.6 - ux * size * 0.75);
  ctx.closePath();
  ctx.fill();
}

function drawGuide() {
  const strokes = LETTERS[state.letter].strokes;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // Wide grey letter to trace over, with a dotted centre line.
  for (const s of strokes) {
    path(s);
    ctx.strokeStyle = "rgba(11, 27, 74, 0.14)";
    ctx.lineWidth = Math.max(14, 11 * geo.s);
    ctx.stroke();
  }
  for (const s of strokes) {
    path(s);
    ctx.setLineDash([2, 7]);
    ctx.strokeStyle = "rgba(11, 27, 74, 0.45)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // Direction arrows, set just beside the line (on the right-hand side of travel)
  // so "down then back up" strokes show both arrows.
  const placed = [];
  ctx.fillStyle = "#e8590c";
  strokes.forEach((s) => {
    if (strokeLength(s) < 12) return;
    const pts = resample(s, 1);
    // Short strokes (like the cross on t) get one arrow in the middle; longer ones get a few.
    const spots = [];
    if (pts.length < 50) spots.push(Math.floor(pts.length / 2));
    else for (let d = 22; d < pts.length - 6; d += 42) spots.push(d);
    for (const d of spots) {
      const [x0, y0] = pts[d - 3], [x1, y1] = pts[d + 3];
      const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
      const ax = pts[d][0] + (-dy / len) * 10, ay = pts[d][1] + (dx / len) * 10;
      if (placed.some(([px, py]) => Math.hypot(px - ax, py - ay) < 14)) continue;
      placed.push([ax, ay]);
      arrowHead(X(ax), Y(ay), dx, dy, Math.max(7, 5 * geo.s));
    }
  });
  // Numbered start dots (green), drawn last so they sit on top.
  strokes.forEach((s, i) => {
    const r = Math.max(10, 7 * geo.s);
    ctx.beginPath();
    ctx.arc(X(s[0][0]), Y(s[0][1]), r, 0, Math.PI * 2);
    ctx.fillStyle = "#1fae4b";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = `800 ${Math.round(r * 1.25)}px "Trebuchet MS", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), X(s[0][0]), Y(s[0][1]) + 1);
  });
}

function drawInk() {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#0b1b4a";
  ctx.lineWidth = Math.max(5, 5 * geo.s);
  for (const s of state.strokes) {
    if (s.length === 1) {
      ctx.beginPath();
      ctx.arc(X(s[0][0]), Y(s[0][1]), ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = "#0b1b4a";
      ctx.fill();
    } else {
      path(s);
      ctx.stroke();
    }
  }
}

function drawWatch() {
  const strokes = LETTERS[state.letter].strokes.map((s) => resample(s, 1));
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#c41e3a";
  ctx.lineWidth = Math.max(6, 6 * geo.s);
  let tip = null;
  strokes.forEach((s, i) => {
    if (i > state.watchStroke) return;
    const n = i < state.watchStroke ? s.length : Math.min(s.length, Math.floor(state.watchDist) + 1);
    const part = s.slice(0, Math.max(1, n));
    if (part.length > 1) { path(part); ctx.stroke(); }
    if (i === state.watchStroke) tip = part[part.length - 1];
  });
  if (tip) {
    // A pencil tip that moves along the letter.
    ctx.beginPath();
    ctx.arc(X(tip[0]), Y(tip[1]), Math.max(9, 6 * geo.s), 0, Math.PI * 2);
    ctx.fillStyle = "#f4d35e";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0b1b4a";
    ctx.stroke();
  }
}

function render() {
  if (!ctx || !geo || !state.letter) return;
  ctx.clearRect(0, 0, geo.w, geo.h);
  drawLines();
  drawGuide();
  if (state.phase === "watch") drawWatch();
  else drawInk();
}

function toUnits(e) {
  const rect = canvas.getBoundingClientRect();
  return [(e.clientX - rect.left - geo.ox) / geo.s, (e.clientY - rect.top - geo.oy) / geo.s];
}

function onDown(e) {
  if (e.pointerType === "pen") penSeen = true;
  if (penSeen && e.pointerType === "touch") return; // ignore a resting palm once a stylus is used
  if (activeId !== null) return;
  e.preventDefault();
  if (state.phase === "watch") stopWatch();
  if (state.phase === "done") { state.strokes = []; state.phase = "trace"; hooks.onRestart && hooks.onRestart(); }
  activeId = e.pointerId;
  try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  state.strokes.push([toUnits(e)]);
  render();
}

function onMove(e) {
  if (e.pointerId !== activeId) return;
  e.preventDefault();
  const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
  const stroke = state.strokes[state.strokes.length - 1];
  for (const ev of events.length ? events : [e]) {
    const p = toUnits(ev);
    const last = stroke[stroke.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) >= 0.8) stroke.push(p);
  }
  render();
}

function onUp(e) {
  if (e.pointerId !== activeId) return;
  activeId = null;
  render();
  hooks.onStroke && hooks.onStroke(state.strokes.length);
}

const block = (e) => e.preventDefault();

// Attach the pad to a freshly rendered <canvas>. Keeps any ink already drawn for this letter.
export function mount(el, letter, options = {}) {
  unmount();
  if (state.letter !== letter) { state.letter = letter; state.strokes = []; state.phase = "trace"; }
  hooks = options;
  canvas = el;
  ctx = canvas.getContext("2d");
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("contextmenu", block);
  canvas.addEventListener("touchstart", block, { passive: false });
  if (window.ResizeObserver) { observer = new ResizeObserver(resize); observer.observe(canvas); }
  window.addEventListener("resize", resize);
  resize();
}

export function unmount() {
  cancelAnimationFrame(raf);
  clearTimeout(endTimer);
  raf = 0; endTimer = 0;
  if (state.phase === "watch") state.phase = "trace";
  if (observer) { observer.disconnect(); observer = null; }
  window.removeEventListener("resize", resize);
  if (canvas) {
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    canvas.removeEventListener("contextmenu", block);
    canvas.removeEventListener("touchstart", block);
  }
  canvas = null; ctx = null; activeId = null;
}

// Start fresh on a letter (used when a letter is opened).
export function reset(letter) {
  state.letter = letter;
  state.strokes = [];
  state.phase = "trace";
}

export function clear() {
  stopWatch();
  state.strokes = [];
  state.phase = "trace";
  render();
}

export function finish() { state.phase = "done"; render(); }
export function strokes() { return state.strokes.map((s) => s.map((p) => [...p])); }
export function scale() { return geo ? geo.s : 1; }
export function isWatching() { return state.phase === "watch"; }

function stopWatch() {
  cancelAnimationFrame(raf);
  clearTimeout(endTimer);
  raf = 0; endTimer = 0;
  if (state.phase === "watch") { state.phase = "trace"; render(); hooks.onWatchEnd && hooks.onWatchEnd(); }
}

// Animate a pen writing the letter, stroke by stroke. Speed is in letter units per second.
export function watch(speed = 95) {
  if (!canvas) return;
  cancelAnimationFrame(raf);
  clearTimeout(endTimer);
  state.strokes = [];
  state.phase = "watch";
  state.watchStroke = 0;
  state.watchDist = 0;
  const strokes = LETTERS[state.letter].strokes.map((s) => resample(s, 1));
  let last = performance.now(), pause = 350;
  const step = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (pause > 0) pause -= dt * 1000;
    else {
      state.watchDist += speed * dt;
      if (state.watchDist >= strokes[state.watchStroke].length) {
        if (state.watchStroke >= strokes.length - 1) {
          render();
          endTimer = setTimeout(() => { endTimer = 0; stopWatch(); }, 700);
          return;
        }
        state.watchStroke += 1;
        state.watchDist = 0;
        pause = 450;
      }
    }
    render();
    raf = requestAnimationFrame(step);
  };
  render();
  raf = requestAnimationFrame(step);
}
