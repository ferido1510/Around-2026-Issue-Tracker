// Celebrations: a tiny canvas particle engine, no dependencies.
//   burst(x, y)        small confetti pop, e.g. when you mark a task done
//   celebrate("victory")  every must-have task is done
//   celebrate("ultra")    every task, stretch included, is done

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CONFETTI = ["#ff5d73", "#ffb020", "#3ddc84", "#3fa7ff", "#a66bff", "#ff7ad9", "#ffe14d"];

let canvas = null;
let ctx = null;
let particles = [];
let rockets = [];
let raf = 0;
let trails = false;

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement("canvas");
  canvas.className = "fx-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);
}

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

function confetti(x, y, n, { spread = Math.PI * 2, angle = -Math.PI / 2, speed = [4, 12], colors = CONFETTI } = {}) {
  for (let i = 0; i < n; i++) {
    const a = angle + rand(-spread / 2, spread / 2);
    const v = rand(speed[0], speed[1]);
    particles.push({
      type: Math.random() < 0.25 ? "dot" : "rect",
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      w: rand(6, 11), h: rand(4, 7), rot: rand(0, Math.PI * 2), vr: rand(-0.3, 0.3),
      color: pick(colors), life: rand(110, 190), age: 0, gravity: 0.22, drag: 0.985, wobble: rand(0, 10),
    });
  }
  start();
}

function spark(x, y, color, n = 70, power = 6) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand(-0.05, 0.05);
    const v = rand(power * 0.5, power);
    particles.push({
      type: "spark", x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      color: Math.random() < 0.2 ? "#fff" : color, life: rand(60, 95), age: 0,
      gravity: 0.07, drag: 0.97, size: rand(1.6, 2.8),
    });
  }
  start();
}

function rocket(color = pick(CONFETTI)) {
  rockets.push({
    x: rand(innerWidth * 0.15, innerWidth * 0.85), y: innerHeight + 10,
    vx: rand(-1.2, 1.2), vy: rand(-15, -11.5), color,
  });
  start();
}

function start() {
  ensureCanvas();
  if (!raf) raf = requestAnimationFrame(tick);
}

function tick() {
  if (trails) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    ctx.globalCompositeOperation = "source-over";
  } else {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
  }

  for (const r of rockets) {
    r.x += r.vx; r.y += r.vy; r.vy += 0.2;
    ctx.fillStyle = r.color;
    ctx.beginPath(); ctx.arc(r.x, r.y, 2.6, 0, Math.PI * 2); ctx.fill();
    if (r.vy >= -1.5) {
      r.dead = true;
      spark(r.x, r.y, r.color, 80, rand(5, 8));
      if (Math.random() < 0.5) spark(r.x, r.y, pick(CONFETTI), 40, 3);
    }
  }
  rockets = rockets.filter((r) => !r.dead);

  for (const p of particles) {
    p.age++;
    p.vx *= p.drag; p.vy = p.vy * p.drag + p.gravity;
    p.x += p.vx + (p.type === "rect" ? Math.sin((p.age + p.wobble) / 8) * 0.6 : 0);
    p.y += p.vy;
    const fade = Math.max(0, 1 - p.age / p.life);
    ctx.globalAlpha = p.type === "spark" ? fade : Math.min(1, fade * 3);
    ctx.fillStyle = p.color;
    if (p.type === "spark") {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    } else if (p.type === "dot") {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.h / 2, 0, Math.PI * 2); ctx.fill();
    } else {
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.age / 6 + p.wobble));     // flutter
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
  particles = particles.filter((p) => p.age < p.life && p.y < innerHeight + 40);

  if (particles.length || rockets.length) {
    raf = requestAnimationFrame(tick);
  } else {
    raf = 0;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
}

export function burst(x, y) {
  if (reducedMotion()) return;
  confetti(x, y, 36, { speed: [3, 8] });
}

// ---------- big moments ----------

const timers = [];
function later(ms, fn) { timers.push(setTimeout(fn, ms)); }
function clearTimers() { while (timers.length) clearTimeout(timers.pop()); }

const COPY = {
  victory: {
    badge: "🏆",
    title: "Victory!",
    text: "Every must-have task in Sprint 2 is done. The stretch goals are waiting if you're feeling heroic.",
    button: "Onwards",
  },
  ultra: {
    badge: "👑",
    title: "ULTRA VICTORY",
    text: "Every single task is done, stretch goals included. Legendary sprint, team.",
    button: "We are legends",
  },
};

export function celebrate(level) {
  const copy = COPY[level];
  if (!copy) return;
  dismiss();

  const overlay = document.createElement("div");
  overlay.className = `celebrate celebrate-${level}`;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "celebrateTitle");
  overlay.innerHTML = `${level === "ultra" ? `<div class="celebrate-glow" aria-hidden="true"></div>` : ""}
    <div class="celebrate-card">
      <div class="celebrate-badge" aria-hidden="true">${copy.badge}</div>
      <h2 id="celebrateTitle" class="celebrate-title">${copy.title}</h2>
      <p class="celebrate-text">${copy.text}</p>
      <button type="button" class="btn primary celebrate-close">${copy.button}</button>
    </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add(`party-${level}`);
  overlay.querySelector(".celebrate-close").focus();
  overlay.addEventListener("click", (e) => {
    if (!e.target.closest(".celebrate-card") || e.target.closest(".celebrate-close")) dismiss();
  });

  if (reducedMotion()) return;

  const W = innerWidth, H = innerHeight;
  const cannons = () => {
    confetti(0, H, 90, { angle: -Math.PI / 3, spread: 0.7, speed: [12, 22] });
    confetti(W, H, 90, { angle: (-2 * Math.PI) / 3, spread: 0.7, speed: [12, 22] });
  };

  if (level === "victory") {
    trails = false;
    cannons();
    later(700, () => confetti(W / 2, H * 0.35, 120, { speed: [6, 14] }));
    later(1400, cannons);
    later(2300, () => confetti(W / 2, H * 0.35, 80, { speed: [5, 12] }));
  } else {
    // Fireworks with trails, confetti rain, and the board dances.
    trails = true;
    const gold = ["#ffd700", "#ffe14d", "#fff3b0", "#ffb020"];
    cannons();
    for (let i = 0; i < 28; i++) later(250 + i * 280, () => rocket(i % 4 === 0 ? "#ffd700" : undefined));
    for (let i = 0; i < 16; i++) {
      later(600 + i * 450, () => {
        for (let k = 0; k < 6; k++) {
          confetti(rand(0, W), -10, 4, { angle: Math.PI / 2, spread: 0.6, speed: [1, 3], colors: i % 2 ? gold : CONFETTI });
        }
      });
    }
    later(3000, cannons);
    later(6000, cannons);
    later(9000, () => { trails = false; });
  }
}

export function dismiss() {
  clearTimers();
  trails = false;
  document.querySelectorAll(".celebrate").forEach((el) => el.remove());
  document.body.classList.remove("party-victory", "party-ultra");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.querySelector(".celebrate")) dismiss();
});
