# CLAUDE.md — Agent Instructions

You are building a mobile-first mental health support platform.

## Read These First — In Order
0. `graphify-out/GRAPH_REPORT.md` — full project knowledge graph: all files, routes, schema, endpoints, queues, cache keys, and phase status. Read this before any other file for fast context recovery.
1. `blueprint/blueprint_v1.0.md` — full specification, all modules, all schema, all APIs
2. `CHECKLIST.md` — ordered build tasks, mark items as you complete them
3. `PROGRESS.md` — current status, what is done, what is active, blockers

## Rules
- Follow the blueprint exactly. Do not invent, assume, or stub anything.
- Complete one checklist item fully before moving to the next.
- After completing any item: update CHECKLIST.md and PROGRESS.md immediately.
- If you encounter a conflict or ambiguity in the blueprint, stop and flag it — do not guess.
- Never skip the safety-related items in any module.
- Build order is defined in blueprint Section 16 — do not deviate from it.