# Next Session — Pick Up Here

## Immediate fixes (small, do first)

### 1. Dashboard — tappable mood area
**File:** `src/frontend/src/screens/DashboardScreen.jsx`
**Problem:** After first daily entry, `moodDone = true` and the banner disappears. No tap target exists to reach `/mood` for a second entry. The MoodBlob has `pointerEvents: none`.
**Fix:** Wrap the blob + last-mood text section in a `<button onClick={() => navigate('/mood')}>` or add a small "+" tap target beneath the last-mood line. Make it subtle — not a call to action, just a quiet affordance.

### 2. Dashboard — timestamp format
**File:** `src/frontend/src/screens/DashboardScreen.jsx`
**Problem:** `timeAgo()` shows "3hrs ago" — correct but feels stale/relative after re-login.
**Fix:** Replace `timeAgo()` with a `formatMoodTime()` helper that shows `"Today · 3:45 PM"` (if same calendar day) or `"Mon · 3:45 PM"` (if earlier). Remove `timeAgo` function entirely from this file.

---

## App icon

**Decision:** Two arcs meeting at center (bridge span silhouette), warm amber `#E88B3F` → golden `#C8943A` gradient.
**Work:**
1. Create `src/frontend/public/icon.svg` — the SVG source
2. Generate PNG exports: `icon-192.png`, `icon-512.png` in `public/`
3. Update `src/frontend/public/manifest.json` (or create if absent) with correct `icons` array
4. Update `vite.config.js` PWA plugin config to reference the icon files
5. Add `<link rel="icon" href="/icon.svg">` to `index.html`

---

## Paystack (do before deployment)

**File:** `src/backend/.env`
**Action:** Fill in:
```
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_WEBHOOK_SECRET=...
```
Get from: https://dashboard.paystack.com/#/settings/developer

---

## Deployment — Railway

Order:
1. Set all production env vars in Railway dashboard (use `.env.example` as checklist)
2. Set `FCM_SERVICE_ACCOUNT_JSON` as the full single-line JSON string (not the file path — Railway has no filesystem)
3. Re-enable `UPSTASH_REDIS_URL=rediss://...` (port 6380 works on Railway)
4. Run migrations: `npm run migrate` (Railway shell or deploy hook)
5. Run seeds if needed (admin user, psychoeducation articles)
6. Smoke test: register → verify email → onboarding → mood → AI chat → credits
7. Set `FRONTEND_URL` to deployed frontend URL for CORS

---

## Migration 031 reminder
`031_notification_journal_prompt.sql` is written but not yet run against Supabase.
Run it alongside the other pending migrations at deployment time.
