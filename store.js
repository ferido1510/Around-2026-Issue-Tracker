// Two interchangeable stores for the board state.
//
// State is one Firestore document per task at sprints/{sprintId}/tasks/{taskId}.
// A missing document means nobody has picked the task up yet.
//   { status: "in-progress" | "done", uid, name, email, startedAt, doneAt? }

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

    finish(sprint, id, user) {
      return F.runTransaction(db, async (tx) => {
        const snap = await tx.get(ref(sprint, id));
        const d = snap.data();
        if (!d || d.status !== "in-progress" || d.uid !== user.uid) {
          throw new Error(`${id} is not in progress for you any more`);
        }
        tx.update(ref(sprint, id), { status: "done", doneAt: F.serverTimestamp() });
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
  let current = null;            // { sprint, state, onData }

  const load = (sprint) => {
    try { return new Map(Object.entries(JSON.parse(localStorage.getItem(PREFIX + sprint)) || {})); }
    catch { return new Map(); }
  };
  const save = (sprint, state) => {
    try { localStorage.setItem(PREFIX + sprint, JSON.stringify(Object.fromEntries(state))); } catch { /* private window */ }
    if (current?.sprint === sprint) current.onData(new Map(state));
  };
  const stateOf = (sprint) => (current?.sprint === sprint ? current.state : load(sprint));
  try {
    window.addEventListener("storage", (e) => {
      if (current && e.key === PREFIX + current.sprint) {
        current.state = load(current.sprint);
        current.onData(new Map(current.state));
      }
    });
  } catch { /* ignore */ }

  return {
    mode: "demo",
    onAuth(cb) { cb(user); },
    signIn: async () => {},
    signOut: async () => {},
    subscribe(sprint, onData) {
      current = { sprint, state: load(sprint), onData };
      onData(new Map(current.state));
      return () => { if (current?.onData === onData) current = null; };
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
    async release(sprint, id) { const state = stateOf(sprint); state.delete(id); save(sprint, state); },
    async reopen(sprint, id) { const state = stateOf(sprint); state.delete(id); save(sprint, state); },
  };
}
