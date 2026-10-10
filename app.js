import { firebaseConfig } from "./firebase-config.js";
import { createDemoStore, createFirebaseStore } from "./store.js";
import { burst, celebrate } from "./celebrate.js";

const DEMO = !firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("PASTE");

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// The sprint on screen. Every edge in a sprint file blocks: hard / file /
// decision(start) block the start, soft / decision(finish) block the finish,
// and the board treats both as red.
let SPRINTS = [];           // from sprints/index.json
let sprintId = null;
let PLAN = { rows: [], tasks: {}, edges: [] };
let incoming = new Map();
let outgoing = new Map();
let storyOf = new Map();
let ALL_IDS = [];
let MUST_IDS = [];

function setPlan(plan) {
  PLAN = plan;
  incoming = new Map();
  outgoing = new Map();
  storyOf = new Map();
  for (const id of Object.keys(PLAN.tasks)) { incoming.set(id, []); outgoing.set(id, []); }
  for (const e of PLAN.edges) { incoming.get(e.to).push(e); outgoing.get(e.from).push(e); }
  for (const row of PLAN.rows) for (const id of row.children) storyOf.set(id, row);
  ALL_IDS = Object.keys(PLAN.tasks);
  MUST_IDS = ALL_IDS.filter((id) => PLAN.tasks[id].prio !== "stretch");
}

// Small localStorage helpers, scoped to the current sprint where it matters.
const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private window */ } };
const sprintKey = (name) => `tracker-${name}:${sprintId}`;

let store = null;
let user = null;
let state = new Map();
let live = false;          // true once we receive data we are allowed to see
let unsubscribe = null;
let tipFor = null;          // task ID the tooltip shows
let tipPinned = false;
let lastPointer = "mouse";
let sweeping = false;        // the debug "fill the progress bar" demo is running
let prevStatus = new Map();  // for the pop animation when a box changes colour
let prevLevel = null;       // celebration level at the last render (null = no live data yet)

const LEVELS = ["none", "victory", "ultra"];

const isDone = (id) => state.get(id)?.status === "done";

function info(id) {
  const s = state.get(id);
  const unmet = incoming.get(id).filter((e) => !isDone(e.from));
  const waiting = outgoing.get(id).filter((e) => !isDone(e.to));
  let status;
  if (s?.status === "done") status = "done";
  else if (s?.status === "in-progress") status = "progress";
  else if (unmet.length) status = "blocked";
  else status = "free";
  // The warning sign marks free tasks that other open tasks wait on.
  return { status, rec: s, unmet, waiting, blocking: status === "free" && waiting.length > 0 };
}

const STATUS_LABEL = { blocked: "Blocked", free: "Free", progress: "In progress", done: "Done" };

// ---------- board ----------

function buildBoard() {
  const cols = Math.max(...PLAN.rows.map((r) => r.children.length));
  let html = `<thead><tr><th class="corner" scope="col"><span>Issue</span><span>Sub-issue →</span></th>`;
  for (let i = 1; i <= cols; i++) html += `<th scope="col" class="colhead"><span>${i}</span></th>`;
  html += `</tr></thead><tbody>`;
  let n = 0;
  for (const row of PLAN.rows) {
    html += `<tr data-row="${esc(row.id)}"><th scope="row" class="rowhead${row.prio === "stretch" ? " stretch" : ""}">
      <span class="rtop"><span class="rid">${esc(row.id)}</span><span class="rtitle">${esc(row.title)}</span></span>
      <span class="rprog"><span class="rbar"><i></i></span><span class="rcount"></span></span></th>`;
    for (let i = 0; i < cols; i++) {
      const id = row.children[i];
      html += id
        ? `<td><button type="button" class="box" data-id="${esc(id)}" style="--i:${n++}" aria-describedby="tip"></button></td>`
        : `<td class="empty"></td>`;
    }
    html += `</tr>`;
  }
  $("board").innerHTML = html + `</tbody>`;
}

function renderBoard() {
  const counts = { blocked: 0, free: 0, progress: 0, done: 0 };
  for (const btn of document.querySelectorAll(".board .box")) {
    const id = btn.dataset.id;
    const t = PLAN.tasks[id];
    const { status, rec, unmet, blocking } = info(id);
    counts[status]++;
    const mine = rec && user && rec.uid === user.uid;
    btn.className = `box s-${status}` +
      (blocking ? " blocking" : "") +
      (mine && status === "progress" ? " mine" : "") +
      (status === "progress" && unmet.length ? " stale" : "") +
      (t.prio === "stretch" ? " stretch" : "");
    if (live && prevStatus.has(id) && prevStatus.get(id) !== status) {
      btn.classList.add("pop");
      btn.addEventListener("animationend", () => btn.classList.remove("pop"), { once: true });
    }
    if (live) prevStatus.set(id, status);
    btn.innerHTML = `<span class="bid">${esc(id)}</span>` +
      (status === "progress" ? `<span class="who">${esc(mine ? "you" : rec.name)}</span>` : "") +
      (blocking ? `<span class="warn" aria-hidden="true"></span>` : "");
    btn.setAttribute("aria-label", `${id}: ${t.title}. ${STATUS_LABEL[status]}` +
      (status === "progress" ? `, ${rec.name}` : "") + (blocking ? ", other tasks wait on it" : ""));
  }
  for (const tr of document.querySelectorAll(".board tbody tr")) {
    const row = PLAN.rows.find((r) => r.id === tr.dataset.row);
    const done = row.children.filter(isDone).length;
    tr.querySelector(".rbar i").style.width = `${(100 * done) / row.children.length}%`;
    tr.querySelector(".rcount").textContent = `${done}/${row.children.length}`;
    tr.classList.toggle("complete", live && done === row.children.length);
  }
  renderProgress(counts);
  if (tipFor) renderTip();
}

// ---------- progress and celebrations ----------

function renderProgress(counts) {
  if (sweeping) return;       // the debug demo owns the bar for a few seconds
  const total = ALL_IDS.length;
  const pct = live ? Math.round((100 * counts.done) / total) : 0;
  $("pct").textContent = live ? pct : "–";
  // One rounded bar holding two bands: done, then in progress. The done band's
  // gradient is scaled to the whole track so a short bar shows its start, not
  // the full gradient squeezed in.
  const done = live ? counts.done : 0;
  const filled = done + (live ? counts.progress : 0);
  // A bar with anything in it is at least as wide as it is tall, so a single
  // task shows as a round stub rather than an oval.
  $("barValue").style.width = filled ? `max(var(--bar-h), ${(100 * filled) / total}%)` : "0%";
  $("barDone").style.width = filled ? `${(100 * done) / filled}%` : "0%";
  $("barProg").style.width = filled ? `${(100 * (filled - done)) / filled}%` : "0%";
  $("barDone").style.setProperty("--track-scale", done ? String(total / done) : "1");
  $("bar").setAttribute("aria-valuenow", String(pct));
  $("bar").classList.toggle("full", live && counts.done === total);
  $("progressMeta").textContent = live
    ? `${counts.done} of ${total} tasks done${counts.progress ? ` · ${counts.progress} in progress` : ""}`
    : "Sign in to see progress";

  const mustDone = MUST_IDS.filter(isDone).length;
  $("goalMustCount").textContent = `${live ? mustDone : 0}/${MUST_IDS.length}`;
  $("goalAllCount").textContent = `${live ? counts.done : 0}/${total}`;
  const level = !live ? 0 : counts.done === total ? 2 : mustDone === MUST_IDS.length ? 1 : 0;
  $("goalMust").disabled = level < 1;
  $("goalAll").disabled = level < 2;
  $("goalMust").classList.toggle("won", level >= 1);
  $("goalAll").classList.toggle("won", level >= 2);
  $("goalMust").title = level >= 1 ? "Play the victory again" : "Finish every must-have task";
  $("goalAll").title = level >= 2 ? "Play the ultra victory again" : "Finish every task, stretch included";

  for (const [k, n] of Object.entries({ Blocked: counts.blocked, Free: counts.free, Progress: counts.progress, Done: counts.done })) {
    $(`n${k}`).textContent = live ? n : "–";
  }

  if (live) checkVictory(level);
}

// Plays when the board reaches a new level while you watch, or on load if this
// browser hasn't seen that level yet. Reopening a task lowers the level, so
// finishing again celebrates again.
function checkVictory(level) {
  const seen = Number(lsGet(sprintKey("celebrated"))) || 0;
  const reached = prevLevel === null ? level > seen : level > prevLevel;
  if (reached && level > 0) celebrate(LEVELS[level]);
  prevLevel = level;
  lsSet(sprintKey("celebrated"), String(level));
  if (level > readUnlocked()) {
    lsSet(sprintKey("unlocked"), String(level));
    renderReplays(true);
  }
}

// Replay buttons appear once a sprint's celebration has been unlocked in this
// browser, and stay even if a task is reopened later.
function readUnlocked() {
  return Number(lsGet(sprintKey("unlocked"))) || 0;
}

function renderReplays(fresh = false) {
  const unlocked = readUnlocked();
  for (const [el, need] of [[$("replayVictory"), 1], [$("replayUltra"), 2]]) {
    const show = unlocked >= need;
    if (show && el.hidden && fresh) {
      el.classList.add("fresh");
      el.addEventListener("animationend", () => el.classList.remove("fresh"), { once: true });
    }
    el.hidden = !show;
  }
}

// ---------- theme ----------

const THEMES = ["auto", "light", "dark"];
const THEME_ICON = { auto: "🌗", light: "☀️", dark: "🌙" };

function applyTheme(t) {
  if (t === "auto") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  const btn = $("themeBtn");
  btn.textContent = THEME_ICON[t];
  btn.setAttribute("aria-label", `Theme: ${t}. Click to change`);
  btn.title = `Theme: ${t}`;
}

function currentTheme() {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "auto";
}

function cycleTheme() {
  const next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
  applyTheme(next);
  try { localStorage.setItem("tracker-theme", next); } catch { /* ignore */ }
}

// ---------- tooltip ----------

function fmtTime(v) {
  if (!v) return "";
  const d = typeof v.toDate === "function" ? v.toDate() : new Date(v);
  return d.toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" });
}

function kindChip(e) {
  const label = e.kind === "decision" ? `decision · ${e.blocks}` : e.kind;
  return `<span class="chip k-${esc(e.kind)}">${esc(label)}</span>`;
}

function edgeLine(e, otherId, met) {
  const other = PLAN.tasks[otherId];
  return `<li class="${met ? "met" : ""}">
    <span class="mark">${met ? "✓" : "✗"}</span>
    <span class="eid">${esc(otherId)}</span>${kindChip(e)}
    <span class="etitle">${esc(other.title)}</span>
    <span class="reason">${esc(e.reason)}</span></li>`;
}

function renderTip() {
  const id = tipFor;
  const t = PLAN.tasks[id];
  const row = storyOf.get(id);
  const { status, rec, unmet } = info(id);
  const ins = incoming.get(id);
  const outs = outgoing.get(id);
  const meta = [
    `Issue ${row.id}: ${row.title}`,
    t.alias ? `= ${t.alias}` : "",
    t.size ? `size ${t.size}` : "",
    t.window[0] ? `planned Day ${t.window[0]}${t.window[1] !== t.window[0] ? "–" + t.window[1] : ""}` : "",
    t.prio === "stretch" ? "stretch" : "",
    t.github ? `GitHub ${t.github}` : "",
  ].filter(Boolean).map(esc).join(" · ");

  let html = `<div class="tip-head"><span class="tip-id">${esc(id)}</span>
    <span class="tip-status s-${status}">${STATUS_LABEL[status]}</span></div>
    <div class="tip-title">${esc(t.title)}</div>
    <div class="tip-meta">${meta}</div>`;
  if (t.existing) html += `<div class="tip-meta">Existing work: ${esc(t.existing)}</div>`;

  html += `<div class="tip-sec">Blocked by</div>` + (ins.length
    ? `<ul class="edges">${ins.map((e) => edgeLine(e, e.from, isDone(e.from))).join("")}</ul>`
    : `<p class="none">Nothing</p>`);
  html += `<div class="tip-sec">Blocks</div>` + (outs.length
    ? `<ul class="edges">${outs.map((e) => edgeLine(e, e.to, isDone(e.to))).join("")}</ul>`
    : `<p class="none">Nothing</p>`);

  if (t.files.length) {
    html += `<div class="tip-sec">Touched files</div>
      <ul class="files">${t.files.map((f) => `<li>${esc(f).replaceAll("/", "/<wbr>")}</li>`).join("")}</ul>`;
  }

  if (status === "progress") {
    html += `<div class="tip-who">${esc(rec.name)} took it ${esc(fmtTime(rec.startedAt))}</div>`;
    if (unmet.length) html += `<div class="tip-who stale">A blocker was reopened after this was taken.</div>`;
  } else if (status === "done") {
    html += `<div class="tip-who">Done by ${esc(rec.name)} ${esc(fmtTime(rec.doneAt))}</div>`;
  }

  if (tipPinned) html += actionsHtml(id, status, rec);
  const tip = $("tip");
  tip.innerHTML = html;
  tip.classList.toggle("pinned", tipPinned);
  tip.dataset.status = status;
}

function actionsHtml(id, status, rec) {
  const b = (act, label, cls = "") => `<button type="button" class="btn ${cls}" data-act="${act}" data-id="${esc(id)}">${label}</button>`;
  let out = "";
  if (!live) out = b("signin", "Sign in with Google", "primary");
  else if (status === "free") out = b("claim", "Start working on it", "primary");
  else if (status === "progress" && rec.uid === user?.uid) out = b("finish", "Mark done", "primary") + b("release", "Release");
  else if (status === "done") out = b("reopen", "Reopen");
  return `<div class="tip-actions">${out}${b("close", "Close", "ghost")}</div>`;
}

function placeTip(anchor) {
  const tip = $("tip");
  tip.hidden = false;
  const r = anchor.getBoundingClientRect();
  const w = tip.offsetWidth, h = tip.offsetHeight;
  const vw = document.documentElement.clientWidth, vh = window.innerHeight;
  let left, top;
  if (r.right + 10 + w <= vw - 8) left = r.right + 10;          // right of the box
  else if (r.left - 10 - w >= 8) left = r.left - w - 10;        // left of the box
  if (left !== undefined) {
    top = r.top + r.height / 2 - h / 2;
  } else {                                                      // narrow screen: below or above
    left = Math.max(8, Math.min(vw - w - 8, r.left + r.width / 2 - w / 2));
    top = r.bottom + 10 + h <= vh ? r.bottom + 10 : r.top - h - 10;
  }
  tip.style.left = `${left}px`;
  tip.style.top = `${Math.max(8, Math.min(vh - h - 8, top))}px`;
}

function showTip(btn, pinned) {
  tipFor = btn.dataset.id;
  tipPinned = pinned;
  renderTip();
  placeTip(btn);
}

function hideTip() {
  tipFor = null;
  tipPinned = false;
  $("tip").hidden = true;
}

// ---------- actions ----------

let toastTimer;
function toast(msg, bad = false) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.toggle("bad", bad);
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 3500);
}

async function run(act, id) {
  try {
    if (act === "signin") return await signIn();
    if (act === "close") return hideTip();
    if (!live || !user) return toast("Sign in first", true);
    if (act === "claim") { await store.claim(sprintId, id, user); toast(`${id} is yours`); }
    if (act === "finish") {
      await store.finish(sprintId, id, user);
      const box = document.querySelector(`.box[data-id="${CSS.escape(id)}"]`);
      if (box) {
        const r = box.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2);
      }
      toast(`${id} done 🎉`);
    }
    if (act === "release") { await store.release(sprintId, id, user); toast(`${id} released`); }
    if (act === "reopen") {
      if (!confirm(`Reopen ${id}? Tasks that depend on it turn red again.`)) return;
      await store.reopen(sprintId, id); toast(`${id} reopened`);
    }
    hideTip();
  } catch (err) {
    toast(err.code === "permission-denied" ? "Not allowed: check the allowlist and that the published Firestore rules are current" : err.message, true);
  }
}

function onBoxClick(btn) {
  const id = btn.dataset.id;
  const { status, rec } = info(id);
  if (lastPointer !== "touch" && live && status === "free") return run("claim", id);
  if (lastPointer !== "touch" && status === "progress" && rec.uid !== user?.uid) return showTip(btn, false);
  showTip(btn, true);
}

async function signIn() {
  try { await store.signIn(); }
  catch (err) { if (err.code !== "auth/popup-closed-by-user") toast(err.message, true); }
}

// ---------- auth / data ----------

function renderAccount() {
  renderDebug();
  const el = $("account");
  if (store.mode === "demo") {
    el.innerHTML = `<span class="pill">Demo mode: Firebase not configured, changes stay in this browser</span>`;
  } else if (user) {
    el.innerHTML = `<span class="me" data-initial="${esc((user.name || "?")[0].toUpperCase())}">${esc(user.name)}</span><span class="email">${esc(user.email)}</span>
      <button type="button" class="btn ghost" id="signOut">Sign out</button>`;
    $("signOut").onclick = () => store.signOut();
  } else {
    el.innerHTML = `<button type="button" class="btn primary" id="signIn">Sign in with Google</button>`;
    $("signIn").onclick = signIn;
  }
}

// ---------- debug tools (demo the animations) ----------
// Only shown to these accounts. This is a convenience, not security: the
// buttons only play animations locally and never write to Firestore.
const DEBUG_EMAILS = ["feritbatuhatip@gmail.com"];

const isDebugUser = () => !!user?.email && DEBUG_EMAILS.includes(user.email.toLowerCase());

function renderDebug() {
  const allowed = isDebugUser();
  const open = allowed && lsGet("tracker-debug") === "1";
  $("debugBtn").hidden = !allowed;
  $("debugBtn").setAttribute("aria-pressed", String(open));
  $("debugPanel").hidden = !open;
}

function toggleDebug() {
  lsSet("tracker-debug", $("debugPanel").hidden ? "1" : "0");
  renderDebug();
}

function sweepProgressBar() {
  if (sweeping) return;
  sweeping = true;
  const value = $("barValue");
  value.style.transition = "none";
  value.style.width = "0%";
  $("barDone").style.width = "100%";
  $("barProg").style.width = "0%";
  $("barDone").style.setProperty("--track-scale", "1");
  void value.offsetWidth;               // apply the 0% before animating
  value.style.transition = "width 2.4s cubic-bezier(0.45, 0, 0.2, 1)";
  value.style.width = "100%";
  const started = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - started) / 2400);
    $("pct").textContent = Math.round(100 * (1 - Math.pow(1 - t, 2)));
    if (t < 1) requestAnimationFrame(tick);
    else $("bar").classList.add("full");
  };
  requestAnimationFrame(tick);
  setTimeout(() => {
    sweeping = false;
    value.style.transition = "";
    $("bar").classList.remove("full");
    renderBoard();
  }, 5000);
}

function popEveryBox() {
  document.querySelectorAll(".board .box").forEach((box, i) => {
    box.style.animationDelay = `${i * 12}ms`;
    box.classList.remove("pop");
    void box.offsetWidth;
    box.classList.add("pop");
    box.addEventListener("animationend", () => { box.classList.remove("pop"); box.style.animationDelay = ""; }, { once: true });
  });
}

function runDebug(action) {
  if (!isDebugUser()) return;
  if (action === "victory" || action === "ultra") celebrate(action);
  if (action === "confetti") burst(innerWidth / 2, innerHeight / 3);
  if (action === "pop") popEveryBox();
  if (action === "sweep") sweepProgressBar();
}

function setBanner(html) {
  const b = $("banner");
  b.hidden = !html;
  b.innerHTML = html || "";
}

function resetLiveState() {
  unsubscribe?.();
  unsubscribe = null;
  state = new Map();
  live = false;
  prevStatus = new Map();
  prevLevel = null;
  hideTip();
}

function subscribe() {
  if (!user || !sprintId) return;
  const sprint = sprintId;
  $("boardWrap").classList.remove("locked");
  unsubscribe = store.subscribe(
    sprint,
    (s) => { if (sprint !== sprintId) return; state = s; live = true; renderBoard(); },
    (err) => {
      if (sprint !== sprintId) return;
      live = false;
      $("boardWrap").classList.add("locked");
      setBanner(err.code === "permission-denied"
        ? `Firestore refused access to <code>sprints/${esc(sprint)}/tasks</code> for <b>${esc(user.email)}</b>. ` +
          `Either that email isn't in the allowlist, or the rules published in the Firebase console are older than this page. ` +
          `Whoever runs the board: publish the current <code>firestore.rules</code> with the team's emails, then reload.`
        : `Could not load the board: ${esc(err.message)}`);
      renderBoard();
    });
}

function onUser(u) {
  user = u;
  resetLiveState();
  renderAccount();
  setBanner("");
  $("gate").hidden = !!u;
  $("boardWrap").classList.toggle("locked", !u);
  subscribe();
  renderBoard();
}

// ---------- sprints ----------

async function fetchJson(path) {
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

function renderSprintPicker(title) {
  $("appTitle").textContent = title;
  const sel = $("sprintSelect");
  sel.innerHTML = SPRINTS.map((sp) => `<option value="${esc(sp.id)}">${esc(sp.name)}</option>`).join("");
  sel.value = sprintId;
}

async function showSprint(id) {
  const sp = SPRINTS.find((x) => x.id === id) || SPRINTS[SPRINTS.length - 1];
  const plan = await fetchJson(`sprints/${encodeURIComponent(sp.id)}.json`);
  resetLiveState();
  sprintId = sp.id;
  setPlan(plan);
  $("sprintSelect").value = sp.id;
  document.title = `${$("appTitle").textContent} ${sp.name} · Tracker`;
  lsSet("tracker-sprint", sp.id);
  const url = new URL(location.href);
  url.searchParams.set("sprint", sp.id);
  history.replaceState(null, "", url);
  buildBoard();
  renderReplays();
  if (store) subscribe();
  renderBoard();
}

// ---------- wiring ----------

function wire() {
  const board = $("board");
  document.addEventListener("pointerdown", (e) => { lastPointer = e.pointerType || "mouse"; }, true);
  board.addEventListener("click", (e) => {
    const btn = e.target.closest(".box");
    if (btn) onBoxClick(btn);
  });
  board.addEventListener("mouseover", (e) => {
    const btn = e.target.closest(".box");
    if (btn && !tipPinned && lastPointer !== "touch") showTip(btn, false);
  });
  board.addEventListener("mouseout", (e) => {
    const btn = e.target.closest(".box");
    if (btn && !tipPinned && !btn.contains(e.relatedTarget)) hideTip();
  });
  board.addEventListener("focusin", (e) => {
    const btn = e.target.closest(".box");
    if (btn && !tipPinned) showTip(btn, false);
  });
  board.addEventListener("focusout", () => { if (!tipPinned) hideTip(); });
  $("tip").addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (b) run(b.dataset.act, b.dataset.id);
  });
  document.addEventListener("click", (e) => {
    if (tipPinned && !e.target.closest("#tip") && !e.target.closest(".box")) hideTip();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hideTip(); });
  window.addEventListener("scroll", () => { if (!tipPinned) hideTip(); }, true);
  $("gateSignIn").onclick = signIn;
  $("themeBtn").onclick = cycleTheme;
  $("debugBtn").onclick = toggleDebug;
  $("debugPanel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-debug]");
    if (b) runDebug(b.dataset.debug);
  });
  $("sprintSelect").onchange = (e) => {
    showSprint(e.target.value).catch((err) => toast(`Could not load that sprint: ${err.message}`, true));
  };
  applyTheme(currentTheme());
  for (const g of [$("goalMust"), $("goalAll"), $("replayVictory"), $("replayUltra")]) {
    g.onclick = () => celebrate(g.dataset.level);
  }
}

async function main() {
  wire();
  try {
    const index = await fetchJson("sprints/index.json");
    SPRINTS = index.sprints || [];
    if (!SPRINTS.length) throw new Error("sprints/index.json lists no sprints");
    const wanted = new URL(location.href).searchParams.get("sprint") || lsGet("tracker-sprint");
    sprintId = (SPRINTS.find((x) => x.id === wanted) || SPRINTS[SPRINTS.length - 1]).id;
    renderSprintPicker(index.title || "Tracker");
    await showSprint(sprintId);
  } catch (err) {
    setBanner(`Could not load the sprint list: ${esc(err.message)}`);
    return;
  }
  try {
    store = DEMO ? createDemoStore() : await createFirebaseStore(firebaseConfig);
  } catch (err) {
    setBanner(`Could not start Firebase: ${esc(err.message)}. Check <code>firebase-config.js</code>.`);
    return;
  }
  store.onAuth(onUser);
}

main();
