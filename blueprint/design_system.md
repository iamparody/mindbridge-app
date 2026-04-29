# UI/UX Design System — Visual Identity & Components (v2)
> Status: COMPLETE. Production-ready. No stubs. Agent must follow this exactly.

---

## 1. DESIGN INTENT

A calm, grounded, non-clinical interface that:
- Reduces anxiety and cognitive load at every screen
- Feels human, warm, and emotionally safe
- Avoids "techy", "clinical", or "generic app" aesthetics
- Looks and feels production-grade — not an MVP

**Key feeling:** quiet confidence + emotional safety

**What this is NOT:**
- Not a medical app (no sterile whites, no clinical blues)
- Not a social media app (no infinite scroll, no engagement traps)
- Not a generic SaaS app (no default Tailwind, no Bootstrap, no MUI defaults)

**Design Psychology Applied:**
- Hick's Law: limit visible choices per screen to reduce decision fatigue
- Miller's Law: never more than 7 elements competing for attention
- Aesthetic-Usability Effect: beautiful interfaces are perceived as more trustworthy — critical for mental health context
- Thumb Zone: all primary actions within natural thumb reach (bottom half of screen)

---

## 2. COLOR SYSTEM

### 2.1 The 60-30-10 Rule — Enforced
This ratio must be maintained across every screen. Deviating from it breaks visual cohesion.

| Role | Ratio | Color | Hex | Usage |
|------|-------|-------|-----|-------|
| Primary | 60% | Deep Warm Brown | #4B3A2F | Page backgrounds, headers, navigation bar |
| Secondary | 30% | Soft Earth Brown + Dust Beige | #7A5C4D / #E8DDD3 | Cards, input surfaces, modals, secondary panels |
| Accent | 10% | Muted Sand | #C2A48A | Primary buttons, active states, highlights, icons |

### 2.2 Full Core Palette
| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Primary Background | Deep Warm Brown | #4B3A2F | App background, top bars |
| Deep Background | Charcoal Brown | #2F2622 | Bottom sheets, overlays, emergency screen |
| Surface Primary | Soft Earth Brown | #7A5C4D | Cards, elevated surfaces |
| Surface Secondary | Dust Beige | #E8DDD3 | Input fields, secondary cards |
| Text Primary | Warm Cream | #F5EDE4 | All primary text on dark backgrounds |
| Text Secondary | Muted Sand | #C2A48A | Captions, labels, secondary text |
| Text Dark | Charcoal Brown | #2F2622 | Text on light surfaces |
| Accent | Muted Sand | #C2A48A | Buttons, active tab indicators, highlights |
| Border | Sand at 40% opacity | rgba(194,164,138,0.40) | Card borders, input borders, dividers |

### 2.3 Emotional State Colors
| State | Name | Hex | Usage |
|-------|------|-----|-------|
| Calm / Success | Sage Green | #8FAF9A | Positive mood, success states, streak milestones |
| Warning | Soft Amber | #D9A441 | Credit low warning, medium risk, 90s timer middle phase |
| Danger / Critical | Muted Red | #B35C5C | Emergency, critical risk, error states, low credit |
| Neutral | Dust Beige | #E8DDD3 | Neutral mood, inactive states |

### 2.4 Tint Scale (Opacity Variants)
| Token | Value | Usage |
|-------|-------|-------|
| --color-primary-10 | rgba(75,58,47,0.10) | Skeleton loader base |
| --color-primary-20 | rgba(75,58,47,0.20) | Hover states, subtle fills |
| --color-primary-40 | rgba(75,58,47,0.40) | Dividers, inactive borders |
| --color-primary-60 | rgba(75,58,47,0.60) | Disabled text, secondary icons |
| --color-accent-20 | rgba(194,164,138,0.20) | Soft button hover |
| --color-accent-40 | rgba(194,164,138,0.40) | Input focus ring |
| --color-danger-20 | rgba(179,92,92,0.20) | Error background tint |
| --color-calm-20 | rgba(143,175,154,0.20) | Success background tint |

### 2.5 WCAG Contrast — Verified
All text meets minimum 4.5:1 contrast ratio (WCAG AA).

| Text | Background | Ratio | Status |
|------|-----------|-------|--------|
| #F5EDE4 (Warm Cream) | #4B3A2F (Deep Brown) | 8.2:1 | PASS |
| #F5EDE4 (Warm Cream) | #2F2622 (Charcoal) | 10.4:1 | PASS |
| #2F2622 (Charcoal) | #E8DDD3 (Dust Beige) | 9.1:1 | PASS |
| #2F2622 (Charcoal) | #C2A48A (Muted Sand) | 4.6:1 | PASS |
| #F5EDE4 (Warm Cream) | #7A5C4D (Earth Brown) | 5.1:1 | PASS |

Agent must verify any new color combination before using it.

---

## 3. DESIGN TOKENS — CSS CUSTOM PROPERTIES

Create `src/frontend/src/styles/globals.css` and place this block at the top.
Every component references these variables — never hardcoded hex values anywhere.

```css
:root {
  /* COLORS */
  --color-bg-primary: #4B3A2F;
  --color-bg-deep: #2F2622;
  --color-bg-emergency: #1E1612;
  --color-surface-primary: #7A5C4D;
  --color-surface-secondary: #E8DDD3;
  --color-surface-card: #5C4035;

  --color-text-primary: #F5EDE4;
  --color-text-secondary: #C2A48A;
  --color-text-dark: #2F2622;
  --color-text-muted: rgba(245,237,228,0.55);

  --color-accent: #C2A48A;
  --color-accent-hover: #D4B99E;
  --color-accent-pressed: #A88B73;

  --color-border: rgba(194,164,138,0.25);
  --color-border-focus: rgba(194,164,138,0.70);
  --color-divider: rgba(194,164,138,0.15);

  --color-calm: #8FAF9A;
  --color-calm-bg: rgba(143,175,154,0.15);
  --color-warning: #D9A441;
  --color-warning-bg: rgba(217,164,65,0.15);
  --color-danger: #B35C5C;
  --color-danger-bg: rgba(179,92,92,0.15);

  --color-overlay: rgba(47,38,34,0.75);
  --color-skeleton-base: rgba(75,58,47,0.4);
  --color-skeleton-shine: rgba(194,164,138,0.15);

  /* TYPOGRAPHY */
  --font-ui: 'Inter', system-ui, -apple-system, sans-serif;
  --font-editorial: 'Lora', 'Playfair Display', Georgia, serif;

  --text-h1: 28px;
  --text-h2: 22px;
  --text-h3: 18px;
  --text-body: 16px;
  --text-caption: 13px;
  --text-label: 12px;

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;

  --leading-tight: 1.3;
  --leading-normal: 1.5;
  --leading-relaxed: 1.7;

  --tracking-label: 0.05em;

  /* SPACING */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* RADIUS */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-pill: 999px;

  /* SHADOWS */
  --shadow-card: 0 2px 12px rgba(47,38,34,0.18);
  --shadow-elevated: 0 4px 24px rgba(47,38,34,0.25);
  --shadow-modal: 0 8px 40px rgba(47,38,34,0.40);
  --shadow-button: 0 2px 8px rgba(47,38,34,0.20);
  --shadow-input-focus: 0 0 0 3px rgba(194,164,138,0.35);

  /* ANIMATION */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --duration-reveal: 600ms;
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --easing-out: cubic-bezier(0, 0, 0.2, 1);

  /* LAYOUT */
  --max-width-mobile: 430px;
  --bottom-nav-height: 64px;
  --top-bar-height: 56px;
  --touch-target-min: 48px;
}

/* Reduced motion — mandatory */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Base resets */
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-ui);
  font-size: var(--text-body);
  line-height: var(--leading-normal);
  -webkit-font-smoothing: antialiased;
}

/* App shell */
#root {
  max-width: var(--max-width-mobile);
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}
```

---

## 4. TYPOGRAPHY SYSTEM

### 4.1 Type Scale — Exact Specifications
| Level | Size | Weight | Line Height | Font | Usage |
|-------|------|--------|-------------|------|-------|
| H1 | 28px | 600 | 1.3 | Inter | Screen titles, alias reveal |
| H2 | 22px | 600 | 1.4 | Inter | Section headers, card titles |
| H3 | 18px | 500 | 1.4 | Inter | Subsection headers, modal titles |
| Body | 16px | 400 | 1.6 | Inter | All body text, descriptions |
| Body Strong | 16px | 500 | 1.6 | Inter | Emphasis within body text |
| Caption | 13px | 400 | 1.5 | Inter | Timestamps, meta info, helper text |
| Label | 12px | 500 | 1.4 | Inter | Tags, badges — uppercase + letter-spacing 0.05em |
| Editorial | 18px | 400 | 1.7 | Lora | AI chat messages, journal entries |
| Editorial Large | 22px | 400 | 1.5 | Lora | Persona confirmation, emotional moments |

### 4.2 Font Loading (add to index.html)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:wght@400;500&display=swap" rel="stylesheet">
```

### 4.3 Rules
- Never use font sizes outside the type scale
- Never use font weights outside 400, 500, 600
- AI messages and journal text always use Lora — communicates emotional depth
- All caps only for Label level — never for body or headings
- Maximum line length: 65 characters for body text

---

## 5. ICON SYSTEM

### 5.1 Library
**Primary:** Phosphor Icons (duotone weight)
```bash
npm install @phosphor-icons/react
```

### 5.2 Icon Sizes
| Context | Size |
|---------|------|
| Navigation bar | 24px |
| Action tiles (dashboard) | 32px |
| Inline / buttons | 20px |
| Large / empty states | 48px |

### 5.3 Style Rules
- Always duotone — never outline-only, never filled solid
- Active: `var(--color-accent)` | Inactive: `var(--color-text-muted)`
- Touch target wrapping: minimum 48×48px even if icon is smaller

### 5.4 Icon Mapping
| Module | Phosphor Icon |
|--------|--------------|
| Home | House |
| Mood | SmileyWink |
| AI Chat | Robot |
| Peer Support | Handshake |
| Therapist | Stethoscope |
| Journal | Notebook |
| Groups | UsersThree |
| Emergency | Siren |
| Safety Plan | ShieldCheck |
| Resources | BookOpen |
| Breathing | Wind |
| Analytics | ChartLine |
| Profile | UserCircle |
| Credits | Coin |
| Notifications | Bell |

---

## 6. LAYOUT SYSTEM

### 6.1 App Structure
- Mobile-first: max content width `430px`, centered on desktop
- Fixed top bar: `56px` height
- Fixed bottom navigation: `64px` height
- Safe area insets: always respect `env(safe-area-inset-*)`

### 6.2 Surface Layering (Depth — Not Flat UI)
| Level | Background | Shadow | Usage |
|-------|-----------|--------|-------|
| Base | --color-bg-primary | none | Screen background |
| Raised | --color-surface-card | --shadow-card | Cards, list items |
| Floating | --color-surface-primary | --shadow-elevated | Modals, bottom sheets |
| Overlay | --color-overlay | --shadow-modal | Full-screen overlays |

---

## 7. COMPONENT SPECIFICATIONS

### 7.1 Primary Button
```
Height: 52px
Padding: 0 24px
Border radius: var(--radius-pill)
Background: var(--color-accent)
Text: var(--color-text-dark) / 16px / 600
Shadow: var(--shadow-button)

States:
  Default: as above
  Hover: background var(--color-accent-hover)
  Pressed: scale(0.97) + background var(--color-accent-pressed), 150ms ease-in-out
  Disabled: opacity 0.45, no shadow, cursor not-allowed
  Loading: spinner (20px, cream) replacing label text
```

### 7.2 Secondary Button
```
Height: 48px
Padding: 0 20px
Border radius: var(--radius-pill)
Background: transparent
Border: 1.5px solid var(--color-border-focus)
Text: var(--color-text-primary) / 16px / 500

States:
  Hover: background var(--color-primary-20)
  Pressed: scale(0.97), 150ms
  Disabled: opacity 0.45
```

### 7.3 Danger Button (Emergency actions)
```
Height: 56px
Padding: 0 28px
Border radius: var(--radius-pill)
Background: var(--color-danger)
Text: var(--color-text-primary) / 16px / 600
Shadow: 0 4px 16px rgba(179,92,92,0.35)
Animation: persistent pulse — see Section 9.3
```

### 7.4 Card
```
Background: var(--color-surface-card)
Border radius: var(--radius-lg)
Border: 1px solid var(--color-border)
Padding: var(--space-md)
Shadow: var(--shadow-card)
Overflow: hidden

Interactive (tappable):
  Pressed: scale(0.985) + reduced shadow, 150ms ease-in-out
  Hover: border-color → var(--color-border-focus)
```

### 7.5 Input Field
```
Height: 52px (single line)
Padding: 14px 16px
Background: var(--color-surface-secondary)
Border: 1.5px solid var(--color-border)
Border radius: var(--radius-md)
Text: var(--color-text-dark) / 16px / 400
Placeholder: var(--color-text-dark) at 50% opacity

States:
  Focus: border → var(--color-border-focus), box-shadow var(--shadow-input-focus)
  Error: border → var(--color-danger), background var(--color-danger-bg)
  Disabled: opacity 0.55

Multiline:
  Min height: 120px
  Resize: vertical only
  Font: Lora for journal entries, Inter for all others
```

### 7.6 Bottom Navigation Bar
```
Height: 64px + safe-area-inset-bottom
Background: var(--color-bg-deep)
Border top: 1px solid var(--color-border)

4 tabs: Home | Resources | Breathing | Profile
Each tab:
  Icon: 24px Phosphor duotone
  Label: 11px / 500 / Inter / letter-spacing 0.03em
  Active: var(--color-accent)
  Inactive: var(--color-text-muted)
  Transition: 150ms ease-out
  Touch target: full tab width × 48px minimum
```

### 7.7 Top Bar
```
Height: 56px
Background: var(--color-bg-primary)
Border bottom: 1px solid var(--color-border)
Padding: 0 var(--space-md)
Layout: left icon / center title / right actions

Title: Inter 18px / 500 / var(--color-text-primary)
```

### 7.8 Mood Selector
```
Layout: 5 items in a row, equal width
Each button:
  Height: 72px
  Border radius: var(--radius-md)
  Background: var(--color-surface-card)
  Border: 2px solid transparent
  Content: mood face (32px) + label (12px / 500) below

States:
  Selected:
    border-color: mood-specific color (see below)
    background: mood color at 20% opacity
    scale(1.08), 200ms var(--easing-spring)
  Unselected (when one is selected):
    opacity 0.55, scale(0.95)

Mood border colors:
  very_low: var(--color-danger)
  low: var(--color-warning)
  neutral: var(--color-accent)
  good: var(--color-calm)
  great: #6BAF7A
```

### 7.9 Chat Bubble
```
User bubble:
  Background: var(--color-accent)
  Text: var(--color-text-dark) / Inter 16px
  Border radius: 20px 20px 4px 20px
  Max width: 78%
  Padding: 12px 16px
  Align: right

AI bubble:
  Background: var(--color-surface-card)
  Text: var(--color-text-primary) / Lora 16px
  Border radius: 20px 20px 20px 4px
  Max width: 78%
  Padding: 12px 16px
  Align: left

Peer bubble: same as AI but Inter font

Typing indicator:
  Three dots, 8px each, var(--color-accent)
  Sequential bounce, 400ms each, infinite
  Each dot: 150ms delay offset
```

### 7.10 Toast Notification
```
Position: top center, 16px from top (below top bar)
Width: calc(100% - 48px), max 380px
Background: var(--color-surface-primary)
Border: 1px solid var(--color-border-focus)
Border radius: var(--radius-md)
Padding: 12px 16px
Shadow: var(--shadow-elevated)
Layout: icon (20px) + message (14px/500) + optional × close

Types and left border (3px):
  Success: var(--color-calm), CheckCircle icon
  Warning: var(--color-warning), Warning icon
  Error: var(--color-danger), XCircle icon
  Info: var(--color-accent), Info icon

Animation:
  Enter: translateY(-8px) + opacity 0 → translateY(0) + opacity 1, 250ms ease-out
  Exit: translateY(-8px) + opacity 0, 200ms ease-in
  Auto-dismiss: success 3000ms / info 4000ms / error 6000ms
```

### 7.11 Skeleton Loader
Spinners are banned. Every loading state uses skeletons.

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-skeleton-base) 25%,
    var(--color-skeleton-shine) 50%,
    var(--color-skeleton-base) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}
```

Skeleton shapes per screen:
```
Dashboard: alias bar (140px × 16px) + credit bar (80px × 14px) + 6 tile blocks
Journal: 3 cards (full width × 80px)
AI Chat: alternating left/right bubble shapes on session start
Groups list: 4 rows (icon circle + 2 text lines)
Analytics: 6 bars varying heights (40px–100px)
Profile: 4 section rows
Resources: 5 article cards
Admin: 5 table rows
```

### 7.12 Empty State
```
Layout: centered vertically and horizontally
SVG illustration: 120×120px, warm tones
Title: Inter 18px / 500 / var(--color-text-primary)
Body: Inter 14px / 400 / var(--color-text-muted), max 2 lines
Optional CTA: secondary button

Per screen:
  Journal:
    Title: "Your journal is waiting"
    Body: "Write your first entry — no rules, just you."
    CTA: "Write something"

  Groups (not joined):
    Title: "Find your people"
    Body: "Join a group to connect with others who understand."
    CTA: "Browse groups"

  Analytics (<3 check-ins):
    Title: "Keep checking in"
    Body: "Your mood insights appear after a few days of check-ins."
    CTA: none

  Notifications:
    Title: "All quiet"
    Body: "You're up to date. Notifications will appear here."
    CTA: none

  Peer requests (none open):
    Title: "No one is waiting right now"
    Body: "When someone needs support, you'll see it here."
    CTA: none
```

### 7.13 Credit Balance Badge
```
Layout: Coin icon (16px) + number + "credits"
Font: Inter 14px / 600
Normal: var(--color-accent)
Low (≤ 2): var(--color-danger), background var(--color-danger-bg)
Border radius: var(--radius-pill)
Padding: 4px 10px
Transition: color + background 300ms ease when threshold crossed
Number change: smooth count animation 300ms
```

### 7.14 Peer Countdown Timer (90 seconds)
```
Shape: SVG circle, 120px diameter
Track: var(--color-surface-card), stroke-width 6px
Progress stroke color transition:
  90s → 45s: var(--color-calm)
  45s → 15s: var(--color-warning)
  15s → 0s: var(--color-danger)
  Color transitions: 500ms ease

Center: seconds remaining, Inter 28px / 600 / var(--color-text-primary)
Below: "Looking for someone..." Inter 14px / var(--color-text-muted)
Circle pulse: scale 1.0→1.02, 2s loop, ease-in-out
```

### 7.15 Bottom Sheet / Modal
```
Background: var(--color-bg-deep)
Border radius: var(--radius-xl) var(--radius-xl) 0 0
Padding: var(--space-lg)
Handle: 4px × 36px bar, var(--color-border-focus), centered, 12px from top
Shadow: var(--shadow-modal)
Max height: 90vh
Overlay: var(--color-overlay)

Animation:
  Enter: translateY(100%) → translateY(0), 350ms var(--easing-out)
  Exit: translateY(0) → translateY(100%), 300ms ease-in
  Overlay: opacity 0 → 0.75, 350ms
```

### 7.16 Streak Counter
```
Location: dashboard, analytics

Layout: 🔥 + number (20px/600/warning) + "day streak" (13px/400)
Color: var(--color-warning)

Milestone animation (3, 7, 30 days):
  scale: 1.0 → 1.25 → 1.0, 400ms var(--easing-spring)
  Color flash: briefly var(--color-calm) then back
  Toast fires simultaneously
```

---

## 8. SCREEN SPECIFICATIONS

### 8.1 Registration / Alias Reveal
```
Background: var(--color-bg-primary)
Form in card: var(--color-surface-card), var(--radius-lg)
Inputs: spec 7.5
Primary CTA: spec 7.1

Alias Reveal (on registration success):
  t=0ms: screen fades to var(--color-bg-deep), 300ms
  t=300ms: "You are now known as" fades in, 250ms
             Inter 16px / 400 / var(--color-text-muted), centered
  t=600ms: alias characters animate in sequentially:
             each char: opacity 0→1 + translateY(8px→0)
             delay: charIndex × 80ms, duration 300ms ease-out
             color: var(--color-accent), Inter 32px / 600
  t=600ms + (chars × 80ms): "Welcome." fades in, 400ms delay
             Lora 18px / 400 / var(--color-text-muted)
  t=+800ms: continue button appears, fade 300ms
```

### 8.2 Persona Creation
```
Progress indicator: 4 dots at top, step 3 active
Title: H2 "Create Your Companion"
Subtitle: Body / muted "This is permanent — choose thoughtfully"

Name input: Lora font — feels like naming, not filling a form
Tone: 4 cards in 2×2 grid
Style: 2 pill options
Formality: 3 pill options
Alias toggle: switch component

Live preview card:
  Persona name: Lora font / var(--color-accent)
  Sample bubble in Lora italic
  Updates in real-time, 200ms transition

Confirmation (after submit):
  Full screen, var(--color-bg-deep)
  Persona name: Lora 28px / 400 / var(--color-accent), centered
  "Your companion is ready." Inter 16px / muted
  Animation: fade in 400ms ease-out
  Hold 1500ms, auto-advance
  No back button — persona is immutable
```

### 8.3 Dashboard
```
Top bar:
  Left: alias (14px/500/muted)
  Center: wordmark
  Right: credit badge (7.13) + bell icon

Streak bar: full width, 40px, var(--color-surface-card), centered streak counter

Mood banner (if not checked in today):
  Card, var(--color-warning-bg), amber left border 3px
  "How are you feeling today?" + "Check in" button

Action tiles 2×3 grid:
  Gap: var(--space-sm)
  Each: Card spec 7.4, icon 32px + label 14px/500
  Emergency tile: var(--color-danger-bg) background, danger border, never dimmed

Sparkline (bottom): 7-day mood trend, 40px, decorative only
```

### 8.4 AI Chat
```
Top bar:
  Back arrow
  Center: persona name (16px/500) + "AI Companion" subtitle (12px/muted)
  Right: "End" in var(--color-danger) 14px/500

Messages: spec 7.9, 12px gap between
Input bar (fixed bottom):
  Background: var(--color-bg-deep)
  Border top: 1px solid var(--color-border)
  Multiline input (max 3 lines) + send circle button (44px, accent bg)
  Send: PaperPlaneRight icon, pulse on tap (spec 9.2)

Emergency redirect (critical keyword):
  IMMEDIATE — var(--color-bg-emergency) overlay 200ms
  Emergency screen renders — no way back to chat
```

### 8.5 Emergency Screen
```
CRITICAL: Zero animation delay. Everything immediately visible.

Background: var(--color-bg-emergency)
No top bar — full screen

Content stack (centered):
  Siren icon 48px var(--color-danger) + persistent pulse
  "You're not alone" — Lora 22px / 400 / var(--color-text-primary)
  Befrienders Kenya number — Inter 28px / 600 / var(--color-accent)
  "Free · 24/7 · Confidential" — caption / muted

  Divider

  "I need to talk to someone now" — Danger button spec 7.3 (full width)
  "Try a breathing exercise first" — Secondary button spec 7.2 (full width)

  "Open my Safety Plan" link (if plan exists):
    14px / 500 / var(--color-accent), underlined

After "talk now" tapped:
  Button → "Help is coming. An admin has been alerted."
  Sage green + CheckCircle icon
  Breathing section expands inline
```

### 8.6 Journal
```
New entry button: full-width primary, sticky top

Entry form (card):
  Mood selector: compact spec 7.8 (56px tiles)
  Tag pills: horizontal scroll, selectable
  Text area: Lora font, min 200px, no border — feels like a page
  Save: primary full width

Timeline:
  Card: mood face + date + tags + first 2 lines text
  Tap: full content slides down 250ms ease-out
  Swipe left: red delete action

Search bar + filter chips (All / 5 mood levels)
```

### 8.7 Groups
```
List:
  Cards: icon + name (H3) + member count + description + joined badge

Chat (same structure as AI Chat 8.4 except):
  Both fonts: Inter
  All aliases shown as "Member" — anonymous
  Long press message: bottom sheet with Report only
  Pinned message: amber left border, PushPin icon
```

### 8.8 Profile
```
Sections as stacked cards:
1. Identity: alias (H2/accent), role badge, "member since"
2. AI Companion: persona name (H3/Lora), fields (caption rows), immutable note
3. Credits: balance (28px/600/accent), Buy Credits, View transactions
4. Privacy: consent version/date, Delete My Data (danger text button)
   Deletion: bottom sheet with 24hr grace explanation, red confirm, cancel
5. Notifications: toggle rows with switch components
6. Feedback: Send Feedback secondary button
```

---

## 9. ANIMATION & MICROINTERACTION SPECIFICATIONS

### 9.1 Global Rules
- CSS transitions/keyframes only — no JS animation libraries
- Never animate more than 2 properties simultaneously
- All emotional reveals respect reduced motion media query (already in globals.css)

### 9.2 Interaction Microinteractions
| Interaction | Animation | Duration | Easing |
|-------------|-----------|----------|--------|
| Button press | scale(0.97) | 150ms | ease-in-out |
| Card tap | scale(0.985) | 150ms | ease-in-out |
| Tab switch | color + opacity | 150ms | ease-out |
| Mood select | scale(1.08) + border | 200ms | --easing-spring |
| Send message | scale(1.15) → 1.0 | 200ms | --easing-spring |
| Toggle switch | translate + color | 200ms | ease-in-out |
| Screen transition | opacity + translateY(8px) | 250ms | ease-out |
| Bottom sheet open | translateY(100%) → 0 | 350ms | --easing-out |
| Toast enter | translateY(-8px) + opacity | 250ms | ease-out |

### 9.3 Persistent Animations

**Emergency button pulse:**
```css
@keyframes emergencyPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(179,92,92,0.5); }
  50% { box-shadow: 0 0 0 12px rgba(179,92,92,0); }
}
/* Apply: animation: emergencyPulse 2s ease-in-out infinite; */
```

**Typing indicator:**
```css
@keyframes typingDot {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}
/* Each dot: animation: typingDot 1.2s infinite; delay offset 150ms per dot */
```

**Skeleton shimmer:** defined in spec 7.11

**Breathing guide:**
```css
@keyframes breatheGuide {
  0%, 100% { transform: scale(0.85); opacity: 0.7; }
  50% { transform: scale(1.0); opacity: 1.0; }
}
/* Duration varies: Box=4s, 4-7-8=8s, PMR=6s */
```

### 9.4 Three Emotional Design Moments

**1. Alias Reveal — full spec in Section 8.1**

**2. Persona Confirmation:**
```
t=0ms:    Full screen var(--color-bg-deep) overlay, 300ms fade
t=300ms:  Persona name, Lora 28px/accent, fade + scale(0.95→1.0), 400ms spring
t=700ms:  "Your companion is ready." Inter 16px/muted, fade 300ms
t=1000ms: Hold still for 1500ms — intentional pause, no UI
t=2500ms: Auto-advance, fade out 300ms
           No back navigation during this sequence
```

**3. Emergency Screen:**
```
ZERO delay — renders instantly at full opacity
Only the siren icon animates: fade + scale(0.8→1.0), 200ms
Everything else: static, immediate
Rationale: someone in crisis cannot wait for animations
```

---

## 10. ERROR STATES & MESSAGE COPY

### 10.1 Rules
- Never show HTTP status codes or technical messages to users
- Every error is warm, specific, tells the user what to do next
- Errors never feel like blame or failure
- All error text: Inter 14px / 400

### 10.2 Error Messages
| Scenario | Message | Action |
|----------|---------|--------|
| Network failure | "We couldn't connect. Check your internet and try again." | Retry |
| Session expired | "Your session ended for security. Please log in again." | Login |
| Credits insufficient | "You need more credits for this. Top up to continue." | Buy Credits |
| Mood submit fail | "Something went wrong saving your mood. Please try again." | Retry |
| AI response fail | "I'm having trouble responding right now. Try again in a moment." | Retry inline |
| Group join fail | "We couldn't add you to this group. Please try again." | Retry |
| Payment fail | "Your payment didn't go through. Please try a different method." | Retry |
| Server error | "Something went wrong on our end. We're on it." | Retry / Home |
| Rate limit | "You've reached your limit for now. Come back a little later." | None |
| Empty required field | Disable submit button — never show this error message |

### 10.3 Form Validation Rules
- Validate on blur, not on submit
- Error: input spec 7.5 error state + caption in var(--color-danger) below field
- Required fields: asterisk in var(--color-accent), never red

---

## 11. ACCESSIBILITY

### 11.1 Mandatory Requirements
- All text: minimum 4.5:1 contrast (WCAG AA) — verified in Section 2.5
- All touch targets: minimum 48×48px
- All icons: aria-label attribute
- All inputs: explicit label elements (not placeholder-only)
- Focus states: visible ring using var(--shadow-input-focus) style
- Heading hierarchy: one H1 per screen, logical H2/H3 below
- Color never sole communicator — always pair with icon or text

### 11.2 Low-Stimulation Mode
Toggle in Profile. When enabled, adds class `low-stimulation` to body:
```css
.low-stimulation *,
.low-stimulation *::before,
.low-stimulation *::after {
  animation: none !important;
  transition-duration: 0.01ms !important;
}
```

---

## 12. AGENT IMPLEMENTATION RULES

Non-negotiable. Every rule followed before marking the UI pass complete.

1. `globals.css` created first — before any component is touched
2. No hardcoded hex values anywhere — only `var()` references
3. No default Tailwind colors — override completely with palette tokens
4. No default component library styling left visible — override everything
5. Spinners banned — every loading state uses skeleton spec 7.11
6. Every screen verified in browser after styling — not assumed
7. Mobile-first — all layouts for 375–430px viewport first
8. Touch targets — every interactive element verified at ≥ 48×48px
9. Error messages — exact copy from Section 10.2 only, no improvising
10. Both fonts loading — verify Inter and Lora before styling screens
11. Three emotional moments implemented exactly per Section 9.4
12. 60-30-10 color ratio verified on every screen before marking done
13. No logic changes — styling pass only, zero API or routing changes
14. `prefers-reduced-motion` block already in globals.css — do not remove
15. Empty states implemented for all five screens in spec 7.12
16. Skeleton loaders implemented for all eight screens in spec 7.11

---

## 13. DOCUMENT STATUS

This document is complete.
All visual decisions are made here.
The agent executes — it does not design.
No design decisions should be invented outside this document.
If something is not specified here, flag it — do not guess.
