# Sprint 3 blocking report

The sprint's three goals are **reservations**, **fixing the noted issues** and **stabilizing**, with **parties** as stretch. This report is built from the team's review of the repo's open issues (26 open issues, plus the new ones in §5). Nothing in it has been created on GitHub yet.

- **Existing issues** use their GitHub number as the board ID (`#249`). Where an issue already had a plan ID, it is shown as an alias (`#249 = E5.1`).
- **New issues** use letter IDs (`R2`, `F4a`, `P3b`). Keep these IDs on the board when the issues are created: the board stores progress by ID, so renaming a task someone already took loses its state. Put the new GitHub number in the task's `github` field instead (§11) and rerun the script.
- **Split issues** get a letter per part (`#246a`, `#246b`, `#246c`). The size target is 600 lines and 10 files per PR.
- **Done** for every new issue also means unit tests, `./gradlew check` and `ktfmtCheck` pass.

## 1. How the plan maps onto the board

- **Tiers:** *must* tasks count for the 🏆 victory. *Should* tasks are normal boxes but only count, with stretch, for the 👑 ultra victory. *Stretch / optional* tasks are striped.
- **#26** and **#253** weren't in a tier. #26 is a must (it only needs closing), #253 a should.
- **Edges added on top of the review** (each says why in §10):
  - `R4 → R2`, file: both change `ReservationRepositoryFirestore` and its test.
  - `S2 → R2`, `R2 → F4b`, `R2 → P2c`, file: the "merge them one at a time" rule for `firestore.rules`. S2 is in the early wave, so it goes first. F4b also edits the rules, so it joins the queue.
  - `#250 → P3b`, hard: the picker goes on #250's accept bar.
  - `#255 → #257` is `soft` (icons, like `#247 → #246`).
  - The #246 parts chain: ViewModel → screen and rows → approve and reject. #249 and R2 block the ViewModel, #247 the screen, and #152 waits on the last part.
- **"Only if adopted":** F4a and F5 wait on the F3 decision. If F3 rejects one, delete it from §11 and rerun the script (or mark it done), so it stops blocking.
- **Not on the board:** F1's follow-up issues (they don't exist until F1 is done), the redeploys S1 repeats after R2, S2, P2c and F4b, and the housekeeping in §7.

## 2. Goal 1: Reservations (existing issues)

| # | What | Blocked by | Note |
|---|---|---|---|
| #248 | E5 epic: accept a quest | its children #249, #250 | Parent, close when children close |
| #249 | E5.1 provider and `accept()` | nothing | |
| #250 | E5.2 accept-quest bar | #249 | |
| #254 | E6 epic: explorer overview | its children #255, #256, #257 | Parent |
| #255 | A3 overview icons | nothing | |
| #256 | E6.1 overview ViewModel | #249 (soft: shared reservation flow and uid) | |
| #257 | E6.2 overview screen | #256, #255 | |
| #247 | dashboard icons | nothing | |
| #246 | venue dashboard, approve and reject | #249 (provider, so only one of #246 and #249 adds it), #247 (soft), R2 | **Too big. Split into ViewModel (#246a), screen and rows (#246b), approve and reject actions (#246c).** |
| #152 | T3 E2E accept journey | #151 (closed), #249, #250, #246 | V9.2 isn't an open issue; taken to be #246 |

## 3. Goal 2: Fix noted issues (existing issues)

| # | What | Blocked by | Note |
|---|---|---|---|
| #6 | V1 epic: venue account | #242, #245 | Parent. Its body is empty. |
| #242 | V1: auth and venue setup backgrounds | nothing | Figma match |
| #245 | venue link submits the explorer form | nothing | Login screen fix |
| #26 | G3 Figma role selection | nothing | Every box is ticked. Close it. |

## 4. Goal 3: Stabilize, and other (existing issues)

| # | What | Blocked by | Note |
|---|---|---|---|
| #241 | E2E sign-up times out on a cold emulator | nothing | Flaky CI, fix early |
| #125 | Measure CI emulator cost | nothing | Optional |
| #228 | Venue entry review follow-up | nothing | Marked "deferred to Sprint 3" |
| #172 | Move tests to the v2 Compose rules | nothing | **~22 files. Split into three: Robolectric tests first half (#172a), second half (#172b), device tests (#172c).** |
| #251 | Replace deprecated APIs | nothing | **Overlaps #172. Narrowed to the non-test-rule deprecations.** |
| #252 | Move hard-coded colours to the theme | nothing | **Too big. Split by area: venue setup (#252a), address bar (#252b), map shadows (#252c), text fields (#252d).** |
| #73 | V4 epic: create a quest | #244, #224, #215 | Parent. Its task list is outdated. |
| #244 | V4.7: list the venue's quests | nothing | |
| #224 | V4.5.4: keep the form open while saving | nothing | |
| #215 | V4.5.3: explain a venue that can't load | nothing | Related to S3 |
| #243 | E4: more quest details | nothing | Parent #128 |
| #253 | Contact venues and explorers | nothing | No PR, user research |

## 5. New issues

### Goal 1: Reservations

**[R2] Let the venue see who reserved** (~200 lines, ~8 files)
**Blocked by:** #249. **Blocks:** #246.
- **Description:**
  - `users/{uid}` is readable only by its owner, so the venue can't show who reserved.
  - Proposal: copy the explorer's display name onto the reservation at creation, as `venueName` is copied onto quests.
  - Files: `Reservation`, both repositories, `firestore.rules`, `FirestoreRulesTest`, the repository test, the schema doc.
- **Done when:**
  - [ ] The field round-trips through the fake and the Firestore repository.
  - [ ] A rules test accepts the field and rejects wrong types.
  - [ ] `accept()` fills the field.
  - [ ] The schema doc lists it.
  - [ ] The PR is flagged for a rules redeploy (S1).

**[R4] Report a rejected reservation write** (~250 lines, 4 files)
**Blocked by:** nothing. Land it before #250 ships.
- **Description:** `createReservation` returns before the server answers, so a rules rejection is silent. Make the Firestore implementation wait for the server with a timeout, and report an offline create as saved and waiting.
- **Done when:**
  - [ ] A rejected create returns a failure, tested in `ReservationRepositoryFirestoreTest`.
  - [ ] An offline create is not reported as a failure.
  - [ ] The KDoc is updated.
  - [ ] #249's failure and retry still work.

**[R7] Explorer cancels a reservation** (~250 lines, 5 files)
**Blocked by:** #257
- **Description:** Add a cancel action with a confirmation on `PENDING` and `APPROVED` rows of the overview, via `updateStatus(CANCELLED)`.
- **Done when:**
  - [ ] Cancel is available on pending and approved rows only.
  - [ ] A confirmation appears first.
  - [ ] The row leaves the list after a successful cancel.
  - [ ] A failed write shows an error.
  - [ ] ViewModel and Compose tests cover it.

### Goal 2: Fix noted issues

**[F1] Audit login and registration against Figma** (no code)
**Blocked by:** read access to the Figma file, so someone with access has to do this.
- **Description:**
  - Compare `AuthScreen` and `RegistrationFlow` with the frames and list every deviation as a checklist.
  - #242, #245 and #252 (text fields) already cover some of it, so list the rest and group it into follow-up issues of about 600 lines and 10 files.
- **Done when:**
  - [ ] The checklist exists, with a screenshot pair for the larger deviations.
  - [ ] Every follow-up issue is open, with its blocker.

**[F3] Decide the remaining schema changes** (docs only, 1 file)
**Blocked by:** nothing
- **Description:** Settle the schema doc's other "Deferred" items: stop copying `venueName` and `location` into `quests`, drop the copied ids from `completions`, split proof into photo and text fields.
- **Done when:**
  - [ ] Each is marked adopted or rejected, with one line of reasoning.
  - [ ] Each adopted item has a follow-up issue.

**[F4a] Map and nearby quests read the venue instead of the copy** (~450 lines, 8 files)
**Blocked by:** F3 (only if adopted)
- **Description:** Use `VenueRepository.observeVenues(ids)` for the map pins and nearby cards. Quest creation still writes the copies.
- **Done when:**
  - [ ] The map, `NearbyQuests` and the overlay show the same data as before.
  - [ ] A venue rename shows up on the map.
  - [ ] ViewModel tests cover it.

**[F4b] Stop storing the copies** (~350 lines, 8 files)
**Blocked by:** F4a
- **Description:** Remove `venueName` and `location` from the model, both repositories, the rules, the rules test and the doc. Old documents must still load.
- **Done when:**
  - [ ] Old documents load.
  - [ ] New quests are written without the fields.
  - [ ] The emulator tests pass.
  - [ ] The PR is flagged for a rules redeploy (S1).

**[F5] Completion model: separate proof fields, drop copied ids** (~200 lines, 3 files)
**Blocked by:** F3 (only if adopted)
- **Description:** Change `Completion` only. There is no completions repository yet.
- **Done when:**
  - [ ] The model has separate photo and text proof fields.
  - [ ] Its validation and tests are updated.
  - [ ] The schema doc matches.

### Goal 3: Stabilize

**[S1] Verify rules v2 are live, and redeploy after each rules change** (no code)
**Blocked by:** someone with Owner or Editor on the `around-67942` Firebase project
- **Description:** Compare the live rules in the Firebase console with `main` and deploy if they differ. Redeploy after R2, S2, P2c and F4b.
- **Done when:**
  - [ ] The live rules match `main`.
  - [ ] The deploy date is posted in the team channel.

**[S2] Tighten reservation rules** (~200 lines, 3 files)
**Blocked by:** nothing. Merge with R2 and P2c in turn.
- **Description:** Require `explorerUids` to be 1 to N unique strings. Require `slotStart` not to be in the past at creation, with a few minutes of tolerance since it's "now" under DEC-2.
- **Done when:**
  - [ ] `FirestoreRulesTest` has an accepted and a rejected case per check.
  - [ ] The doc is updated.
  - [ ] The PR is flagged for a rules redeploy (S1).

**[S3] Check what works offline** (docs only, 1 file)
**Blocked by:** nothing
- **Description:** Walk through the app in airplane mode (map, venue page, profile, quest creation) and write what works. No fixes here. #215 is related.
- **Done when:**
  - [ ] The findings are written down.
  - [ ] Each gap has its own follow-up issue.

**[S4a] Shared fakes source set, with the auth and user fakes** (~150 lines, ~8 files). Optional.
**Blocked by:** nothing
- **Description:** The fakes live in `src/main`, so they ship in the release app. Create a shared source set and move `FakeAuthRepository` and `FakeUserRepository`, keeping their packages.
- **Done when:**
  - [ ] Release builds contain neither fake.
  - [ ] All tests pass.

**[S4b] Move the quest, venue and reservation fakes** (~150 lines, ~6 files). Optional.
**Blocked by:** S4a
- **Description:** Move `FakeQuestRepository`, `FakeVenueRepository` and `FakeReservationRepository`, and fix the `CreateQuestScreen` preview.
- **Done when:**
  - [ ] Release builds contain no fake repositories.
  - [ ] The previews render.
  - [ ] All tests pass.

### Stretch: Parties

**[P1] Decide the party model** (docs only, 1 file)
**Blocked by:** nothing
- **Description:** Keep `explorerUids`, or add a party document plus a membership document per explorer. Also decide how companions are picked, since the app has no friends feature.
- **Done when:**
  - [ ] The decision is in the schema doc.
  - [ ] P2a to P3b are updated or closed.

**[P2a] Party model and fake repository** (~300 lines, 5 files)
**Blocked by:** P1
- **Description:** Add the model, interface and fake, with no Firebase imports.
- **Done when:**
  - [ ] The model validates itself.
  - [ ] The fake covers create, add member, withdraw and observe.
  - [ ] Unit tests cover each.

**[P2b] Party Firestore repository** (~350 lines, 4 files)
**Blocked by:** P2a
- **Description:** Implement the repository on Firestore.
- **Done when:**
  - [ ] It matches the fake.
  - [ ] An emulator test covers it.
  - [ ] `connectedDebugAndroidTest` passes.

**[P2c] Party rules and schema doc** (~300 lines, 3 files)
**Blocked by:** P2a. Merge with R2 and S2 in turn.
- **Description:** Update the rules and doc for the party documents.
- **Done when:**
  - [ ] `FirestoreRulesTest` has an accepted and a rejected case per rule.
  - [ ] The doc matches.
  - [ ] The PR is flagged for a rules redeploy (S1).

**[P3a] Add party members to a reservation** (~300 lines, 4 files)
**Blocked by:** #249, P2b, P2c
- **Description:** Let the explorer add companions (party quests can already be accepted, per DEC-3 in #248). Validate `minPartySize` against `exactPartySize` and reject duplicates.
- **Done when:**
  - [ ] Too-small and too-large parties are reported.
  - [ ] Duplicates are rejected.
  - [ ] Unit tests cover each.

**[P3b] Companion selection UI** (~400 lines, 7 files)
**Blocked by:** P3a, and the companion mechanism chosen in P1
- **Description:** Add the companion picker to #250's accept bar.
- **Done when:**
  - [ ] The explorer can add and remove companions before accepting.
  - [ ] The bar still shows how many more people are needed.
  - [ ] Compose tests cover it.

## 6. Priority and load

| Tier | What | PRs |
|---|---|---|
| Must | Goal 1 chain (#249, #250, #255, #256, #257, #247, #246 in 3 parts, #152, R2, R4, R7), F1 and its follow-ups, #242, #245, F3, S1, S2, #241 | ~22 |
| Should | #244, #243, #224, #215, #228, #172 (3), #251, #252 (3 to 4), S3, F4a, F4b, F5 | ~17 |
| Stretch / optional | P1 to P3b, S4a, S4b, #125 | ~9 |

- **Total:** about 48 PRs (#253, S1 and #26 need no PR), or about 7 per dev for 7 devs. The Must tier alone is about 3 each.
- **Long chains:** #249 → R2 → #246 → #152 is 4 deep (6 on the board, with #246 in three parts). The party chain is 5 deep.
- **Merge order:** R2, S2 and P2c all edit `firestore.rules`, so merge them one at a time.
- **Early wave:** these can start now: #249, #247, #255, R4, #241, #242, #245, F1, F3, S1, S2, P1.

## 7. Housekeeping

- Close #26 (all boxes ticked).
- Merge #172 and #251, or split their scope as above, so the v2 rule change isn't done twice.
- New tests from now on should use the v2 Compose rule, or #172 keeps growing.
- Update the task list in #73. It still lists done and old tasks.
- A completions repository and its rules are not in this sprint. The schema doc says "model only for now". If they are wanted, they need their own issues.

## 8. Sources

- The repo's open issues, listed with `gh api` (26 open issues).
- The new issues in §5 were drafted in the same review and don't exist on GitHub yet.

## 9. Board layout

Each row is one line on the board. Rows marked *stretch* are striped.

| Row | Title | Goal | Tasks |
|---|---|---|---|
| E5 | Accept a quest (epic #248) | Goal 1 | #249, R4, #250 |
| E6 | Explorer reservation overview (epic #254) | Goal 1 | #255, #256, #257, R7 |
| DASH | Venue dashboard: approve and reject (#246) | Goal 1 | #247, R2, #246a, #246b, #246c |
| E2E | End-to-end tests | Goal 1 / 3 | #241, #152 |
| V1 | Venue account (epic #6) | Goal 2 | #242, #245 |
| FIGMA | Match the Figma screens | Goal 2 | F1, #26 |
| SCHEMA | Schema clean-up | Goal 2 | F3, F4a, F4b, F5 |
| RULES | Firestore rules and offline | Goal 3 | S1, S2, S3 |
| CI | CI and the v2 Compose test rules | Goal 3 | #125, #172a, #172b, #172c |
| HEALTH | Code health | Goal 3 | #251, #228, #252a, #252b, #252c, #252d |
| FAKES | Fakes out of the release app *(stretch)* | Goal 3 | S4a, S4b |
| V4 | Create a quest (epic #73) | Other | #215, #224, #244 |
| E4 | Venue page and quest details (#128) | Other | #243 |
| RESEARCH | User research | Other | #253 |
| PARTY | Parties *(stretch)* | Stretch | P1, P2a, P2b, P2c, P3a, P3b |

## 10. Blocking edges

Kinds as in the Sprint 2 report: `hard` needs the blocker's code, `soft` can be built against a fake and only the finish waits, `file` shares a file and goes after it, `decision` waits on a decision task.

| From | To | Kind | Blocks | Why |
|---|---|---|---|---|
| #249 | #250 | hard | start | the bar calls #249's provider and accept() |
| R4 | #250 | soft | finish | a rejected reservation write must be reported before the bar ships |
| #249 | #256 | soft | finish | shares the reservation flow and the explorer uid |
| #256 | #257 | hard | start | the screen renders the overview ViewModel |
| #255 | #257 | soft | finish | overview icons; the screen can use placeholders until they land |
| #257 | R7 | hard | start | cancel goes on the overview's pending and approved rows |
| #249 | R2 | hard | start | accept() fills the reserver's name |
| R4 | R2 | file | start | both change ReservationRepositoryFirestore and its test |
| S2 | R2 | file | start | both edit firestore.rules and FirestoreRulesTest; merge one at a time |
| #249 | #246a | hard | start | uses the reservation provider #249 adds (only one of them adds it) |
| R2 | #246a | hard | start | the dashboard shows who reserved |
| #246a | #246b | hard | start | the screen and rows render the dashboard ViewModel |
| #247 | #246b | soft | finish | dashboard icons |
| #246b | #246c | hard | start | approve and reject go on the dashboard rows |
| #249 | #152 | hard | start | the journey starts with accept() |
| #250 | #152 | hard | start | the explorer accepts through the bar |
| #246c | #152 | hard | start | the journey ends with the venue approving |
| F3 | F4a | decision | start | only if F3 adopts reading the venue instead of the copy |
| F4a | F4b | hard | start | nothing may read the copies once they stop being written |
| R2 | F4b | file | start | both edit firestore.rules and FirestoreRulesTest; merge one at a time |
| F3 | F5 | decision | start | only if F3 adopts the completion changes |
| S4a | S4b | hard | start | needs the shared fakes source set |
| P1 | P2a | decision | start | the model follows P1's decision |
| P2a | P2b | hard | start | implements P2a's interface |
| P2a | P2c | hard | start | rules for P2a's documents |
| R2 | P2c | file | start | both edit firestore.rules and FirestoreRulesTest; merge one at a time |
| #249 | P3a | hard | start | adds members to #249's reservation |
| P2b | P3a | hard | start | stores the party |
| P2c | P3a | hard | start | the party writes must be allowed |
| P3a | P3b | hard | start | the picker calls P3a |
| P1 | P3b | decision | start | how companions are picked (the app has no friends feature) |
| #250 | P3b | hard | start | the picker goes on #250's accept bar |

## 11. Machine-readable data

`tools/add_sprint.py` reads this block. Edit it (or this report's tables and the script that built them) and rerun `python3 tools/add_sprint.py data/sprint-3-blocking-report.md --id sprint-3 --name "Sprint 3"`.

```json
{
"tasks": [
{"id": "E5", "kind": "story", "title": "Accept a quest (epic #248)", "prio": "must", "children": ["#249", "R4", "#250"]},
{"id": "E6", "kind": "story", "title": "Explorer reservation overview (epic #254)", "prio": "must", "children": ["#255", "#256", "#257", "R7"]},
{"id": "DASH", "kind": "story", "title": "Venue dashboard: approve and reject (#246)", "prio": "must", "children": ["#247", "R2", "#246a", "#246b", "#246c"]},
{"id": "E2E", "kind": "story", "title": "End-to-end tests", "prio": "must", "children": ["#241", "#152"]},
{"id": "V1", "kind": "story", "title": "Venue account (epic #6)", "prio": "must", "children": ["#242", "#245"]},
{"id": "FIGMA", "kind": "story", "title": "Match the Figma screens", "prio": "must", "children": ["F1", "#26"]},
{"id": "SCHEMA", "kind": "story", "title": "Schema clean-up", "prio": "should", "children": ["F3", "F4a", "F4b", "F5"]},
{"id": "RULES", "kind": "story", "title": "Firestore rules and offline", "prio": "must", "children": ["S1", "S2", "S3"]},
{"id": "CI", "kind": "story", "title": "CI and the v2 Compose test rules", "prio": "should", "children": ["#125", "#172a", "#172b", "#172c"]},
{"id": "HEALTH", "kind": "story", "title": "Code health", "prio": "should", "children": ["#251", "#228", "#252a", "#252b", "#252c", "#252d"]},
{"id": "FAKES", "kind": "story", "title": "Fakes out of the release app", "prio": "stretch", "children": ["S4a", "S4b"]},
{"id": "V4", "kind": "story", "title": "Create a quest (epic #73)", "prio": "should", "children": ["#215", "#224", "#244"]},
{"id": "E4", "kind": "story", "title": "Venue page and quest details (#128)", "prio": "should", "children": ["#243"]},
{"id": "RESEARCH", "kind": "story", "title": "User research", "prio": "should", "children": ["#253"]},
{"id": "PARTY", "kind": "story", "title": "Parties", "prio": "stretch", "children": ["P1", "P2a", "P2b", "P2c", "P3a", "P3b"]},
{"id": "#249", "kind": "task", "title": "Reservation provider and accept()", "parent": "E5", "prio": "must", "alias": "E5.1", "github": "#249 (part of #248)"},
{"id": "R4", "kind": "task", "title": "Report a rejected reservation write", "parent": "E5", "prio": "must", "size": "~250 lines, 4 files", "github": "new issue, not created yet", "files": ["ReservationRepositoryFirestore.createReservation (wait for the server, with a timeout)", "ReservationRepository KDoc", "ReservationRepositoryFirestoreTest"]},
{"id": "#250", "kind": "task", "title": "Accept-quest bar", "parent": "E5", "prio": "must", "alias": "E5.2", "github": "#250 (part of #248)"},
{"id": "#255", "kind": "task", "title": "Overview icons", "parent": "E6", "prio": "must", "alias": "A3", "github": "#255 (part of #254)"},
{"id": "#256", "kind": "task", "title": "Overview ViewModel", "parent": "E6", "prio": "must", "alias": "E6.1", "github": "#256 (part of #254)"},
{"id": "#257", "kind": "task", "title": "Overview screen", "parent": "E6", "prio": "must", "alias": "E6.2", "github": "#257 (part of #254)"},
{"id": "R7", "kind": "task", "title": "Explorer cancels a reservation", "parent": "E6", "prio": "must", "size": "~250 lines, 5 files", "github": "new issue, not created yet", "files": ["overview ViewModel and screen (from #256, #257)", "updateStatus(CANCELLED)", "ViewModel and Compose tests"]},
{"id": "#247", "kind": "task", "title": "Dashboard icons", "parent": "DASH", "prio": "must", "github": "#247"},
{"id": "R2", "kind": "task", "title": "Let the venue see who reserved", "parent": "DASH", "prio": "must", "size": "~200 lines, ~8 files", "github": "new issue, not created yet", "files": ["Reservation (explorer display name, copied at creation)", "FakeReservationRepository", "ReservationRepositoryFirestore", "firestore.rules", "FirestoreRulesTest", "reservation repository test", "schema doc"]},
{"id": "#246a", "kind": "task", "title": "Venue dashboard ViewModel", "parent": "DASH", "prio": "must", "github": "#246 (part 1 of 3, split)"},
{"id": "#246b", "kind": "task", "title": "Venue dashboard screen and rows", "parent": "DASH", "prio": "must", "github": "#246 (part 2 of 3, split)"},
{"id": "#246c", "kind": "task", "title": "Approve and reject actions", "parent": "DASH", "prio": "must", "github": "#246 (part 3 of 3, split)"},
{"id": "#241", "kind": "task", "title": "E2E sign-up times out on a cold emulator", "parent": "E2E", "prio": "must", "github": "#241"},
{"id": "#152", "kind": "task", "title": "End-to-end accept journey", "parent": "E2E", "prio": "must", "alias": "T3", "github": "#152"},
{"id": "#242", "kind": "task", "title": "Auth and venue setup backgrounds match Figma", "parent": "V1", "prio": "must", "github": "#242 (part of #6)"},
{"id": "#245", "kind": "task", "title": "Venue link submits the explorer form (login screen fix)", "parent": "V1", "prio": "must", "github": "#245 (part of #6)"},
{"id": "F1", "kind": "task", "title": "Audit login and registration against Figma", "parent": "FIGMA", "prio": "must", "size": "no code", "github": "new issue, not created yet", "files": ["AuthScreen and RegistrationFlow (read only, compared with the Figma frames)"]},
{"id": "#26", "kind": "task", "title": "Figma role selection: every box is ticked, close it", "parent": "FIGMA", "prio": "must", "alias": "G3", "size": "no code", "github": "#26"},
{"id": "F3", "kind": "task", "title": "Decide the remaining schema changes", "parent": "SCHEMA", "prio": "must", "size": "docs only, 1 file", "github": "new issue, not created yet", "files": ["schema doc"]},
{"id": "F4a", "kind": "task", "title": "Map and nearby quests read the venue instead of the copy", "parent": "SCHEMA", "prio": "should", "size": "~450 lines, 8 files", "github": "new issue, not created yet", "files": ["VenueRepository.observeVenues(ids)", "map pins", "NearbyQuests", "map overlay", "ViewModel tests"]},
{"id": "F4b", "kind": "task", "title": "Stop storing the venue name and location on quests", "parent": "SCHEMA", "prio": "should", "size": "~350 lines, 8 files", "github": "new issue, not created yet", "files": ["Quest model", "FakeQuestRepository", "QuestRepositoryFirestore", "firestore.rules", "FirestoreRulesTest", "schema doc"]},
{"id": "F5", "kind": "task", "title": "Completion model: separate proof fields, drop copied ids", "parent": "SCHEMA", "prio": "should", "size": "~200 lines, 3 files", "github": "new issue, not created yet", "files": ["Completion model and its validation", "Completion tests", "schema doc"]},
{"id": "S1", "kind": "task", "title": "Verify rules v2 are live, and redeploy after each rules change", "parent": "RULES", "prio": "must", "size": "no code", "github": "new issue, not created yet", "files": ["Firebase console of around-67942 (needs Owner or Editor)"]},
{"id": "S2", "kind": "task", "title": "Tighten reservation rules", "parent": "RULES", "prio": "must", "size": "~200 lines, 3 files", "github": "new issue, not created yet", "files": ["firestore.rules (explorerUids 1 to N unique strings, slotStart not in the past)", "FirestoreRulesTest", "schema doc"]},
{"id": "S3", "kind": "task", "title": "Check what works offline", "parent": "RULES", "prio": "should", "size": "docs only, 1 file", "github": "new issue, not created yet", "files": ["offline findings doc"]},
{"id": "#125", "kind": "task", "title": "Measure CI emulator cost", "parent": "CI", "prio": "stretch", "github": "#125 (optional)"},
{"id": "#172a", "kind": "task", "title": "v2 Compose rules: Robolectric tests, first half", "parent": "CI", "prio": "should", "size": "~7 files", "github": "#172 (part 1 of 3, split)"},
{"id": "#172b", "kind": "task", "title": "v2 Compose rules: Robolectric tests, second half", "parent": "CI", "prio": "should", "size": "~7 files", "github": "#172 (part 2 of 3, split)"},
{"id": "#172c", "kind": "task", "title": "v2 Compose rules: device tests", "parent": "CI", "prio": "should", "size": "~8 files", "github": "#172 (part 3 of 3, split)"},
{"id": "#251", "kind": "task", "title": "Replace deprecated APIs (not the test rules, that's #172)", "parent": "HEALTH", "prio": "should", "github": "#251 (narrowed)"},
{"id": "#228", "kind": "task", "title": "Venue entry review follow-up", "parent": "HEALTH", "prio": "should", "github": "#228"},
{"id": "#252a", "kind": "task", "title": "Theme colours: venue setup", "parent": "HEALTH", "prio": "should", "github": "#252 (split by area)"},
{"id": "#252b", "kind": "task", "title": "Theme colours: address bar", "parent": "HEALTH", "prio": "should", "github": "#252 (split by area)"},
{"id": "#252c", "kind": "task", "title": "Theme colours: map shadows", "parent": "HEALTH", "prio": "should", "github": "#252 (split by area)"},
{"id": "#252d", "kind": "task", "title": "Theme colours: text fields", "parent": "HEALTH", "prio": "should", "github": "#252 (split by area)"},
{"id": "S4a", "kind": "task", "title": "Shared fakes source set, with the auth and user fakes", "parent": "FAKES", "prio": "stretch", "size": "~150 lines, ~8 files", "github": "new issue, not created yet", "files": ["new shared fakes source set (Gradle)", "FakeAuthRepository", "FakeUserRepository"]},
{"id": "S4b", "kind": "task", "title": "Move the quest, venue and reservation fakes", "parent": "FAKES", "prio": "stretch", "size": "~150 lines, ~6 files", "github": "new issue, not created yet", "files": ["FakeQuestRepository", "FakeVenueRepository", "FakeReservationRepository", "CreateQuestScreen preview"]},
{"id": "#215", "kind": "task", "title": "Explain a venue that can't load", "parent": "V4", "prio": "should", "alias": "V4.5.3", "github": "#215 (part of #73)"},
{"id": "#224", "kind": "task", "title": "Keep the form open while saving", "parent": "V4", "prio": "should", "alias": "V4.5.4", "github": "#224 (part of #73)"},
{"id": "#244", "kind": "task", "title": "List the venue's quests", "parent": "V4", "prio": "should", "alias": "V4.7", "github": "#244 (part of #73)"},
{"id": "#243", "kind": "task", "title": "More quest details", "parent": "E4", "prio": "should", "github": "#243 (part of #128)"},
{"id": "#253", "kind": "task", "title": "Contact venues and explorers", "parent": "RESEARCH", "prio": "should", "size": "no PR", "github": "#253"},
{"id": "P1", "kind": "task", "title": "Decide the party model", "parent": "PARTY", "prio": "stretch", "size": "docs only, 1 file", "github": "new issue, not created yet", "files": ["schema doc"]},
{"id": "P2a", "kind": "task", "title": "Party model and fake repository", "parent": "PARTY", "prio": "stretch", "size": "~300 lines, 5 files", "github": "new issue, not created yet", "files": ["party model", "party repository interface", "fake party repository", "unit tests"]},
{"id": "P2b", "kind": "task", "title": "Party Firestore repository", "parent": "PARTY", "prio": "stretch", "size": "~350 lines, 4 files", "github": "new issue, not created yet", "files": ["party Firestore repository", "emulator test"]},
{"id": "P2c", "kind": "task", "title": "Party rules and schema doc", "parent": "PARTY", "prio": "stretch", "size": "~300 lines, 3 files", "github": "new issue, not created yet", "files": ["firestore.rules", "FirestoreRulesTest", "schema doc"]},
{"id": "P3a", "kind": "task", "title": "Add party members to a reservation", "parent": "PARTY", "prio": "stretch", "size": "~300 lines, 4 files", "github": "new issue, not created yet", "files": ["reservation party members (minPartySize, exactPartySize, no duplicates)", "unit tests"]},
{"id": "P3b", "kind": "task", "title": "Companion selection UI", "parent": "PARTY", "prio": "stretch", "size": "~400 lines, 7 files", "github": "new issue, not created yet", "files": ["#250's accept bar", "companion picker", "Compose tests"]}
],
"edges": [
{"from": "#249", "to": "#250", "kind": "hard", "blocks": "start", "reason": "the bar calls #249's provider and accept()"},
{"from": "R4", "to": "#250", "kind": "soft", "blocks": "finish", "reason": "a rejected reservation write must be reported before the bar ships"},
{"from": "#249", "to": "#256", "kind": "soft", "blocks": "finish", "reason": "shares the reservation flow and the explorer uid"},
{"from": "#256", "to": "#257", "kind": "hard", "blocks": "start", "reason": "the screen renders the overview ViewModel"},
{"from": "#255", "to": "#257", "kind": "soft", "blocks": "finish", "reason": "overview icons; the screen can use placeholders until they land"},
{"from": "#257", "to": "R7", "kind": "hard", "blocks": "start", "reason": "cancel goes on the overview's pending and approved rows"},
{"from": "#249", "to": "R2", "kind": "hard", "blocks": "start", "reason": "accept() fills the reserver's name"},
{"from": "R4", "to": "R2", "kind": "file", "blocks": "start", "reason": "both change ReservationRepositoryFirestore and its test"},
{"from": "S2", "to": "R2", "kind": "file", "blocks": "start", "reason": "both edit firestore.rules and FirestoreRulesTest; merge one at a time"},
{"from": "#249", "to": "#246a", "kind": "hard", "blocks": "start", "reason": "uses the reservation provider #249 adds (only one of them adds it)"},
{"from": "R2", "to": "#246a", "kind": "hard", "blocks": "start", "reason": "the dashboard shows who reserved"},
{"from": "#246a", "to": "#246b", "kind": "hard", "blocks": "start", "reason": "the screen and rows render the dashboard ViewModel"},
{"from": "#247", "to": "#246b", "kind": "soft", "blocks": "finish", "reason": "dashboard icons"},
{"from": "#246b", "to": "#246c", "kind": "hard", "blocks": "start", "reason": "approve and reject go on the dashboard rows"},
{"from": "#249", "to": "#152", "kind": "hard", "blocks": "start", "reason": "the journey starts with accept()"},
{"from": "#250", "to": "#152", "kind": "hard", "blocks": "start", "reason": "the explorer accepts through the bar"},
{"from": "#246c", "to": "#152", "kind": "hard", "blocks": "start", "reason": "the journey ends with the venue approving"},
{"from": "F3", "to": "F4a", "kind": "decision", "blocks": "start", "reason": "only if F3 adopts reading the venue instead of the copy"},
{"from": "F4a", "to": "F4b", "kind": "hard", "blocks": "start", "reason": "nothing may read the copies once they stop being written"},
{"from": "R2", "to": "F4b", "kind": "file", "blocks": "start", "reason": "both edit firestore.rules and FirestoreRulesTest; merge one at a time"},
{"from": "F3", "to": "F5", "kind": "decision", "blocks": "start", "reason": "only if F3 adopts the completion changes"},
{"from": "S4a", "to": "S4b", "kind": "hard", "blocks": "start", "reason": "needs the shared fakes source set"},
{"from": "P1", "to": "P2a", "kind": "decision", "blocks": "start", "reason": "the model follows P1's decision"},
{"from": "P2a", "to": "P2b", "kind": "hard", "blocks": "start", "reason": "implements P2a's interface"},
{"from": "P2a", "to": "P2c", "kind": "hard", "blocks": "start", "reason": "rules for P2a's documents"},
{"from": "R2", "to": "P2c", "kind": "file", "blocks": "start", "reason": "both edit firestore.rules and FirestoreRulesTest; merge one at a time"},
{"from": "#249", "to": "P3a", "kind": "hard", "blocks": "start", "reason": "adds members to #249's reservation"},
{"from": "P2b", "to": "P3a", "kind": "hard", "blocks": "start", "reason": "stores the party"},
{"from": "P2c", "to": "P3a", "kind": "hard", "blocks": "start", "reason": "the party writes must be allowed"},
{"from": "P3a", "to": "P3b", "kind": "hard", "blocks": "start", "reason": "the picker calls P3a"},
{"from": "P1", "to": "P3b", "kind": "decision", "blocks": "start", "reason": "how companions are picked (the app has no friends feature)"},
{"from": "#250", "to": "P3b", "kind": "hard", "blocks": "start", "reason": "the picker goes on #250's accept bar"}
]
}
```
