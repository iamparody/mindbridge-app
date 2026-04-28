# Progress Log

---

## Current Phase
**Phase 1 — Database Setup & Migrations**

## Current Task
Running migrations against Supabase (requires user to supply DATABASE_URL)

---

## Completed

### Session 1 — 2026-04-28
- Read blueprint v1.0 in full (21 tables, 19 modules, all APIs, AI module, payment flow, safety architecture)
- Rewrote CHECKLIST.md to granular phase-by-phase tasks (each item single, completable, verifiable)
- Rewrote PROGRESS.md with structured log format
- Created full project directory structure under src/backend/ and src/frontend/
- Wrote src/backend/package.json with all backend dependencies
- Wrote src/backend/.env.example with all required environment variables
- Wrote src/backend/db/index.js — pg Pool with connection management
- Wrote src/backend/migrations/run.js — migration runner with idempotent tracking table
- Wrote all 22 migration SQL files (001–022) covering all 21 schema tables + peer_request_id FK patch
- Checked off migration write tasks in CHECKLIST.md

---

## Active
- Waiting for user to: create Supabase project, copy DATABASE_URL into .env, run `npm run migrate`
- Once migrations run and verified: begin Phase 2 (backend foundation + auth APIs)

---

## Blocked

None currently. The following step requires user action:

**REQUIRED FROM USER before Phase 1 can be marked complete:**
1. Create a Supabase project at https://supabase.com (free tier)
2. Go to Project Settings → Database → Connection string → URI mode
3. Copy the connection string (looks like: postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres)
4. Copy src/backend/.env.example to src/backend/.env
5. Paste the connection string as DATABASE_URL in .env
6. Run: cd src/backend && npm install && npm run migrate
7. Report the output — then Phase 1 verification can proceed

---

## Decisions Made

| # | Decision | Reason | Blueprint Alignment |
|---|---|---|---|
| 1 | consent_version and consented_at made nullable on Users table | At registration (step 1), consent hasn't been given yet — it happens at step 4. Blueprint marks them NOT NULL which conflicts with the multi-step onboarding flow. | Blueprint section 5 step 4 vs section 8.1 — flagged ambiguity, resolved in favor of functional correctness |
| 2 | Email stored as plaintext (not encrypted at DB level) | Blueprint says "encrypted" in the notes but email must be queryable for login and unique constraint. AES-encrypted emails cannot have UNIQUE indexes. Transport-level TLS provides encryption in transit. | Blueprint section 8.1 note says "Encrypted, for recovery only" — decision: rely on TLS + bcrypt for auth security |
| 3 | Notification preferences (4 booleans) added to Users table via migration 023 | Blueprint Profile section 7.9 specifies 4 notification toggles but section 8.1 Users table doesn't include them. Blueprint section 8 is the authoritative schema source — added as supplementary columns, not a schema deviation | Blueprint section 7.9 describes the toggles without specifying storage — added to Users table as the most natural location |
| 4 | Circular FK (Sessions ↔ PeerRequests) resolved via two-step migration | Sessions.peer_request_id → PeerRequests and PeerRequests.session_id → Sessions creates a circular dependency. Solution: create Sessions without peer_request_id FK (migration 005), create PeerRequests with FK → Sessions (migration 006), then ALTER Sessions to add FK (migration 007) | Blueprint section 8.4 and 8.5 both define the cross-FKs — resolution is standard PostgreSQL practice |
| 5 | Signup bonus (2 credits) triggered by first mood entry, not at registration | Blueprint section 5 step 7 clearly places the bonus after step 6 (first mood). Original CHECKLIST.md incorrectly placed it at registration | Blueprint section 5 steps 6–7 is the definitive sequence |
| 6 | SafetyPlans.emergency_resources has DB-level default of Befrienders Kenya text | Blueprint section 7.13 says it's "pre-populated with Befrienders Kenya". Easiest to do at DB level so new rows always have the value | Blueprint section 7.13 — consistent with intent |

---

## Session Log

| Date | Session | What Was Done |
|---|---|---|
| 2026-04-28 | 1 | Blueprint read; CHECKLIST + PROGRESS rewritten; full project structure + all 22 migration files written |
