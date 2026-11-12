# Around · sprint tracker

A one-page board for the team's sprint plans. Pick a sprint from the dropdown next to the title. Each row is an issue (user story) and each column is one of its sub-issues (for sprints with assignees and reviewers, rows are assignees and columns are reviewers, see below). The boxes show what is blocked, what is free, who is working on what, and what is done. It updates live for everyone through Firestore.

| Box | Meaning |
|---|---|
| Red | Blocked: at least one blocker isn't done yet |
| Green | Free: nothing blocks it, and no open task waits on it |
| Green + red ⚠ | Free, and other open tasks wait on it. Do these first |
| Dark yellow | In progress. Shows who took it |
| Blue | In review: the assignee completed it, and the reviewer has to approve it (sprints with assignees and reviewers) |
| Grey ✓ | Done (approved) |
| Striped | Stretch task |

Letters after a task ID (also explained in the board's **Boxes** legend):

| Suffix | Meaning | Example |
|---|---|---|
| `p` | Provider switch: a one-file follow-up that switches the app from the fake repository to the Firestore one built in the same-numbered task | D2 → D2p |
| `a`, `b`, `c` | Parts of one item that was too big for one PR; each part is its own task with its own blockers | V4.3 → V4.3a, V4.3b, V4.3c |

- **Hover** a box to see its title, what blocks it, what it blocks, and the kind of each block (hard / soft / file / decision).
- **Click** a free box to take it. It turns yellow with your name on it.
- **Click a yellow box** to *Mark done* (anyone can, in case the person who took it passed it on without releasing it) or, if it's yours, to *Release* it. Marking done turns grey and unblocks whatever was waiting on it. In sprints with assignees and reviewers it works differently, see [Assignees and reviewers](#assignees-and-reviewers).
- **Click a grey box** to reopen it (if it was marked done by mistake).
- On a phone, tap a box to see its details and the action buttons.
- The **progress bar** at the top fills from 0 to 100% as tasks are marked done (the striped yellow part is work in progress).
- When every must-have task is done, the board plays a **victory** animation 🏆. When every task is done, should-haves and stretch included, it plays the **ultra victory** 👑. Each one plays once per browser. Once unlocked, a **Replay victory** / **Replay ultra victory** button appears in the top bar so you can replay it any time for morale (it stays even if a task is reopened later). If someone reopens a task and it gets finished again, it plays again.
- The 🌗 button switches between automatic, light and dark themes.
- The 🏅 **leaderboard** under the progress bar ranks everyone who has taken a task in the selected sprint by tasks done (then in progress or in review), live. Ties share a rank, and hovering a name lists their tasks.
- The **sprint dropdown** next to the title switches sprints. The page opens on the newest sprint, or on the one in the link (`?sprint=sprint-2`), so you can share a link to a specific sprint. Each sprint has its own progress, celebrations and replay buttons.

Every structural blocking kind counts: `hard`, `file`, `soft`, and `decision` (start and finish). The chronological kinds (`owner-queue`, `not-before`, `stretch-gate`) are ignored, because they depend on the plan's owners and dates. In the older sprints (2 to 5) the owners and reviewers from the plan are not used: whoever clicks a task gets it. From Sprint 6 on, every task has an **assignee** and a **reviewer**, see [Assignees and reviewers](#assignees-and-reviewers).

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

You don't need to create any collections. The board creates a document in `sprints/<sprint id>/tasks` the first time someone takes a task in that sprint.

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

Open the site, click **Sign in with Google**, and take a free task. In the Firebase console under **Firestore Database → Data**, you should see `sprints` → `sprint-2` → `tasks` with a document named after that task.

---

## Day-to-day admin

- **Reset a sprint:** in **Firestore Database → Data**, open `sprints` → the sprint → and delete its `tasks` collection (⋮ menu → *Delete collection*).
- **Fix one task by hand:** delete its document to make it unassigned, or edit `status` / `name` directly.
- **Someone left a task in progress:** they can release it, or you can delete its document in the console.

## Assignees and reviewers

Sprint 6 and later plans give every task an `assignee` and a `reviewer`. For these sprints the board is a grid: **rows are assignees, columns are reviewers**, and a task sits in the cell where its two names cross (so Ferit's tasks that Zaynab reviews are in the Ferit row, Zaynab column). The diagonal is hatched, since nobody reviews their own work. Each row shows its assignee's progress, each column header shows how many of that reviewer's tasks are approved and how many are waiting for them (`⧗`), and your own row and column are marked "you". The issue (user story) a task belongs to is in its hover box. A task is only **done** once it has been completed *and* approved:

1. **Free** (green): the assignee clicks it, or *Start working on it*, and it turns yellow.
2. **In progress** (yellow): the assignee clicks it and chooses *Mark complete*. *Release* puts it back to free.
3. **In review** (blue): the box now shows `→ reviewer`. The reviewer clicks it and chooses *Approve*, which turns it grey and unblocks what waited on it, or *Request changes*, which sends it back to yellow. The assignee can also *Take back* a task that nobody has reviewed yet.
4. **Done** (grey ✓): the tooltip says who completed it and who approved it. The assignee or the reviewer can *Reopen* it, which puts it back to yellow.

Details:
- A blue box does **not** unblock anything: only approved tasks do. A task that waits on a blue one shows a ⧗ next to it in the tooltip.
- A ringed box is yours to act on: a task you are working on (yellow ring) or one waiting for your review (blue ring). The *in review* count in the top right is the number of blue boxes.
- Nobody approves what they completed themselves; Firestore enforces that.
- Only the assignee of a task sees *Start*, *Mark complete* and *Release*, and only its reviewer sees *Approve* and *Request changes*. This part is enforced by the page, not by Firestore: the assignee and reviewer live in the sprint file, which the rules can't see. It is a team board, not a security boundary.
- The board knows people by the **first name on their Google account**, compared without case or accents (`Yigit` matches `Yiğit`). If someone signs in under a name that isn't in the plan, their tooltip says so and offers no buttons. Fix the name in the plan, or change the Google account's first name.
- To reassign a task, change `assignee` or `reviewer` in the plan and run the sprint script again (below). Progress is kept.
- A task with no `assignee` keeps the old behaviour (anyone takes it, anyone marks it done), so the earlier sprints still work.
- Links to things outside the sprint (a Figma frame, another PR) go in `blockedBy` too. If the `ref` is not one of the sprint's tasks (e.g. `#401`), it is shown under *Outside this sprint* in the tooltip and doesn't block the box.

**After pulling this change, publish the updated `firestore.rules` again** (step 5 of the set-up). The new *in review* step needs the new rules, or the board shows "Not allowed" when someone marks a task complete.

## Adding a new sprint

Each sprint is one file in [`sprints/`](sprints/), listed in [`sprints/index.json`](sprints/index.json). Nothing about a sprint is hardcoded in the page.

There are two formats. A plan with assignees and reviewers (Sprint 6 on) is a `.json` file with `stories` and `tasks` (each task has `key`, `type`, `story`, `assignee`, `reviewer`, `blockedBy`, `blocks`, …). Save it in `data/` and run the script on it, e.g.

```sh
python3 tools/add_sprint.py data/sprint-6.json --id sprint-6 --name "Sprint 6"
```

The script prints how many tasks each person has to do and to review, and notes any edge that is only listed on one side. Each story becomes a row, its stretch tasks go in a `<story>+` row, and tasks without a story go in "Other tasks". See the docstring in [`tools/add_sprint.py`](tools/add_sprint.py) for the exact shape. The rest of this section describes the older blocking-report format:

1. Get the sprint's blocking report in the same format as [`data/sprint-2-blocking-report.md`](data/sprint-2-blocking-report.md) or [`data/sprint-3-blocking-report.md`](data/sprint-3-blocking-report.md): a Markdown file with a ```` ```json ```` block that has `tasks` and `edges` (section 11 of those reports), or that JSON on its own. Save it in `data/`, e.g. `data/sprint-4-blocking-report.md`.
2. Run:

   ```sh
   python3 tools/add_sprint.py data/sprint-4-blocking-report.md --id sprint-4 --name "Sprint 4"
   ```

   This writes `sprints/sprint-4.json` and adds Sprint 4 to the dropdown. The `--id` goes in links and in Firestore, so use lowercase letters, digits and dashes.
3. Commit and push. Once GitHub Pages updates, the board opens on the newest sprint, the last one in `sprints/index.json`.

How the board is laid out from the JSON:
- Each task with `"kind": "story"` becomes a row, in the order they appear. Its `children` are the columns.
- A task that isn't any story's child goes before its `parent` task (as the contracts do), or into a row named after its parent (e.g. `PROC` → "Process (no user story)"), or into "Other tasks" if it has no parent.
- Tasks with `"prio": "stretch"` are striped and only count for the 👑 ultra victory.
- Tasks with `"prio": "should"` look like normal boxes (the hover box says *should-have*) and, like stretch, only count for the 👑 ultra victory. Anything else counts as a must-have.
- Only `hard`, `file`, `soft` and `decision` edges are used. The script warns about edge kinds it doesn't know.

**To change a sprint's plan**, edit its report and run the same command again with the same `--id`. Progress is stored by sprint ID and task ID, so it is kept as long as the task IDs don't change.

**To rename the project** (the "Around" in the title), change `"title"` in `sprints/index.json`. To rename a sprint or change the dropdown order, edit `sprints/index.json` directly.

## Running it locally

The page is plain HTML and JavaScript modules, with no build step. Modules need a web server, not `file://`:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

- **Demo mode:** while `firebase-config.js` still has the `PASTE_YOUR_API_KEY` placeholder, the page runs without Firebase. You are a fake user called "You", who plays every role (assignee and reviewer of every task, so you can try the whole review flow), and the state is kept in your browser only. It's useful for trying the board out.
- **Emulator mode:** with the [Firebase CLI](https://firebase.google.com/docs/cli) installed, run `firebase emulators:start --project demo-tracker` and open `http://localhost:8000/?emulator`. Sign-in then asks for an email and creates a fake Google account on the emulator, so you can test the rules with several "people" in different browser windows. Emails must be on the allowlist in `firestore.rules`.

## Files

| File | What it is |
|---|---|
| `index.html`, `style.css` | The page and its look, including both legends |
| `assets/around-logo-*.png` | The Around wordmark (purple for light mode, cream for dark), exported at 4x from the Around Figma file. Colours and fonts in `style.css` follow the same file |
| `app.js` | Board logic: colours, tooltips, clicks, progress, theme |
| `celebrate.js` | Confetti and fireworks for the victory animations |
| `store.js` | Firestore and Google sign-in (plus the local demo store) |
| `firebase-config.js` | **Your** Firebase web config |
| `firestore.rules` | Security rules with the seven-email allowlist |
| `sprints/index.json` | The project title and the list of sprints in the dropdown |
| `sprints/<id>.json` | One sprint's tasks and blocking edges, generated by `tools/add_sprint.py` |
| `tools/add_sprint.py` | Adds or updates a sprint from its blocking report or its assigned plan |
| `data/` | The source blocking reports and plans |
| `firebase.json` | Only for the CLI and emulators (optional) |
