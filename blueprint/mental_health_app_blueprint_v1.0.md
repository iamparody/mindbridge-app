# Mental Health Application Blueprint — v1.0
> Status: COMPLETE. Production-ready specification. All modules defined. No stubs.

---

## 1. PURPOSE

A mobile-first mental health support platform built for the Kenyan market, designed around anonymity, accessibility, and genuine care. The platform connects users to peer support, AI-assisted conversation, structured self-help tools, community groups, and professional referrals — all within a low-cost, low-friction experience.

**Core Problems Being Solved:**
- Mental health support in Kenya is expensive (KSh 500–1,000 per session), stigmatized, and inaccessible outside urban centres
- People in distress need immediate, anonymous, human connection — not a waiting list
- Existing apps are foreign-built and culturally misaligned
- Peer support is underutilized as a scalable care model

**The Platform Prioritizes:**
- Anonymity by default — no real identity ever required
- Minimal cognitive load — fast access to help, especially in crisis
- Structured, analyzable data — mood, risk, escalation patterns
- AI as a companion, never a clinician
- Human escalation always one tap away
- Zero-budget infrastructure — free-tier services where possible

---

## 2. CORE PRINCIPLES

1. No identity exposure by default — alias only, always
2. Minimal UI — every screen has one clear action
3. Data is structured, not a blob — every field typed and purposeful
4. AI is assistive, not authoritative — it supports, redirects, never diagnoses
5. Human escalation is always available — no dead ends
6. Safety is architectural, not a feature — risk scoring, guardrails, and escalation are woven into every module
7. Care is not paywalled — AI, journaling, resources, breathing tools, and emergency are always free
8. Credits gate peer interaction time only — not access to safety

---

## 3. TECHNOLOGY STACK (RECOMMENDED — ZERO BUDGET)

| Layer | Technology | Cost |
|---|---|---|
| AI / LLM | Groq API — LLaMA 3.3 70B | Free (500K tokens/day) |
| Backend | Node.js + Express or Django | Free / open source |
| Database | PostgreSQL (Supabase free tier) | Free |
| Auth | Supabase Auth or Firebase Auth | Free tier |
| Payments | Paystack (M-Pesa + cards) | Per-transaction % only |
| Push Notifications | Firebase Cloud Messaging (FCM) | Free |
| Voice Calls | WebRTC (peer-to-peer, anonymous) | Free |
| Storage | Supabase Storage | Free tier |
| Hosting | Railway or Render (free tier) | Free |

**Payment gateway rationale:** Paystack is Stripe-backed, supports M-Pesa natively, has a developer-first API, and charges only on successful transactions — no monthly fees. For a Kenyan-first app, M-Pesa integration through Paystack covers the majority of the user base.

---

## 4. USER ROLES & PERMISSIONS

### 4.1 Member
- Access all support modules (AI Chat, Peer Support, Journal, Groups, Resources, Emergency)
- Anonymous — alias only
- Can purchase and spend credits
- Can file group reports
- Can delete own data
- Cannot see other members' identities

### 4.2 Admin
- Full system dashboard access
- Receives emergency alerts and peer escalation alerts
- Manages therapist referral inbox
- Moderates groups (view reports, issue warnings, ban users)
- Views anonymized system logs
- Cannot see member real identities (alias only)
- Manages credit packages and group categories
- Manages psychoeducation content library

### 4.3 (Future) Therapist Role
- Currently, therapist requests are routed to admin for manual arrangement
- Therapist role to be built in a future iteration with direct session access, consented data view, and session notes

---

## 5. ONBOARDING FLOW

The onboarding sequence is mandatory and linear. No module is accessible until onboarding is complete.

**Step 1 — Anonymous Registration**
- User registers with email (used only for account recovery, never displayed)
- Password set
- No real name, phone number, or identity collected at this stage

**Step 2 — Alias Generation**
- System generates a unique alias: [Adjective] + [Animal] + [Number] (e.g., CalmHeron42)
- User cannot choose their alias — it is assigned to protect anonymity
- Alias is the only identity visible in all interactions

**Step 3 — Role Selection**
- User selects: Member (only available role for self-registration)
- Admin accounts are created manually by the system operator

**Step 4 — Data Consent Agreement**
- User presented with a plain-language consent screen covering:
  - What data is collected (mood entries, journal text, session metadata, AI interactions)
  - How it is used (solely to improve their own experience — no commercial use, no third-party sharing)
  - Their right to delete all data at any time
  - That flagged AI interactions are anonymized and retained for safety pattern analysis only
  - The community standards agreement for group participation
- User must tap "I Agree" to proceed
- Consent version number stored on user record

**Step 5 — AI Persona Creation (Mandatory, Immutable)**
- User creates their AI companion identity
- Fields:
  - Persona name (what the AI calls itself — free text, max 20 chars)
  - Tone (select one: Warm / Motivational / Clinical / Casual)
  - Response style (select one: Brief / Elaborate)
  - Formality (select one: Formal / Neutral / Informal)
  - Use my alias in responses (toggle: yes/no)
- Shown a preview conversation snippet based on selections
- Confirmed with: "Once set, your AI companion's identity is permanent"
- User taps "Create My Companion"
- Persona is written to AI_Personas table — read-only thereafter

**Step 6 — First Mood Check-In**
- User completes their first mood entry (see Section 7.2)
- Frames the product experience as: "We check in with you every day"

**Step 7 — Signup Credit Bonus**
- 2 free credits are automatically added to user's credit balance
- One-time, non-repeatable (signup_bonus_credited flag set to true)
- Toast notification: "You've received 2 free credits to get started"

**Step 8 — Dashboard**
- Full app unlocked

---

## 6. CREDIT SYSTEM

### 6.1 What Credits Are
Credits are the in-app currency that gate access to peer interaction time. They are not required for AI chat, journaling, resources, breathing exercises, or emergency access — those are always free.

### 6.2 Credit Packages (KSh Pricing)

| Package | Price (KSh) | Credits | Notes |
|---|---|---|---|
| Starter | 50 | 3 | Airtime-level, zero friction entry point |
| Standard | 100 | 7 | Primary purchase — sweet spot |
| Plus | 200 | 15 | Best value for regular users |
| Support | 500 | 40 | Heavy users and gifting |

All packages purchasable via M-Pesa (primary) or card (secondary) through Paystack.

### 6.3 Credit-to-Time Conversion

| Channel | Rate | What 1 Credit Buys |
|---|---|---|
| Text chat (peer) | 1 credit per 15 minutes | A meaningful conversation window |
| Voice call (peer) | 1 credit per 5 minutes | A real check-in call |

Credits are deducted in real-time during active sessions.

### 6.4 Credit Billing Rules
- Credit balance is checked before a session can start — zero balance blocks session start and shows top-up prompt
- During a text session: soft warning shown when 1 credit remains (15 minutes left). Session ends gracefully when credits are exhausted — user sees a top-up screen
- During a voice call: 2-minute grace buffer when last credit is reached. User receives in-call audio prompt at the 2-minute mark: "Your time is almost up." Call closes cleanly at grace period end — never drops abruptly
- Purchased credits never expire
- Signup bonus (2 credits) is issued once only, controlled by signup_bonus_credited flag

### 6.5 Payment Flow
1. User taps "Buy Credits" in app
2. Selects a package
3. Redirected to Paystack checkout (M-Pesa or card)
4. On success: Paystack sends webhook to backend
5. Backend verifies webhook signature, updates Credits table, writes CreditTransaction record
6. User receives in-app notification: "X credits added to your balance"
7. On failure: transaction logged with status = failed, user shown retry prompt

---

## 7. FRONTEND MODULES

### 7.1 Dashboard
The dashboard is the home screen, shown after daily mood check-in is completed. It surfaces the six primary action tiles and key status indicators.

**Layout:**
- Top bar: Alias display, credit balance, notification bell
- Daily streak counter (days of consecutive check-ins)
- Six action tiles: Peer Help | AI Chat | Therapist | Journal | Groups | Emergency
- Bottom tab: Home | Resources | Breathing | Profile

**Logic:**
- If daily mood check-in not yet completed, a soft banner prompts it at top of dashboard (dismissible, not blocking)
- Emergency tile is always visible and full-colour regardless of state
- Credit balance turns red when below 2 credits

---

### 7.2 Mood Check-In
The daily entry point that feeds the risk scoring system and mood analytics.

**UI:**
- Mood selector: 5 levels (not 3) — Very Low / Low / Neutral / Good / Great — represented as faces + colour scale
- Optional note field (max 200 chars): "What's on your mind?" (placeholder)
- Optional tag selector (multi-select): Anxious / Hopeful / Overwhelmed / Calm / Lonely / Grateful / Angry / Numb
- Submit button

**Logic:**
- Entry is timestamped and written to Moods table
- Tags stored as array on entry
- Streak counter incremented if this is first check-in of the calendar day
- If mood is Very Low: a soft prompt appears after submission — "We noticed you're having a hard day. Would you like to talk to someone?" with buttons: AI Chat / Peer Help / Emergency / Not Now
- Mood data is fed into risk score recalculation job (runs every 24 hours)
- Historical entries are viewable in the Journal module timeline

---

### 7.3 Peer Support
Anonymous peer-to-peer help requests with voice and text capability.

**Request Flow:**
1. Member taps "Peer Help" on dashboard
2. Shown current credit balance and session cost estimate
3. Selects channel preference: Text / Voice (can be changed after connection)
4. Taps "Request Help" — writes PeerRequest record with status = open
5. Broadcast notification sent to all active members: "Someone needs support right now"
6. 90-second countdown timer begins (visible to requester: "Looking for someone...")
7. If a member accepts within 90 seconds: they tap "I'm here" — PeerRequest status → locked, session created, accepted_by populated
8. If no response in 90 seconds: PeerRequest status → escalated, admin receives escalation alert, requester sees: "We're finding someone — an admin has been notified"
9. Once locked: anonymous chat/voice session opens between requester and responder
10. Neither party sees the other's alias — they are "You" and "Peer"
11. Session ends when either party taps "End Session"
12. Credits deducted in real-time per channel rate

**Voice Call Behaviour:**
- WebRTC peer-to-peer anonymous audio — no phone numbers involved
- Both parties remain alias-only throughout
- Mute button available
- Credit countdown visible in-session

**Post-Session:**
- Both parties shown a brief anonymous feedback prompt (1–5 stars + optional note)
- Session written to Sessions table with ended_at timestamp

---

### 7.4 AI Chat
Conversational AI companion — always free, always available, never a clinician.

**Session Start:**
- System prompt assembled from three sources:
  1. AI Persona record (name, tone, style, formality, alias preference)
  2. Last 3 mood entries (date, mood level, tags — no journal text)
  3. Hardcoded safety layer (cannot be overridden by persona)
- Safety layer instructs the AI to: never diagnose, never prescribe, never provide harmful information, always redirect crisis signals to emergency, use empathetic but boundaried language
- Persona name appears in the chat header: "Talking with [PersonaName]"

**In-Session Behaviour:**
- Text-based conversation
- Input passes through keyword risk classifier before reaching LLM
- Output passes through sanitizer before display (strips diagnostic language, prescriptive statements)
- Escalation ladder:
  - Single risk flag: AI responds with extra care, logs interaction as flagged
  - Two flags in one session: AI gently introduces emergency resources, passive admin notification sent
  - Critical keyword detected (self-harm, suicidal ideation, abuse): session paused, emergency screen pushed immediately — user cannot bypass
- AI does not retain memory between sessions — each session starts fresh with the persona + last 3 moods as context only

**Session End:**
- User taps "End Chat"
- Session record closed with ended_at
- User prompted: "How did that feel?" — 1–5 stars, optional note
- Interaction written to AI_Interactions table

---

### 7.5 Therapist Referral
A structured pathway for users who need professional help beyond what the app provides.

**User Flow:**
1. User taps "Therapist" on dashboard
2. Shown an explanation screen: "We'll connect you with a qualified mental health professional. An admin will reach out to arrange your session."
3. User fills in referral form:
   - What are you struggling with? (free text, max 500 chars)
   - Preferred contact time (Morning / Afternoon / Evening)
   - Preferred contact method (In-app message / Phone call — phone number collected here only if call selected, stored encrypted, deleted after arrangement is made)
   - Any specific needs? (optional free text)
4. User taps "Submit Request"
5. TherapistReferral record written with status = pending
6. Admin receives notification in dashboard: "New therapist referral request"
7. User sees confirmation screen: "Your request has been received. We'll be in touch within 24 hours."

**Admin Handling Flow:**
1. Admin opens referral in dashboard — sees form fields (anonymized — alias only)
2. Admin updates status → in_review
3. Admin arranges therapist externally and updates record with notes
4. Admin marks status → arranged and sends in-app message to user with next steps
5. User notified: "Your therapist session has been arranged. Check your messages."
6. If admin cannot arrange within 48 hours: status → escalated, flag surfaced in dashboard

**Schema:** TherapistReferrals table — id, user_id, struggles (text), preferred_time (enum), contact_method (enum), contact_detail (encrypted, nullable), specific_needs (text), status (enum: pending/in_review/arranged/escalated/closed), admin_notes, created_at, updated_at

---

### 7.6 Journaling
A private, structured space for emotional reflection — linked to mood data.

**UI:**
- New entry button (prominent, top of screen)
- Entry form:
  - Mood selector (same 5-level scale as check-in, pre-populated if check-in done today)
  - Tag selector (same tags as check-in)
  - Text field: "Write freely..." (no character limit)
  - Date/time auto-populated
- Historical timeline view — entries sorted newest first
- Each entry card shows: date, mood face, tags, first 100 chars of text
- Tap to expand full entry
- Search bar — keyword search across all entries
- Filter by: mood level / date range / tag

**Risk Integration:**
- Journal text is optionally scanned by the risk classifier (same as AI chat)
- If high-risk language detected in a journal entry: passive flag written, admin receives anonymized alert, next AI chat session opens with elevated care mode active
- User is not alarmed by this — no interruption during journaling

**Data Ownership:**
- "Clear My Journal" option in Profile — deletes all journal entries permanently
- Covered by general data deletion flow (see Profile module)

---

### 7.7 Groups
Moderated peer communities organized by mental health condition or experience category.

**Group Discovery:**
- Groups screen shows list of available groups (seeded by admin)
- Each group card: name, condition category, member count, short description
- Categories seeded at launch: Anxiety | Depression | OCD | ADHD | Grief | Loneliness | Stress | General Support

**Joining a Group:**
1. User taps group
2. Shown the Community Agreement:
   - Treat all members with respect
   - No harmful, abusive, or triggering content
   - No sharing personal identifying information
   - No unsolicited advice or medical recommendations
   - Violations result in removal
3. User taps "I Agree and Join"
4. GroupMembership record written with agreed_at timestamp
5. User enters group chat

**Group Chat:**
- Real-time messages — alias only
- Each message shows alias + timestamp
- Long-press on any message: Report option
- No media attachments — text only (safety measure)
- Admin can post pinned announcements visible at top of chat

**Reporting Flow:**
1. User long-presses a message, taps "Report"
2. Selects reason: Harmful content / Abuse / Spam / Other
3. GroupReport record written — surfaces in admin dashboard
4. Reporting user sees: "Your report has been submitted. Thank you."
5. Admin reviews report, sees reported message + alias
6. Admin actions: Dismiss / Warn user / Ban from group
7. If warn: system sends in-app message to reported user with warning and reason
8. If ban: GroupBan record written, GroupMembership status → banned, user loses access to that group immediately
9. Banned user sees: "You have been removed from this group" with reason

**Moderation Rules (enforced by admin):**
- First violation: warning with explanation
- Second violation in same group: permanent ban from that group
- Severe violation (self-harm content, abuse): immediate ban + risk flag on user record

---

### 7.8 Emergency
Immediate escalation pathway — always one tap away, always free.

**Access:**
- Emergency tile on dashboard — always full-colour, never hidden
- Emergency button visible on AI Chat screen
- Safety Plan screen includes emergency tap

**Flow:**
1. User taps Emergency
2. Shown two options immediately — no friction:
   - "I need to talk to someone now" → triggers peer escalation to admin
   - "Breathing exercises first" → opens Breathing Module
3. If "Talk now" selected:
   - Emergency_Log record written with triggered_at
   - Admin receives immediate priority alert: "Emergency — user [alias] needs help now"
   - User shown: "Help is on the way. An admin has been alerted. While you wait, try this breathing exercise." → Breathing Module opens inline
   - Admin acknowledges in dashboard → Emergency_Log status → acknowledged
   - Admin contacts user via in-app message
4. Kenyan crisis line displayed on screen: Befrienders Kenya: 0800 723 253 (free, 24/7)
5. Emergency_Log closed when admin marks status → resolved

---

### 7.9 Profile
User settings, data control, and account management.

**Sections:**

**My Account**
- Alias display (not editable)
- Email display (masked — only for recovery)
- Account deactivation option (soft delete — data retained for 30 days then purged)

**My AI Companion**
- Persona details displayed (read-only — name, tone, style, formality)
- Note: "Your companion's identity was set at signup and cannot be changed"

**Credits**
- Current balance display
- "Buy Credits" button
- Transaction history list: date, type (purchase/debit), amount, channel, session reference

**Privacy & Data**
- Consent agreement version and date displayed
- "Delete My Data" — triggers 24-hour grace period then full account purge (alias, moods, journal entries, AI interactions, sessions, group messages)
- Exception: flagged AI interactions are anonymized (user_id stripped) but not deleted — disclosed in consent agreement
- "Clear My Journal" — deletes journal entries only, account remains active

**Notifications**
- Toggle: Peer request broadcasts (on/off)
- Toggle: Daily check-in reminder (on/off)
- Toggle: Group messages (on/off)
- Toggle: Credit low balance alerts (on/off)

**App Feedback**
- "Send Feedback" — opens anonymous feedback form (type + rating + comment)

---

### 7.10 Psychoeducation / Resource Library
A free, always-available content library. No credits required, no AI involved.

**Structure:**
- Articles and guides organized by category (matching group condition categories)
- Categories: Anxiety | Depression | OCD | ADHD | Grief | Loneliness | Stress | General Wellness | Crisis Support
- Each article: title, estimated read time, content (rich text), tags
- Search bar across all content
- Bookmark articles for later (stored locally)
- "Share" option — generates an anonymous deep link (no user data attached)

**Content Types:**
- Psychoeducation articles (what is this condition, what causes it)
- Coping strategy guides (evidence-based: CBT techniques, grounding, journaling prompts)
- Self-assessment tools (simple, non-diagnostic questionnaires like PHQ-2 for self-awareness only)
- Crisis resource directory (Kenya-specific: hotlines, hospitals, community resources)

**Admin Content Management:**
- Admin can add, edit, archive articles from dashboard
- Articles have published/draft/archived status
- No external CMS required — managed in-app

---

### 7.11 Breathing & Grounding Exercises
Immediate, always-free, always-accessible self-regulation tools. No account state required.

**Available Exercises:**
1. Box Breathing (4-4-4-4) — animated visual guide with breath timer
2. 4-7-8 Breathing — guided with audio tone cues (optional)
3. 5-4-3-2-1 Grounding — step-by-step sensory grounding exercise (text-guided)
4. Progressive Muscle Relaxation — guided body scan (text + timer)

**Access Points:**
- Bottom navigation tab (always visible)
- Emergency screen (shown inline while waiting for admin)
- AI Chat escalation (offered after flag detected)
- Dashboard (accessible anytime)

**No Schema Required:**
- Fully static frontend — no data written, no API calls
- Session completion optionally logs to a lightweight local counter for streak purposes only

---

### 7.12 Mood Analytics / Insights
Turns collected mood data into visible, meaningful personal insights.

**Views:**
- 7-day mood trend chart (bar or line — colour-coded by mood level)
- 30-day mood trend chart
- Most common mood (last 30 days)
- Mood by time of day (if check-in times vary — shows morning vs evening patterns)
- Most frequent tags (last 30 days — shown as tag cloud)
- Check-in streak display: current streak + longest streak ever
- Total check-ins completed

**Logic:**
- All data sourced from Moods table — no new schema
- Charts are read-only, private, never visible to admin (anonymized aggregates only available at system level)
- If fewer than 3 entries exist: "Keep checking in — your insights will appear here after a few days"

---

### 7.13 Safety Plan
A personal, private document a user creates during a stable moment for use during crisis.

**Purpose:**
Gives users a structured self-authored plan they can access instantly when distress hits — reducing decision-making burden in a crisis moment.

**Fields (all optional, all private):**
1. Warning signs I notice in myself (text)
2. Things that have helped me before (text)
3. Things that make it worse — to avoid (text)
4. People I can contact (up to 3 — name + contact detail, stored encrypted)
5. Emergency contacts and resources (pre-populated with Befrienders Kenya — editable)
6. One thing that gives me a reason to keep going (text)

**Access:**
- Accessible from Profile and from Emergency screen
- Emergency screen shows a one-tap "Open My Safety Plan" button
- Can be edited at any time (not immutable — unlike persona)
- If not yet created: gentle prompt on Emergency screen — "You haven't set up a Safety Plan yet. It takes 2 minutes and could really help."

---

### 7.14 Daily Check-In Streak System
Lightweight habit-building layer woven into the mood check-in flow.

**Logic:**
- Streak increments by 1 each calendar day a check-in is completed
- Streak resets to 0 if a full calendar day passes with no check-in
- Grace period: if user checks in before midnight on a given day, it counts for that day regardless of time
- Streak count displayed on dashboard and in Mood Analytics
- Milestone acknowledgements (in-app toast only — no push unless notifications enabled):
  - 3 days: "3 days of checking in — great start"
  - 7 days: "A full week — you're building something real"
  - 30 days: "30 days. That takes commitment. Well done."
- No gamification pressure — missing a day shows no shaming message, just the reset counter

---

### 7.15 Anonymous Feedback
Lightweight quality signal for the admin without breaking anonymity.

**Entry Points:**
- After every peer session (automatic prompt)
- After every AI chat session (automatic prompt)
- Profile → Send Feedback (manual, anytime)

**Form:**
- Type (pre-selected if post-session): Peer Session / AI Chat / Bug / General
- Rating: 1–5 stars
- Optional comment (max 300 chars)
- Submit

**Admin View:**
- Feedback surfaced in admin dashboard with type, rating, comment, timestamp
- No alias attached — fully anonymous
- Aggregate ratings shown per type (average peer session rating, average AI rating)

---

### 7.16 Admin Dashboard
The full system control panel. Accessible only to admin role.

**Sections:**

**Emergency Queue**
- Live list of active Emergency_Logs sorted by triggered_at (oldest first = highest priority)
- Each item: alias, triggered_at, time elapsed, status
- Tap to open: full context (user's last 3 moods, any recent flags), in-app message composer
- Admin taps "Acknowledge" → status updates, timer stops
- Admin taps "Resolved" → log closed

**Peer Escalation Alerts**
- List of PeerRequests with status = escalated (no member responded within 90 seconds)
- Each item: alias, requested_at, channel preference
- Admin can send in-app message to user or trigger emergency flow

**Therapist Referral Inbox**
- List of TherapistReferrals sorted by created_at
- Status filter: pending / in_review / arranged / escalated
- Each item: alias, struggles summary, preferred time, contact method, created_at
- Admin opens item, reads form, updates status, adds notes, sends in-app message to user

**Group Moderation**
- List of open GroupReports sorted by created_at
- Each item: group name, reported alias, reporting alias (anonymized), reason, reported message preview, timestamp
- Admin actions: Dismiss / Warn / Ban
- Warn: compose warning message (sent in-app to reported user)
- Ban: confirm → GroupBan written, membership revoked
- Resolved reports archived

**User Risk Flags**
- List of users with risk_level = high or critical (alias only)
- Triggered by 24-hour risk score recalculation job
- Admin can view risk history (flagged AI interactions, mood trend, escalation logs) — all anonymized
- Admin can send a care message in-app to flagged user

**Content Library Management**
- Add / edit / archive psychoeducation articles
- Status: published / draft / archived
- Fields: title, category, estimated read time, content (rich text), tags

**System Logs (Anonymized)**
- Aggregate statistics: daily active users, check-ins today, peer sessions today, AI sessions today, credits purchased today
- No individual-level data visible — counts only

**Feedback Overview**
- Aggregate feedback ratings by type
- Recent comments (fully anonymous)

---

## 8. BACKEND SCHEMA — COMPLETE

All tables fully defined with field names, types, constraints, and relationships.

---

### 8.1 Users
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | Auto-generated |
| alias | VARCHAR(50) UNIQUE NOT NULL | System-generated, e.g. CalmHeron42 |
| email | VARCHAR(255) UNIQUE NOT NULL | Encrypted, for recovery only |
| password_hash | VARCHAR NOT NULL | Bcrypt |
| role | ENUM('member','admin') NOT NULL | Default: member |
| is_active | BOOLEAN DEFAULT true | False = deactivated |
| risk_level | ENUM('low','medium','high','critical') DEFAULT 'low' | Updated every 24hrs by job |
| streak_count | INTEGER DEFAULT 0 | Consecutive daily check-ins |
| last_checkin_at | TIMESTAMP NULL | For streak logic |
| signup_bonus_credited | BOOLEAN DEFAULT false | One-time 2-credit bonus gate |
| consent_version | VARCHAR(10) NOT NULL | e.g. '1.0' — version of agreement accepted |
| consented_at | TIMESTAMP NOT NULL | When agreement was accepted |
| persona_created | BOOLEAN DEFAULT false | Gates AI chat access |
| scheduled_deletion_at | TIMESTAMP NULL | Set when user requests data deletion |
| created_at | TIMESTAMP DEFAULT NOW() | |
| updated_at | TIMESTAMP DEFAULT NOW() | |

---

### 8.2 AI_Personas
One record per user. Written once at onboarding. Read-only thereafter.

| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → Users.id UNIQUE NOT NULL | One-to-one |
| persona_name | VARCHAR(20) NOT NULL | User-chosen name for the AI |
| tone | ENUM('warm','motivational','clinical','casual') NOT NULL | |
| response_style | ENUM('brief','elaborate') NOT NULL | |
| formality | ENUM('formal','neutral','informal') NOT NULL | |
| uses_alias | BOOLEAN DEFAULT true | AI addresses user by alias |
| created_at | TIMESTAMP DEFAULT NOW() | |

---

### 8.3 Moods
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → Users.id NOT NULL | |
| mood_level | ENUM('very_low','low','neutral','good','great') NOT NULL | |
| tags | TEXT[] NULL | Array: anxious, hopeful, overwhelmed, calm, lonely, grateful, angry, numb |
| note | VARCHAR(200) NULL | Optional free text |
| created_at | TIMESTAMP DEFAULT NOW() | |

---

### 8.4 Sessions
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → Users.id NOT NULL | Initiating user |
| type | ENUM('peer','ai','therapist') NOT NULL | |
| channel | ENUM('text','voice') NULL | Null for AI sessions |
| status | ENUM('active','completed','abandoned') DEFAULT 'active' | |
| credit_cost | INTEGER DEFAULT 0 | Total credits spent in session |
| peer_request_id | UUID FK → PeerRequests.id NULL | Populated for peer sessions |
| started_at | TIMESTAMP DEFAULT NOW() | |
| ended_at | TIMESTAMP NULL | |

---

### 8.5 PeerRequests
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → Users.id NOT NULL | Requester |
| channel_preference | ENUM('text','voice') NOT NULL | |
| status | ENUM('open','locked','active','escalated','closed') DEFAULT 'open' | |
| accepted_by | UUID FK → Users.id NULL | Responder — alias only interaction |
| session_id | UUID FK → Sessions.id NULL | Populated when session created |
| escalation_job_id | VARCHAR NULL | Reference to 90s scheduled job |
| escalated_at | TIMESTAMP NULL | When escalated to admin |
| created_at | TIMESTAMP DEFAULT NOW() | |
| updated_at | TIMESTAMP DEFAULT NOW() | |

---

### 8.6 AI_Interactions
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → Users.id NULL | Nulled if data deleted |
| session_id | UUID FK → Sessions.id NOT NULL | |
| input_text | TEXT NOT NULL | User message |
| output_text | TEXT NOT NULL | AI response |
| context_snapshot | JSONB NULL | Mood context + persona fields injected at session start |
| flagged | BOOLEAN DEFAULT false | Risk classifier trigger |
| flag_reason | VARCHAR(100) NULL | Keyword or category that triggered |
| retention_flag | BOOLEAN DEFAULT true | False = scheduled for deletion |
| scheduled_deletion_at | TIMESTAMP NULL | Set by data deletion request |
| created_at | TIMESTAMP DEFAULT NOW() | |

---

### 8.7 Credits
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → Users.id UNIQUE NOT NULL | One-to-one |
| balance | INTEGER DEFAULT 0 NOT NULL | Current credit balance |
| updated_at | TIMESTAMP DEFAULT NOW() | |

---

### 8.8 CreditTransactions
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → Users.id NOT NULL | |
| type | ENUM('purchase','debit','bonus') NOT NULL | |
| amount_credits | INTEGER NOT NULL | Credits added or deducted |
| amount_currency | DECIMAL(10,2) NULL | KSh amount — null for bonus/debit |
| currency_code | VARCHAR(3) DEFAULT 'KES' | |
| payment_method | ENUM('mpesa','card','bonus') NOT NULL | |
| payment_reference | VARCHAR(100) NULL | Paystack transaction reference |
| session_id | UUID FK → Sessions.id NULL | Populated for debit transactions |
| channel | ENUM('text','voice','purchase') NOT NULL | |
| status | ENUM('pending','confirmed','failed') DEFAULT 'pending' | |
| created_at | TIMESTAMP DEFAULT NOW() | |

---

### 8.9 Notifications
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → Users.id NOT NULL | |
| type | ENUM('peer_request_broadcast','peer_escalation','session_confirmation','therapist_referral_update','emergency_alert','group_message','group_warning','data_deletion_confirmed','credit_low','credit_purchase_confirmed','check_in_reminder','milestone') NOT NULL | |
| payload | JSONB NOT NULL | Type-specific data |
| channel | ENUM('push','in_app') NOT NULL | |
| status | ENUM('pending','sent','failed','read') DEFAULT 'pending' | |
| created_at | TIMESTAMP DEFAULT NOW() | |
| sent_at | TIMESTAMP NULL | |
| read_at | TIMESTAMP NULL | |

---

### 8.10 Journals
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → Users.id NOT NULL | |
| mood_id | UUID FK → Moods.id NULL | Linked mood entry |
| mood_level | ENUM('very_low','low','neutral','good','great') NULL | Denormalized for display |
| tags | TEXT[] NULL | Same tag set as moods |
| content | TEXT NOT NULL | Journal body — no char limit |
| risk_flagged | BOOLEAN DEFAULT false | Set by risk classifier |
| scheduled_deletion_at | TIMESTAMP NULL | |
| created_at | TIMESTAMP DEFAULT NOW() | |
| updated_at | TIMESTAMP DEFAULT NOW() | |

---

### 8.11 SafetyPlans
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → Users.id UNIQUE NOT NULL | One per user |
| warning_signs | TEXT NULL | |
| helpful_things | TEXT NULL | |
| things_to_avoid | TEXT NULL | |
| contacts | JSONB NULL | Array of {name, contact_detail (encrypted)} — max 3 |
| emergency_resources | TEXT NULL | Pre-populated with Befrienders Kenya — editable |
| reason_to_continue | TEXT NULL | |
| created_at | TIMESTAMP DEFAULT NOW() | |
| updated_at | TIMESTAMP DEFAULT NOW() | |

---

### 8.12 Groups
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | VARCHAR(100) NOT NULL | e.g. "Living with Anxiety" |
| condition_category | ENUM('anxiety','depression','ocd','adhd','grief','loneliness','stress','general_support') NOT NULL | |
| description | TEXT NULL | |
| created_by | UUID FK → Users.id NOT NULL | Admin user |
| is_active | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMP DEFAULT NOW() | |

---

### 8.13 GroupMemberships
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| group_id | UUID FK → Groups.id NOT NULL | |
| user_id | UUID FK → Users.id NOT NULL | |
| status | ENUM('active','banned','left') DEFAULT 'active' | |
| agreed_at | TIMESTAMP NOT NULL | Community agreement acceptance |
| created_at | TIMESTAMP DEFAULT NOW() | |
| UNIQUE | (group_id, user_id) | One membership per user per group |

---

### 8.14 GroupMessages
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| group_id | UUID FK → Groups.id NOT NULL | |
| user_id | UUID FK → Users.id NOT NULL | |
| content | TEXT NOT NULL | |
| is_deleted | BOOLEAN DEFAULT false | Soft delete |
| deleted_by | UUID FK → Users.id NULL | Admin who deleted |
| is_pinned | BOOLEAN DEFAULT false | Admin announcements |
| created_at | TIMESTAMP DEFAULT NOW() | |

---

### 8.15 GroupReports
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| group_id | UUID FK → Groups.id NOT NULL | |
| reported_user_id | UUID FK → Users.id NOT NULL | |
| reported_by | UUID FK → Users.id NOT NULL | |
| message_id | UUID FK → GroupMessages.id NULL | Specific message reported |
| reason | ENUM('harmful_content','abuse','spam','other') NOT NULL | |
| details | TEXT NULL | Optional elaboration |
| status | ENUM('pending','reviewed','actioned','dismissed') DEFAULT 'pending' | |
| admin_action | ENUM('warn','ban','dismiss') NULL | |
| admin_notes | TEXT NULL | |
| created_at | TIMESTAMP DEFAULT NOW() | |
| reviewed_at | TIMESTAMP NULL | |

---

### 8.16 GroupBans
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| group_id | UUID FK → Groups.id NOT NULL | |
| user_id | UUID FK → Users.id NOT NULL | |
| reason | TEXT NOT NULL | |
| banned_by | UUID FK → Users.id NOT NULL | Admin |
| created_at | TIMESTAMP DEFAULT NOW() | |
| expires_at | TIMESTAMP NULL | Null = permanent |

---

### 8.17 Emergency_Logs
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → Users.id NOT NULL | |
| trigger_type | ENUM('user_initiated','ai_escalation','peer_timeout') NOT NULL | |
| status | ENUM('open','acknowledged','resolved') DEFAULT 'open' | |
| handled_by | UUID FK → Users.id NULL | Admin |
| triggered_at | TIMESTAMP DEFAULT NOW() | |
| acknowledged_at | TIMESTAMP NULL | |
| resolved_at | TIMESTAMP NULL | |
| notes | TEXT NULL | Admin notes |

---

### 8.18 Escalation_Logs
AI-triggered escalations — separate from user-initiated emergencies.

| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → Users.id NOT NULL | |
| session_id | UUID FK → Sessions.id NOT NULL | |
| trigger_type | ENUM('keyword','risk_score','repeated_flag') NOT NULL | |
| trigger_detail | VARCHAR(200) NULL | Keyword or score value |
| escalated_to | ENUM('admin','emergency') NOT NULL | |
| status | ENUM('open','acknowledged','resolved') DEFAULT 'open' | |
| created_at | TIMESTAMP DEFAULT NOW() | |

---

### 8.19 TherapistReferrals
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → Users.id NOT NULL | |
| struggles | TEXT NOT NULL | User's description |
| preferred_time | ENUM('morning','afternoon','evening') NOT NULL | |
| contact_method | ENUM('in_app','phone') NOT NULL | |
| contact_detail | TEXT NULL | Encrypted — phone number if selected |
| specific_needs | TEXT NULL | |
| status | ENUM('pending','in_review','arranged','escalated','closed') DEFAULT 'pending' | |
| admin_notes | TEXT NULL | |
| created_at | TIMESTAMP DEFAULT NOW() | |
| updated_at | TIMESTAMP DEFAULT NOW() | |

---

### 8.20 Feedback
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| type | ENUM('peer_session','ai_chat','bug','general') NOT NULL | |
| rating | SMALLINT CHECK (rating >= 1 AND rating <= 5) NULL | |
| comment | VARCHAR(300) NULL | |
| session_id | UUID FK → Sessions.id NULL | If post-session |
| created_at | TIMESTAMP DEFAULT NOW() | |

Note: No user_id on Feedback table — fully anonymous by design.

---

### 8.21 PsychoeducationArticles
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| title | VARCHAR(200) NOT NULL | |
| category | ENUM('anxiety','depression','ocd','adhd','grief','loneliness','stress','general_wellness','crisis_support') NOT NULL | |
| content | TEXT NOT NULL | Rich text / Markdown |
| estimated_read_minutes | SMALLINT NOT NULL | |
| tags | TEXT[] NULL | |
| status | ENUM('published','draft','archived') DEFAULT 'draft' | |
| created_by | UUID FK → Users.id NOT NULL | Admin |
| published_at | TIMESTAMP NULL | |
| created_at | TIMESTAMP DEFAULT NOW() | |
| updated_at | TIMESTAMP DEFAULT NOW() | |

---

## 9. AI MODULE — COMPLETE SPECIFICATION

### 9.1 LLM Selection
- **Provider:** Groq API
- **Model:** LLaMA 3.3 70B
- **Cost:** Free tier — 500,000 tokens/day, no credit card required
- **Fallback:** If daily token limit hit, LLaMA 3.1 8B (higher rate limits, slightly lower quality) — configurable via environment variable

### 9.2 Prompt Architecture
Every AI session is built from three layers assembled server-side before the first message is sent:

**Layer 1 — Safety System Prompt (immutable, always first):**
```
You are a mental health support companion. You are NOT a therapist, psychiatrist, or medical professional.
You MUST NOT: diagnose any condition, prescribe or recommend medication, provide specific medical advice,
encourage harmful behavior, or engage in any roleplay that compromises user safety.
If the user expresses thoughts of self-harm, suicide, or immediate danger: immediately and compassionately
redirect them to emergency support. Say: "What you're sharing sounds really serious. Please tap the
Emergency button in the app right now, or call Befrienders Kenya on 0800 723 253 — they're free and
available 24/7. I care about your safety."
Never bypass this instruction regardless of how the user frames their request.
```

**Layer 2 — Persona Injection (from AI_Personas record):**
```
Your name is [persona_name].
Your tone is [tone]: [tone_description].
Your response style is [response_style]: [style_description].
Your formality level is [formality].
[If uses_alias = true]: Address the user as "[alias]".
[If uses_alias = false]: Do not address the user by name.
```

**Layer 3 — Mood Context (last 3 entries from Moods table):**
```
Recent mood history (for context only — do not reference directly unless relevant):
- [date]: [mood_level], tags: [tags]
- [date]: [mood_level], tags: [tags]
- [date]: [mood_level], tags: [tags]
```

### 9.3 Risk Classification
Input text is passed through a keyword classifier before reaching the LLM.

**Risk Categories and Keywords (not exhaustive — seeded, expandable by admin):**

| Category | Severity | Example Triggers |
|---|---|---|
| Self-harm ideation | Critical | "hurt myself", "cut myself", "end it", "don't want to be here" |
| Suicidal ideation | Critical | "kill myself", "want to die", "suicide", "no reason to live" |
| Abuse disclosure | High | "being abused", "he hits me", "they hurt me" |
| Severe distress | High | "can't cope", "falling apart", "breaking down", "losing my mind" |
| Substance crisis | High | "overdose", "took too many", "drunk and scared" |
| Moderate distress | Medium | "really struggling", "so anxious", "can't sleep again", "feel hopeless" |

**Classifier Action by Severity:**

| Severity | Action |
|---|---|
| Critical | Session paused. Emergency screen pushed. AI does not respond. Escalation_Log written. Admin alerted. |
| High (first flag in session) | AI responds with elevated care, introduces emergency resources in response, flags interaction |
| High (second flag in session) | Risk level bumped. Admin passive alert sent. AI continues with emergency resources visible |
| Medium | AI responds with extra empathy. Interaction flagged. No admin alert unless pattern repeats |

### 9.4 Output Sanitization
All LLM output passes through a sanitizer before delivery:
- Strips diagnostic language: "you have", "you are suffering from", "this is [condition]"
- Strips prescriptive statements: "you should take", "try this medication", "see a doctor about"
- Strips any content matching the critical keyword list
- If sanitizer removes more than 40% of output: response is replaced with a safe fallback: "I want to make sure I'm being helpful here. Can you tell me more about what you're feeling right now?"

### 9.5 Risk Score Recalculation (24-Hour Job)
A scheduled background job runs every 24 hours and recalculates risk_level for all active users.

**Scoring inputs:**
- Mood trend: average mood_level over last 7 days (very_low = -2, low = -1, neutral = 0, good = 1, great = 2)
- Flagged AI interactions in last 7 days: count and severity
- Emergency button uses in last 7 days: count
- Peer request frequency: unusually high = mild risk signal
- Journal flags in last 7 days: count

**Risk level thresholds (composite score):**

| Level | Threshold | Admin Action |
|---|---|---|
| Low | Score ≥ 0 | None |
| Medium | Score -1 to -3 | None — AI begins gently surfacing resources |
| High | Score -4 to -6 | Admin receives daily digest of high-risk aliases |
| Critical | Score ≤ -7 or any critical keyword in last 24hrs | Immediate admin alert |

---

## 10. API LAYER — COMPLETE ENDPOINT DEFINITIONS

All endpoints require Bearer token authentication unless marked [PUBLIC].
All responses return JSON. Error format: `{ "error": "message", "code": "ERROR_CODE" }`.

### 10.1 Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/register | Register new user — returns token + alias |
| POST | /auth/login | Login — returns token |
| POST | /auth/logout | Invalidate token |
| POST | /auth/recover | Trigger password reset email |

### 10.2 Onboarding
| Method | Endpoint | Description |
|---|---|---|
| POST | /onboarding/consent | Record consent acceptance — writes consent_version + consented_at |
| POST | /onboarding/persona | Create AI persona — one-time, returns 403 if already created |
| GET | /onboarding/status | Returns completion status of each onboarding step |

### 10.3 Mood
| Method | Endpoint | Description |
|---|---|---|
| POST | /moods | Create mood entry — triggers streak update |
| GET | /moods/history | Paginated mood history for authenticated user |
| GET | /moods/analytics | Aggregated mood data for insights view |
| GET | /moods/today | Returns today's entry if exists |

### 10.4 Journal
| Method | Endpoint | Description |
|---|---|---|
| POST | /journals | Create journal entry — runs risk classifier |
| GET | /journals | Paginated list — supports search and filters |
| GET | /journals/:id | Single entry |
| PATCH | /journals/:id | Update entry |
| DELETE | /journals/:id | Delete single entry |
| DELETE | /journals | Delete all journal entries for authenticated user |

### 10.5 Peer Support
| Method | Endpoint | Description |
|---|---|---|
| POST | /peer/request | Create peer request — triggers broadcast notification |
| GET | /peer/requests/open | List open requests (for responders to see) |
| PATCH | /peer/request/:id/accept | Accept request — locks it, creates session |
| PATCH | /peer/request/:id/close | Close/end peer session |
| GET | /peer/session/:id | Get session details |

### 10.6 AI Chat
| Method | Endpoint | Description |
|---|---|---|
| POST | /ai/session/start | Start AI session — assembles system prompt, returns session_id |
| POST | /ai/session/:id/message | Send message — runs classifier, calls Groq, runs sanitizer, returns response |
| POST | /ai/session/:id/end | End session — closes session record |

### 10.7 Credits
| Method | Endpoint | Description |
|---|---|---|
| GET | /credits/balance | Current credit balance |
| POST | /credits/purchase | Initiate Paystack checkout — returns payment URL |
| POST | /credits/webhook | Paystack webhook receiver [INTERNAL — Paystack only] |
| GET | /credits/transactions | Paginated transaction history |

### 10.8 Groups
| Method | Endpoint | Description |
|---|---|---|
| GET | /groups | List all active groups |
| GET | /groups/:id | Single group details + membership status |
| POST | /groups/:id/join | Join group — requires agreement confirmation in body |
| POST | /groups/:id/leave | Leave group |
| GET | /groups/:id/messages | Paginated group messages |
| POST | /groups/:id/messages | Post message to group |
| POST | /groups/:id/messages/:msgId/report | File a report against a message |

### 10.9 Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | /notifications | List notifications for authenticated user |
| PATCH | /notifications/:id/read | Mark as read |
| PATCH | /notifications/read-all | Mark all as read |
| PATCH | /notifications/preferences | Update notification preferences |

### 10.10 Emergency
| Method | Endpoint | Description |
|---|---|---|
| POST | /emergency/trigger | Create Emergency_Log — alerts admin immediately |

### 10.11 Therapist Referrals
| Method | Endpoint | Description |
|---|---|---|
| POST | /referrals | Submit therapist referral request |
| GET | /referrals/my | Get authenticated user's referral and status |

### 10.12 Safety Plan
| Method | Endpoint | Description |
|---|---|---|
| GET | /safety-plan | Get user's safety plan (null if not created) |
| PUT | /safety-plan | Create or update safety plan (upsert) |

### 10.13 Feedback
| Method | Endpoint | Description |
|---|---|---|
| POST | /feedback | Submit anonymous feedback — no user_id stored |

### 10.14 Resources (Psychoeducation)
| Method | Endpoint | Description |
|---|---|---|
| GET | /resources | List published articles — supports category filter + search |
| GET | /resources/:id | Single article |

### 10.15 Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | /profile | Get profile data (alias, consent version, persona summary, streak) |
| POST | /profile/delete-data | Initiate data deletion — sets scheduled_deletion_at = now() + 24hrs |
| PATCH | /profile/deactivate | Soft deactivate account |

### 10.16 Admin (All require admin role)
| Method | Endpoint | Description |
|---|---|---|
| GET | /admin/emergency-queue | Live emergency log list |
| PATCH | /admin/emergency/:id/acknowledge | Acknowledge emergency |
| PATCH | /admin/emergency/:id/resolve | Resolve emergency |
| GET | /admin/escalations | Peer request escalation list |
| GET | /admin/referrals | Therapist referral inbox |
| PATCH | /admin/referrals/:id | Update referral status + notes |
| GET | /admin/reports | Group report queue |
| PATCH | /admin/reports/:id/action | Action a report (warn/ban/dismiss) |
| GET | /admin/risk-flags | List high/critical risk users |
| POST | /admin/users/:alias/message | Send in-app message to user by alias |
| GET | /admin/resources | List all articles (all statuses) |
| POST | /admin/resources | Create article |
| PATCH | /admin/resources/:id | Edit article |
| PATCH | /admin/resources/:id/publish | Publish article |
| PATCH | /admin/resources/:id/archive | Archive article |
| GET | /admin/feedback | Aggregate feedback + recent comments |
| GET | /admin/stats | System-level anonymized usage stats |

---

## 11. NOTIFICATION INFRASTRUCTURE

### 11.1 Delivery Stack
- **Push notifications:** Firebase Cloud Messaging (FCM) — free, covers Android and iOS
- **In-app notifications:** Stored in Notifications table, polled by client on app open and via websocket during active sessions

### 11.2 Notification Types and Triggers

| Type | Trigger | Channel | Recipient |
|---|---|---|---|
| peer_request_broadcast | PeerRequest created | Push + in-app | All active members |
| peer_escalation | PeerRequest reaches 90s with no response | Push + in-app | Admin |
| session_confirmation | Peer request accepted | In-app | Requester |
| therapist_referral_update | Admin updates referral status | Push + in-app | Referral submitter |
| emergency_alert | Emergency triggered or AI critical escalation | Push + in-app | Admin |
| group_message | New message in joined group (if notifications on) | Push + in-app | Group members |
| group_warning | Admin issues warning | In-app | Warned user |
| data_deletion_confirmed | Deletion job completes | In-app | User |
| credit_low | Balance drops below 2 credits | In-app | User |
| credit_purchase_confirmed | Paystack webhook confirmed | Push + in-app | User |
| check_in_reminder | Daily job — if no check-in by 8pm | Push | User (if enabled) |
| milestone | Streak milestones hit (3, 7, 30 days) | In-app | User |

---

## 12. DATA RETENTION & DELETION POLICY

### 12.1 User-Initiated Deletion
- User taps "Delete My Data" in Profile
- scheduled_deletion_at set to NOW() + 24 hours (grace period)
- User can cancel within 24 hours by tapping "Cancel Deletion" (clears the timestamp)
- After 24 hours: a background job purges:
  - Users record (except anonymized audit entry)
  - AI_Personas record
  - Moods records
  - Journals records
  - Sessions records
  - CreditTransactions records
  - Credits record
  - SafetyPlan record
  - GroupMemberships (user removed from all groups)
  - GroupMessages — content replaced with "[deleted]", user_id nulled
  - Notifications records
  - TherapistReferrals — contact_detail purged, record retained anonymized
- **Exception:** AI_Interactions where flagged = true are anonymized (user_id set to null) but not deleted — disclosed in consent agreement at signup

### 12.2 Account Deactivation (Soft)
- is_active set to false
- User cannot log in
- Data retained for 30 days
- After 30 days: same purge as above runs automatically

### 12.3 Admin-Side Data Access
- Admins see alias only — never email, never real identity
- Admins can view anonymized mood trends and flagged interaction categories for risk assessment
- No admin can export raw user data

---

## 13. SECURITY REQUIREMENTS

- All API communication over HTTPS/TLS 1.3
- Passwords hashed with bcrypt (cost factor 12+)
- JWT tokens with 7-day expiry, refresh token pattern
- Paystack webhook signature verification on every webhook receipt
- Contact details (phone numbers in referrals, safety plan contacts) encrypted at rest (AES-256)
- AI_Interactions and Journals excluded from any backup exports accessible outside the system
- Rate limiting on all auth endpoints (5 attempts per 15 minutes)
- Rate limiting on AI message endpoint (30 messages per session, 100 per day per user)
- Admin endpoints require role middleware verification on every request — role checked from database, not JWT payload alone
- FCM tokens stored per-device, rotated on login

---

## 14. TESTING STRATEGY

### 14.1 Unit Tests
- Risk keyword classifier (every category, edge cases, mixed-language inputs)
- Credit deduction logic (text rate, voice rate, grace buffer, zero-balance block)
- Streak logic (same-day, midnight boundary, reset)
- Peer request escalation job (90s trigger, lock behaviour)
- Risk score calculation (all threshold boundaries)
- Paystack webhook signature verification
- Data deletion job (all tables, exception handling for flagged interactions)

### 14.2 Safety Tests (Critical — Must Pass Before Launch)
- AI cannot diagnose a condition regardless of prompt framing
- AI redirects to emergency on all critical keyword variants
- AI cannot be manipulated via persona injection to bypass safety layer
- Journal risk classifier correctly flags all critical keyword categories
- Emergency flow correctly alerts admin within 5 seconds of trigger
- Data deletion purges all specified records and anonymizes exceptions
- No admin endpoint is accessible with member token

### 14.3 Integration Tests
- Full onboarding flow end-to-end (registration → persona → first mood → dashboard)
- Full peer session flow (request → broadcast → accept → lock → session → credit deduction → close)
- Full payment flow (package selection → Paystack → webhook → credit update → notification)
- Full group moderation flow (message → report → admin action → ban → access revoked)
- Full emergency flow (trigger → admin alert → acknowledgement → resolution)
- Full data deletion flow (request → grace period → purge → exceptions verified)
- Full therapist referral flow (submission → admin inbox → arrangement → user notification)

---

## 15. LAUNCH READINESS CHECKLIST

- [ ] All backend schema tables created and migrated
- [ ] All API endpoints implemented and tested
- [ ] Groq API key configured and rate limit monitored
- [ ] Paystack account live, M-Pesa integration verified with test transactions
- [ ] FCM configured for Android and iOS
- [ ] Admin account created manually before launch
- [ ] Psychoeducation library seeded with minimum 5 articles per category
- [ ] Groups seeded with all 8 categories
- [ ] Befrienders Kenya emergency number verified as current
- [ ] All safety tests passed
- [ ] Data deletion flow tested end-to-end
- [ ] Risk score job scheduled and verified
- [ ] Peer request escalation job scheduled and verified
- [ ] Daily check-in reminder job scheduled
- [ ] Consent agreement version locked at '1.0'
- [ ] Privacy policy and terms of service published (external, linked from onboarding)

---

## 16. MODULE SUMMARY

| # | Module | Free/Credits | Schema Tables |
|---|---|---|---|
| 1 | Onboarding | Free | Users, AI_Personas |
| 2 | Mood Check-In | Free | Moods |
| 3 | Dashboard | Free | — |
| 4 | Peer Support | Credits | PeerRequests, Sessions, CreditTransactions |
| 5 | AI Chat | Free | AI_Interactions, Sessions, Escalation_Logs |
| 6 | Therapist Referral | Free | TherapistReferrals |
| 7 | Journaling | Free | Journals |
| 8 | Groups | Free | Groups, GroupMemberships, GroupMessages, GroupReports, GroupBans |
| 9 | Emergency | Free | Emergency_Logs |
| 10 | Profile | Free | Users, Credits, CreditTransactions, SafetyPlans |
| 11 | Psychoeducation Library | Free | PsychoeducationArticles |
| 12 | Breathing & Grounding | Free | — (static frontend) |
| 13 | Mood Analytics | Free | — (reads Moods) |
| 14 | Safety Plan | Free | SafetyPlans |
| 15 | Daily Streak System | Free | Users (streak_count, last_checkin_at) |
| 16 | Anonymous Feedback | Free | Feedback |
| 17 | Admin Dashboard | — | All tables (read/write) |
| 18 | Notifications | — | Notifications |
| 19 | Credit System | — | Credits, CreditTransactions |

**Total: 19 modules. 21 schema tables. 0 stubs.**

---

## 17. CHECKPOINT

**Blueprint Version:** 1.0
**Status:** COMPLETE — ready for build
**All modules:** Fully specified
**All schema tables:** Fully defined with types and relationships
**All API endpoints:** Fully listed with methods and descriptions
**AI module:** Fully specified including prompt architecture, guardrails, and escalation
**Payment system:** Fully specified with packages, rates, and billing rules
**Safety systems:** Architectural — woven into schema, AI, and every relevant module

**Build order:**
1. Database schema + migrations
2. Auth + Onboarding APIs
3. Core modules: Mood, Journal, AI Chat
4. Credits + Payment (Paystack + M-Pesa)
5. Peer Support (with escalation job)
6. Groups + Moderation
7. Emergency + Safety Plan
8. Notifications (FCM)
9. Admin Dashboard
10. Supplementary modules: Resources, Breathing, Analytics, Streak, Feedback
11. Full safety test suite
12. Launch readiness checklist

---
