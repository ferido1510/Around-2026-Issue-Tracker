import { PLAN } from "./data.js";
import { firebaseConfig } from "./firebase-config.js";
import { createDemoStore, createFirebaseStore } from "./store.js";

const DEMO = !firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("PASTE");

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Every edge kept in data.js blocks: hard / file / decision(start) block the start,
// soft / decision(finish) block the finish, and the board treats both as red.
const incoming = new Map();
const outgoing = new Map();
const storyOf = new Map();
for (const id of Object.keys(PLAN.tasks)) { incoming.set(id, []); outgoing.set(id, []); }
for (const e of PLAN.edges) { incoming.get(e.to).push(e); outgoing.get(e.from).push(e); }
for (const row of PLAN.rows) for (const id of row.children) storyOf.set(id, row);

let store = null;
let user = null;
let state = new Map();
let live = false;          // true once we receive data we are allowed to see
let unsubscribe = null;
let tipFor = null;          // task ID the tooltip shows
let tipPinned = false;
let lastPointer = "mouse";

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
  for (let i = 1; i <= cols; i++) html += `<th scope="col" class="colhead">${i}</th>`;
  html += `</tr></thead><tbody>`;
  for (const row of PLAN.rows) {
    html += `<tr><th scope="row" class="rowhead${row.prio === "stretch" ? " stretch" : ""}">
      <span class="rid">${esc(row.id)}</span>
      <span class="rtitle">${esc(row.title)}</span>
      <span class="rprog" data-row="${esc(row.id)}"></span></th>`;
    for (let i = 0; i < cols; i++) {
      const id = row.children[i];
      html += id
        ? `<td><button type="button" class="box" data-id="${esc(id)}" aria-describedby="tip"></button></td>`
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
    btn.innerHTML = `<span class="bid">${esc(id)}</span>` +
      (status === "progress" ? `<span class="who">${esc(mine ? "you" : rec.name)}</span>` : "") +
      (blocking ? `<span class="warn" aria-hidden="true"></span>` : "");
    btn.setAttribute("aria-label", `${id}: ${t.title}. ${STATUS_LABEL[status]}` +
      (status === "progress" ? `, ${rec.name}` : "") + (blocking ? ", other tasks wait on it" : ""));
  }
  for (const el of document.querySelectorAll(".rprog")) {
    const row = PLAN.rows.find((r) => r.id === el.dataset.row);
    const done = row.children.filter(isDone).length;
    el.textContent = `${done}/${row.children.length} done`;
    el.classList.toggle("all", done === row.children.length);
  }
  $("counts").innerHTML = live
    ? `<span class="c s-blocked"></span>${counts.blocked} blocked · <span class="c s-free"></span>${counts.free} free · ` +
      `<span class="c s-progress"></span>${counts.progress} in progress · <span class="c s-done"></span>${counts.done} done`
    : "";
  if (tipFor) renderTip();
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
    if (act === "claim") { await store.claim(id, user); toast(`${id} is yours`); }
    if (act === "finish") { await store.finish(id, user); toast(`${id} done`); }
    if (act === "release") { await store.release(id, user); toast(`${id} released`); }
    if (act === "reopen") {
      if (!confirm(`Reopen ${id}? Tasks that depend on it turn red again.`)) return;
      await store.reopen(id); toast(`${id} reopened`);
    }
    hideTip();
  } catch (err) {
    toast(err.code === "permission-denied" ? "Not allowed: check the allowlist in firestore.rules" : err.message, true);
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
  const el = $("account");
  if (store.mode === "demo") {
    el.innerHTML = `<span class="pill">Demo mode: Firebase not configured, changes stay in this browser</span>`;
  } else if (user) {
    el.innerHTML = `<span class="me">${esc(user.name)}</span><span class="email">${esc(user.email)}</span>
      <button type="button" class="btn ghost" id="signOut">Sign out</button>`;
    $("signOut").onclick = () => store.signOut();
  } else {
    el.innerHTML = `<button type="button" class="btn primary" id="signIn">Sign in with Google</button>`;
    $("signIn").onclick = signIn;
  }
}

function setBanner(html) {
  const b = $("banner");
  b.hidden = !html;
  b.innerHTML = html || "";
}

function onUser(u) {
  user = u;
  unsubscribe?.();
  unsubscribe = null;
  state = new Map();
  live = false;
  renderAccount();
  setBanner("");
  $("gate").hidden = !!u;
  $("boardWrap").classList.toggle("locked", !u);
  if (u) {
    unsubscribe = store.subscribe(
      (s) => { state = s; live = true; renderBoard(); },
      (err) => {
        live = false;
        $("boardWrap").classList.add("locked");
        setBanner(err.code === "permission-denied"
          ? `<b>${esc(u.email)}</b> is not on the board's allowlist. Ask whoever runs the board to add it to <code>firestore.rules</code>, then reload.`
          : `Could not load the board: ${esc(err.message)}`);
        renderBoard();
      });
  }
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

  // Legends start collapsed on small screens so they don't cover the board.
  if (window.matchMedia("(max-width: 900px)").matches) {
    document.querySelectorAll(".legend details").forEach((d) => { d.open = false; });
  }
}

async function main() {
  buildBoard();
  wire();
  try {
    store = DEMO ? createDemoStore() : await createFirebaseStore(firebaseConfig);
  } catch (err) {
    setBanner(`Could not start Firebase: ${esc(err.message)}. Check <code>firebase-config.js</code>.`);
    return;
  }
  store.onAuth(onUser);
}

main();
