<!-- Co-authored-by: Claude <noreply@anthropic.com> -->

# Sprint 2: task and blocking report

Source: `sprint-2-plan.md` (Sprint 2 plan, draft for team discussion). This report is the **initial picture** for the issue tracker: every task, who owns it, when it is planned, and **what blocks it, structurally and chronologically**. A machine-readable copy of everything below is in §11 (JSON).

> Snapshot time: **start of Day 1**, before the planning meeting. Nothing is merged and nothing is decided yet. Tasks marked *existing work* already have code in a PR, but it isn't merged.

**Naming:** days are written *Day 1 … Day 7*. `D1`–`D7` (and `D2p`, `D3p`, `D7a`, `D7b`) are **task IDs** for the data work, not days.

## 1. How to read this

### 1.1 Blocking kinds

| Kind | Family | Meaning | Blocks |
|---|---|---|---|
| `hard` | structural | Needs code, types, a route or a file that the blocker creates | **start** |
| `soft` | structural | Can be built against a fake, stub or placeholder. Only the final wiring or acceptance waits | **finish** (marking done) |
| `file` | structural | Touches a file the blocker also changes, so it is sequenced after it to avoid concurrent edits | **start** |
| `decision` | structural | Needs a team decision (DEC-x). The note says whether it blocks *start* or *finish* | start or finish |
| `owner-queue` | chronological | The owner's previous task in the plan (capacity, not code). The owner may reorder | start (advisory) |
| `not-before` | chronological | Planned window starts on Day n | start (advisory) |
| `stretch-gate` | chronological | Stretch work starts only after the owner's must-haves are done | start |

A tracker should treat `hard`, `file`, `decision(start)` and `stretch-gate` as **blocking**, `soft` and `decision(finish)` as **blocking completion**, and `owner-queue`/`not-before` as **schedule warnings**.

### 1.2 Initial statuses

| Status | Meaning |
|---|---|
| `ready` | No unmet structural blocker, and planned for Day 1 |
| `ready-scheduled` | No unmet structural blocker, but the planned window starts later (chronological only) |
| `blocked` | At least one unmet `hard`, `file` or `decision(start)` blocker |
| `gated` | Stretch item: waits for the owner's must-haves (stretch gate) |
| `gated+blocked` | Stretch item that also has unmet structural blockers |
| `pending-decision` | A decision to take at the planning meeting (Day 1) |
| `open` | Parent user story. Done when all its children are done |

### 1.3 Fields

`id` (stable plan ID, used everywhere) · `kind` (story / task / contract / decision / process) · `story` (user story served) · `parent` · `tier` (0 deferred … 7 nice-to-have) · `prio` (must / stretch) · `owner` · `reviewer` · `size` (S ≈ ½ d, M ≈ 1 d, L ≈ 2 d) · `window` (planned days, Day n–m) · `gh` (existing GitHub issue it rewrites or continues) · `existing` (unmerged code that already exists).

**Contracts** (`C1`–`C8`) are the half-day PRs on Day 1 that freeze shared seams. Three of them are aliases of a task: `C1` = `N0`, `C4` = `V3.1`, `C8` = `DEC-1`.

## 2. People

| Key | Name | GitHub |
|---|---|---|
| `ferit` | Ferit | @ferido1510 |
| `zaynab` | Zaynab | @zaynab79i |
| `yigit` | Yigit | @yeet-yildiz |
| `ece` | Ece | @ecetos |
| `vali` | Vali | @valigadayev-lgtm |
| `jiayi` | Jiayi | @jiayizhngepfl |
| `alisher` | Alisher | @mcpeblocker |
| `team` | whole team | — |

## 3. Snapshot at the start of Day 1

| Status | Count |
|---|---|
| `ready` | 13 |
| `ready-scheduled` | 4 |
| `blocked` | 32 |
| `gated` | 3 |
| `gated+blocked` | 11 |
| `pending-decision` | 6 |
| `open` | 14 |

### 3.1 Ready now (start on Day 1)

| ID | Title | Owner | Size | Existing work |
|---|---|---|---|---|
| HK-1 | Close duplicate/finished issues #9 #22 #26 #29, verify and close #50, file Google sign-in backlog issue | Jiayi | S | — |
| C2 | AppRoot slot signature: authFlow, roleSelection, explorerHome, venueEntry | Vali | S | — |
| C3 | AuthRepository.currentUserEmail (+ fake + Firebase impl) | Vali | S | — |
| G3.1 | Role selection ViewModel | Ece | S | — |
| V3.1 | Save and load the venue's marker and radius (= contract C4) | Yigit | S | code in PR #92 (opened backwards, closed) |
| V4.1 | Reward model and Firestore mapping (merge PR #76; doc checkbox moved to D1) | Zaynab | S | PR #76 (draft, complete) |
| C6 | NearbyQuest data class + MapUiState.nearby | Ferit | S | — |
| Q1 | CI emulator = API 37 / Pixel 10a + repo hygiene | Alisher | M | — |
| Q3 | Shared Firestore emulator test support | Jiayi | S | — |
| N0 | Route contract: every Sprint 2 route with a Coming-soon stub (= contract C1) | Alisher | S | — |
| D1 | Finalize Firestore schema v1 (#23 / PR #25) | Jiayi | M | PR #25 (draft since Oct 4) |
| DS0 | Design tokens and fonts in the theme (asset-only PR) | Ferit | S | — |
| C7 | VenuePageUiState + VenuePageQuest + ViewModel stub | Jiayi | S | — |

### 3.2 Ready, but scheduled later (no structural blocker)

| ID | Title | Owner | Window | Soft blockers (finish) |
|---|---|---|---|---|
| M1 | M1 deliverables: release APK, wiki links, sprint backlog view | Alisher | Day 7 | Q1, T1, T2 |
| Q2 | One tap-the-map-until-it-counts helper for device tests | Ferit | Day 2–3 | Q1 |
| D3 | UserRepositoryFirestore + emulator tests | Ece | Day 4–6 | Q3, D1 |
| F1 | Figma: venue page (light/dark, incl. accept-bar state) | Zaynab | Day 2–3 | — |

### 3.3 Blocked at the start of Day 1

| ID | Title | Owner | Blocked by (start) | Earliest structural start | Planned window |
|---|---|---|---|---|---|
| G2.1 | Show the sign-in flow or the app from the saved session | Vali | C2 (hard) | Day 1 | Day 1–2 |
| G2.2 | Clear the back stack on sign-in and sign-out | Vali | G2.1 (hard) | Day 2 | Day 2 |
| G2.3 | Route a signed-in user by role | Vali | G2.1 (hard) | Day 2 | Day 3 |
| G2.4 | Sign out from the Profile tab | Vali | G2.1 (hard) | Day 2 | Day 3 |
| G3.2 | Role selection screen (Figma #27) | Ece | G3.1 (hard) | Day 2 | Day 3 |
| G3.3 | Venue entry: resume onboarding or open venue home (rewrite of #79) | Ece | C2 (hard), V3.1 (hard), N0 (hard) | Day 1 | Day 4 |
| V3.2 | Save the picked address with the area | Yigit | V3.1 (hard) | Day 1 | Day 2–3 |
| C5 | CreateQuestUiState, RewardFormState, RewardType + ViewModel stubs | Zaynab | V4.1 (hard) | Day 1 | Day 1 |
| V4.2 | CreateQuestViewModel logic + tests | Zaynab | C5 (hard), V4.1 (hard) | Day 1 | Day 1–3 |
| V4.3a | Create-quest form: layout and text fields | Zaynab | C5 (hard) | Day 1 | Day 4–5 |
| V4.3b | Reward type picker and per-type fields | Ece | C5 (hard) | Day 1 | Day 2–3 |
| V4.3c | Saving/error states and open the form from the venue home | Zaynab | V4.2 (hard), V4.3a (hard), N0 (hard), N2 (hard) | Day 5 | Day 5 |
| E3.1 | Sort nearby quests by distance in MapViewModel | Ferit | C6 (hard) | Day 1 | Day 1–2 |
| E3.2 | NearbyQuestList component (rows, empty, location-off) | Yigit | C6 (hard) | Day 1 | Day 2–3 |
| E3.3 | Bottom sheet holding the list on MapScreen | Ferit | E3.2 (hard) | Day 3 | Day 3–5 |
| E3.4 | Row tap frames venue + opens card; View opens venue page | Ferit | E3.3 (hard), N1 (hard) | Day 5 | Day 5 |
| N1 | Open the venue page from the map card; Quests tab hosts overview (closes #20 gap) | Alisher | N0 (hard) | Day 1 | Day 2 |
| N2 | Venue home shell: Dashboard / Quests (New quest) / Profile | Vali | N0 (hard), G2.4 (hard) | Day 3 | Day 4–5 |
| D2 | VenueRepositoryFirestore + emulator tests | Yigit | V3.2 (hard) | Day 3 | Day 3–5 |
| D2p | Switch the venue provider to Firestore | Yigit | D2 (hard), G2.1 (hard) | Day 5 | Day 5 |
| D3p | Add and switch the user provider to Firestore | Ece | D3 (hard), G2.1 (hard) | Day 6 | Day 6 |
| D4 | Security rules v2, tested and deployed to around-67942 | Alisher | D1 (hard), DEC-1 (decision) | Day 2 | Day 3–4 |
| D5 | Quests + reservations from Firestore; MapDemoData out of src/main | Jiayi | G2.1 (hard), V4.1 (file) | Day 2 | Day 3 |
| D7a | Seed tool for the emulator (tools/seed) | Jiayi | D1 (hard) | Day 2 | Day 4–5 |
| D7b | Data day: everyone creates a real venue + quests through the app | Team | DEC-4 (decision), G3.3 (hard), V3.1 (hard), V4.3c (hard), D2p (hard), D5 (hard), D4 (hard) | Day 5 | Day 6 |
| T0 | E2E harness: emulator reset, account helpers, page-object base | Alisher | Q1 (hard) | Day 2 | Day 4–5 |
| T1 | E2E venue journey: sign up -> Venue -> name -> area -> new quest | Alisher | T0 (hard), G2.3 (hard), G3.2 (hard), G3.3 (hard), V3.1 (hard), N2 (hard), V4.3c (hard) | Day 5 | Day 5–6 |
| T2 | E2E explorer journey: seeded quest -> map -> nearby -> venue page | Vali | T0 (hard), G2.3 (hard), G3.2 (hard), E3.4 (hard), E4.2 (hard), D5 (hard) | Day 5 | Day 5–6 |
| A1 | Import venue page assets (asset-only PR) | Zaynab | F1 (hard), DS0 (file) | Day 3 | Day 4 |
| E4.1 | VenuePageViewModel logic + tests | Jiayi | C7 (hard) | Day 1 | Day 2–3 |
| E4.2 | Venue page skeleton: top bar, header, states, questRow/bottomBar slots | Yigit | C7 (hard), N0 (hard) | Day 1 | Day 4–5 |
| E4.3 | Quest rows on the venue page | Ferit | C7 (hard), V4.1 (file) | Day 1 | Day 4–5 |

### 3.4 Gated (stretch)

| ID | Title | Owner | Structural blockers (start) | Window |
|---|---|---|---|---|
| E4.4 | Quest detail sheet (only if rows are too dense) | Zaynab | E4.3 (hard) | Day 7 |
| E5.1 | Accept a quest in VenuePageViewModel | Jiayi | E4.1 (hard), DEC-1 (decision), DEC-2 (decision), DEC-3 (decision) | Day 6 |
| E5.2 | AcceptQuestBar component on the venue page | Vali | E4.2 (hard), C7 (hard), DEC-3 (decision) | Day 6 |
| T3 | E2E: accept -> sign in as venue -> dashboard lists it | Vali | T2 (hard), E5.1 (hard), E5.2 (hard), V9.2 (hard) | Day 7 |
| F2 | Figma: venue dashboard with >= 1 reservation | Ece | — (gate only) | Day 6 |
| A2 | Import dashboard assets (asset-only PR) | Ece | F2 (hard), DS0 (file) | Day 6 |
| V9.1 | DashboardViewModel (first commit = DashboardUiState contract) | Jiayi | DEC-1 (decision) | Day 7 |
| V9.2 | Dashboard reservation list (replaces stub; exposes row actions slot) | Ece | V9.1 (hard), N2 (hard), N0 (hard) | Day 7 |
| V10.1 | Approve / decline on a pending dashboard row | Jiayi | V9.1 (hard), V9.2 (hard) | Day 7 |
| F3 | Figma: explorer overview showing an accepted quest | Yigit | — (gate only) | Day 6 |
| A3 | Import overview assets (asset-only PR) | Yigit | F3 (hard), DS0 (file) | Day 6 |
| E6.1 | OverviewViewModel (first commit = OverviewUiState contract) | Zaynab | — (gate only) | Day 6 |
| E6.2 | Overview screen in the Quests tab (replaces stub) | Ferit | E6.1 (hard), N1 (hard), N0 (hard) | Day 6–7 |
| D8 | Geo-bounded quest query: download only quests near the explorer or the map view | — | D1 (hard), V4.1 (file), D7a (file), E3.4 (file) | Day 6–7 |

### 3.5 Pending decisions (planning meeting, Day 1)

| ID | Decision | What it blocks |
|---|---|---|
| DEC-1 = C8 | Party model: a reservation is the party; add leaderUid and partyNames? (= contract C8) | D1 (finish), D4 (start), E5.1 (start), F2 (finish), V9.1 (start) |
| DEC-2 | slotStart when accepting a quest (recommendation: now) | E5.1 (start) |
| DEC-3 | Quests needing a party > 1: allow accept and show 'needs N more'? | E5.1 (start), E5.2 (start) |
| DEC-4 | Real business names in production data: consent or fictional names | D7b (start) |
| DEC-5 | Confirm new story IDs E4/E5/E6 and V1 as persistence parent | — (no code blocked; process only) |
| DEC-6 | Schema sign-off rule: silence by Day 2 noon = approval | D1 (finish) |

## 4. Chronological blocking: critical paths

These are chains of `hard` edges with the planned windows. A slip anywhere on them moves the end of the chain. The slack is Day 7 (buffer day).

| # | Chain | Ends | Slack | Mitigation |
|---|---|---|---|---|
| CP-1 | C2 (Day 1) → G2.1 (Day 1–2) → G2.4 (Day 3) → **N2 (Day 4–5)** → V4.3c (Day 5) → T1 (Day 5–6) | Day 6 | 1 day | N2 ships the Quests tab with the *New quest* button first (split N2 if needed). V4.3c and T1 are the most exposed |
| CP-2 | C6 (Day 1) → E3.2 (Day 2–3) → **E3.3 (Day 3–5)** → E3.4 (Day 5) → T2 (Day 5–6) | Day 6 | 1 day | E3.3 can start with a static list. T2 can be written step by step from Day 5 |
| CP-3 | C2 → G2.1 (Day 2) → D5 (Day 3) → T2 (Day 5–6) | Day 6 | 2 days | Only real wait on auth: rules need sign-in to read quests |
| CP-4 | V3.1 (Day 1) → V3.2 (Day 2–3) → **D2 (Day 3–5)** → D2p (Day 5) → D7b data day (Day 6) | Day 6 | 1 day | Data day can run on Day 7 if D2 slips |
| CP-5 | DEC-1 (Day 1) → D1 schema (Day 1–2) → D4 rules + deploy (Day 3–4) → D7b (Day 6) | Day 6 | 2 days | DEC-6 stops D1 from stalling |
| CP-6 *(stretch)* | C7 → E4.1 (Day 3) → E5.1 (Day 6) · E4.2 (Day 5) → E5.2 (Day 6) · V9.1 → V9.2 (Day 7) → **T3 (Day 7)** | Day 7 | 0 days | Over-subscribed. T3 is the first item to drop |

## 5. Chronological blocking: owner queues

Each owner's tasks in planned order. A task's `owner-queue` blocker is the row above it. Rows after **— stretch gate —** wait until all rows above are done.

### Ferit (@ferido1510)

| # | ID | Title | Window | Size | Structural blockers owned by others |
|---|---|---|---|---|---|
| 1 | C6 | NearbyQuest data class + MapUiState.nearby | Day 1 | S | — |
| 2 | DS0 | Design tokens and fonts in the theme (asset-only PR) | Day 1 | S | — |
| 3 | E3.1 | Sort nearby quests by distance in MapViewModel | Day 1–2 | M | — |
| 4 | Q2 | One tap-the-map-until-it-counts helper for device tests | Day 2–3 | M | V3.1 (Yigit, file), Q1 (Alisher, soft) |
| 5 | E3.3 | Bottom sheet holding the list on MapScreen | Day 3–5 | M | E3.2 (Yigit, hard) |
| 6 | E4.3 | Quest rows on the venue page | Day 4–5 | M | C7 (Jiayi, hard), E4.2 (Yigit, soft), F1 (Zaynab, soft), A1 (Zaynab, soft), V4.1 (Zaynab, file) |
| 7 | E3.4 | Row tap frames venue + opens card; View opens venue page | Day 5 | S | N1 (Alisher, hard) |
| | **— stretch gate —** | | | | |
| 8 | E6.2 | Overview screen in the Quests tab (replaces stub) | Day 6–7 | M | E6.1 (Zaynab, hard), N1 (Alisher, hard), N0 (Alisher, hard), A3 (Yigit, soft), E5.1 (Jiayi, soft) |

### Zaynab (@zaynab79i)

| # | ID | Title | Window | Size | Structural blockers owned by others |
|---|---|---|---|---|---|
| 1 | V4.1 | Reward model and Firestore mapping (merge PR #76; doc checkbox moved to D1) | Day 1 | S | — |
| 2 | C5 | CreateQuestUiState, RewardFormState, RewardType + ViewModel stubs | Day 1 | S | — |
| 3 | V4.2 | CreateQuestViewModel logic + tests | Day 1–3 | L | — |
| 4 | F1 | Figma: venue page (light/dark, incl. accept-bar state) | Day 2–3 | M | — |
| 5 | A1 | Import venue page assets (asset-only PR) | Day 4 | S | DS0 (Ferit, file) |
| 6 | V4.3a | Create-quest form: layout and text fields | Day 4–5 | M | — |
| 7 | V4.3c | Saving/error states and open the form from the venue home | Day 5 | S | N0 (Alisher, hard), N2 (Vali, hard), V4.3b (Ece, soft) |
| | **— stretch gate —** | | | | |
| 8 | E6.1 | OverviewViewModel (first commit = OverviewUiState contract) | Day 6 | M | D5 (Jiayi, soft) |
| 9 | E4.4 | Quest detail sheet (only if rows are too dense) | Day 7 | S | E4.3 (Ferit, hard) |

### Yigit (@yeet-yildiz)

| # | ID | Title | Window | Size | Structural blockers owned by others |
|---|---|---|---|---|---|
| 1 | V3.1 | Save and load the venue's marker and radius (= contract C4) | Day 1 | S | — |
| 2 | E3.2 | NearbyQuestList component (rows, empty, location-off) | Day 2–3 | M | C6 (Ferit, hard) |
| 3 | V3.2 | Save the picked address with the area | Day 2–3 | S | — |
| 4 | D2 | VenueRepositoryFirestore + emulator tests | Day 3–5 | L | Q3 (Jiayi, soft), D1 (Jiayi, soft) |
| 5 | E4.2 | Venue page skeleton: top bar, header, states, questRow/bottomBar slots | Day 4–5 | M | C7 (Jiayi, hard), N0 (Alisher, hard), E4.1 (Jiayi, soft), A1 (Zaynab, soft) |
| 6 | D2p | Switch the venue provider to Firestore | Day 5 | S | G2.1 (Vali, hard) |
| | **— stretch gate —** | | | | |
| 7 | F3 | Figma: explorer overview showing an accepted quest | Day 6 | M | — |
| 8 | A3 | Import overview assets (asset-only PR) | Day 6 | S | DS0 (Ferit, file) |

### Ece (@ecetos)

| # | ID | Title | Window | Size | Structural blockers owned by others |
|---|---|---|---|---|---|
| 1 | G3.1 | Role selection ViewModel | Day 1–2 | S | C3 (Vali, soft) |
| 2 | V4.3b | Reward type picker and per-type fields | Day 2–3 | M | C5 (Zaynab, hard), V4.3a (Zaynab, soft) |
| 3 | G3.2 | Role selection screen (Figma #27) | Day 3 | M | C2 (Vali, soft) |
| 4 | G3.3 | Venue entry: resume onboarding or open venue home (rewrite of #79) | Day 4 | M | C2 (Vali, hard), V3.1 (Yigit, hard), N0 (Alisher, hard), G2.3 (Vali, soft), N2 (Vali, soft) |
| 5 | D3 | UserRepositoryFirestore + emulator tests | Day 4–6 | L | Q3 (Jiayi, soft), D1 (Jiayi, soft) |
| 6 | D3p | Add and switch the user provider to Firestore | Day 6 | S | G2.1 (Vali, hard) |
| | **— stretch gate —** | | | | |
| 7 | F2 | Figma: venue dashboard with >= 1 reservation | Day 6 | M | DEC-1 (Jiayi, decision) |
| 8 | A2 | Import dashboard assets (asset-only PR) | Day 6 | S | DS0 (Ferit, file) |
| 9 | V9.2 | Dashboard reservation list (replaces stub; exposes row actions slot) | Day 7 | M | V9.1 (Jiayi, hard), N2 (Vali, hard), N0 (Alisher, hard) |

### Vali (@valigadayev-lgtm)

| # | ID | Title | Window | Size | Structural blockers owned by others |
|---|---|---|---|---|---|
| 1 | C2 | AppRoot slot signature: authFlow, roleSelection, explorerHome, venueEntry | Day 1 | S | — |
| 2 | C3 | AuthRepository.currentUserEmail (+ fake + Firebase impl) | Day 1 | S | — |
| 3 | G2.1 | Show the sign-in flow or the app from the saved session | Day 1–2 | M | — |
| 4 | G2.2 | Clear the back stack on sign-in and sign-out | Day 2 | S | — |
| 5 | G2.3 | Route a signed-in user by role | Day 3 | M | D3p (Ece, soft) |
| 6 | G2.4 | Sign out from the Profile tab | Day 3 | S | — |
| 7 | N2 | Venue home shell: Dashboard / Quests (New quest) / Profile | Day 4–5 | M | N0 (Alisher, hard) |
| 8 | T2 | E2E explorer journey: seeded quest -> map -> nearby -> venue page | Day 5–6 | M | T0 (Alisher, hard), G3.2 (Ece, hard), E3.4 (Ferit, hard), E4.2 (Yigit, hard), D5 (Jiayi, hard), E4.3 (Ferit, soft) |
| | **— stretch gate —** | | | | |
| 9 | E5.2 | AcceptQuestBar component on the venue page | Day 6 | M | E4.2 (Yigit, hard), C7 (Jiayi, hard), DEC-3 (Team, decision), E5.1 (Jiayi, soft) |
| 10 | T3 | E2E: accept -> sign in as venue -> dashboard lists it | Day 7 | M | E5.1 (Jiayi, hard), V9.2 (Ece, hard) |

### Jiayi (@jiayizhngepfl)

| # | ID | Title | Window | Size | Structural blockers owned by others |
|---|---|---|---|---|---|
| 1 | DEC-1 | Party model: a reservation is the party; add leaderUid and partyNames? (= contract C8) | Day 1 | S | — |
| 2 | C7 | VenuePageUiState + VenuePageQuest + ViewModel stub | Day 1 | S | — |
| 3 | Q3 | Shared Firestore emulator test support | Day 1 | S | — |
| 4 | HK-1 | Close duplicate/finished issues #9 #22 #26 #29, verify and close #50, file Google sign-in backlog issue | Day 1 | S | — |
| 5 | D1 | Finalize Firestore schema v1 (#23 / PR #25) | Day 1–2 | M | DEC-6 (Team, decision), V4.1 (Zaynab, soft) |
| 6 | E4.1 | VenuePageViewModel logic + tests | Day 2–3 | M | — |
| 7 | D5 | Quests + reservations from Firestore; MapDemoData out of src/main | Day 3 | S | G2.1 (Vali, hard), V4.1 (Zaynab, file), D4 (Alisher, soft) |
| 8 | D7a | Seed tool for the emulator (tools/seed) | Day 4–5 | L | — |
| | **— stretch gate —** | | | | |
| 9 | E5.1 | Accept a quest in VenuePageViewModel | Day 6 | M | DEC-2 (Team, decision), DEC-3 (Team, decision), D4 (Alisher, soft) |
| 10 | V9.1 | DashboardViewModel (first commit = DashboardUiState contract) | Day 7 | M | — |
| 11 | V10.1 | Approve / decline on a pending dashboard row | Day 7 | S | V9.2 (Ece, hard) |

### Alisher (@mcpeblocker)

| # | ID | Title | Window | Size | Structural blockers owned by others |
|---|---|---|---|---|---|
| 1 | N0 | Route contract: every Sprint 2 route with a Coming-soon stub (= contract C1) | Day 1 | S | — |
| 2 | Q1 | CI emulator = API 37 / Pixel 10a + repo hygiene | Day 1–2 | M | — |
| 3 | N1 | Open the venue page from the map card; Quests tab hosts overview (closes #20 gap) | Day 2 | S | — |
| 4 | D4 | Security rules v2, tested and deployed to around-67942 | Day 3–4 | M | D1 (Jiayi, hard), DEC-1 (Jiayi, decision) |
| 5 | T0 | E2E harness: emulator reset, account helpers, page-object base | Day 4–5 | M | — |
| 6 | T1 | E2E venue journey: sign up -> Venue -> name -> area -> new quest | Day 5–6 | M | G2.3 (Vali, hard), G3.2 (Ece, hard), G3.3 (Ece, hard), V3.1 (Yigit, hard), N2 (Vali, hard), V4.3c (Zaynab, hard), Q2 (Ferit, soft), D2p (Yigit, soft), D3p (Ece, soft) |
| 7 | M1 | M1 deliverables: release APK, wiki links, sprint backlog view | Day 7 | S | T2 (Vali, soft) |

## 6. Unblock timeline (if every task merges by the end of its window)

A task becomes structurally unblocked on the day its last `hard`/`file`/`decision(start)` blocker is due. Same-day means the blocker is a contract merged on the morning of that day.

| Day | Becomes structurally unblocked | Planned to start |
|---|---|---|
| Day 1 | G2.1, G3.3, V3.2, C5, V4.2, V4.3a, V4.3b, E3.1, E3.2, Q2, N1, E4.1, E4.2, E4.3, V9.1 | HK-1, C2, C3, G2.1, G3.1, V3.1, V4.1, C5, V4.2, C6, E3.1, Q1, Q3, N0, D1, DS0, C7 |
| Day 2 | G2.2, G2.3, G2.4, G3.2, D4, D5, D7a, T0 | G2.2, V3.2, V4.3b, E3.2, Q2, N1, F1, E4.1 |
| Day 3 | E3.3, N2, D2, A1, E5.1 | G2.3, G2.4, G3.2, E3.3, D2, D4, D5 |
| Day 4 | — | G3.3, V4.3a, N2, D3, D7a, T0, A1, E4.2, E4.3 |
| Day 5 | V4.3c, E3.4, D2p, D7b, T1, T2, E4.4, E5.2, D8 | V4.3c, E3.4, D2p, T1, T2 |
| Day 6 | D3p, A2, A3, E6.2 | D3p, D7b, E5.1, E5.2, F2, A2, F3, A3, E6.1, E6.2, D8 |
| Day 7 | T3, V9.2, V10.1 | M1, E4.4, T3, V9.1, V9.2, V10.1 |

## 7. Full task register

`Blocks` lists the tasks that have this one as a blocker (`h` = hard, `s` = soft, `f` = file, `d` = decision).

### Tier 0: deferred from Sprint 1

| ID | Kind | Title | Story | Parent | Owner | Rev. | Size | Window | Prio | Hard / file (start) | Soft (finish) | Decisions | Blocks | Initial | GitHub / existing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| HK-1 | process | Close duplicate/finished issues #9 #22 #26 #29, verify and close #50, file Google sign-in backlog issue | G1,V4 | PROC | Jiayi | Alisher | S | Day 1 | must | — | — | — | — | `ready` | #9 #22 #26 #29 #50 |
| G2 | story | Route users by session and role | G2 | — | Vali | — | — | Day 1–3 | must | — | — | — | — | `open` | #7 · PR #86 (draft) |
| G3 | story | Choose a role and finish venue onboarding | G3 | — | Ece | — | — | Day 1–4 | must | — | — | — | — | `open` | #79 (absorbed) |
| V3 | story | Confirm the venue's area (save/load + address) | V3 | — | Yigit | — | — | Day 1–3 | must | — | — | — | — | `open` | #88 #89 |
| V4 | story | Create a quest | V4 | — | Zaynab | — | — | Day 1–5 | must | — | — | — | — | `open` | #73 |
| E3 | story | Nearby quests sorted by distance | E3 | — | Ferit | — | — | Day 1–5 | must | — | — | — | — | `open` | #91 |
| M1 | process | M1 deliverables: release APK, wiki links, sprint backlog view | PROC | PROC | Alisher | Jiayi | S | Day 7 | must | — | Q1, T1, T2 | — | — | `ready-scheduled` | #12 |
| C2 | contract | AppRoot slot signature: authFlow, roleSelection, explorerHome, venueEntry | G2 | G2 | Vali | Alisher | S | Day 1 | must | — | — | — | G2.1 (h), G3.2 (s), G3.3 (h) | `ready` | — |
| C3 | contract | AuthRepository.currentUserEmail (+ fake + Firebase impl) | G2 | G2 | Vali | Ece | S | Day 1 | must | — | — | — | G3.1 (s) | `ready` | — |
| G2.1 | task | Show the sign-in flow or the app from the saved session | G2 | G2 | Vali | Alisher | M | Day 1–2 | must | C2 | — | — | G2.2 (h), G2.3 (h), G2.4 (h), D2p (h), D3p (h), D5 (h) | `blocked` | code in PR #86 |
| G2.2 | task | Clear the back stack on sign-in and sign-out | G2 | G2 | Vali | Ece | S | Day 2 | must | G2.1 | — | — | G2.4 (s) | `blocked` | code in PR #86 |
| G2.3 | task | Route a signed-in user by role | G2 | G2 | Vali | Ece | M | Day 3 | must | G2.1 | D3p | — | G3.3 (s), N2 (s), T1 (h), T2 (h) | `blocked` | RoleNavigation in PR #86 |
| G2.4 | task | Sign out from the Profile tab | G2 | G2 | Vali | Alisher | S | Day 3 | must | G2.1 | G2.2 | — | N2 (h) | `blocked` | — |
| G3.1 | task | Role selection ViewModel | G3 | G3 | Ece | Vali | S | Day 1–2 | must | — | C3 | — | G3.2 (h) | `ready` | — |
| G3.2 | task | Role selection screen (Figma #27) | G3 | G3 | Ece | Zaynab | M | Day 3 | must | G3.1 | C2 | — | T1 (h), T2 (h) | `blocked` | — |
| G3.3 | task | Venue entry: resume onboarding or open venue home (rewrite of #79) | G3 | G3 | Ece | Yigit | M | Day 4 | must | C2, V3.1, N0 | G2.3, N2 | — | D7b (h), T1 (h) | `blocked` | #79 |
| V3.1 = C4 | task | Save and load the venue's marker and radius (= contract C4) | V3 | V3 | Yigit | Ece | S | Day 1 | must | — | — | — | G3.3 (h), V3.2 (h), Q2 (f), D7b (h), T1 (h) | `ready` | #88 · code in PR #92 (opened backwards, closed) |
| V3.2 | task | Save the picked address with the area | V3 | V3 | Yigit | Ferit | S | Day 2–3 | must | V3.1 | — | — | D2 (h) | `blocked` | — |
| V4.1 | task | Reward model and Firestore mapping (merge PR #76; doc checkbox moved to D1) | V4 | V4 | Zaynab | Ferit | S | Day 1 | must | — | — | — | C5 (h), V4.2 (h), D1 (s), D5 (f), E4.3 (f), D8 (f) | `ready` | #74 · PR #76 (draft, complete) |
| C5 | contract | CreateQuestUiState, RewardFormState, RewardType + ViewModel stubs | V4 | V4.2 | Zaynab | Ece | S | Day 1 | must | V4.1 | — | — | V4.2 (h), V4.3a (h), V4.3b (h) | `blocked` | — |
| V4.2 | task | CreateQuestViewModel logic + tests | V4 | V4 | Zaynab | Jiayi | L | Day 1–3 | must | C5, V4.1 | — | — | V4.3a (s), V4.3c (h) | `blocked` | #75 |
| V4.3a | task | Create-quest form: layout and text fields | V4 | V4 | Zaynab | Ece | M | Day 4–5 | must | C5 | V4.2 | — | V4.3b (s), V4.3c (h) | `blocked` | #32 |
| V4.3b | task | Reward type picker and per-type fields | V4 | V4 | Ece | Zaynab | M | Day 2–3 | must | C5 | V4.3a | — | V4.3c (s) | `blocked` | #32 |
| V4.3c | task | Saving/error states and open the form from the venue home | V4 | V4 | Zaynab | Vali | S | Day 5 | must | V4.2, V4.3a, N0, N2 | V4.3b | — | D7b (h), T1 (h) | `blocked` | #32 |
| C6 | contract | NearbyQuest data class + MapUiState.nearby | E3 | E3.1 | Ferit | Yigit | S | Day 1 | must | — | — | — | E3.1 (h), E3.2 (h) | `ready` | — |
| E3.1 | task | Sort nearby quests by distance in MapViewModel | E3 | E3 | Ferit | Jiayi | M | Day 1–2 | must | C6 | — | — | E3.3 (s) | `blocked` | #91 |
| E3.2 | task | NearbyQuestList component (rows, empty, location-off) | E3 | E3 | Yigit | Ferit | M | Day 2–3 | must | C6 | — | — | E3.3 (h) | `blocked` | #91 |
| E3.3 | task | Bottom sheet holding the list on MapScreen | E3 | E3 | Ferit | Yigit | M | Day 3–5 | must | E3.2 | E3.1 | — | E3.4 (h) | `blocked` | #91 |
| E3.4 | task | Row tap frames venue + opens card; View opens venue page | E3 | E3 | Ferit | Alisher | S | Day 5 | must | E3.3, N1 | — | — | T2 (h), D8 (f) | `blocked` | #91 |

### Tier 1: flaky cleanup

| ID | Kind | Title | Story | Parent | Owner | Rev. | Size | Window | Prio | Hard / file (start) | Soft (finish) | Decisions | Blocks | Initial | GitHub / existing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Q | story | Make CI trustworthy (map + Firestore tests) | E2,V3,V4,V9 | — | Alisher | — | — | Day 1–3 | must | — | — | — | — | `open` | #95 |
| Q1 | task | CI emulator = API 37 / Pixel 10a + repo hygiene | E2,V3 | Q | Alisher | Yigit | M | Day 1–2 | must | — | — | — | M1 (s), Q2 (s), T0 (h) | `ready` | #95 |
| Q2 | task | One tap-the-map-until-it-counts helper for device tests | E2,V3 | Q | Ferit | Yigit | M | Day 2–3 | must | V3.1 (f) | Q1 | — | T1 (s) | `ready-scheduled` | — |
| Q3 | task | Shared Firestore emulator test support | V1,V4,V9 | Q | Jiayi | Zaynab | S | Day 1 | must | — | — | — | D2 (s), D3 (s) | `ready` | — |

### Tier 2: connect screens

| ID | Kind | Title | Story | Parent | Owner | Rev. | Size | Window | Prio | Hard / file (start) | Soft (finish) | Decisions | Blocks | Initial | GitHub / existing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| N | story | No dead ends between screens | G2,E4,V4 | — | Alisher | — | — | Day 1–5 | must | — | — | — | — | `open` | — |
| N0 = C1 | contract | Route contract: every Sprint 2 route with a Coming-soon stub (= contract C1) | G2 | N | Alisher | Vali | S | Day 1 | must | — | — | — | G3.3 (h), V4.3c (h), N1 (h), N2 (h), E4.2 (h), V9.2 (h), E6.2 (h) | `ready` | — |
| N1 | task | Open the venue page from the map card; Quests tab hosts overview (closes #20 gap) | E4 | N | Alisher | Ferit | S | Day 2 | must | N0 | — | — | E3.4 (h), E6.2 (h) | `blocked` | #20 |
| N2 | task | Venue home shell: Dashboard / Quests (New quest) / Profile | V4,V9 | N | Vali | Alisher | M | Day 4–5 | must | N0, G2.4 | G2.3 | — | G3.3 (s), V4.3c (h), T1 (h), V9.2 (h) | `blocked` | — |

### Tier 3: mocks → Firestore

| ID | Kind | Title | Story | Parent | Owner | Rev. | Size | Window | Prio | Hard / file (start) | Soft (finish) | Decisions | Blocks | Initial | GitHub / existing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| V1 | story | Venue and user data persists (mocks -> Firestore, real data) | V1,E2 | — | Jiayi | — | — | Day 1–6 | must | — | — | — | — | `open` | #6 #23 |
| D1 | task | Finalize Firestore schema v1 (#23 / PR #25) | V1 | V1 | Jiayi | alisher+zaynab | M | Day 1–2 | must | — | V4.1 | DEC-1 (finish), DEC-6 (finish) | D2 (s), D3 (s), D4 (h), D7a (h), D8 (h) | `ready` | #23 · PR #25 (draft since Oct 4) |
| D2 | task | VenueRepositoryFirestore + emulator tests | V1,V3 | V1 | Yigit | Zaynab | L | Day 3–5 | must | V3.2 | Q3, D1 | — | D2p (h) | `blocked` | — |
| D2p | task | Switch the venue provider to Firestore | V1 | V1 | Yigit | Jiayi | S | Day 5 | must | D2, G2.1 | — | — | D7b (h), T1 (s) | `blocked` | — |
| D3 | task | UserRepositoryFirestore + emulator tests | V1,G3 | V1 | Ece | Vali | L | Day 4–6 | must | — | Q3, D1 | — | D3p (h) | `ready-scheduled` | — |
| D3p | task | Add and switch the user provider to Firestore | V1,G3 | V1 | Ece | Vali | S | Day 6 | must | D3, G2.1 | — | — | G2.3 (s), D7b (s), T1 (s) | `blocked` | — |
| D4 | task | Security rules v2, tested and deployed to around-67942 | V1,E5 | V1 | Alisher | Jiayi | M | Day 3–4 | must | D1 | — | DEC-1 (start) | D5 (s), D7b (h), E5.1 (s), D8 (s) | `blocked` | — |
| D5 | task | Quests + reservations from Firestore; MapDemoData out of src/main | E2 | V1 | Jiayi | Ferit | S | Day 3 | must | G2.1, V4.1 (f) | D4 | — | D7a (s), D7b (h), T2 (h), E5.1 (s), V9.1 (s), E6.1 (s), D8 (s) | `blocked` | — |
| D7a | task | Seed tool for the emulator (tools/seed) | V1,E2 | V1 | Jiayi | Alisher | L | Day 4–5 | must | D1 | D5 | — | D8 (f) | `blocked` | — |
| D7b | task | Data day: everyone creates a real venue + quests through the app | V1,E2 | V1 | Team | Jiayi | S | Day 6 | must | G3.3, V3.1, V4.3c, D2p, D5, D4 | D3p | DEC-4 (start) | — | `blocked` | — |
| D8 | task | Geo-bounded quest query: download only quests near the explorer or the map view | V1,E2 | V1 | — | — | L | Day 6–7 | stretch | D1, V4.1 (f), D7a (f), E3.4 (f) | D5, D4 | — | — | `gated+blocked` | new (file under #6) |
| DS0 | task | Design tokens and fonts in the theme (asset-only PR) | E2,E4,V4 | V1 | Ferit | Zaynab | S | Day 1 | must | — | — | — | A1 (f), A2 (f), A3 (f) | `ready` | — |

### Tier 4: end-to-end

| ID | Kind | Title | Story | Parent | Owner | Rev. | Size | Window | Prio | Hard / file (start) | Soft (finish) | Decisions | Blocks | Initial | GitHub / existing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| T | story | Core loop works end to end | V4,E4 | — | Alisher | — | — | Day 4–6 | must | — | — | — | — | `open` | — |
| T0 | task | E2E harness: emulator reset, account helpers, page-object base | V4,E4 | T | Alisher | Vali | M | Day 4–5 | must | Q1 | — | — | T1 (h), T2 (h) | `blocked` | — |
| T1 | task | E2E venue journey: sign up -> Venue -> name -> area -> new quest | V4 | T | Alisher | Ece | M | Day 5–6 | must | T0, G2.3, G3.2, G3.3, V3.1, N2, V4.3c | Q2, D2p, D3p | — | M1 (s) | `blocked` | — |
| T2 | task | E2E explorer journey: seeded quest -> map -> nearby -> venue page | E4 | T | Vali | Ferit | M | Day 5–6 | must | T0, G2.3, G3.2, E3.4, E4.2, D5 | E4.3 | — | M1 (s), T3 (h) | `blocked` | — |

### Tier 5: venue page

| ID | Kind | Title | Story | Parent | Owner | Rev. | Size | Window | Prio | Hard / file (start) | Soft (finish) | Decisions | Blocks | Initial | GitHub / existing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| E4 | story | See a venue's page and its quests | E4 | — | Yigit | — | — | Day 1–5 | must | — | — | — | — | `open` | — |
| F1 | task | Figma: venue page (light/dark, incl. accept-bar state) | E4 | E4 | Zaynab | Yigit | M | Day 2–3 | must | — | — | — | A1 (h), E4.3 (s) | `ready-scheduled` | — |
| A1 | task | Import venue page assets (asset-only PR) | E4 | E4 | Zaynab | Ferit | S | Day 4 | must | F1, DS0 (f) | — | — | E4.2 (s), E4.3 (s) | `blocked` | — |
| C7 | contract | VenuePageUiState + VenuePageQuest + ViewModel stub | E4 | E4.1 | Jiayi | Yigit | S | Day 1 | must | — | — | — | E4.1 (h), E4.2 (h), E4.3 (h), E5.2 (h) | `ready` | — |
| E4.1 | task | VenuePageViewModel logic + tests | E4 | E4 | Jiayi | Yigit | M | Day 2–3 | must | C7 | — | — | E4.2 (s), E5.1 (h) | `blocked` | — |
| E4.2 | task | Venue page skeleton: top bar, header, states, questRow/bottomBar slots | E4 | E4 | Yigit | Jiayi | M | Day 4–5 | must | C7, N0 | E4.1, A1 | — | T2 (h), E4.3 (s), E5.2 (h) | `blocked` | — |
| E4.3 | task | Quest rows on the venue page | E4 | E4 | Ferit | Zaynab | M | Day 4–5 | must | C7, V4.1 (f) | E4.2, F1, A1 | — | T2 (s), E4.4 (h) | `blocked` | — |
| E4.4 | task | Quest detail sheet (only if rows are too dense) | E4 | E4 | Zaynab | Ferit | S | Day 7 | stretch | E4.3 | — | — | — | `gated+blocked` | — |

### Tier 6: accept a quest (stretch)

| ID | Kind | Title | Story | Parent | Owner | Rev. | Size | Window | Prio | Hard / file (start) | Soft (finish) | Decisions | Blocks | Initial | GitHub / existing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| E5 | story | Accept a quest and form a party | E5 | — | Jiayi | — | — | Day 6–7 | stretch | — | — | — | — | `open` | — |
| E5.1 | task | Accept a quest in VenuePageViewModel | E5 | E5 | Jiayi | Vali | M | Day 6 | stretch | E4.1 | D5, D4 | DEC-1 (start), DEC-2 (start), DEC-3 (start) | E5.2 (s), T3 (h), E6.2 (s) | `gated+blocked` | — |
| E5.2 | task | AcceptQuestBar component on the venue page | E5 | E5 | Vali | Yigit | M | Day 6 | stretch | E4.2, C7 | E5.1 | DEC-3 (start) | T3 (h) | `gated+blocked` | — |
| T3 | task | E2E: accept -> sign in as venue -> dashboard lists it | E5,V9 | T | Vali | Jiayi | M | Day 7 | stretch | T2, E5.1, E5.2, V9.2 | — | — | — | `gated+blocked` | — |

### Tier 7: nice-to-have screens (stretch)

| ID | Kind | Title | Story | Parent | Owner | Rev. | Size | Window | Prio | Hard / file (start) | Soft (finish) | Decisions | Blocks | Initial | GitHub / existing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| V9 | story | Receive reservation requests on the venue dashboard | V9 | — | Jiayi | — | — | Day 6–7 | stretch | — | — | — | — | `open` | #93 |
| V10 | story | Approve a reservation | V10 | — | Jiayi | — | — | Day 7 | stretch | — | — | — | — | `open` | #94 |
| E6 | story | See my accepted quest (explorer overview) | E6 | — | Zaynab | — | — | Day 6–7 | stretch | — | — | — | — | `open` | — |
| F2 | task | Figma: venue dashboard with >= 1 reservation | V9 | V9 | Ece | Jiayi | M | Day 6 | stretch | — | — | DEC-1 (finish) | A2 (h) | `gated` | — |
| A2 | task | Import dashboard assets (asset-only PR) | V9 | V9 | Ece | Vali | S | Day 6 | stretch | F2, DS0 (f) | — | — | V9.2 (s) | `gated+blocked` | — |
| V9.1 | task | DashboardViewModel (first commit = DashboardUiState contract) | V9 | V9 | Jiayi | Ece | M | Day 7 | stretch | — | D5 | DEC-1 (start) | V9.2 (h), V10.1 (h) | `gated+blocked` | — |
| V9.2 | task | Dashboard reservation list (replaces stub; exposes row actions slot) | V9 | V9 | Ece | Vali | M | Day 7 | stretch | V9.1, N2, N0 | A2 | — | T3 (h), V10.1 (h) | `gated+blocked` | — |
| V10.1 | task | Approve / decline on a pending dashboard row | V10 | V10 | Jiayi | Ece | S | Day 7 | stretch | V9.1, V9.2 | — | — | — | `gated+blocked` | — |
| F3 | task | Figma: explorer overview showing an accepted quest | E6 | E6 | Yigit | Zaynab | M | Day 6 | stretch | — | — | — | A3 (h) | `gated` | — |
| A3 | task | Import overview assets (asset-only PR) | E6 | E6 | Yigit | Ferit | S | Day 6 | stretch | F3, DS0 (f) | — | — | E6.2 (s) | `gated+blocked` | — |
| E6.1 | task | OverviewViewModel (first commit = OverviewUiState contract) | E6 | E6 | Zaynab | Jiayi | M | Day 6 | stretch | — | D5 | — | E6.2 (h) | `gated` | — |
| E6.2 | task | Overview screen in the Quests tab (replaces stub) | E6 | E6 | Ferit | Zaynab | M | Day 6–7 | stretch | E6.1, N1, N0 | A3, E5.1 | — | — | `gated+blocked` | — |

### 7.1 Why each structural edge exists

| Task | Blocker | Kind | Reason |
|---|---|---|---|
| M1 | Q1 | soft | release needs a green CI |
| M1 | T1 | soft | core loop green before release |
| M1 | T2 | soft | core loop green before release |
| G2.1 | C2 | hard | builds on the slot signature |
| G2.2 | G2.1 | hard | same file, needs the gate |
| G2.3 | G2.1 | hard | routing sits inside the signed-in branch |
| G2.3 | D3p | soft | real roles only once the user provider serves Firestore; fake until then |
| G2.4 | G2.1 | hard | sign-out must land on the gate |
| G2.4 | G2.2 | soft | back-stack clearing after sign-out |
| G3.1 | C3 | soft | needs currentUserEmail; can take an email lambda until C3 merges |
| G3.2 | G3.1 | hard | screen renders the ViewModel's state |
| G3.2 | C2 | soft | plugs into the roleSelection slot |
| G3.3 | C2 | hard | implements the venueEntry slot |
| G3.3 | V3.1 | hard | registers VenueAreaScreen(venueId, onSaved, onBack) = contract C4 |
| G3.3 | N0 | hard | navigates to the venue-home route |
| G3.3 | G2.3 | soft | final registration in the role router |
| G3.3 | N2 | soft | venue home is a stub until N2 |
| V3.2 | V3.1 | hard | extends the save path and the same ViewModel |
| C5 | V4.1 | hard | the form state references the Reward subtypes |
| V4.2 | C5 | hard | implements the contract |
| V4.2 | V4.1 | hard | saves typed rewards |
| V4.3a | C5 | hard | renders CreateQuestUiState |
| V4.3a | V4.2 | soft | real validation only with the ViewModel logic |
| V4.3b | C5 | hard | stateless over RewardFormState |
| V4.3b | V4.3a | soft | plugged into the form's rewardFields slot |
| V4.3c | V4.2 | hard | states come from the ViewModel |
| V4.3c | V4.3a | hard | same screen file |
| V4.3c | N0 | hard | replaces the create-quest stub destination |
| V4.3c | N2 | hard | entry point is the venue home's New quest button |
| V4.3c | V4.3b | soft | reward fields plugged in |
| E3.1 | C6 | hard | fills the contract |
| E3.2 | C6 | hard | renders NearbyQuest |
| E3.3 | E3.2 | hard | hosts the list component |
| E3.3 | E3.1 | soft | list is empty until the ViewModel fills it |
| E3.4 | E3.3 | hard | same screen, needs the sheet |
| E3.4 | N1 | hard | View navigates to the venue route |
| Q2 | V3.1 | file | V3.1 adds a test to VenueAreaScreenDeviceTest.kt; rewrite taps after it lands |
| Q2 | Q1 | soft | 5 green runs must be on the new CI emulator |
| N1 | N0 | hard | the venue route must exist |
| N2 | N0 | hard | tabs host the stub destinations |
| N2 | G2.4 | hard | reuses ProfileScreen |
| N2 | G2.3 | soft | reached through the router's venueEntry -> home |
| D1 | DEC-1 | decision | finish: reservation party fields |
| D1 | DEC-6 | decision | finish: sign-off rule for merging |
| D1 | V4.1 | soft | documents the reward map from PR #76 |
| D2 | V3.2 | hard | implements the address-aware setArea interface |
| D2 | Q3 | soft | tests use the shared support |
| D2 | D1 | soft | fields per schema v1 |
| D2p | D2 | hard | needs the implementation |
| D2p | G2.1 | hard | rules require sign-in to read venues |
| D3 | Q3 | soft | tests use the shared support |
| D3 | D1 | soft | fields per schema v1 |
| D3p | D3 | hard | needs the implementation |
| D3p | G2.1 | hard | users are owner-only: sign-in first |
| D4 | D1 | hard | rules follow schema v1 |
| D4 | DEC-1 | decision | start: reservation fields to allow |
| D5 | G2.1 | hard | rules require sign-in to read quests |
| D5 | V4.1 | file | edits model/quest/ after the Reward change |
| D5 | D4 | soft | production reads need rules v2 deployed |
| D7a | D1 | hard | seed documents follow schema v1 |
| D7a | D5 | soft | MapDemoData becomes the seed input |
| D7b | DEC-4 | decision | start: which names to use |
| D7b | G3.3 | hard | onboarding reachable in the app |
| D7b | V3.1 | hard | area must save |
| D7b | V4.3c | hard | quests creatable from the venue home |
| D7b | D2p | hard | venues must persist in Firestore |
| D7b | D5 | hard | quests must persist in Firestore |
| D7b | D4 | hard | rules v2 deployed to production |
| D7b | D3p | soft | without it roles are asked again after restart |
| D8 | D1 | hard | adds a geohash field to quest documents; schema v1 must define it (docs/firestore-schema.md is Jiayi's) |
| D8 | V4.1 | file | edits model/quest/Quest.kt and QuestRepositoryFirestore.kt after the Reward change (PR #76) |
| D8 | D7a | file | the seed tool must write geohash on seeded quests; edit tools/seed after it lands |
| D8 | E3.4 | file | changes the observeActiveQuests call in ui/map/MapViewModel.kt; goes after Ferit's last MapViewModel task |
| D8 | D5 | soft | the bounded query only reaches the map once the quest provider serves Firestore; verify in the app after D5 |
| D8 | D4 | soft | the composite index (status + geohash) ships in firestore.indexes.json with D4's firebase.json and deploy |
| T0 | Q1 | hard | harness runs on the new CI emulator |
| T1 | T0 | hard | uses the harness |
| T1 | G2.3 | hard | role routing |
| T1 | G3.2 | hard | pick Venue |
| T1 | G3.3 | hard | onboarding in the app |
| T1 | V3.1 | hard | save the area |
| T1 | N2 | hard | venue home |
| T1 | V4.3c | hard | create quest from the home |
| T1 | Q2 | soft | map taps via the shared helper |
| T1 | D2p | soft | assert in Firestore once venues are real |
| T1 | D3p | soft | assert role in Firestore once users are real |
| T2 | T0 | hard | uses the harness |
| T2 | G2.3 | hard | role routing |
| T2 | G3.2 | hard | pick Explorer |
| T2 | E3.4 | hard | View from the nearby list |
| T2 | E4.2 | hard | venue page exists |
| T2 | D5 | hard | map reads the seeded Firestore quest |
| T2 | E4.3 | soft | asserts the quest row on the page |
| A1 | F1 | hard | exports from the frame |
| A1 | DS0 | file | may add tokens to ui/theme after DS0 |
| E4.1 | C7 | hard | fills the contract |
| E4.2 | C7 | hard | renders VenuePageUiState |
| E4.2 | N0 | hard | replaces the venue-page stub |
| E4.2 | E4.1 | soft | real data |
| E4.2 | A1 | soft | swap placeholders for assets |
| E4.3 | C7 | hard | renders VenuePageQuest |
| E4.3 | E4.2 | soft | plugged into the questRow slot |
| E4.3 | F1 | soft | matches the frame |
| E4.3 | A1 | soft | uses its assets |
| E4.3 | V4.1 | file | reuses the reward chip changed in QuestCard.kt |
| E4.4 | E4.3 | hard | extends the rows |
| E5.1 | E4.1 | hard | same ViewModel |
| E5.1 | DEC-1 | decision | start: reservation fields |
| E5.1 | DEC-2 | decision | start: slotStart |
| E5.1 | DEC-3 | decision | start: party > 1 behaviour |
| E5.1 | D5 | soft | reservation provider on Firestore |
| E5.1 | D4 | soft | rules v2 allow the create |
| E5.2 | E4.2 | hard | plugs into the bottomBar slot |
| E5.2 | C7 | hard | renders the state |
| E5.2 | DEC-3 | decision | start: 'needs N more' state |
| E5.2 | E5.1 | soft | real accept behaviour |
| T3 | T2 | hard | extends the explorer journey |
| T3 | E5.1 | hard | accept works |
| T3 | E5.2 | hard | accept button |
| T3 | V9.2 | hard | dashboard lists reservations |
| F2 | DEC-1 | decision | finish: whether rows show party names |
| A2 | F2 | hard | exports from the frame |
| A2 | DS0 | file | ui/theme after DS0 |
| V9.1 | DEC-1 | decision | start: row content |
| V9.1 | D5 | soft | reservation provider on Firestore |
| V9.2 | V9.1 | hard | needs the DashboardUiState contract (first commit of V9.1) |
| V9.2 | N2 | hard | hosted in the venue home's Dashboard tab |
| V9.2 | N0 | hard | replaces the stub |
| V9.2 | A2 | soft | assets |
| V10.1 | V9.1 | hard | status updates go through the ViewModel |
| V10.1 | V9.2 | hard | plugs into the row actions slot |
| A3 | F3 | hard | exports from the frame |
| A3 | DS0 | file | ui/theme after DS0 |
| E6.1 | D5 | soft | reservations from Firestore |
| E6.2 | E6.1 | hard | needs the OverviewUiState contract |
| E6.2 | N1 | hard | Quests tab hosts the route |
| E6.2 | N0 | hard | replaces the stub |
| E6.2 | A3 | soft | assets |
| E6.2 | E5.1 | soft | an accepted quest exists only once accepting works |

### 7.2 Parent stories and their children

| Story | Title | Prio | Children | GitHub |
|---|---|---|---|---|
| G2 | Route users by session and role | must | C2, C3, G2.1, G2.2, G2.3, G2.4 | #7 |
| G3 | Choose a role and finish venue onboarding | must | G3.1, G3.2, G3.3 | #79 (absorbed) |
| V3 | Confirm the venue's area (save/load + address) | must | V3.1, V3.2 | #88 #89 |
| V4 | Create a quest | must | V4.1, V4.2, V4.3a, V4.3b, V4.3c | #73 |
| E3 | Nearby quests sorted by distance | must | E3.1, E3.2, E3.3, E3.4 | #91 |
| Q | Make CI trustworthy (map + Firestore tests) | must | Q1, Q2, Q3 | #95 |
| N | No dead ends between screens | must | N0, N1, N2 | new |
| V1 | Venue and user data persists (mocks -> Firestore, real data) | must | D1, D2, D2p, D3, D3p, D4, D5, D7a, D7b, D8, DS0 | #6 #23 |
| T | Core loop works end to end | must | T0, T1, T2, T3 | new |
| E4 | See a venue's page and its quests | must | F1, A1, E4.1, E4.2, E4.3, E4.4 | new |
| E5 | Accept a quest and form a party | stretch | E5.1, E5.2 | new |
| V9 | Receive reservation requests on the venue dashboard | stretch | F2, A2, V9.1, V9.2 | #93 |
| V10 | Approve a reservation | stretch | V10.1 | #94 |
| E6 | See my accepted quest (explorer overview) | stretch | F3, A3, E6.1, E6.2 | new |
| PROC | Process (no user story) | must | DEC-1, DEC-2, DEC-3, DEC-4, DEC-5, DEC-6, HK-1, M1 | — |

Contracts belong to the task they start: C5 → V4.2, C6 → E3.1, C7 → E4.1 (their `parent` field). C2 and C3 are part of G2.

## 8. Structural blocking: integration points (slots)

A screen is *visible in the app* only once it is plugged into its slot or route. Rule: **the later of the two PRs does the plug-in, and the owner of the host file reviews it.** No one edits a host file outside these lines.

| Slot / seam | Defined by | Filled by | Filler task | Host file owner | Who plugs it in |
|---|---|---|---|---|---|
| AppRoot.authFlow | C2 | AuthScreen (exists) | G2.1 | Vali | G2.1 plugs it |
| AppRoot.explorerHome | C2 | AroundApp (exists) | G2.3 | Vali | G2.3 plugs it |
| AppRoot.roleSelection | C2 | RoleSelectionScreen | G3.2 | Vali (MainActivity/AppRoot) | later of G2.3/G3.2 plugs it, Vali reviews |
| AppRoot.venueEntry | C2 | venue entry composable | G3.3 | Vali (MainActivity/AppRoot) | later of G2.3/G3.3 plugs it, Vali reviews |
| venueOnboardingDestinations.locationScreen | existing | VenueAreaScreen(venueId,onSaved,onBack) | V3.1 | Ece | G3.3 plugs it |
| MapScreen.onOpenVenue | existing | venue/{venueId} route | N0 | Alisher (AroundApp.kt) | N1 plugs it |
| MapScreen nearby sheet | C6 | NearbyQuestList | E3.2 | Ferit | E3.3 plugs it |
| CreateQuestScreen.rewardFields | C5 | RewardFields | V4.3b | Zaynab | later of V4.3a/V4.3b plugs it, Zaynab reviews |
| VenueHome Quests tab -> create quest | N0 | CreateQuestScreen | V4.3c | Zaynab (CreateQuestDestination.kt) | V4.3c replaces the stub |
| VenueHome Profile tab | G2.4 | ProfileScreen | G2.4 | Vali | N2 plugs it |
| VenuePageScreen.questRow | C7 | VenueQuestRow | E4.3 | Yigit | later of E4.2/E4.3 plugs it, Yigit reviews |
| VenuePageScreen.bottomBar | C7 | AcceptQuestBar | E5.2 | Yigit | E5.2 plugs it (E4.2 is earlier), Yigit reviews |
| VenueHome Dashboard tab | N0 | DashboardScreen | V9.2 | Ece (DashboardDestination.kt) | V9.2 replaces the stub |
| Dashboard row actions | V9.2 | ReservationActions | V10.1 | Ece | V10.1 plugs it, Ece reviews |
| Explorer Quests tab | N0 | OverviewScreen | E6.2 | Ferit (OverviewDestination.kt) | E6.2 replaces the stub |
| QuestRepositoryProvider / ReservationRepositoryProvider | existing | *Firestore impls | D5 | Jiayi this sprint | D5 |
| VenueRepositoryProvider | existing | VenueRepositoryFirestore | D2 | Yigit | D2p |
| UserRepositoryProvider | new | UserRepositoryFirestore | D3 | Ece | D3p |

## 9. Structural blocking: shared-file contention

Files touched by more than one task, and how the order is enforced. Cross-owner cases are encoded as `file` edges.

| File | Tasks | Ordering | Note |
|---|---|---|---|
| `androidTest/ui/venue/VenueAreaScreenDeviceTest.kt` | V3.1, Q2 | Q2 after V3.1 (file edge) | Yigit adds a save test; Ferit rewrites the taps |
| `ui/theme/*` | DS0, A1, A2, A3 | asset PRs after DS0 (file edge) | DS0 renames fonts and moves tokens |
| `model/quest/*` | V4.1, D5 | D5 after V4.1 (file edge) | model/quest is Zaynab's; D5 edits only the provider |
| `ui/map/marker/QuestCard.kt` | V4.1, E4.3 | E4.3 after V4.1 (file edge) | V4.1 changes the reward chip that E4.3 reuses |
| `ui/map/MapViewModel.kt` | C6, E3.1, E3.4, D8 | Ferit's queue, then D8 (file edge from E3.4) | D8 only changes the `observeActiveQuests` call |
| `model/quest/QuestRepositoryFirestore.kt` | V4.1, D8 | D8 after V4.1 (file edge) | model/quest is Zaynab's |
| `tools/seed/*` | D7a, D8 | D8 after D7a (file edge) | D8 adds geohash to seeded quests |
| `ui/map/MapScreen.kt` | E3.3, E3.4 | same owner, queue order | Ferit only |
| `ui/venue/VenueAreaViewModel.kt` | V3.1, V3.2 | same owner, hard edge | Yigit only; #90 vs #92 collision is not repeated |
| `model/venue/VenueRepository.kt (+fake)` | V3.2, D2 | same owner, hard edge | Yigit only |
| `ui/navigation/AppRoot.kt, MainActivity.kt` | C2, G2.1, G2.2, G2.3, G3.2, G3.3 | Vali's files; G3.x plug-ins follow the later-PR rule | slot plug-ins are 1-5 lines |
| `ui/navigation/AroundApp.kt` | N1 | single editor this sprint | G2.x wraps it without editing |
| `ui/venuepage/VenuePageDestination.kt` | N0, E4.2, E4.3, E5.2 | N0 creates; Yigit owns from E4.2; plug-ins reviewed by Yigit | — |
| `ui/quest/create/CreateQuestScreen.kt` | V4.3a, V4.3c | same owner, hard edge | V4.3b lives in RewardFields.kt |
| `ui/dashboard/DashboardScreen.kt` | V9.2, V10.1 | V10.1 uses V9.2's row-actions slot | avoids V10.1 editing Ece's file |
| `firestore.rules` | D4 | single editor (Alisher) | E5 rule needs are folded into D4 |
| `README.md` | D4, D5, D7a | different sections; trivial conflicts | deploy command / demo section / seed section |
| `docs/firestore-schema.md` | D1, V4.1 | V4.1's doc checkbox moved into D1 | only Jiayi edits |
| `resources/C.kt` | many | append-only, one block per feature | conflicts are trivial |

## 10. GitHub mapping (existing issues and PRs)

| GitHub | Becomes | Action |
|---|---|---|
| #6 | V1 | rewrite |
| #7 | G2 (+G2.1–G2.4) | rewrite |
| #9 | HK-1 | close as duplicate of #29 |
| #12 | M1 | keep, add M1 release items |
| #20 | N1 | N1 closes its last checkbox |
| #22 | HK-1 | close as duplicate of #24 |
| #23 | D1 | update |
| #26 | HK-1 | close (superseded by #27, #28) |
| #29 | HK-1 | close after confirming the empty My-quests frame |
| #32 | V4.3a, V4.3b, V4.3c | split |
| #50 | HK-1 | verify and close; Google sign-in to backlog |
| #73 | V4 | keep, update the task list |
| #74 | V4.1 | doc checkbox moved to D1 |
| #75 | V4.2 (+C5) | update: contract first |
| #79 | G3.3 | rewrite |
| #88 | V3.1 | rewrite; reopen the PR in the right direction |
| #89 | V3.2 | gap: address not saved |
| #91 | E3 (+E3.1–E3.4) | rewrite |
| #93 | V9 | rewrite (stretch) |
| #94 | V10 | rewrite (stretch) |
| #95 | Q1 | keep, add hygiene |
| PR #25 | D1 | merge by D2 |
| PR #76 | V4.1 | merge D1 |
| PR #86 | G2.1–G2.3 | split, then close |
| PR #92 | V3.1 | reopen from the feature branch into main |

## 11. Machine-readable data (JSON)

Edge direction: `from` blocks `to`. `stretch-gate` edges have `from` = the owner's must-have IDs joined with `|` (all must be done). `not-before` edges have `from` = `day:N`. Story completion is derived from `children`.

```json
{
  "snapshot": "start of Day 1, nothing merged, nothing decided",
  "days": {"1": "sprint day 1", "7": "sprint day 7 (buffer, M1 release)", "note": "task IDs D1-D7 are data tasks, not days"},
  "people": {"ferit": {"name": "Ferit", "github": "ferido1510"}, "zaynab": {"name": "Zaynab", "github": "zaynab79i"}, "yigit": {"name": "Yigit", "github": "yeet-yildiz"}, "ece": {"name": "Ece", "github": "ecetos"}, "vali": {"name": "Vali", "github": "valigadayev-lgtm"}, "jiayi": {"name": "Jiayi", "github": "jiayizhngepfl"}, "alisher": {"name": "Alisher", "github": "mcpeblocker"}, "team": {"name": "Team", "github": null}},
  "edgeKinds": {"hard": {"family": "structural", "blocks": "start"}, "file": {"family": "structural", "blocks": "start"}, "soft": {"family": "structural", "blocks": "finish"}, "decision": {"family": "structural", "blocks": "start or finish (see note prefix)"}, "owner-queue": {"family": "chronological", "blocks": "start (advisory)"}, "not-before": {"family": "chronological", "blocks": "start (advisory)"}, "stretch-gate": {"family": "chronological", "blocks": "start"}},
  "tasks": [
    {"id": "DEC-1", "alias": "C8", "kind": "decision", "title": "Party model: a reservation is the party; add leaderUid and partyNames? (= contract C8)", "story": ["E5", "V9"], "parent": "PROC", "tier": 0, "prio": "must", "owner": "jiayi", "reviewer": "team", "size": "S", "windowStartDay": 1, "windowEndDay": 1, "initialStatus": "pending-decision", "earliestStructuralStartDay": 1},
    {"id": "DEC-2", "kind": "decision", "title": "slotStart when accepting a quest (recommendation: now)", "story": ["E5"], "parent": "PROC", "tier": 0, "prio": "must", "owner": "team", "size": "S", "windowStartDay": 1, "windowEndDay": 1, "initialStatus": "pending-decision", "earliestStructuralStartDay": 1},
    {"id": "DEC-3", "kind": "decision", "title": "Quests needing a party > 1: allow accept and show 'needs N more'?", "story": ["E5"], "parent": "PROC", "tier": 0, "prio": "must", "owner": "team", "size": "S", "windowStartDay": 1, "windowEndDay": 1, "initialStatus": "pending-decision", "earliestStructuralStartDay": 1},
    {"id": "DEC-4", "kind": "decision", "title": "Real business names in production data: consent or fictional names", "story": ["V1"], "parent": "PROC", "tier": 0, "prio": "must", "owner": "team", "size": "S", "windowStartDay": 1, "windowEndDay": 1, "initialStatus": "pending-decision", "earliestStructuralStartDay": 1},
    {"id": "DEC-5", "kind": "decision", "title": "Confirm new story IDs E4/E5/E6 and V1 as persistence parent", "story": ["E4", "E5", "E6", "V1"], "parent": "PROC", "tier": 0, "prio": "must", "owner": "team", "size": "S", "windowStartDay": 1, "windowEndDay": 1, "initialStatus": "pending-decision", "earliestStructuralStartDay": 1},
    {"id": "DEC-6", "kind": "decision", "title": "Schema sign-off rule: silence by Day 2 noon = approval", "story": ["V1"], "parent": "PROC", "tier": 0, "prio": "must", "owner": "team", "size": "S", "windowStartDay": 1, "windowEndDay": 1, "initialStatus": "pending-decision", "earliestStructuralStartDay": 1},
    {"id": "HK-1", "kind": "process", "title": "Close duplicate/finished issues #9 #22 #26 #29, verify and close #50, file Google sign-in backlog issue", "story": ["G1", "V4"], "parent": "PROC", "tier": 0, "prio": "must", "owner": "jiayi", "reviewer": "alisher", "size": "S", "windowStartDay": 1, "windowEndDay": 1, "github": "#9 #22 #26 #29 #50", "initialStatus": "ready", "earliestStructuralStartDay": 1},
    {"id": "G2", "kind": "story", "title": "Route users by session and role", "story": ["G2"], "tier": 0, "prio": "must", "owner": "vali", "windowStartDay": 1, "windowEndDay": 3, "github": "#7", "existingWork": "PR #86 (draft)", "initialStatus": "open", "children": ["C2", "C3", "G2.1", "G2.2", "G2.3", "G2.4"]},
    {"id": "G3", "kind": "story", "title": "Choose a role and finish venue onboarding", "story": ["G3"], "tier": 0, "prio": "must", "owner": "ece", "windowStartDay": 1, "windowEndDay": 4, "github": "#79 (absorbed)", "initialStatus": "open", "children": ["G3.1", "G3.2", "G3.3"]},
    {"id": "V3", "kind": "story", "title": "Confirm the venue's area (save/load + address)", "story": ["V3"], "tier": 0, "prio": "must", "owner": "yigit", "windowStartDay": 1, "windowEndDay": 3, "github": "#88 #89", "initialStatus": "open", "children": ["V3.1", "V3.2"]},
    {"id": "V4", "kind": "story", "title": "Create a quest", "story": ["V4"], "tier": 0, "prio": "must", "owner": "zaynab", "windowStartDay": 1, "windowEndDay": 5, "github": "#73", "initialStatus": "open", "children": ["V4.1", "V4.2", "V4.3a", "V4.3b", "V4.3c"]},
    {"id": "E3", "kind": "story", "title": "Nearby quests sorted by distance", "story": ["E3"], "tier": 0, "prio": "must", "owner": "ferit", "windowStartDay": 1, "windowEndDay": 5, "github": "#91", "initialStatus": "open", "children": ["E3.1", "E3.2", "E3.3", "E3.4"]},
    {"id": "Q", "kind": "story", "title": "Make CI trustworthy (map + Firestore tests)", "story": ["E2", "V3", "V4", "V9"], "tier": 1, "prio": "must", "owner": "alisher", "windowStartDay": 1, "windowEndDay": 3, "github": "#95", "initialStatus": "open", "children": ["Q1", "Q2", "Q3"]},
    {"id": "N", "kind": "story", "title": "No dead ends between screens", "story": ["G2", "E4", "V4"], "tier": 2, "prio": "must", "owner": "alisher", "windowStartDay": 1, "windowEndDay": 5, "initialStatus": "open", "children": ["N0", "N1", "N2"]},
    {"id": "V1", "kind": "story", "title": "Venue and user data persists (mocks -> Firestore, real data)", "story": ["V1", "E2"], "tier": 3, "prio": "must", "owner": "jiayi", "windowStartDay": 1, "windowEndDay": 6, "github": "#6 #23", "initialStatus": "open", "children": ["D1", "D2", "D2p", "D3", "D3p", "D4", "D5", "D7a", "D7b", "D8", "DS0"]},
    {"id": "T", "kind": "story", "title": "Core loop works end to end", "story": ["V4", "E4"], "tier": 4, "prio": "must", "owner": "alisher", "windowStartDay": 4, "windowEndDay": 6, "initialStatus": "open", "children": ["T0", "T1", "T2", "T3"]},
    {"id": "E4", "kind": "story", "title": "See a venue's page and its quests", "story": ["E4"], "tier": 5, "prio": "must", "owner": "yigit", "windowStartDay": 1, "windowEndDay": 5, "initialStatus": "open", "children": ["F1", "A1", "E4.1", "E4.2", "E4.3", "E4.4"]},
    {"id": "E5", "kind": "story", "title": "Accept a quest and form a party", "story": ["E5"], "tier": 6, "prio": "stretch", "owner": "jiayi", "windowStartDay": 6, "windowEndDay": 7, "initialStatus": "open", "children": ["E5.1", "E5.2"]},
    {"id": "V9", "kind": "story", "title": "Receive reservation requests on the venue dashboard", "story": ["V9"], "tier": 7, "prio": "stretch", "owner": "jiayi", "windowStartDay": 6, "windowEndDay": 7, "github": "#93", "initialStatus": "open", "children": ["F2", "A2", "V9.1", "V9.2"]},
    {"id": "V10", "kind": "story", "title": "Approve a reservation", "story": ["V10"], "tier": 7, "prio": "stretch", "owner": "jiayi", "windowStartDay": 7, "windowEndDay": 7, "github": "#94", "initialStatus": "open", "children": ["V10.1"]},
    {"id": "E6", "kind": "story", "title": "See my accepted quest (explorer overview)", "story": ["E6"], "tier": 7, "prio": "stretch", "owner": "zaynab", "windowStartDay": 6, "windowEndDay": 7, "initialStatus": "open", "children": ["F3", "A3", "E6.1", "E6.2"]},
    {"id": "M1", "kind": "process", "title": "M1 deliverables: release APK, wiki links, sprint backlog view", "story": ["PROC"], "parent": "PROC", "tier": 0, "prio": "must", "owner": "alisher", "reviewer": "jiayi", "size": "S", "windowStartDay": 7, "windowEndDay": 7, "github": "#12", "initialStatus": "ready-scheduled", "earliestStructuralStartDay": 1},
    {"id": "C2", "kind": "contract", "title": "AppRoot slot signature: authFlow, roleSelection, explorerHome, venueEntry", "story": ["G2"], "parent": "G2", "tier": 0, "prio": "must", "owner": "vali", "reviewer": "alisher", "size": "S", "windowStartDay": 1, "windowEndDay": 1, "files": ["ui/navigation/AppRoot.kt"], "initialStatus": "ready", "earliestStructuralStartDay": 1},
    {"id": "C3", "kind": "contract", "title": "AuthRepository.currentUserEmail (+ fake + Firebase impl)", "story": ["G2"], "parent": "G2", "tier": 0, "prio": "must", "owner": "vali", "reviewer": "ece", "size": "S", "windowStartDay": 1, "windowEndDay": 1, "files": ["model/auth/AuthRepository*.kt"], "initialStatus": "ready", "earliestStructuralStartDay": 1},
    {"id": "G2.1", "kind": "task", "title": "Show the sign-in flow or the app from the saved session", "story": ["G2"], "parent": "G2", "tier": 0, "prio": "must", "owner": "vali", "reviewer": "alisher", "size": "M", "windowStartDay": 1, "windowEndDay": 2, "existingWork": "code in PR #86", "files": ["MainActivity.kt", "ui/navigation/AppRoot.kt", "ui/navigation/SessionViewModel.kt", "model/auth/AuthRepositoryProvider.kt", "src/debug/AuthDemoActivity.kt (deleted)"], "initialStatus": "blocked", "earliestStructuralStartDay": 1},
    {"id": "G2.2", "kind": "task", "title": "Clear the back stack on sign-in and sign-out", "story": ["G2"], "parent": "G2", "tier": 0, "prio": "must", "owner": "vali", "reviewer": "ece", "size": "S", "windowStartDay": 2, "windowEndDay": 2, "existingWork": "code in PR #86", "files": ["ui/navigation/AppRoot.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 2},
    {"id": "G2.3", "kind": "task", "title": "Route a signed-in user by role", "story": ["G2"], "parent": "G2", "tier": 0, "prio": "must", "owner": "vali", "reviewer": "ece", "size": "M", "windowStartDay": 3, "windowEndDay": 3, "existingWork": "RoleNavigation in PR #86", "files": ["ui/navigation/RoleRouting.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 2},
    {"id": "G2.4", "kind": "task", "title": "Sign out from the Profile tab", "story": ["G2"], "parent": "G2", "tier": 0, "prio": "must", "owner": "vali", "reviewer": "alisher", "size": "S", "windowStartDay": 3, "windowEndDay": 3, "files": ["ui/profile/ProfileScreen.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 2},
    {"id": "G3.1", "kind": "task", "title": "Role selection ViewModel", "story": ["G3"], "parent": "G3", "tier": 0, "prio": "must", "owner": "ece", "reviewer": "vali", "size": "S", "windowStartDay": 1, "windowEndDay": 2, "files": ["ui/role/RoleSelectionViewModel.kt"], "initialStatus": "ready", "earliestStructuralStartDay": 1},
    {"id": "G3.2", "kind": "task", "title": "Role selection screen (Figma #27)", "story": ["G3"], "parent": "G3", "tier": 0, "prio": "must", "owner": "ece", "reviewer": "zaynab", "size": "M", "windowStartDay": 3, "windowEndDay": 3, "files": ["ui/role/RoleSelectionScreen.kt", "res/values/role_strings.xml"], "initialStatus": "blocked", "earliestStructuralStartDay": 2},
    {"id": "G3.3", "kind": "task", "title": "Venue entry: resume onboarding or open venue home (rewrite of #79)", "story": ["G3"], "parent": "G3", "tier": 0, "prio": "must", "owner": "ece", "reviewer": "yigit", "size": "M", "windowStartDay": 4, "windowEndDay": 4, "github": "#79", "files": ["ui/navigation/VenueOnboardingNavigation.kt", "docs/venue-onboarding-navigation.md"], "initialStatus": "blocked", "earliestStructuralStartDay": 1},
    {"id": "V3.1", "alias": "C4", "kind": "task", "title": "Save and load the venue's marker and radius (= contract C4)", "story": ["V3"], "parent": "V3", "tier": 0, "prio": "must", "owner": "yigit", "reviewer": "ece", "size": "S", "windowStartDay": 1, "windowEndDay": 1, "github": "#88", "existingWork": "code in PR #92 (opened backwards, closed)", "files": ["ui/venue/VenueAreaViewModel.kt", "ui/venue/VenueAreaScreen.kt", "androidTest/ui/venue/VenueAreaScreenDeviceTest.kt"], "initialStatus": "ready", "earliestStructuralStartDay": 1},
    {"id": "V3.2", "kind": "task", "title": "Save the picked address with the area", "story": ["V3"], "parent": "V3", "tier": 0, "prio": "must", "owner": "yigit", "reviewer": "ferit", "size": "S", "windowStartDay": 2, "windowEndDay": 3, "files": ["model/venue/VenueRepository.kt", "model/venue/FakeVenueRepository.kt", "ui/venue/VenueAreaViewModel.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 1},
    {"id": "V4.1", "kind": "task", "title": "Reward model and Firestore mapping (merge PR #76; doc checkbox moved to D1)", "story": ["V4"], "parent": "V4", "tier": 0, "prio": "must", "owner": "zaynab", "reviewer": "ferit", "size": "S", "windowStartDay": 1, "windowEndDay": 1, "github": "#74", "existingWork": "PR #76 (draft, complete)", "files": ["model/quest/Quest.kt", "model/quest/QuestRepositoryFirestore.kt", "ui/map/marker/QuestCard.kt"], "initialStatus": "ready", "earliestStructuralStartDay": 1},
    {"id": "C5", "kind": "contract", "title": "CreateQuestUiState, RewardFormState, RewardType + ViewModel stubs", "story": ["V4"], "parent": "V4.2", "tier": 0, "prio": "must", "owner": "zaynab", "reviewer": "ece", "size": "S", "windowStartDay": 1, "windowEndDay": 1, "files": ["ui/quest/create/CreateQuestUiState.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 1},
    {"id": "V4.2", "kind": "task", "title": "CreateQuestViewModel logic + tests", "story": ["V4"], "parent": "V4", "tier": 0, "prio": "must", "owner": "zaynab", "reviewer": "jiayi", "size": "L", "windowStartDay": 1, "windowEndDay": 3, "github": "#75", "files": ["ui/quest/create/CreateQuestViewModel.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 1, "children": ["C5"]},
    {"id": "V4.3a", "kind": "task", "title": "Create-quest form: layout and text fields", "story": ["V4"], "parent": "V4", "tier": 0, "prio": "must", "owner": "zaynab", "reviewer": "ece", "size": "M", "windowStartDay": 4, "windowEndDay": 5, "github": "#32", "files": ["ui/quest/create/CreateQuestScreen.kt", "res/values/create_quest_strings.xml"], "initialStatus": "blocked", "earliestStructuralStartDay": 1},
    {"id": "V4.3b", "kind": "task", "title": "Reward type picker and per-type fields", "story": ["V4"], "parent": "V4", "tier": 0, "prio": "must", "owner": "ece", "reviewer": "zaynab", "size": "M", "windowStartDay": 2, "windowEndDay": 3, "github": "#32", "files": ["ui/quest/create/RewardFields.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 1},
    {"id": "V4.3c", "kind": "task", "title": "Saving/error states and open the form from the venue home", "story": ["V4"], "parent": "V4", "tier": 0, "prio": "must", "owner": "zaynab", "reviewer": "vali", "size": "S", "windowStartDay": 5, "windowEndDay": 5, "github": "#32", "files": ["ui/quest/create/CreateQuestScreen.kt", "ui/quest/create/CreateQuestDestination.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 5},
    {"id": "C6", "kind": "contract", "title": "NearbyQuest data class + MapUiState.nearby", "story": ["E3"], "parent": "E3.1", "tier": 0, "prio": "must", "owner": "ferit", "reviewer": "yigit", "size": "S", "windowStartDay": 1, "windowEndDay": 1, "files": ["ui/map/NearbyQuests.kt", "ui/map/MapViewModel.kt"], "initialStatus": "ready", "earliestStructuralStartDay": 1},
    {"id": "E3.1", "kind": "task", "title": "Sort nearby quests by distance in MapViewModel", "story": ["E3"], "parent": "E3", "tier": 0, "prio": "must", "owner": "ferit", "reviewer": "jiayi", "size": "M", "windowStartDay": 1, "windowEndDay": 2, "github": "#91", "files": ["ui/map/NearbyQuests.kt", "ui/map/MapViewModel.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 1, "children": ["C6"]},
    {"id": "E3.2", "kind": "task", "title": "NearbyQuestList component (rows, empty, location-off)", "story": ["E3"], "parent": "E3", "tier": 0, "prio": "must", "owner": "yigit", "reviewer": "ferit", "size": "M", "windowStartDay": 2, "windowEndDay": 3, "github": "#91", "files": ["ui/map/nearby/NearbyQuestList.kt", "ui/map/nearby/NearbyQuestRow.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 1},
    {"id": "E3.3", "kind": "task", "title": "Bottom sheet holding the list on MapScreen", "story": ["E3"], "parent": "E3", "tier": 0, "prio": "must", "owner": "ferit", "reviewer": "yigit", "size": "M", "windowStartDay": 3, "windowEndDay": 5, "github": "#91", "files": ["ui/map/MapScreen.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 3},
    {"id": "E3.4", "kind": "task", "title": "Row tap frames venue + opens card; View opens venue page", "story": ["E3"], "parent": "E3", "tier": 0, "prio": "must", "owner": "ferit", "reviewer": "alisher", "size": "S", "windowStartDay": 5, "windowEndDay": 5, "github": "#91", "files": ["ui/map/MapViewModel.kt", "ui/map/MapScreen.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 5},
    {"id": "Q1", "kind": "task", "title": "CI emulator = API 37 / Pixel 10a + repo hygiene", "story": ["E2", "V3"], "parent": "Q", "tier": 1, "prio": "must", "owner": "alisher", "reviewer": "yigit", "size": "M", "windowStartDay": 1, "windowEndDay": 2, "github": "#95", "files": [".github/workflows/ci.yml", "firestore-debug.log (untrack)", "SimpleData.kt", "PointTest.kt", "ExampleUnitTest.kt"], "initialStatus": "ready", "earliestStructuralStartDay": 1},
    {"id": "Q2", "kind": "task", "title": "One tap-the-map-until-it-counts helper for device tests", "story": ["E2", "V3"], "parent": "Q", "tier": 1, "prio": "must", "owner": "ferit", "reviewer": "yigit", "size": "M", "windowStartDay": 2, "windowEndDay": 3, "files": ["androidTest/ui/map/MapViews.kt", "androidTest/ui/map/QuestMarkersDeviceTest.kt", "androidTest/ui/venue/VenueAreaScreenDeviceTest.kt"], "initialStatus": "ready-scheduled", "earliestStructuralStartDay": 1},
    {"id": "Q3", "kind": "task", "title": "Shared Firestore emulator test support", "story": ["V1", "V4", "V9"], "parent": "Q", "tier": 1, "prio": "must", "owner": "jiayi", "reviewer": "zaynab", "size": "S", "windowStartDay": 1, "windowEndDay": 1, "files": ["androidTest/testing/FirestoreTestSupport.kt", "QuestRepositoryFirestoreTest.kt", "ReservationRepositoryFirestoreTest.kt"], "initialStatus": "ready", "earliestStructuralStartDay": 1},
    {"id": "N0", "alias": "C1", "kind": "contract", "title": "Route contract: every Sprint 2 route with a Coming-soon stub (= contract C1)", "story": ["G2"], "parent": "N", "tier": 2, "prio": "must", "owner": "alisher", "reviewer": "vali", "size": "S", "windowStartDay": 1, "windowEndDay": 1, "files": ["ui/navigation/Routes.kt", "ui/venuepage/VenuePageDestination.kt", "ui/quest/create/CreateQuestDestination.kt", "ui/dashboard/DashboardDestination.kt", "ui/overview/OverviewDestination.kt"], "initialStatus": "ready", "earliestStructuralStartDay": 1},
    {"id": "N1", "kind": "task", "title": "Open the venue page from the map card; Quests tab hosts overview (closes #20 gap)", "story": ["E4"], "parent": "N", "tier": 2, "prio": "must", "owner": "alisher", "reviewer": "ferit", "size": "S", "windowStartDay": 2, "windowEndDay": 2, "github": "#20", "files": ["ui/navigation/AroundApp.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 1},
    {"id": "N2", "kind": "task", "title": "Venue home shell: Dashboard / Quests (New quest) / Profile", "story": ["V4", "V9"], "parent": "N", "tier": 2, "prio": "must", "owner": "vali", "reviewer": "alisher", "size": "M", "windowStartDay": 4, "windowEndDay": 5, "files": ["ui/navigation/VenueHome.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 3},
    {"id": "D1", "kind": "task", "title": "Finalize Firestore schema v1 (#23 / PR #25)", "story": ["V1"], "parent": "V1", "tier": 3, "prio": "must", "owner": "jiayi", "reviewer": "alisher+zaynab", "size": "M", "windowStartDay": 1, "windowEndDay": 2, "github": "#23", "existingWork": "PR #25 (draft since Oct 4)", "files": ["docs/firestore-schema.md"], "initialStatus": "ready", "earliestStructuralStartDay": 1},
    {"id": "D2", "kind": "task", "title": "VenueRepositoryFirestore + emulator tests", "story": ["V1", "V3"], "parent": "V1", "tier": 3, "prio": "must", "owner": "yigit", "reviewer": "zaynab", "size": "L", "windowStartDay": 3, "windowEndDay": 5, "files": ["model/venue/VenueRepositoryFirestore.kt", "androidTest/model/venue/VenueRepositoryFirestoreTest.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 3},
    {"id": "D2p", "kind": "task", "title": "Switch the venue provider to Firestore", "story": ["V1"], "parent": "V1", "tier": 3, "prio": "must", "owner": "yigit", "reviewer": "jiayi", "size": "S", "windowStartDay": 5, "windowEndDay": 5, "files": ["model/venue/VenueRepositoryProvider.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 5},
    {"id": "D3", "kind": "task", "title": "UserRepositoryFirestore + emulator tests", "story": ["V1", "G3"], "parent": "V1", "tier": 3, "prio": "must", "owner": "ece", "reviewer": "vali", "size": "L", "windowStartDay": 4, "windowEndDay": 6, "files": ["model/user/UserRepositoryFirestore.kt", "androidTest/model/user/UserRepositoryFirestoreTest.kt"], "initialStatus": "ready-scheduled", "earliestStructuralStartDay": 1},
    {"id": "D3p", "kind": "task", "title": "Add and switch the user provider to Firestore", "story": ["V1", "G3"], "parent": "V1", "tier": 3, "prio": "must", "owner": "ece", "reviewer": "vali", "size": "S", "windowStartDay": 6, "windowEndDay": 6, "files": ["model/user/UserRepositoryProvider.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 6},
    {"id": "D4", "kind": "task", "title": "Security rules v2, tested and deployed to around-67942", "story": ["V1", "E5"], "parent": "V1", "tier": 3, "prio": "must", "owner": "alisher", "reviewer": "jiayi", "size": "M", "windowStartDay": 3, "windowEndDay": 4, "files": ["firestore.rules", "androidTest/model/FirestoreRulesTest.kt", "firebase.json", "README.md (deploy)"], "initialStatus": "blocked", "earliestStructuralStartDay": 2},
    {"id": "D5", "kind": "task", "title": "Quests + reservations from Firestore; MapDemoData out of src/main", "story": ["E2"], "parent": "V1", "tier": 3, "prio": "must", "owner": "jiayi", "reviewer": "ferit", "size": "S", "windowStartDay": 3, "windowEndDay": 3, "files": ["model/quest/QuestRepositoryProvider.kt", "model/reservation/ReservationRepositoryProvider.kt", "model/demo/MapDemoData.kt (moved to test fixtures)", "test/model/RepositoryProvidersTest.kt", "test/model/demo/MapDemoDataTest.kt", "README.md (demo section)"], "initialStatus": "blocked", "earliestStructuralStartDay": 2},
    {"id": "D7a", "kind": "task", "title": "Seed tool for the emulator (tools/seed)", "story": ["V1", "E2"], "parent": "V1", "tier": 3, "prio": "must", "owner": "jiayi", "reviewer": "alisher", "size": "L", "windowStartDay": 4, "windowEndDay": 5, "files": ["tools/seed/*", "README.md (seed)"], "initialStatus": "blocked", "earliestStructuralStartDay": 2},
    {"id": "D7b", "kind": "task", "title": "Data day: everyone creates a real venue + quests through the app", "story": ["V1", "E2"], "parent": "V1", "tier": 3, "prio": "must", "owner": "team", "reviewer": "jiayi", "size": "S", "windowStartDay": 6, "windowEndDay": 6, "initialStatus": "blocked", "earliestStructuralStartDay": 5},
    {"id": "D8", "kind": "task", "title": "Geo-bounded quest query: download only quests near the explorer or the map view", "story": ["V1", "E2"], "parent": "V1", "tier": 3, "prio": "stretch", "owner": null, "reviewer": null, "size": "L", "windowStartDay": 6, "windowEndDay": 7, "github": "new (file under #6, V1)", "files": ["model/quest/QuestRepository.kt (+ FakeQuestRepository)", "model/quest/QuestRepositoryFirestore.kt (geohash on write, range queries on read)", "model/quest/Quest.kt (geohash)", "ui/map/MapViewModel.kt (pass explorer location, else map camera centre)", "firestore.indexes.json", "tools/seed/* (write geohash)", "docs/firestore-schema.md (geohash field)", "tools/backfill-geohash (one-off, for quests created before D8)"], "initialStatus": "gated+blocked", "earliestStructuralStartDay": 5},
    {"id": "DS0", "kind": "task", "title": "Design tokens and fonts in the theme (asset-only PR)", "story": ["E2", "E4", "V4"], "parent": "V1", "tier": 3, "prio": "must", "owner": "ferit", "reviewer": "zaynab", "size": "S", "windowStartDay": 1, "windowEndDay": 1, "files": ["ui/theme/*", "res/font/*"], "initialStatus": "ready", "earliestStructuralStartDay": 1},
    {"id": "T0", "kind": "task", "title": "E2E harness: emulator reset, account helpers, page-object base", "story": ["V4", "E4"], "parent": "T", "tier": 4, "prio": "must", "owner": "alisher", "reviewer": "vali", "size": "M", "windowStartDay": 4, "windowEndDay": 5, "files": ["androidTest/e2e/E2eRule.kt", "androidTest/e2e/Accounts.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 2},
    {"id": "T1", "kind": "task", "title": "E2E venue journey: sign up -> Venue -> name -> area -> new quest", "story": ["V4"], "parent": "T", "tier": 4, "prio": "must", "owner": "alisher", "reviewer": "ece", "size": "M", "windowStartDay": 5, "windowEndDay": 6, "files": ["androidTest/e2e/VenueJourneyTest.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 5},
    {"id": "T2", "kind": "task", "title": "E2E explorer journey: seeded quest -> map -> nearby -> venue page", "story": ["E4"], "parent": "T", "tier": 4, "prio": "must", "owner": "vali", "reviewer": "ferit", "size": "M", "windowStartDay": 5, "windowEndDay": 6, "files": ["androidTest/e2e/ExplorerJourneyTest.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 5},
    {"id": "F1", "kind": "task", "title": "Figma: venue page (light/dark, incl. accept-bar state)", "story": ["E4"], "parent": "E4", "tier": 5, "prio": "must", "owner": "zaynab", "reviewer": "yigit", "size": "M", "windowStartDay": 2, "windowEndDay": 3, "initialStatus": "ready-scheduled", "earliestStructuralStartDay": 1},
    {"id": "A1", "kind": "task", "title": "Import venue page assets (asset-only PR)", "story": ["E4"], "parent": "E4", "tier": 5, "prio": "must", "owner": "zaynab", "reviewer": "ferit", "size": "S", "windowStartDay": 4, "windowEndDay": 4, "files": ["res/drawable/*", "ui/theme/* (only if new tokens)"], "initialStatus": "blocked", "earliestStructuralStartDay": 3},
    {"id": "C7", "kind": "contract", "title": "VenuePageUiState + VenuePageQuest + ViewModel stub", "story": ["E4"], "parent": "E4.1", "tier": 5, "prio": "must", "owner": "jiayi", "reviewer": "yigit", "size": "S", "windowStartDay": 1, "windowEndDay": 1, "files": ["ui/venuepage/VenuePageUiState.kt"], "initialStatus": "ready", "earliestStructuralStartDay": 1},
    {"id": "E4.1", "kind": "task", "title": "VenuePageViewModel logic + tests", "story": ["E4"], "parent": "E4", "tier": 5, "prio": "must", "owner": "jiayi", "reviewer": "yigit", "size": "M", "windowStartDay": 2, "windowEndDay": 3, "files": ["ui/venuepage/VenuePageViewModel.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 1, "children": ["C7"]},
    {"id": "E4.2", "kind": "task", "title": "Venue page skeleton: top bar, header, states, questRow/bottomBar slots", "story": ["E4"], "parent": "E4", "tier": 5, "prio": "must", "owner": "yigit", "reviewer": "jiayi", "size": "M", "windowStartDay": 4, "windowEndDay": 5, "files": ["ui/venuepage/VenuePageScreen.kt", "ui/venuepage/VenuePageDestination.kt", "res/values/venue_page_strings.xml"], "initialStatus": "blocked", "earliestStructuralStartDay": 1},
    {"id": "E4.3", "kind": "task", "title": "Quest rows on the venue page", "story": ["E4"], "parent": "E4", "tier": 5, "prio": "must", "owner": "ferit", "reviewer": "zaynab", "size": "M", "windowStartDay": 4, "windowEndDay": 5, "files": ["ui/venuepage/VenueQuestRow.kt"], "initialStatus": "blocked", "earliestStructuralStartDay": 1},
    {"id": "E4.4", "kind": "task", "title": "Quest detail sheet (only if rows are too dense)", "story": ["E4"], "parent": "E4", "tier": 5, "prio": "stretch", "owner": "zaynab", "reviewer": "ferit", "size": "S", "windowStartDay": 7, "windowEndDay": 7, "files": ["ui/venuepage/QuestDetailSheet.kt"], "initialStatus": "gated+blocked", "earliestStructuralStartDay": 5},
    {"id": "E5.1", "kind": "task", "title": "Accept a quest in VenuePageViewModel", "story": ["E5"], "parent": "E5", "tier": 6, "prio": "stretch", "owner": "jiayi", "reviewer": "vali", "size": "M", "windowStartDay": 6, "windowEndDay": 6, "files": ["ui/venuepage/VenuePageViewModel.kt"], "initialStatus": "gated+blocked", "earliestStructuralStartDay": 3},
    {"id": "E5.2", "kind": "task", "title": "AcceptQuestBar component on the venue page", "story": ["E5"], "parent": "E5", "tier": 6, "prio": "stretch", "owner": "vali", "reviewer": "yigit", "size": "M", "windowStartDay": 6, "windowEndDay": 6, "files": ["ui/venuepage/AcceptQuestBar.kt"], "initialStatus": "gated+blocked", "earliestStructuralStartDay": 5},
    {"id": "T3", "kind": "task", "title": "E2E: accept -> sign in as venue -> dashboard lists it", "story": ["E5", "V9"], "parent": "T", "tier": 6, "prio": "stretch", "owner": "vali", "reviewer": "jiayi", "size": "M", "windowStartDay": 7, "windowEndDay": 7, "files": ["androidTest/e2e/AcceptJourneyTest.kt"], "initialStatus": "gated+blocked", "earliestStructuralStartDay": 7},
    {"id": "F2", "kind": "task", "title": "Figma: venue dashboard with >= 1 reservation", "story": ["V9"], "parent": "V9", "tier": 7, "prio": "stretch", "owner": "ece", "reviewer": "jiayi", "size": "M", "windowStartDay": 6, "windowEndDay": 6, "initialStatus": "gated", "earliestStructuralStartDay": 1},
    {"id": "A2", "kind": "task", "title": "Import dashboard assets (asset-only PR)", "story": ["V9"], "parent": "V9", "tier": 7, "prio": "stretch", "owner": "ece", "reviewer": "vali", "size": "S", "windowStartDay": 6, "windowEndDay": 6, "initialStatus": "gated+blocked", "earliestStructuralStartDay": 6},
    {"id": "V9.1", "kind": "task", "title": "DashboardViewModel (first commit = DashboardUiState contract)", "story": ["V9"], "parent": "V9", "tier": 7, "prio": "stretch", "owner": "jiayi", "reviewer": "ece", "size": "M", "windowStartDay": 7, "windowEndDay": 7, "files": ["ui/dashboard/DashboardViewModel.kt"], "initialStatus": "gated+blocked", "earliestStructuralStartDay": 1},
    {"id": "V9.2", "kind": "task", "title": "Dashboard reservation list (replaces stub; exposes row actions slot)", "story": ["V9"], "parent": "V9", "tier": 7, "prio": "stretch", "owner": "ece", "reviewer": "vali", "size": "M", "windowStartDay": 7, "windowEndDay": 7, "files": ["ui/dashboard/DashboardScreen.kt", "ui/dashboard/DashboardDestination.kt"], "initialStatus": "gated+blocked", "earliestStructuralStartDay": 7},
    {"id": "V10.1", "kind": "task", "title": "Approve / decline on a pending dashboard row", "story": ["V10"], "parent": "V10", "tier": 7, "prio": "stretch", "owner": "jiayi", "reviewer": "ece", "size": "S", "windowStartDay": 7, "windowEndDay": 7, "files": ["ui/dashboard/ReservationActions.kt"], "initialStatus": "gated+blocked", "earliestStructuralStartDay": 7},
    {"id": "F3", "kind": "task", "title": "Figma: explorer overview showing an accepted quest", "story": ["E6"], "parent": "E6", "tier": 7, "prio": "stretch", "owner": "yigit", "reviewer": "zaynab", "size": "M", "windowStartDay": 6, "windowEndDay": 6, "initialStatus": "gated", "earliestStructuralStartDay": 1},
    {"id": "A3", "kind": "task", "title": "Import overview assets (asset-only PR)", "story": ["E6"], "parent": "E6", "tier": 7, "prio": "stretch", "owner": "yigit", "reviewer": "ferit", "size": "S", "windowStartDay": 6, "windowEndDay": 6, "initialStatus": "gated+blocked", "earliestStructuralStartDay": 6},
    {"id": "E6.1", "kind": "task", "title": "OverviewViewModel (first commit = OverviewUiState contract)", "story": ["E6"], "parent": "E6", "tier": 7, "prio": "stretch", "owner": "zaynab", "reviewer": "jiayi", "size": "M", "windowStartDay": 6, "windowEndDay": 6, "files": ["ui/overview/OverviewViewModel.kt"], "initialStatus": "gated", "earliestStructuralStartDay": 1},
    {"id": "E6.2", "kind": "task", "title": "Overview screen in the Quests tab (replaces stub)", "story": ["E6"], "parent": "E6", "tier": 7, "prio": "stretch", "owner": "ferit", "reviewer": "zaynab", "size": "M", "windowStartDay": 6, "windowEndDay": 7, "files": ["ui/overview/OverviewScreen.kt", "ui/overview/OverviewDestination.kt"], "initialStatus": "gated+blocked", "earliestStructuralStartDay": 6}
  ],
  "edges": [
    {"from": "Q1", "to": "M1", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "release needs a green CI"},
    {"from": "T1", "to": "M1", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "core loop green before release"},
    {"from": "T2", "to": "M1", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "core loop green before release"},
    {"from": "C2", "to": "G2.1", "kind": "hard", "family": "structural", "blocks": "start", "reason": "builds on the slot signature"},
    {"from": "G2.1", "to": "G2.2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "same file, needs the gate"},
    {"from": "G2.1", "to": "G2.3", "kind": "hard", "family": "structural", "blocks": "start", "reason": "routing sits inside the signed-in branch"},
    {"from": "D3p", "to": "G2.3", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "real roles only once the user provider serves Firestore; fake until then"},
    {"from": "G2.1", "to": "G2.4", "kind": "hard", "family": "structural", "blocks": "start", "reason": "sign-out must land on the gate"},
    {"from": "G2.2", "to": "G2.4", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "back-stack clearing after sign-out"},
    {"from": "C3", "to": "G3.1", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "needs currentUserEmail; can take an email lambda until C3 merges"},
    {"from": "G3.1", "to": "G3.2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "screen renders the ViewModel's state"},
    {"from": "C2", "to": "G3.2", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "plugs into the roleSelection slot"},
    {"from": "C2", "to": "G3.3", "kind": "hard", "family": "structural", "blocks": "start", "reason": "implements the venueEntry slot"},
    {"from": "V3.1", "to": "G3.3", "kind": "hard", "family": "structural", "blocks": "start", "reason": "registers VenueAreaScreen(venueId, onSaved, onBack) = contract C4"},
    {"from": "N0", "to": "G3.3", "kind": "hard", "family": "structural", "blocks": "start", "reason": "navigates to the venue-home route"},
    {"from": "G2.3", "to": "G3.3", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "final registration in the role router"},
    {"from": "N2", "to": "G3.3", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "venue home is a stub until N2"},
    {"from": "V3.1", "to": "V3.2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "extends the save path and the same ViewModel"},
    {"from": "V4.1", "to": "C5", "kind": "hard", "family": "structural", "blocks": "start", "reason": "the form state references the Reward subtypes"},
    {"from": "C5", "to": "V4.2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "implements the contract"},
    {"from": "V4.1", "to": "V4.2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "saves typed rewards"},
    {"from": "C5", "to": "V4.3a", "kind": "hard", "family": "structural", "blocks": "start", "reason": "renders CreateQuestUiState"},
    {"from": "V4.2", "to": "V4.3a", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "real validation only with the ViewModel logic"},
    {"from": "C5", "to": "V4.3b", "kind": "hard", "family": "structural", "blocks": "start", "reason": "stateless over RewardFormState"},
    {"from": "V4.3a", "to": "V4.3b", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "plugged into the form's rewardFields slot"},
    {"from": "V4.2", "to": "V4.3c", "kind": "hard", "family": "structural", "blocks": "start", "reason": "states come from the ViewModel"},
    {"from": "V4.3a", "to": "V4.3c", "kind": "hard", "family": "structural", "blocks": "start", "reason": "same screen file"},
    {"from": "N0", "to": "V4.3c", "kind": "hard", "family": "structural", "blocks": "start", "reason": "replaces the create-quest stub destination"},
    {"from": "N2", "to": "V4.3c", "kind": "hard", "family": "structural", "blocks": "start", "reason": "entry point is the venue home's New quest button"},
    {"from": "V4.3b", "to": "V4.3c", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "reward fields plugged in"},
    {"from": "C6", "to": "E3.1", "kind": "hard", "family": "structural", "blocks": "start", "reason": "fills the contract"},
    {"from": "C6", "to": "E3.2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "renders NearbyQuest"},
    {"from": "E3.2", "to": "E3.3", "kind": "hard", "family": "structural", "blocks": "start", "reason": "hosts the list component"},
    {"from": "E3.1", "to": "E3.3", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "list is empty until the ViewModel fills it"},
    {"from": "E3.3", "to": "E3.4", "kind": "hard", "family": "structural", "blocks": "start", "reason": "same screen, needs the sheet"},
    {"from": "N1", "to": "E3.4", "kind": "hard", "family": "structural", "blocks": "start", "reason": "View navigates to the venue route"},
    {"from": "V3.1", "to": "Q2", "kind": "file", "family": "structural", "blocks": "start", "reason": "V3.1 adds a test to VenueAreaScreenDeviceTest.kt; rewrite taps after it lands"},
    {"from": "Q1", "to": "Q2", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "5 green runs must be on the new CI emulator"},
    {"from": "N0", "to": "N1", "kind": "hard", "family": "structural", "blocks": "start", "reason": "the venue route must exist"},
    {"from": "N0", "to": "N2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "tabs host the stub destinations"},
    {"from": "G2.4", "to": "N2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "reuses ProfileScreen"},
    {"from": "G2.3", "to": "N2", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "reached through the router's venueEntry -> home"},
    {"from": "DEC-1", "to": "D1", "kind": "decision", "family": "structural", "blocks": "finish", "reason": "finish: reservation party fields"},
    {"from": "DEC-6", "to": "D1", "kind": "decision", "family": "structural", "blocks": "finish", "reason": "finish: sign-off rule for merging"},
    {"from": "V4.1", "to": "D1", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "documents the reward map from PR #76"},
    {"from": "V3.2", "to": "D2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "implements the address-aware setArea interface"},
    {"from": "Q3", "to": "D2", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "tests use the shared support"},
    {"from": "D1", "to": "D2", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "fields per schema v1"},
    {"from": "D2", "to": "D2p", "kind": "hard", "family": "structural", "blocks": "start", "reason": "needs the implementation"},
    {"from": "G2.1", "to": "D2p", "kind": "hard", "family": "structural", "blocks": "start", "reason": "rules require sign-in to read venues"},
    {"from": "Q3", "to": "D3", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "tests use the shared support"},
    {"from": "D1", "to": "D3", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "fields per schema v1"},
    {"from": "D3", "to": "D3p", "kind": "hard", "family": "structural", "blocks": "start", "reason": "needs the implementation"},
    {"from": "G2.1", "to": "D3p", "kind": "hard", "family": "structural", "blocks": "start", "reason": "users are owner-only: sign-in first"},
    {"from": "D1", "to": "D4", "kind": "hard", "family": "structural", "blocks": "start", "reason": "rules follow schema v1"},
    {"from": "DEC-1", "to": "D4", "kind": "decision", "family": "structural", "blocks": "start", "reason": "start: reservation fields to allow"},
    {"from": "G2.1", "to": "D5", "kind": "hard", "family": "structural", "blocks": "start", "reason": "rules require sign-in to read quests"},
    {"from": "V4.1", "to": "D5", "kind": "file", "family": "structural", "blocks": "start", "reason": "edits model/quest/ after the Reward change"},
    {"from": "D4", "to": "D5", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "production reads need rules v2 deployed"},
    {"from": "D1", "to": "D7a", "kind": "hard", "family": "structural", "blocks": "start", "reason": "seed documents follow schema v1"},
    {"from": "D5", "to": "D7a", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "MapDemoData becomes the seed input"},
    {"from": "DEC-4", "to": "D7b", "kind": "decision", "family": "structural", "blocks": "start", "reason": "start: which names to use"},
    {"from": "G3.3", "to": "D7b", "kind": "hard", "family": "structural", "blocks": "start", "reason": "onboarding reachable in the app"},
    {"from": "V3.1", "to": "D7b", "kind": "hard", "family": "structural", "blocks": "start", "reason": "area must save"},
    {"from": "V4.3c", "to": "D7b", "kind": "hard", "family": "structural", "blocks": "start", "reason": "quests creatable from the venue home"},
    {"from": "D2p", "to": "D7b", "kind": "hard", "family": "structural", "blocks": "start", "reason": "venues must persist in Firestore"},
    {"from": "D5", "to": "D7b", "kind": "hard", "family": "structural", "blocks": "start", "reason": "quests must persist in Firestore"},
    {"from": "D4", "to": "D7b", "kind": "hard", "family": "structural", "blocks": "start", "reason": "rules v2 deployed to production"},
    {"from": "D3p", "to": "D7b", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "without it roles are asked again after restart"},
    {"from": "D1", "to": "D8", "kind": "hard", "family": "structural", "blocks": "start", "reason": "adds a geohash field to quest documents; schema v1 must define it (docs/firestore-schema.md is Jiayi's)"},
    {"from": "V4.1", "to": "D8", "kind": "file", "family": "structural", "blocks": "start", "reason": "edits model/quest/Quest.kt and QuestRepositoryFirestore.kt after the Reward change (PR #76)"},
    {"from": "D7a", "to": "D8", "kind": "file", "family": "structural", "blocks": "start", "reason": "the seed tool must write geohash on seeded quests; edit tools/seed after it lands"},
    {"from": "E3.4", "to": "D8", "kind": "file", "family": "structural", "blocks": "start", "reason": "changes the observeActiveQuests call in ui/map/MapViewModel.kt; goes after Ferit's last MapViewModel task"},
    {"from": "D5", "to": "D8", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "the bounded query only reaches the map once the quest provider serves Firestore; verify in the app after D5"},
    {"from": "D4", "to": "D8", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "the composite index (status + geohash) ships in firestore.indexes.json with D4's firebase.json and deploy"},
    {"from": "Q1", "to": "T0", "kind": "hard", "family": "structural", "blocks": "start", "reason": "harness runs on the new CI emulator"},
    {"from": "T0", "to": "T1", "kind": "hard", "family": "structural", "blocks": "start", "reason": "uses the harness"},
    {"from": "G2.3", "to": "T1", "kind": "hard", "family": "structural", "blocks": "start", "reason": "role routing"},
    {"from": "G3.2", "to": "T1", "kind": "hard", "family": "structural", "blocks": "start", "reason": "pick Venue"},
    {"from": "G3.3", "to": "T1", "kind": "hard", "family": "structural", "blocks": "start", "reason": "onboarding in the app"},
    {"from": "V3.1", "to": "T1", "kind": "hard", "family": "structural", "blocks": "start", "reason": "save the area"},
    {"from": "N2", "to": "T1", "kind": "hard", "family": "structural", "blocks": "start", "reason": "venue home"},
    {"from": "V4.3c", "to": "T1", "kind": "hard", "family": "structural", "blocks": "start", "reason": "create quest from the home"},
    {"from": "Q2", "to": "T1", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "map taps via the shared helper"},
    {"from": "D2p", "to": "T1", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "assert in Firestore once venues are real"},
    {"from": "D3p", "to": "T1", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "assert role in Firestore once users are real"},
    {"from": "T0", "to": "T2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "uses the harness"},
    {"from": "G2.3", "to": "T2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "role routing"},
    {"from": "G3.2", "to": "T2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "pick Explorer"},
    {"from": "E3.4", "to": "T2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "View from the nearby list"},
    {"from": "E4.2", "to": "T2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "venue page exists"},
    {"from": "D5", "to": "T2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "map reads the seeded Firestore quest"},
    {"from": "E4.3", "to": "T2", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "asserts the quest row on the page"},
    {"from": "F1", "to": "A1", "kind": "hard", "family": "structural", "blocks": "start", "reason": "exports from the frame"},
    {"from": "DS0", "to": "A1", "kind": "file", "family": "structural", "blocks": "start", "reason": "may add tokens to ui/theme after DS0"},
    {"from": "C7", "to": "E4.1", "kind": "hard", "family": "structural", "blocks": "start", "reason": "fills the contract"},
    {"from": "C7", "to": "E4.2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "renders VenuePageUiState"},
    {"from": "N0", "to": "E4.2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "replaces the venue-page stub"},
    {"from": "E4.1", "to": "E4.2", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "real data"},
    {"from": "A1", "to": "E4.2", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "swap placeholders for assets"},
    {"from": "C7", "to": "E4.3", "kind": "hard", "family": "structural", "blocks": "start", "reason": "renders VenuePageQuest"},
    {"from": "E4.2", "to": "E4.3", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "plugged into the questRow slot"},
    {"from": "F1", "to": "E4.3", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "matches the frame"},
    {"from": "A1", "to": "E4.3", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "uses its assets"},
    {"from": "V4.1", "to": "E4.3", "kind": "file", "family": "structural", "blocks": "start", "reason": "reuses the reward chip changed in QuestCard.kt"},
    {"from": "E4.3", "to": "E4.4", "kind": "hard", "family": "structural", "blocks": "start", "reason": "extends the rows"},
    {"from": "E4.1", "to": "E5.1", "kind": "hard", "family": "structural", "blocks": "start", "reason": "same ViewModel"},
    {"from": "DEC-1", "to": "E5.1", "kind": "decision", "family": "structural", "blocks": "start", "reason": "start: reservation fields"},
    {"from": "DEC-2", "to": "E5.1", "kind": "decision", "family": "structural", "blocks": "start", "reason": "start: slotStart"},
    {"from": "DEC-3", "to": "E5.1", "kind": "decision", "family": "structural", "blocks": "start", "reason": "start: party > 1 behaviour"},
    {"from": "D5", "to": "E5.1", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "reservation provider on Firestore"},
    {"from": "D4", "to": "E5.1", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "rules v2 allow the create"},
    {"from": "E4.2", "to": "E5.2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "plugs into the bottomBar slot"},
    {"from": "C7", "to": "E5.2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "renders the state"},
    {"from": "DEC-3", "to": "E5.2", "kind": "decision", "family": "structural", "blocks": "start", "reason": "start: 'needs N more' state"},
    {"from": "E5.1", "to": "E5.2", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "real accept behaviour"},
    {"from": "T2", "to": "T3", "kind": "hard", "family": "structural", "blocks": "start", "reason": "extends the explorer journey"},
    {"from": "E5.1", "to": "T3", "kind": "hard", "family": "structural", "blocks": "start", "reason": "accept works"},
    {"from": "E5.2", "to": "T3", "kind": "hard", "family": "structural", "blocks": "start", "reason": "accept button"},
    {"from": "V9.2", "to": "T3", "kind": "hard", "family": "structural", "blocks": "start", "reason": "dashboard lists reservations"},
    {"from": "DEC-1", "to": "F2", "kind": "decision", "family": "structural", "blocks": "finish", "reason": "finish: whether rows show party names"},
    {"from": "F2", "to": "A2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "exports from the frame"},
    {"from": "DS0", "to": "A2", "kind": "file", "family": "structural", "blocks": "start", "reason": "ui/theme after DS0"},
    {"from": "DEC-1", "to": "V9.1", "kind": "decision", "family": "structural", "blocks": "start", "reason": "start: row content"},
    {"from": "D5", "to": "V9.1", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "reservation provider on Firestore"},
    {"from": "V9.1", "to": "V9.2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "needs the DashboardUiState contract (first commit of V9.1)"},
    {"from": "N2", "to": "V9.2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "hosted in the venue home's Dashboard tab"},
    {"from": "N0", "to": "V9.2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "replaces the stub"},
    {"from": "A2", "to": "V9.2", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "assets"},
    {"from": "V9.1", "to": "V10.1", "kind": "hard", "family": "structural", "blocks": "start", "reason": "status updates go through the ViewModel"},
    {"from": "V9.2", "to": "V10.1", "kind": "hard", "family": "structural", "blocks": "start", "reason": "plugs into the row actions slot"},
    {"from": "F3", "to": "A3", "kind": "hard", "family": "structural", "blocks": "start", "reason": "exports from the frame"},
    {"from": "DS0", "to": "A3", "kind": "file", "family": "structural", "blocks": "start", "reason": "ui/theme after DS0"},
    {"from": "D5", "to": "E6.1", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "reservations from Firestore"},
    {"from": "E6.1", "to": "E6.2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "needs the OverviewUiState contract"},
    {"from": "N1", "to": "E6.2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "Quests tab hosts the route"},
    {"from": "N0", "to": "E6.2", "kind": "hard", "family": "structural", "blocks": "start", "reason": "replaces the stub"},
    {"from": "A3", "to": "E6.2", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "assets"},
    {"from": "E5.1", "to": "E6.2", "kind": "soft", "family": "structural", "blocks": "finish", "reason": "an accepted quest exists only once accepting works"},
    {"from": "Q3", "to": "HK-1", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Jiayi's previous task in the plan"},
    {"from": "T1", "to": "M1", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Alisher's previous task in the plan"},
    {"from": "day:7", "to": "M1", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 7"},
    {"from": "C2", "to": "C3", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Vali's previous task in the plan"},
    {"from": "C3", "to": "G2.1", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Vali's previous task in the plan"},
    {"from": "G2.1", "to": "G2.2", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Vali's previous task in the plan"},
    {"from": "day:2", "to": "G2.2", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 2"},
    {"from": "G2.2", "to": "G2.3", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Vali's previous task in the plan"},
    {"from": "day:3", "to": "G2.3", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 3"},
    {"from": "G2.3", "to": "G2.4", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Vali's previous task in the plan"},
    {"from": "day:3", "to": "G2.4", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 3"},
    {"from": "V4.3b", "to": "G3.2", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Ece's previous task in the plan"},
    {"from": "day:3", "to": "G3.2", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 3"},
    {"from": "G3.2", "to": "G3.3", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Ece's previous task in the plan"},
    {"from": "day:4", "to": "G3.3", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 4"},
    {"from": "E3.2", "to": "V3.2", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Yigit's previous task in the plan"},
    {"from": "day:2", "to": "V3.2", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 2"},
    {"from": "V4.1", "to": "C5", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Zaynab's previous task in the plan"},
    {"from": "C5", "to": "V4.2", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Zaynab's previous task in the plan"},
    {"from": "A1", "to": "V4.3a", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Zaynab's previous task in the plan"},
    {"from": "day:4", "to": "V4.3a", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 4"},
    {"from": "G3.1", "to": "V4.3b", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Ece's previous task in the plan"},
    {"from": "day:2", "to": "V4.3b", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 2"},
    {"from": "V4.3a", "to": "V4.3c", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Zaynab's previous task in the plan"},
    {"from": "day:5", "to": "V4.3c", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 5"},
    {"from": "DS0", "to": "E3.1", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Ferit's previous task in the plan"},
    {"from": "V3.1", "to": "E3.2", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Yigit's previous task in the plan"},
    {"from": "day:2", "to": "E3.2", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 2"},
    {"from": "Q2", "to": "E3.3", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Ferit's previous task in the plan"},
    {"from": "day:3", "to": "E3.3", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 3"},
    {"from": "E4.3", "to": "E3.4", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Ferit's previous task in the plan"},
    {"from": "day:5", "to": "E3.4", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 5"},
    {"from": "N0", "to": "Q1", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Alisher's previous task in the plan"},
    {"from": "E3.1", "to": "Q2", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Ferit's previous task in the plan"},
    {"from": "day:2", "to": "Q2", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 2"},
    {"from": "C7", "to": "Q3", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Jiayi's previous task in the plan"},
    {"from": "Q1", "to": "N1", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Alisher's previous task in the plan"},
    {"from": "day:2", "to": "N1", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 2"},
    {"from": "G2.4", "to": "N2", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Vali's previous task in the plan"},
    {"from": "day:4", "to": "N2", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 4"},
    {"from": "HK-1", "to": "D1", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Jiayi's previous task in the plan"},
    {"from": "V3.2", "to": "D2", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Yigit's previous task in the plan"},
    {"from": "day:3", "to": "D2", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 3"},
    {"from": "E4.2", "to": "D2p", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Yigit's previous task in the plan"},
    {"from": "day:5", "to": "D2p", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 5"},
    {"from": "G3.3", "to": "D3", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Ece's previous task in the plan"},
    {"from": "day:4", "to": "D3", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 4"},
    {"from": "D3", "to": "D3p", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Ece's previous task in the plan"},
    {"from": "day:6", "to": "D3p", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 6"},
    {"from": "N1", "to": "D4", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Alisher's previous task in the plan"},
    {"from": "day:3", "to": "D4", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 3"},
    {"from": "E4.1", "to": "D5", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Jiayi's previous task in the plan"},
    {"from": "day:3", "to": "D5", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 3"},
    {"from": "D5", "to": "D7a", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Jiayi's previous task in the plan"},
    {"from": "day:4", "to": "D7a", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 4"},
    {"from": "day:6", "to": "D7b", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 6"},
    {"from": "C6", "to": "DS0", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Ferit's previous task in the plan"},
    {"from": "D4", "to": "T0", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Alisher's previous task in the plan"},
    {"from": "day:4", "to": "T0", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 4"},
    {"from": "T0", "to": "T1", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Alisher's previous task in the plan"},
    {"from": "day:5", "to": "T1", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 5"},
    {"from": "N2", "to": "T2", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Vali's previous task in the plan"},
    {"from": "day:5", "to": "T2", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 5"},
    {"from": "V4.2", "to": "F1", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Zaynab's previous task in the plan"},
    {"from": "day:2", "to": "F1", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 2"},
    {"from": "F1", "to": "A1", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Zaynab's previous task in the plan"},
    {"from": "day:4", "to": "A1", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 4"},
    {"from": "DEC-1", "to": "C7", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Jiayi's previous task in the plan"},
    {"from": "D1", "to": "E4.1", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Jiayi's previous task in the plan"},
    {"from": "day:2", "to": "E4.1", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 2"},
    {"from": "D2", "to": "E4.2", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Yigit's previous task in the plan"},
    {"from": "day:4", "to": "E4.2", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 4"},
    {"from": "E3.3", "to": "E4.3", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Ferit's previous task in the plan"},
    {"from": "day:4", "to": "E4.3", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 4"},
    {"from": "E6.1", "to": "E4.4", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Zaynab's previous task in the plan"},
    {"from": "V4.1|C5|V4.2|F1|A1|V4.3a|V4.3c", "to": "E4.4", "kind": "stretch-gate", "family": "chronological", "blocks": "start", "advisory": false, "reason": "Zaynab has finished all must-haves"},
    {"from": "day:7", "to": "E4.4", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 7"},
    {"from": "D7a", "to": "E5.1", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Jiayi's previous task in the plan"},
    {"from": "DEC-1|C7|Q3|HK-1|D1|E4.1|D5|D7a", "to": "E5.1", "kind": "stretch-gate", "family": "chronological", "blocks": "start", "advisory": false, "reason": "Jiayi has finished all must-haves"},
    {"from": "day:6", "to": "E5.1", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 6"},
    {"from": "T2", "to": "E5.2", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Vali's previous task in the plan"},
    {"from": "C2|C3|G2.1|G2.2|G2.3|G2.4|N2|T2", "to": "E5.2", "kind": "stretch-gate", "family": "chronological", "blocks": "start", "advisory": false, "reason": "Vali has finished all must-haves"},
    {"from": "day:6", "to": "E5.2", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 6"},
    {"from": "E5.2", "to": "T3", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Vali's previous task in the plan"},
    {"from": "C2|C3|G2.1|G2.2|G2.3|G2.4|N2|T2", "to": "T3", "kind": "stretch-gate", "family": "chronological", "blocks": "start", "advisory": false, "reason": "Vali has finished all must-haves"},
    {"from": "day:7", "to": "T3", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 7"},
    {"from": "D3p", "to": "F2", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Ece's previous task in the plan"},
    {"from": "G3.1|V4.3b|G3.2|G3.3|D3|D3p", "to": "F2", "kind": "stretch-gate", "family": "chronological", "blocks": "start", "advisory": false, "reason": "Ece has finished all must-haves"},
    {"from": "day:6", "to": "F2", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 6"},
    {"from": "F2", "to": "A2", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Ece's previous task in the plan"},
    {"from": "G3.1|V4.3b|G3.2|G3.3|D3|D3p", "to": "A2", "kind": "stretch-gate", "family": "chronological", "blocks": "start", "advisory": false, "reason": "Ece has finished all must-haves"},
    {"from": "day:6", "to": "A2", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 6"},
    {"from": "E5.1", "to": "V9.1", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Jiayi's previous task in the plan"},
    {"from": "DEC-1|C7|Q3|HK-1|D1|E4.1|D5|D7a", "to": "V9.1", "kind": "stretch-gate", "family": "chronological", "blocks": "start", "advisory": false, "reason": "Jiayi has finished all must-haves"},
    {"from": "day:7", "to": "V9.1", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 7"},
    {"from": "A2", "to": "V9.2", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Ece's previous task in the plan"},
    {"from": "G3.1|V4.3b|G3.2|G3.3|D3|D3p", "to": "V9.2", "kind": "stretch-gate", "family": "chronological", "blocks": "start", "advisory": false, "reason": "Ece has finished all must-haves"},
    {"from": "day:7", "to": "V9.2", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 7"},
    {"from": "V9.1", "to": "V10.1", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Jiayi's previous task in the plan"},
    {"from": "DEC-1|C7|Q3|HK-1|D1|E4.1|D5|D7a", "to": "V10.1", "kind": "stretch-gate", "family": "chronological", "blocks": "start", "advisory": false, "reason": "Jiayi has finished all must-haves"},
    {"from": "day:7", "to": "V10.1", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 7"},
    {"from": "D2p", "to": "F3", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Yigit's previous task in the plan"},
    {"from": "V3.1|E3.2|V3.2|D2|E4.2|D2p", "to": "F3", "kind": "stretch-gate", "family": "chronological", "blocks": "start", "advisory": false, "reason": "Yigit has finished all must-haves"},
    {"from": "day:6", "to": "F3", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 6"},
    {"from": "F3", "to": "A3", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Yigit's previous task in the plan"},
    {"from": "V3.1|E3.2|V3.2|D2|E4.2|D2p", "to": "A3", "kind": "stretch-gate", "family": "chronological", "blocks": "start", "advisory": false, "reason": "Yigit has finished all must-haves"},
    {"from": "day:6", "to": "A3", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 6"},
    {"from": "V4.3c", "to": "E6.1", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Zaynab's previous task in the plan"},
    {"from": "V4.1|C5|V4.2|F1|A1|V4.3a|V4.3c", "to": "E6.1", "kind": "stretch-gate", "family": "chronological", "blocks": "start", "advisory": false, "reason": "Zaynab has finished all must-haves"},
    {"from": "day:6", "to": "E6.1", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 6"},
    {"from": "E3.4", "to": "E6.2", "kind": "owner-queue", "family": "chronological", "blocks": "start", "advisory": true, "reason": "Ferit's previous task in the plan"},
    {"from": "C6|DS0|E3.1|Q2|E3.3|E4.3|E3.4", "to": "E6.2", "kind": "stretch-gate", "family": "chronological", "blocks": "start", "advisory": false, "reason": "Ferit has finished all must-haves"},
    {"from": "day:6", "to": "E6.2", "kind": "not-before", "family": "chronological", "blocks": "start", "advisory": true, "reason": "planned window starts on Day 6"}
  ],
  "integrationPoints": [
    {"slot": "AppRoot.authFlow", "definedBy": "C2", "filledBy": "AuthScreen (exists)", "fillerTask": "G2.1", "hostOwner": "Vali", "plugIn": "G2.1 plugs it"},
    {"slot": "AppRoot.explorerHome", "definedBy": "C2", "filledBy": "AroundApp (exists)", "fillerTask": "G2.3", "hostOwner": "Vali", "plugIn": "G2.3 plugs it"},
    {"slot": "AppRoot.roleSelection", "definedBy": "C2", "filledBy": "RoleSelectionScreen", "fillerTask": "G3.2", "hostOwner": "Vali (MainActivity/AppRoot)", "plugIn": "later of G2.3/G3.2 plugs it, Vali reviews"},
    {"slot": "AppRoot.venueEntry", "definedBy": "C2", "filledBy": "venue entry composable", "fillerTask": "G3.3", "hostOwner": "Vali (MainActivity/AppRoot)", "plugIn": "later of G2.3/G3.3 plugs it, Vali reviews"},
    {"slot": "venueOnboardingDestinations.locationScreen", "definedBy": "existing", "filledBy": "VenueAreaScreen(venueId,onSaved,onBack)", "fillerTask": "V3.1", "hostOwner": "Ece", "plugIn": "G3.3 plugs it"},
    {"slot": "MapScreen.onOpenVenue", "definedBy": "existing", "filledBy": "venue/{venueId} route", "fillerTask": "N0", "hostOwner": "Alisher (AroundApp.kt)", "plugIn": "N1 plugs it"},
    {"slot": "MapScreen nearby sheet", "definedBy": "C6", "filledBy": "NearbyQuestList", "fillerTask": "E3.2", "hostOwner": "Ferit", "plugIn": "E3.3 plugs it"},
    {"slot": "CreateQuestScreen.rewardFields", "definedBy": "C5", "filledBy": "RewardFields", "fillerTask": "V4.3b", "hostOwner": "Zaynab", "plugIn": "later of V4.3a/V4.3b plugs it, Zaynab reviews"},
    {"slot": "VenueHome Quests tab -> create quest", "definedBy": "N0", "filledBy": "CreateQuestScreen", "fillerTask": "V4.3c", "hostOwner": "Zaynab (CreateQuestDestination.kt)", "plugIn": "V4.3c replaces the stub"},
    {"slot": "VenueHome Profile tab", "definedBy": "G2.4", "filledBy": "ProfileScreen", "fillerTask": "G2.4", "hostOwner": "Vali", "plugIn": "N2 plugs it"},
    {"slot": "VenuePageScreen.questRow", "definedBy": "C7", "filledBy": "VenueQuestRow", "fillerTask": "E4.3", "hostOwner": "Yigit", "plugIn": "later of E4.2/E4.3 plugs it, Yigit reviews"},
    {"slot": "VenuePageScreen.bottomBar", "definedBy": "C7", "filledBy": "AcceptQuestBar", "fillerTask": "E5.2", "hostOwner": "Yigit", "plugIn": "E5.2 plugs it (E4.2 is earlier), Yigit reviews"},
    {"slot": "VenueHome Dashboard tab", "definedBy": "N0", "filledBy": "DashboardScreen", "fillerTask": "V9.2", "hostOwner": "Ece (DashboardDestination.kt)", "plugIn": "V9.2 replaces the stub"},
    {"slot": "Dashboard row actions", "definedBy": "V9.2", "filledBy": "ReservationActions", "fillerTask": "V10.1", "hostOwner": "Ece", "plugIn": "V10.1 plugs it, Ece reviews"},
    {"slot": "Explorer Quests tab", "definedBy": "N0", "filledBy": "OverviewScreen", "fillerTask": "E6.2", "hostOwner": "Ferit (OverviewDestination.kt)", "plugIn": "E6.2 replaces the stub"},
    {"slot": "QuestRepositoryProvider / ReservationRepositoryProvider", "definedBy": "existing", "filledBy": "*Firestore impls", "fillerTask": "D5", "hostOwner": "Jiayi this sprint", "plugIn": "D5"},
    {"slot": "VenueRepositoryProvider", "definedBy": "existing", "filledBy": "VenueRepositoryFirestore", "fillerTask": "D2", "hostOwner": "Yigit", "plugIn": "D2p"},
    {"slot": "UserRepositoryProvider", "definedBy": "new", "filledBy": "UserRepositoryFirestore", "fillerTask": "D3", "hostOwner": "Ece", "plugIn": "D3p"}
  ],
  "fileContention": [
    {"file": "androidTest/ui/venue/VenueAreaScreenDeviceTest.kt", "tasks": ["V3.1", "Q2"], "ordering": "Q2 after V3.1 (file edge)", "note": "Yigit adds a save test; Ferit rewrites the taps"},
    {"file": "ui/theme/*", "tasks": ["DS0", "A1", "A2", "A3"], "ordering": "asset PRs after DS0 (file edge)", "note": "DS0 renames fonts and moves tokens"},
    {"file": "model/quest/*", "tasks": ["V4.1", "D5"], "ordering": "D5 after V4.1 (file edge)", "note": "model/quest is Zaynab's; D5 edits only the provider"},
    {"file": "ui/map/marker/QuestCard.kt", "tasks": ["V4.1", "E4.3"], "ordering": "E4.3 after V4.1 (file edge)", "note": "V4.1 changes the reward chip that E4.3 reuses"},
    {"file": "ui/map/MapViewModel.kt", "tasks": ["C6", "E3.1", "E3.4", "D8"], "ordering": "Ferit's queue, then D8 (file edge from E3.4)", "note": "D8 only changes the observeActiveQuests call"},
    {"file": "model/quest/QuestRepositoryFirestore.kt", "tasks": ["V4.1", "D8"], "ordering": "D8 after V4.1 (file edge)", "note": "model/quest is Zaynab's"},
    {"file": "tools/seed/*", "tasks": ["D7a", "D8"], "ordering": "D8 after D7a (file edge)", "note": "D8 adds geohash to seeded quests"},
    {"file": "ui/map/MapScreen.kt", "tasks": ["E3.3", "E3.4"], "ordering": "same owner, queue order", "note": "Ferit only"},
    {"file": "ui/venue/VenueAreaViewModel.kt", "tasks": ["V3.1", "V3.2"], "ordering": "same owner, hard edge", "note": "Yigit only; #90 vs #92 collision is not repeated"},
    {"file": "model/venue/VenueRepository.kt (+fake)", "tasks": ["V3.2", "D2"], "ordering": "same owner, hard edge", "note": "Yigit only"},
    {"file": "ui/navigation/AppRoot.kt, MainActivity.kt", "tasks": ["C2", "G2.1", "G2.2", "G2.3", "G3.2", "G3.3"], "ordering": "Vali's files; G3.x plug-ins follow the later-PR rule", "note": "slot plug-ins are 1-5 lines"},
    {"file": "ui/navigation/AroundApp.kt", "tasks": ["N1"], "ordering": "single editor this sprint", "note": "G2.x wraps it without editing"},
    {"file": "ui/venuepage/VenuePageDestination.kt", "tasks": ["N0", "E4.2", "E4.3", "E5.2"], "ordering": "N0 creates; Yigit owns from E4.2; plug-ins reviewed by Yigit", "note": ""},
    {"file": "ui/quest/create/CreateQuestScreen.kt", "tasks": ["V4.3a", "V4.3c"], "ordering": "same owner, hard edge", "note": "V4.3b lives in RewardFields.kt"},
    {"file": "ui/dashboard/DashboardScreen.kt", "tasks": ["V9.2", "V10.1"], "ordering": "V10.1 uses V9.2's row-actions slot", "note": "avoids V10.1 editing Ece's file"},
    {"file": "firestore.rules", "tasks": ["D4"], "ordering": "single editor (Alisher)", "note": "E5 rule needs are folded into D4"},
    {"file": "README.md", "tasks": ["D4", "D5", "D7a"], "ordering": "different sections; trivial conflicts", "note": "deploy command / demo section / seed section"},
    {"file": "docs/firestore-schema.md", "tasks": ["D1", "V4.1"], "ordering": "V4.1's doc checkbox moved into D1", "note": "only Jiayi edits"},
    {"file": "resources/C.kt", "tasks": ["many"], "ordering": "append-only, one block per feature", "note": "conflicts are trivial"}
  ]
}
```

## 12. Added after the snapshot

### D8: Geo-bounded quest query (added Day 1, from the E3.1 review)

**Problem.** `QuestRepository.observeActiveQuests()` listens to *every* active quest in the world. Both the map pins and the E3 nearby list are built from that one stream, so download size, memory and listener cost grow with the global number of quests, not with what the explorer can see. Fine for the Sprint 2 data set (seeded Lausanne quests plus the team's venues), but it does not scale.

**Fix.** Store a `geohash` on each quest (from its venue's location) and replace the global listener with geohash range queries around a centre: the explorer's location when permission is granted (fine or approximate), otherwise the map camera's centre. The radius is `NEARBY_RADIUS_METERS` or the visible area, whichever is larger. An exact distance filter runs on the client to drop the corners of the geohash cells. The nearby list (E3.1) and the pins then hold only what this query returns, with no change to `nearbyQuests(...)`.

**Done when**
- [ ] `observeActiveQuests(center, radiusMeters)` uses `status == ACTIVE` + geohash ranges (GeoFire common utilities), with emulator tests: inside, outside, cell-corner, moving centre
- [ ] Quests get `geohash` on write; a one-off backfill covers quests created before D8 (for example on data day)
- [ ] `docs/firestore-schema.md` documents the field; the composite index (`status`, `geohash`) is in `firestore.indexes.json` and deployed
- [ ] The seed tool writes `geohash`
- [ ] `MapViewModel` passes the explorer location, else the camera centre (re-querying when it moves beyond half the radius)

**Placement.** V1 (Tier 3, mocks → Firestore), next to D5, which switches the quest provider to Firestore. Story tags `[V1·E2]`.

**Priority: stretch.** Nothing in Sprint 2 fails without it, and the must-haves already have little slack (§4).

**Blocked by**
| Blocker | Kind | Why |
|---|---|---|
| D1 | hard | adds a geohash field to quest documents; schema v1 must define it (docs/firestore-schema.md is Jiayi's) |
| V4.1 | file | edits model/quest/Quest.kt and QuestRepositoryFirestore.kt after the Reward change (PR #76) |
| D7a | file | the seed tool must write geohash on seeded quests; edit tools/seed after it lands |
| E3.4 | file | changes the observeActiveQuests call in ui/map/MapViewModel.kt; goes after Ferit's last MapViewModel task |
| D5 | soft | the bounded query only reaches the map once the quest provider serves Firestore; verify in the app after D5 |
| D4 | soft | the composite index (status + geohash) ships in firestore.indexes.json with D4's firebase.json and deploy |

**Blocks: nothing.**
- E3.1 is not blocked. Its no-location case lists every valid quest the repository delivers, so it is bounded automatically once D8 lands, with no change to E3.1.
- D7b (data day) is not blocked. Quests created before D8 are covered by the backfill instead of making data day wait.
- T2 is not blocked. It only needs the seeded quest to have a `geohash`, which the D7a file edge guarantees.

**Out of scope (team decision, not D8):** IP-based geolocation for explorers without any location permission (privacy and cost).

