#!/usr/bin/env python3
"""Add a sprint to the board (or update one) from a blocking report or a plan.

Usage:
  python3 tools/add_sprint.py <report.md | plan.json> --id sprint-3 --name "Sprint 3"

It writes sprints/<id>.json and adds or updates the entry in sprints/index.json.
Running it again for the same --id replaces that sprint's data; progress in
Firestore is keyed by sprint ID and task ID, so it is kept.

Two input shapes are understood.

1. Blocking report (Sprints 2-5). Markdown (the last ```json block that has
   "tasks" and "edges" is used) or that JSON on its own:
     tasks: [{id, kind, title, parent?, children?, prio?, size?,
              windowStartDay?, windowEndDay?, github?, existingWork?, files?, alias?}]
     edges: [{from, to, kind, blocks?, reason?}]
   Every task with kind "story" becomes a row, in the order they appear, with
   its `children` as the columns. A task that is no story's child is placed next
   to its parent: before its parent task if the parent is a task (contracts go
   before the task they start), otherwise in a row named after the parent (e.g.
   "PROC"). Tasks without any parent go in "Other". Owners and reviewers are
   dropped on purpose: assignments happen on the board.

2. Assigned plan (Sprint 6 onwards), JSON with a "stories" list and a "tasks"
   list whose items have a `key`:
     stories: [{id, title, github?}]
     tasks:   [{key, title, type ("Must have" | "Should have" | "Stretch"),
                story?, subId?, estimateHours?, github?, assignee, reviewer,
                notes?, touchedFiles?,
                blockedBy: [{ref, type, reason}], blocks: [{ref, type, reason}]}]
   One row per story (its stretch tasks go in a separate "<story>+" row after
   the others, and tasks without a story in an "Other tasks" row). An edge is
   taken from either side's blockedBy / blocks and de-duplicated. A ref that is
   not a task of this sprint (e.g. "#401") is kept on the task as `external`
   and shown in the tooltip, but never blocks the box. Every task gets its
   assignee and reviewer: the assignee completes it, the reviewer approves it.

Only structural edges are kept (hard, file, soft, decision). The chronological
ones (owner-queue, not-before, stretch-gate) depend on owners or the schedule,
so the board ignores them.
"""
import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPRINTS = ROOT / "sprints"
KEPT_EDGE_KINDS = {"hard", "file", "soft", "decision"}
IGNORED_EDGE_KINDS = {"owner-queue", "not-before", "stretch-gate"}
ROW_TITLES = {"PROC": "Process (no user story)", "OTHER": "Other tasks"}
TYPE_PRIO = {"must have": "must", "should have": "should", "stretch": "stretch"}


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


def is_assigned_plan(plan: dict) -> bool:
    tasks = plan.get("tasks")
    return isinstance(tasks, list) and "stories" in plan and all("key" in t for t in tasks)


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


def convert_report(plan: dict):
    """Blocking report (Sprints 2-5) -> rows, tasks, edges."""
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
    return rows, out_tasks, edges


def parse_edge_type(raw: str):
    """'hard' -> ('hard', 'start'); 'decision · finish' -> ('decision', 'finish')."""
    kind, _, blocks = raw.partition("·")
    kind, blocks = kind.strip(), blocks.strip()
    return kind, blocks or ("finish" if kind == "soft" else "start")


def convert_assigned(plan: dict):
    """Assigned plan (Sprint 6 onwards) -> rows, tasks, edges."""
    stories = {s["id"]: s for s in plan["stories"]}
    tasks = {}
    for t in plan["tasks"]:
        key = t["key"]
        if "/" in key or key in (".", "..") or key in tasks:
            sys.exit(f"Task key {key!r} is duplicated or contains '/'")
        if t.get("story") and t["story"] not in stories:
            sys.exit(f"{key}: unknown story {t['story']!r}")
        if t["type"].lower() not in TYPE_PRIO:
            sys.exit(f"{key}: unknown type {t['type']!r} (use Must have, Should have or Stretch)")
        for role in ("assignee", "reviewer"):
            if not t.get(role):
                sys.exit(f"{key}: missing {role}")
        if t["assignee"] == t["reviewer"]:
            print(f"warning: {key} has the same assignee and reviewer ({t['assignee']})", file=sys.stderr)
        tasks[key] = t

    # Rows: one per story, then tasks without a story, then one stretch row per story.
    def story_title(sid):
        s = stories[sid]
        return f"{s['title']} (story #{s['github']})" if s.get("github") else s["title"]

    rows, stretch_rows = [], []
    for sid in stories:
        keep = [k for k, t in tasks.items() if t.get("story") == sid and TYPE_PRIO[t["type"].lower()] != "stretch"]
        late = [k for k, t in tasks.items() if t.get("story") == sid and TYPE_PRIO[t["type"].lower()] == "stretch"]
        if keep:
            rows.append({"id": sid, "title": story_title(sid), "prio": "must", "children": keep})
        if late:
            stretch_rows.append({"id": f"{sid}+", "title": f"{stories[sid]['title']}: stretch", "prio": "stretch", "children": late})
    loose = [k for k, t in tasks.items() if not t.get("story")]
    if loose:
        rows.append({"id": "OTHER", "title": "Other tasks (no story)", "prio": "must", "children": loose})
    rows += stretch_rows

    # Edges: from either side, de-duplicated by (from, to, kind, blocks).
    edges, seen, external = [], {}, {}
    for key, t in tasks.items():
        for side, items in (("blockedBy", t.get("blockedBy", [])), ("blocks", t.get("blocks", []))):
            for item in items:
                kind, blocks = parse_edge_type(item["type"])
                other = item["ref"]
                if other not in tasks:
                    if side == "blockedBy":
                        external.setdefault(key, []).append(
                            {"ref": other, "kind": kind, "blocks": blocks, "reason": item.get("reason", "")})
                    else:
                        print(f"warning: {key} blocks {other}, which is not a task of this sprint", file=sys.stderr)
                    continue
                if kind not in KEPT_EDGE_KINDS:
                    print(f"warning: ignored edge kind {kind!r} on {key}", file=sys.stderr)
                    continue
                frm, to = (other, key) if side == "blockedBy" else (key, other)
                sig = (frm, to, kind, blocks)
                if sig in seen:
                    seen[sig]["sides"].add(side if side == "blockedBy" else "blocks")
                    continue
                edge = {"from": frm, "to": to, "kind": kind, "blocks": blocks, "reason": item.get("reason", "")}
                seen[sig] = {"edge": edge, "sides": {side}}
                edges.append(edge)
    for sig, info in seen.items():
        if len(info["sides"]) == 1:
            frm, to, kind, _ = sig
            print(f"note: {kind} edge {frm} -> {to} is only listed on the "
                  f"{'blocked' if 'blockedBy' in info['sides'] else 'blocking'} side", file=sys.stderr)

    out_tasks = {}
    for row in rows:
        for key in row["children"]:
            t = tasks[key]
            gh = t.get("github")
            story = stories.get(t.get("story"))
            if gh and story and story.get("github"):
                github = f"#{gh} (part of #{story['github']})"
            else:
                github = f"#{gh}" if gh else None
            hours = t.get("estimateHours")
            out = {
                "title": t["title"],
                "kind": "task",
                "alias": t.get("subId"),
                "prio": TYPE_PRIO[t["type"].lower()],
                "size": f"est. {hours:g} h" if hours else None,
                "window": [None, None],
                "github": github,
                "existing": None,
                "files": t.get("touchedFiles", []),
                "assignee": t["assignee"],
                "reviewer": t["reviewer"],
            }
            if t.get("notes"):
                out["notes"] = t["notes"]
            if key in external:
                out["external"] = external[key]
            out_tasks[key] = out

    load = Counter(t["assignee"] for t in out_tasks.values())
    reviews = Counter(t["reviewer"] for t in out_tasks.values())
    people = sorted(set(load) | set(reviews))
    print("  " + "\n  ".join(f"{p}: {load[p]} to do, {reviews[p]} to review" for p in people))
    return rows, out_tasks, edges


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source", type=Path, help="report .md or plan .json")
    ap.add_argument("--id", required=True, help="URL-safe sprint ID, e.g. sprint-3")
    ap.add_argument("--name", required=True, help='name shown in the dropdown, e.g. "Sprint 3"')
    args = ap.parse_args()

    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,40}", args.id):
        sys.exit("--id must be lowercase letters, digits and dashes (it is used in URLs and Firestore paths)")

    plan = load_plan(args.source)
    rows, out_tasks, edges = (convert_assigned if is_assigned_plan(plan) else convert_report)(plan)

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
