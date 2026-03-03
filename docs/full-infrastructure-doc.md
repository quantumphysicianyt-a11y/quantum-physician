# QP Admin Panel — Full Infrastructure Documentation

**Last updated:** Session 25 (Mar 2, 2026)

---

## System Architecture Overview

### Hosting
- **QP Admin**: `qp-homepage.netlify.app/admin/` — Split into index.html + admin.css + admin.js
- **QP Member Portal**: `qp-homepage.netlify.app/members/` — Login, dashboard, settings, reset-password (SESSION 25)
- **QP Referral Hub**: `qp-homepage.netlify.app/referral-hub.html`
- **QP Sessions Page**: `qp-homepage.netlify.app/pages/one-on-sessions.html` — Public booking page with dynamic status (SESSION 23)
- **Fusion Admin**: `fusionsessions.com/admin.html` — Stays untouched until QP has full parity
- **Academy**: `qp-homepage.netlify.app/academy/`
- **Fusion Sessions**: `fusionsessions.com`

### Backend Services
- **Supabase** (rihlrfiqokqrlmzjjyxj): Database, auth, RLS policies, storage (avatars bucket)
- **Stripe**: Payment processing (shared account for both platforms)
- **Netlify**: Hosting + serverless functions (QP repo + Fusion repo)
- **Google Apps Script**: Email sending (3 scripts), Stripe webhook handling
- **Vimeo**: Video hosting for Fusion session recordings

### Repo: `quantum-physician` (in ~/Downloads/quantum-physician/)
```
quantum-physician/
├── _headers
├── admin/
│   ├── index.html             # Admin panel HTML (~555 lines)
│   ├── admin.css              # Admin panel styles
│   └── admin.js               # Admin panel logic (~4789 lines)
├── academy/
│   ├── builder.html, course.html, dashboard.html, index.html
│   ├── learn.html, login.html, preview.html, reset-password.html
│   ├── schedule.html, seed-course.html
│   ├── css/academy.css
│   └── js/
├── assets/
├── components/
│   ├── footer.html
│   └── header.html            # Updated: login/signup links (SESSION 25)
├── css/shared.css
├── docs/
│   ├── admin-master-plan.md
│   ├── full-infrastructure-doc.md
│   ├── fusion-gap-analysis.md
│   ├── session-system-design.md
│   └── session-26-crm-plan.md # NEW (SESSION 25) — Patient Portal build plan
├── js/
│   ├── events-panel.js
│   └── shared.js              # UPDATED: Auth-aware header with avatar dropdown (SESSION 25)
├── members/                   # NEW DIRECTORY (SESSION 25)
│   ├── login.html             # Auth gateway (sign in / create account / forgot password)
│   ├── dashboard.html         # Main member hub (sidebar + customizable cards)
│   ├── settings.html          # Profile, avatar, password, notifications
│   └── reset-password.html    # Password reset handler
├── netlify/functions/
│   ├── academy-checkout.js
│   ├── academy-webhook.js
│   ├── admin-auth.js
│   ├── admin-proxy.js         # Server-side proxy for all admin ops
│   ├── session-checkout.js    # Stripe checkout for 1-on-1 sessions (SESSION 24)
│   ├── session-webhook.js     # Payment webhook for 1-on-1 sessions (SESSION 24)
│   └── stripe-refund.js
├── pages/
│   ├── _template.html
│   ├── health.html
│   ├── one-on-sessions.html   # Public booking page (SESSION 23)
│   └── self-hope.html
├── netlify.toml
├── index.html                 # QP homepage
└── referral-hub.html
```

---

## Authentication System

### Admin Login Flow
1. User enters email + password on admin login screen
2. `admin-auth.js` Netlify function: `signInWithPassword()` → check `admin_users` → return `{success, admin, token}`
3. Fallback: Direct `sb.auth.signInWithPassword()` if function unavailable
4. Token stored: `sessionStorage` (qp_admin_token, qp_admin_refresh, qp_admin_auth)

### Member Auth Flow (SESSION 25)
1. User visits `/members/login.html` → Sign In or Create Account
2. Supabase `signInWithPassword()` or `signUp()` with `full_name` in user_metadata
3. On signup: auto-creates `profiles` row via Supabase trigger (or manual insert)
4. Session stored in Supabase localStorage (domain-specific)
5. All member pages check `sb.auth.getSession()` → redirect to login if no session
6. `onAuthStateChange('SIGNED_OUT')` → redirect to login with `?session_expired=true`

### Auth-Aware Shared Header (SESSION 25)
- `js/shared.js` — after loading shared header, checks Supabase session
- **Logged out**: header unchanged (Sign Up / Login links remain)
- **Logged in**: replaces Sign Up/Login with avatar circle → dropdown (Member Dashboard, Academy Dashboard, Book a Session, Account Settings, Sign Out)
- Requires Supabase JS SDK on the page — silently skips if not loaded
- Styles injected dynamically via `<style id="qp-auth-styles">`

### Cross-Domain SSO (SESSION 25 — PARTIAL)
- **QP → Fusion**: `goToFusion()` grabs session tokens, appends to URL hash:
  `https://fusionsessions.com/dashboard.html#access_token=XXX&refresh_token=YYY&type=sso`
- **Fusion receiver**: NOT YET ADDED — needs snippet in Fusion dashboard.html to call `supabase.auth.setSession()` from hash params
- Limitation: Supabase sessions are in localStorage which is domain-specific

### Token Auto-Refresh (SESSION 20)
- `onAuthStateChange` listener + `adminProxy` 401 retry + 45-minute background interval + session restore on load

### Admin Proxy (`admin-proxy.js`)
- Single Netlify function handling ALL admin Supabase operations
- **Dual clients**: `sbAnon` (validates caller) + `sbAdmin` (performs operations)
- **Allowlisted tables (25)**: admin_audit_log, admin_notes, admin_users, email_campaigns, email_log, email_tracking, profiles, promotions, purchases, qa_enrollments, qa_profiles, qa_bundles, qa_bundle_courses, qa_courses, qa_lessons, qa_modules, referral_codes, scheduled_emails, session_schedule, session_config, session_cycles, session_availability, session_clients, session_bookings, session_waitlist
- **Write safety**: All writes require filter conditions

---

## Member Portal Architecture (SESSION 25)

### Design System
- **Colors**: Navy (#0e1a30, #0a1424, #12223d), Teal (#5ba8b2, #4acfd9), Gold (#c9a96e), Taupe (#ad9b84)
- **Fonts**: Playfair Display (headings), Lato (body)
- **Icons**: SVG sprite system — NO emojis. Icons as `<symbol>` in hidden `<svg>`, referenced via `<use href="#i-xxx"/>`. Feather/Lucide style, stroke-based, 2px stroke-width, round caps/joins.
- **Layout**: Fixed sidebar (260px) + scrollable main content. Matches Academy dashboard.

### Sidebar Structure
```
[QP Logo]
[Avatar + Name + Email]
[Referral Code Card]
──────────
Dashboard (active)
Book a Session
Academy
Fusion Sessions
Account Settings
──────────
Main Site
──────────
[Sign Out]
```

### Customizable Dashboard Cards
6 available, user picks 3. Saved to localStorage key `qp_dash_cards`.
Default: `['sessions', 'learning', 'progress']`

| Card | Data Source | Key Query |
|------|-----------|-----------|
| Upcoming Sessions | `session_bookings` | `.eq('email', userEmail).in('status', ['proposed','paid','confirmed'])` |
| Upcoming Events | `session_schedule` | `.gte('session_date', today)` |
| Continue Learning | `qa_enrollments` + `qa_courses` | `.eq('user_id', userId).order('updated_at', {ascending:false}).limit(1)` |
| Community | `discussion_posts` | `.order('created_at', {ascending:false}).limit(3)` |
| Live Events | `session_schedule` | `.eq('session_date', today)` |
| Recent Progress | `qa_enrollments` + `qa_lesson_progress` | `.eq('user_id', userId)` |

### Referral Card
- Lookup: `referral_codes.eq('email', userEmail.toLowerCase())` — NOT by user_id
- Shows: code, credit_balance, total_earned, successful_referrals
- Earning info: "$10 per session referral, $25 per bundle referral"
- Link: `/referral-hub.html?brand=academy` (teal theme)

### Avatar System
- Storage: Supabase `avatars` bucket (public, already exists)
- Upload path: `avatars/{user_id}.{ext}` (jpg/png, max 2MB)
- Public URL stored in `profiles.avatar_url`
- Fallback: initials from `profiles.full_name`

---

## Email System Architecture

### Email Sending (ALL emails go through Google Apps Script)
- `APPS_SCRIPT_URL` in admin.js (~line 833)
- `mode:'no-cors'` — response is opaque, can't confirm delivery

### 3 Google Apps Scripts
1. **Stripe Webhook Handler** — Handles checkout.session.completed, routes Fusion vs Academy
2. **Fusion Sessions Email Automation** — Runs every 15 min via time trigger
3. **Bulk Email Sender v3** — Called by admin Email Center, test emails, Offer Slot test sends

---

## 1-on-1 Sessions System (SESSION 23-24)

### Database Tables
| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `session_config` | session_price, session_duration_minutes, booking_buffer_minutes, public_booking_status, public_booking_opens_at, timezone, zoom_link | Global settings |
| `session_cycles` | name, start_date, end_date, status | 4-month booking cycles |
| `session_availability` | cycle_id, date, start_time, end_time, status, visibility | Daily time blocks |
| `session_clients` | email, name, frequency, preferred_day, preferred_time, priority, status | Recurring client roster |
| `session_bookings` | cycle_id, client_id, email, name, date, start_time, end_time, status, type, stripe_payment_id, confirmation_token, proposed_at, confirmed_at | Individual appointments |
| `session_waitlist` | email, name, preferred_days, preferred_times, message, status, notified_at | Public waitlist |

### Booking Status Flow
```
proposed → paid → completed / cancelled / no_show
proposed → declined (slot freed)
proposed → expired (72 hours without payment)
```

---

## Supabase Storage Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `avatars` | PUBLIC | User profile photos (SESSION 25) |
| `course-videos` | Private (2 policies) | Academy video content |
| `course-files` | Private (2 policies) | Academy downloadable files |
| `course-thumbnails` | PUBLIC | Academy course thumbnail images |
| `achievements` | PUBLIC | Achievement badge images |

---

## Key Constants & Variables

### Member Portal (SESSION 25)
- Supabase URL: `https://rihlrfiqokqrlmzjjyxj.supabase.co`
- Supabase Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (same across all QP pages)
- Login URL: `/members/login.html`
- Card preferences key: `qp_dash_cards` (localStorage)
- Default active cards: `['sessions', 'learning', 'progress']`

### admin.js Global State
- `sessConfigData`, `sessCyclesData`, `sessAvailData`, `sessClientsData`, `sessBookingsData`, `sessWaitlistData`
- `sessSelectedCycleId`, `sessAvailMonth`, `sessAvailYear`

---

## File Sizes (Session 25)
- `admin/index.html` — ~555 lines (unchanged)
- `admin/admin.js` — ~4789 lines (unchanged)
- `admin/admin.css` — ~142 lines (unchanged)
- `pages/one-on-sessions.html` — ~1333 lines (unchanged)
- `members/login.html` — ~NEW
- `members/dashboard.html` — ~NEW (sidebar layout, ~500+ lines)
- `members/settings.html` — ~NEW (~400+ lines)
- `members/reset-password.html` — ~NEW
- `js/shared.js` — UPDATED (~200 lines, was ~45)
- `netlify/functions/session-checkout.js` — ~240 lines
- `netlify/functions/session-webhook.js` — ~300 lines

---

## Netlify Functions (7)
| Function | Purpose | Auth |
|----------|---------|------|
| `admin-proxy.js` | All admin Supabase operations | Bearer token → admin_users check |
| `admin-auth.js` | Admin login | Email + password → Supabase auth |
| `academy-checkout.js` | Academy Stripe checkout sessions | Public |
| `academy-webhook.js` | Academy Stripe webhook handler | Stripe signature |
| `stripe-refund.js` | Process Stripe refunds | Bearer token |
| `session-checkout.js` | Create Stripe checkout for session bookings | Public |
| `session-webhook.js` | Handle session payment → update booking to `paid` | Stripe signature |

---

## Session 26-27 Additions

### New Database Tables (5)
| Table | Purpose | RLS |
|-------|---------|-----|
| session_notes | Per-booking practitioner notes | Admin write, patient read (if visible_to_patient=true) |
| session_recordings | Zoom recording metadata per booking | Admin write, patient read |
| patient_intake | Health questionnaire responses (30+ fields) | Patient CRUD own row |
| patient_checkins | Self-reported symptom tracking (jsonb) | Patient CRUD own rows |
| patient_progress_notes | Longitudinal alignment/milestone/observation notes | Admin write, patient read |

### New Member Portal Pages (4)
| Page | Lines | Purpose |
|------|-------|---------|
| members/sessions.html | ~551 | Upcoming/Past/All session cards with status badges |
| members/intake.html | ~751 | 5-section health intake form with auto-save |
| members/progress.html | ~700 | Symptom chart, energy/sleep chart, before/after card, check-in log |
| members/billing.html | ~332 | Purchase history with totals |

### Admin CRM: Client Profiles Tab
- Client list with search/filter/sort/pagination
- Client detail view with 5 sub-tabs: Sessions, Intake, Progress, Billing, Notes
- Inline note adding, recording adding, visibility toggles
- All actions logged to admin_audit_log

### Cross-Domain SSO (Fixed)
- QP goToFusion() passes access_token + refresh_token in URL hash
- Fusion boot() checks hash for SSO tokens before getSession()
- Calls setSession(), clears hash, proceeds to normal flow
- Commit: 84cc1d2 (Fusion repo)

### Progress Page Features
- Chart.js symptom tracking with time range filters (1mo/3mo/6mo/All)
- Energy & Sleep Recovery chart (inverse trend)
- Before/After Healing Journey card with Scores/% Change toggle
- Quick Stats dropdown (Overview / Top Symptoms / Wellness Scores)
- Milestone markers from practitioner notes
- All chart sections collapsible (collapsed by default)

---

## Known Issues (Session 27)
1. **email-decode.min.js 404** — Netlify phantom, harmless.
2. **Test email delivery** — `mode:'no-cors'` means no confirmation. Check inbox manually.
3. **Rich editor → email fidelity** — Advanced formatting may not render in all clients.
4. **Token refresh first-login** — After deploying auth changes, must log out + back in once.
5. **Dead code from Session 19-20** — Old EC overrides still present. Low priority cleanup.
6. **Webhook untested with real payment** — session-webhook.js deployed but awaiting first real Stripe payment.
7. **Calendar needs active cycle** — Frontend shows "filled" when all cycles completed. Intentional.
8. **Cross-domain SSO working** — QP→Fusion deployed and tested (Session 27). Fusion→QP not yet needed.
9. **notification_preferences columns** — Need to verify boolean columns exist for settings page toggles.
10. **Stripe checkout formatting** — Stripe ignores `\n` in descriptions.
