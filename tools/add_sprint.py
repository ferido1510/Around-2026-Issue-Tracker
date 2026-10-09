#!/usr/bin/env python3
"""Add a sprint to the board (or update one) from a blocking report.

Usage:
  python3 tools/add_sprint.py <report.md | plan.json> --id sprint-3 --name "Sprint 3"

The input is either the report Markdown (the last ```json block that has
"tasks" and "edges" is used) or that JSON on its own. It writes
sprints/<id>.json and adds or updates the entry in sprints/index.json.
Running it again for the same --id replaces that sprint's data; progress in
Firestore is keyed by sprint ID and task ID, so it is kept.

Expected JSON shape (the same as the Sprint 2 report, section 11):
  tasks: [{id, kind, title, parent?, children?, prio?, size?,
           windowStartDay?, windowEndDay?, github?, existingWork?, files?, alias?}]
  edges: [{from, to, kind, blocks?, reason?}]

Rows on the board: every task with kind "story" becomes a row, in the order
they appear, with its `children` as the columns. A task that is no story's
child is placed next to its parent: before its parent task if the parent is
a task (contracts go before the task they start), otherwise in a row named
after the parent (e.g. "PROC"). Tasks without any parent go in "Other".

Owners and reviewers are dropped on purpose: assignments happen on the board.
Only structural edges are kept (hard, file, soft, decision). The chronological
ones (owner-queue, not-before, stretch-gate) depend on owners or the schedule,
so the board ignores them.
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPRINTS = ROOT / "sprints"
KEPT_EDGE_KINDS = {"hard", "file", "soft", "decision"}
IGNORED_EDGE_KINDS = {"owner-queue", "not-before", "stretch-gate"}
ROW_TITLES = {"PROC": "Process (no user story)", "OTHER": "Other tasks"}


def load_plan(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    if path.suffix == ".json":
        return json.loads(text)
    for block in reversed(re.findall(r"```json\n(.*?)\n```", text, re.S)):
        try:
            plan = json.loads(block)
        except json.JSONDecodeError:
            continue
        if "tasks" in plan and "edges" in plan:
            return plan
    sys.exit(f"{path}: no ```json block with \"tasks\" and \"edges\" found")


def build_rows(tasks: dict) -> list:
    stories = [t for t in tasks.values() if t["kind"] == "story"]
    rows = [{"id": s["id"], "title": s["title"], "prio": s.get("prio", "must"),
             "children": [c for c in s.get("children", []) if c in tasks]} for s in stories]
    placed = {c for r in rows for c in r["children"]}
    pending = [tid for tid, t in tasks.items() if t["kind"] != "story" and tid not in placed]

    # Place tasks whose parent is a task already on the board, repeating so
    # chains (a contract of a contract) settle too.
    progress = True
    while pending and progress:
        progress = False
        for tid in list(pending):
            parent = tasks[tid].get("parent")
            for r in rows:
                if parent in r["children"]:
                    r["children"].insert(r["children"].index(parent), tid)
                    pending.remove(tid)
                    progress = True
                    break

    # The rest go in a row per (non-task) parent, after the stories.
    extra = {}
    for tid in pending:
        parent = tasks[tid].get("parent") or "OTHER"
        if parent in tasks and tasks[parent]["kind"] != "story":
            parent = "OTHER"   # parent task is itself unplaced; don't loop forever
        extra.setdefault(parent, []).append(tid)
    for key, children in extra.items():
        rows.append({"id": key, "title": tasks[key]["title"] if key in tasks else ROW_TITLES.get(key, key),
                     "prio": "must", "children": children})
    return [r for r in rows if r["children"]]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source", type=Path, help="report .md or plan .json")
    ap.add_argument("--id", required=True, help="URL-safe sprint ID, e.g. sprint-3")
    ap.add_argument("--name", required=True, help='name shown in the dropdown, e.g. "Sprint 3"')
    args = ap.parse_args()

    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,40}", args.id):
        sys.exit("--id must be lowercase letters, digits and dashes (it is used in URLs and Firestore paths)")

    plan = load_plan(args.source)
    tasks = {t["id"]: t for t in plan["tasks"]}
    bad_ids = [tid for tid in tasks if "/" in tid or tid in (".", "..")]
    if bad_ids:
        sys.exit(f"Task IDs can't contain '/': {bad_ids}")

    rows = build_rows(tasks)
    placed = [c for r in rows for c in r["children"]]
    dupes = sorted({c for c in placed if placed.count(c) > 1})
    if dupes:
        sys.exit(f"Tasks listed under more than one story: {dupes}")

    out_tasks = {}
    for tid in placed:
        t = tasks[tid]
        out_tasks[tid] = {
            "title": t["title"],
            "kind": t["kind"],
            "alias": t.get("alias"),
            "prio": t.get("prio", "must"),
            "size": t.get("size"),
            "window": [t.get("windowStartDay"), t.get("windowEndDay")],
            "github": t.get("github"),
            "existing": t.get("existingWork"),
            "files": t.get("files", []),
        }

    edges, unknown = [], set()
    for e in plan["edges"]:
        if e["kind"] not in KEPT_EDGE_KINDS:
            if e["kind"] not in IGNORED_EDGE_KINDS:
                unknown.add(e["kind"])
            continue
        if e["from"] not in out_tasks or e["to"] not in out_tasks:
            sys.exit(f"Edge points at a task that isn't on the board: {e}")
        edges.append({"from": e["from"], "to": e["to"], "kind": e["kind"],
                      "blocks": e.get("blocks", "start"), "reason": e.get("reason", "")})
    if unknown:
        print(f"warning: ignored unknown edge kinds {sorted(unknown)}", file=sys.stderr)

    SPRINTS.mkdir(exist_ok=True)
    (SPRINTS / f"{args.id}.json").write_text(
        json.dumps({"rows": rows, "tasks": out_tasks, "edges": edges}, indent=1, ensure_ascii=False) + "\n",
        encoding="utf-8")

    index_path = SPRINTS / "index.json"
    index = json.loads(index_path.read_text(encoding="utf-8")) if index_path.exists() else {"title": "Around", "sprints": []}
    entry = {"id": args.id, "name": args.name}
    for i, s in enumerate(index["sprints"]):
        if s["id"] == args.id:
            index["sprints"][i] = entry
            break
    else:
        index["sprints"].append(entry)
    index_path.write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"{args.name} ({args.id}): {len(rows)} rows, {len(out_tasks)} tasks, {len(edges)} edges "
          f"-> sprints/{args.id}.json, {len(index['sprints'])} sprint(s) in sprints/index.json")


if __name__ == "__main__":
    main()
