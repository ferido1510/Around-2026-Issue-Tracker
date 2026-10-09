# Around · Sprint 2 issue tracker

A one-page board for the Sprint 2 plan. Each row is an issue (user story) and each column is one of its sub-issues. The boxes show what is blocked, what is free, who is working on what, and what is done. It updates live for everyone through Firestore.

| Box | Meaning |
|---|---|
| Red | Blocked: at least one blocker isn't done yet |
| Green | Free: nothing blocks it, and no open task waits on it |
| Green + red ⚠ | Free, and other open tasks wait on it. Do these first |
| Dark yellow | In progress. Shows who took it |
| Grey ✓ | Done |
| Striped | Stretch task |

- **Hover** a box to see its title, what blocks it, what it blocks, and the kind of each block (hard / soft / file / decision).
- **Click** a free box to take it. It turns yellow with your name on it.
- **Click your own yellow box** to *Mark done* or *Release* it. Marking done turns grey and unblocks whatever was waiting on it.
- **Click a grey box** to reopen it (if it was marked done by mistake).
- On a phone, tap a box to see its details and the action buttons.
- The **progress bar** at the top fills from 0 to 100% as tasks are marked done (the striped yellow part is work in progress).
- When every must-have task is done, the board plays a **victory** animation 🏆. When every task is done, stretch included, it plays the **ultra victory** 👑. Each one plays once per browser; click the trophy or crown next to the progress bar to replay it. If someone reopens a task and it gets finished again, it plays again.
- The 🌗 button switches between automatic, light and dark themes.

Every structural blocking kind counts: `hard`, `file`, `soft`, and `decision` (start and finish). The chronological kinds (`owner-queue`, `not-before`, `stretch-gate`) are ignored, because they depend on the plan's owners and dates. The owners and reviewers from the plan are not used at all: whoever clicks a task gets it.

---

## Set up your own Firebase (about 10 minutes)

The board needs a Firebase project for sign-in and the shared state. The free **Spark** plan is plenty: seven people clicking around use a tiny fraction of the free daily quota (50,000 reads and 20,000 writes). You don't need a credit card.

### 1. Create the project

1. Go to <https://console.firebase.google.com> and sign in with your Google account.
2. Click **Create a project** (or **Add project**). Name it something like `around-tracker`.
3. When it asks about Google Analytics, turn it **off**. You don't need it.
4. Wait for the project to be created, then click **Continue**.

### 2. Register a web app and copy its config

1. On the project overview page, click the **Web** icon (`</>`) to add an app.
2. Give it a nickname (e.g. `tracker`). Leave **Firebase Hosting** unchecked, since GitHub Pages hosts the page.
3. Click **Register app**. Firebase shows a code block containing `const firebaseConfig = { ... }`.
4. Copy the values into [`firebase-config.js`](firebase-config.js) in this repo, replacing the placeholders. You can find them again later under ⚙️ **Project settings → General → Your apps**.

These values are **not secrets**. Every Firebase web app ships them to the browser. The security comes from the rules in step 5.

### 3. Turn on Google sign-in

1. In the left menu: **Build → Authentication → Get started**.
2. On the **Sign-in method** tab, click **Google**, switch it to **Enable**, pick your email as the support email, and click **Save**.
3. Go to the **Settings** tab → **Authorized domains** → **Add domain** and add `ferido1510.github.io`. Without this, the Google popup is refused on the GitHub Pages site. (`localhost` is already on the list.)

### 4. Create the Firestore database

1. In the left menu: **Build → Firestore Database → Create database**.
2. If it asks for an edition, pick **Standard**.
3. Pick a location close to the team, e.g. `europe-west6` (Zürich) or `eur3` (Europe multi-region). **This can't be changed later.**
4. Choose **Start in production mode** (everything is locked until you publish the rules below).
5. Click **Create**.

You don't need to create any collections. The board creates a document in `tasks` the first time someone takes a task.

### 5. Publish the security rules with your seven emails

1. Open [`firestore.rules`](firestore.rules) and replace the seven `teammateN@gmail.com` entries with the **Google account emails** your teammates will sign in with. Write them in lowercase.
2. In the console: **Firestore Database → Rules** tab. Delete what is there, paste the whole file, and click **Publish**.

What the rules enforce:

- Only those seven signed-in Google accounts can read or change anything. Anyone else who opens the page sees a "not on the allowlist" message.
- You can only take a task in your own name, and only if nobody else holds it. Two people clicking at once can't both get it.
- Only the person holding a task can mark it done or release it.
- Anyone on the team can reopen a done task.

To add or swap a person later, edit the list and publish again. It takes effect within a minute.

### 6. Publish the page on GitHub Pages

1. Commit your filled-in `firebase-config.js` (it's fine for it to be public), and merge this branch into `main`.
2. On GitHub: **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, pick `main` and `/ (root)`, and click **Save**.
3. After a minute the board is live at **<https://ferido1510.github.io/Around-2026-Issue-Tracker/>**.

On a free GitHub account, Pages only works for **public** repositories. Anyone can then see the page's code and task titles, but not the board state: who took what and what's done lives in Firestore behind the allowlist.

### 7. Check it works

Open the site, click **Sign in with Google**, and take a free task. In the Firebase console under **Firestore Database → Data**, you should see a `tasks` collection with a document named after that task.

---

## Day-to-day admin

- **Reset the whole board:** in **Firestore Database → Data**, delete the `tasks` collection (⋮ menu → *Delete collection*).
- **Fix one task by hand:** delete its document to make it unassigned, or edit `status` / `name` directly.
- **Someone left a task in progress:** they can release it, or you can delete its document in the console.

## Changing the plan

The tasks and blocking edges come from the JSON block in [`data/sprint-2-blocking-report.md`](data/sprint-2-blocking-report.md) (section 11). After editing it, regenerate `data.js`:

```sh
python3 tools/build_data.py
```

Task state in Firestore is keyed by task ID, so existing progress is kept as long as IDs don't change.

## Running it locally

The page is plain HTML and JavaScript modules, with no build step. Modules need a web server, not `file://`:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

- **Demo mode:** while `firebase-config.js` still has the `PASTE_YOUR_API_KEY` placeholder, the page runs without Firebase. You are a fake user called "You", and the state is kept in your browser only. It's useful for trying the board out.
- **Emulator mode:** with the [Firebase CLI](https://firebase.google.com/docs/cli) installed, run `firebase emulators:start --project demo-tracker` and open `http://localhost:8000/?emulator`. Sign-in then asks for an email and creates a fake Google account on the emulator, so you can test the rules with several "people" in different browser windows. Emails must be on the allowlist in `firestore.rules`.

## Files

| File | What it is |
|---|---|
| `index.html`, `style.css` | The page and its look, including both legends |
| `app.js` | Board logic: colours, tooltips, clicks, progress, theme |
| `celebrate.js` | Confetti and fireworks for the victory animations |
| `store.js` | Firestore and Google sign-in (plus the local demo store) |
| `firebase-config.js` | **Your** Firebase web config |
| `firestore.rules` | Security rules with the seven-email allowlist |
| `data.js` | Generated tasks and blocking edges. Don't edit by hand |
| `tools/build_data.py` | Regenerates `data.js` from the report |
| `firebase.json` | Only for the CLI and emulators (optional) |
