// Two interchangeable stores for the board state.
//
// State is one Firestore document per task at sprints/{sprintId}/tasks/{taskId}.
// A missing document means nobody has picked the task up yet.
//   { status: "in-progress" | "review" | "done" | "deferred", uid, name, email,
//     startedAt?, reviewAt?, doneAt?, reviewerUid?, reviewerName?, deferredAt?,
//     adminClosed? }
//
// Tasks with no assignee in the sprint file go in-progress -> done (finish).
// Tasks with an assignee and a reviewer go in-progress -> review (the assignee
// completes it, submit) -> done (the reviewer approves it, approve). A reviewer
// can send it back to in-progress (requestChanges), and a done task can be
// reopened to in-progress (reopenAssigned). An assignee can also defer a task that
// nothing open waits on (defer), which leaves it out of the progress until it is
// brought back (undefer, which makes it unclaimed again). An admin can close any task
// that isn't done (adminClose): it is recorded as completed and approved by them.

const SDK = "https://www.gstatic.com/firebasejs/10.12.2";

function firstName(user) {
  const full = user.displayName || user.email || "Someone";
  return full.split(/[\s@]/)[0];
}

export async function createFirebaseStore(config) {
  const [{ initializeApp }, A, F] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-auth.js`),
    import(`${SDK}/firebase-firestore.js`),
  ]);
  const app = initializeApp(config);
  const auth = A.getAuth(app);
  const db = F.getFirestore(app);
  // Local testing: open http://localhost:<port>/?emulator with `firebase emulators:start` running.
  // Sign-in then asks for an email and uses a fake Google account, no Google popup.
  const emulator = location.hostname === "localhost" && new URLSearchParams(location.search).has("emulator");
  if (emulator) {
    A.connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    F.connectFirestoreEmulator(db, "localhost", 8080);
  }
  const ref = (sprint, id) => F.doc(db, "sprints", sprint, "tasks", id);

  return {
    mode: "firebase",

    onAuth(cb) {
      A.onAuthStateChanged(auth, (u) =>
        cb(u ? { uid: u.uid, name: firstName(u), email: u.email } : null));
    },
    async signIn() {
      if (!emulator) return A.signInWithPopup(auth, new A.GoogleAuthProvider());
      const email = prompt("Emulator sign-in: email of a fake Google account");
      if (!email) return;
      const fakeIdToken = JSON.stringify({ sub: email, email, email_verified: true, name: email.split("@")[0] });
      return A.signInWithCredential(auth, A.GoogleAuthProvider.credential(fakeIdToken));
    },
    signOut: () => A.signOut(auth),

    subscribe(sprint, onData, onError) {
      return F.onSnapshot(F.collection(db, "sprints", sprint, "tasks"), (snap) => {
        const state = new Map();
        snap.forEach((d) => state.set(d.id, d.data()));
        onData(state);
      }, onError);
    },

    // A transaction so two people clicking the same box at once can't both get it.
    claim(sprint, id, user) {
      return F.runTransaction(db, async (tx) => {
        const snap = await tx.get(ref(sprint, id));
        if (snap.exists()) {
          throw new Error(`${id} was just taken by ${snap.data().name}`);
        }
        tx.set(ref(sprint, id), {
          status: "in-progress", uid: user.uid, name: user.name, email: user.email,
          startedAt: F.serverTimestamp(),
        });
      });
    },

    finish(sprint, id) {
      return F.runTransaction(db, async (tx) => {
        const snap = await tx.get(ref(sprint, id));
        const d = snap.data();
        if (!d || d.status !== "in-progress") {
          throw new Error(`${id} is not in progress any more`);
        }
        tx.update(ref(sprint, id), { status: "done", doneAt: F.serverTimestamp() });
      });
    },

    // The assignee says the work is complete; it now waits for the reviewer.
    submit(sprint, id) {
      return F.runTransaction(db, async (tx) => {
        const d = (await tx.get(ref(sprint, id))).data();
        if (!d || d.status !== "in-progress") throw new Error(`${id} is not in progress any more`);
        tx.update(ref(sprint, id), { status: "review", reviewAt: F.serverTimestamp() });
      });
    },

    // The reviewer approves it. You can't approve what you completed yourself.
    approve(sprint, id, user) {
      return F.runTransaction(db, async (tx) => {
        const d = (await tx.get(ref(sprint, id))).data();
        if (!d || d.status !== "review") throw new Error(`${id} is not waiting for a review any more`);
        if (d.uid === user.uid) throw new Error("Someone else has to approve what you completed");
        tx.update(ref(sprint, id), {
          status: "done", doneAt: F.serverTimestamp(), reviewerUid: user.uid, reviewerName: user.name,
        });
      });
    },

    // Reviewer: needs more work. Assignee: take it back. Either way, in progress again.
    requestChanges(sprint, id) {
      return F.runTransaction(db, async (tx) => {
        const d = (await tx.get(ref(sprint, id))).data();
        if (!d || d.status !== "review") throw new Error(`${id} is not waiting for a review any more`);
        tx.update(ref(sprint, id), { status: "in-progress", reviewAt: F.deleteField() });
      });
    },

    // A done task that turned out not to be: back to in progress for its assignee.
    reopenAssigned(sprint, id) {
      return F.runTransaction(db, async (tx) => {
        const d = (await tx.get(ref(sprint, id))).data();
        if (!d || d.status !== "done") throw new Error(`${id} is not done`);
        tx.update(ref(sprint, id), {
          status: "in-progress", doneAt: F.deleteField(), reviewAt: F.deleteField(),
          reviewerUid: F.deleteField(), reviewerName: F.deleteField(), adminClosed: F.deleteField(),
        });
      });
    },

    // An admin closes a task: completed and approved in one step, for when the assignee and
    // the reviewer can't be reached. A task nobody touched is recorded under the assignee's name.
    adminClose(sprint, id, admin, assignee) {
      return F.runTransaction(db, async (tx) => {
        const snap = await tx.get(ref(sprint, id));
        const d = snap.data();
        if (d?.status === "done") throw new Error(`${id} is already done`);
        const now = F.serverTimestamp();
        if (!snap.exists()) {
          tx.set(ref(sprint, id), {
            status: "done", uid: admin.uid, name: assignee || admin.name, email: admin.email,
            reviewAt: now, doneAt: now, reviewerUid: admin.uid, reviewerName: admin.name, adminClosed: true,
          });
        } else {
          tx.update(ref(sprint, id), {
            status: "done", doneAt: now, ...(d.reviewAt ? {} : { reviewAt: now }),
            reviewerUid: admin.uid, reviewerName: admin.name, adminClosed: true,
            ...(d.deferredAt ? { deferredAt: F.deleteField() } : {}),
          });
        }
      });
    },

    // Put a task off: from unclaimed (a new record) or in progress (the same record).
    defer(sprint, id, user) {
      return F.runTransaction(db, async (tx) => {
        const snap = await tx.get(ref(sprint, id));
        const d = snap.data();
        if (!snap.exists()) {
          tx.set(ref(sprint, id), {
            status: "deferred", uid: user.uid, name: user.name, email: user.email,
            deferredAt: F.serverTimestamp(),
          });
        } else if (d.status === "in-progress") {
          tx.update(ref(sprint, id), { status: "deferred", deferredAt: F.serverTimestamp() });
        } else {
          throw new Error(`${id} can't be deferred any more`);
        }
      });
    },

    // Bring it back: the task is unclaimed again.
    undefer(sprint, id) {
      return F.runTransaction(db, async (tx) => {
        const d = (await tx.get(ref(sprint, id))).data();
        if (!d || d.status !== "deferred") throw new Error(`${id} is not deferred any more`);
        tx.delete(ref(sprint, id));
      });
    },

    release: (sprint, id) => F.deleteDoc(ref(sprint, id)),
    reopen: (sprint, id) => F.deleteDoc(ref(sprint, id)),
  };
}

// Demo mode: same API, state kept in localStorage per sprint. Lets you try the
// board before Firebase is configured. Other tabs of the same browser stay in sync.
export function createDemoStore() {
  const PREFIX = "around-tracker-demo:";
  const user = { uid: "demo", name: "You", email: "demo@example.com" };
  const subs = new Map();        // sprint -> { state, onData }: the sprints being watched

  const load = (sprint) => {
    try { return new Map(Object.entries(JSON.parse(localStorage.getItem(PREFIX + sprint)) || {})); }
    catch { return new Map(); }
  };
  const save = (sprint, state) => {
    try { localStorage.setItem(PREFIX + sprint, JSON.stringify(Object.fromEntries(state))); } catch { /* private window */ }
    const sub = subs.get(sprint);
    if (sub) sub.onData(new Map(state));
  };
  const stateOf = (sprint) => subs.get(sprint)?.state || load(sprint);
  try {
    window.addEventListener("storage", (e) => {
      for (const [sprint, sub] of subs) {
        if (e.key === PREFIX + sprint) { sub.state = load(sprint); sub.onData(new Map(sub.state)); }
      }
    });
  } catch { /* ignore */ }

  return {
    mode: "demo",
    onAuth(cb) { cb(user); },
    signIn: async () => {},
    signOut: async () => {},
    subscribe(sprint, onData) {
      const sub = { state: load(sprint), onData };
      subs.set(sprint, sub);
      onData(new Map(sub.state));
      return () => { if (subs.get(sprint) === sub) subs.delete(sprint); };
    },
    async claim(sprint, id, u) {
      const state = stateOf(sprint);
      if (state.has(id)) throw new Error(`${id} was just taken by ${state.get(id).name}`);
      state.set(id, { status: "in-progress", uid: u.uid, name: u.name, email: u.email, startedAt: Date.now() });
      save(sprint, state);
    },
    async finish(sprint, id) {
      const state = stateOf(sprint);
      state.set(id, { ...state.get(id), status: "done", doneAt: Date.now() });
      save(sprint, state);
    },
    async submit(sprint, id) {
      const state = stateOf(sprint);
      const d = state.get(id);
      if (!d || d.status !== "in-progress") throw new Error(`${id} is not in progress any more`);
      state.set(id, { ...d, status: "review", reviewAt: Date.now() });
      save(sprint, state);
    },
    async approve(sprint, id, u) {
      const state = stateOf(sprint);
      const d = state.get(id);
      if (!d || d.status !== "review") throw new Error(`${id} is not waiting for a review any more`);
      // No own-work check here: demo mode has a single user, who plays every role.
      state.set(id, { ...d, status: "done", doneAt: Date.now(), reviewerUid: u.uid, reviewerName: u.name });
      save(sprint, state);
    },
    async requestChanges(sprint, id) {
      const state = stateOf(sprint);
      const { reviewAt, ...d } = state.get(id) || {};
      if (d.status !== "review") throw new Error(`${id} is not waiting for a review any more`);
      state.set(id, { ...d, status: "in-progress" });
      save(sprint, state);
    },
    async reopenAssigned(sprint, id) {
      const state = stateOf(sprint);
      const { reviewAt, doneAt, reviewerUid, reviewerName, adminClosed, ...d } = state.get(id) || {};
      if (d.status !== "done") throw new Error(`${id} is not done`);
      state.set(id, { ...d, status: "in-progress" });
      save(sprint, state);
    },
    async adminClose(sprint, id, u, assignee) {
      const state = stateOf(sprint);
      const d = state.get(id);
      if (d?.status === "done") throw new Error(`${id} is already done`);
      const now = Date.now();
      const { deferredAt, ...rest } = d || {};
      state.set(id, d
        ? { ...rest, status: "done", reviewAt: d.reviewAt || now, doneAt: now, reviewerUid: u.uid, reviewerName: u.name, adminClosed: true }
        : { status: "done", uid: u.uid, name: assignee || u.name, email: u.email, reviewAt: now, doneAt: now,
            reviewerUid: u.uid, reviewerName: u.name, adminClosed: true });
      save(sprint, state);
    },
    async defer(sprint, id, u) {
      const state = stateOf(sprint);
      const d = state.get(id);
      if (!d) state.set(id, { status: "deferred", uid: u.uid, name: u.name, email: u.email, deferredAt: Date.now() });
      else if (d.status === "in-progress") state.set(id, { ...d, status: "deferred", deferredAt: Date.now() });
      else throw new Error(`${id} can't be deferred any more`);
      save(sprint, state);
    },
    async undefer(sprint, id) {
      const state = stateOf(sprint);
      if (state.get(id)?.status !== "deferred") throw new Error(`${id} is not deferred any more`);
      state.delete(id);
      save(sprint, state);
    },
    async release(sprint, id) { const state = stateOf(sprint); state.delete(id); save(sprint, state); },
    async reopen(sprint, id) { const state = stateOf(sprint); state.delete(id); save(sprint, state); },
  };
}
