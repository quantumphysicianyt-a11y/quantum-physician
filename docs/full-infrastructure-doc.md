# QP Admin Panel — Full Infrastructure Documentation

**Last updated:** Session 30 (Mar 4, 2026)

---

## System Architecture Overview

### Hosting
- **QP Admin**: `qp-homepage.netlify.app/admin/` — Split into index.html + admin.css + admin.js
- **QP Member Portal**: `qp-homepage.netlify.app/members/` — Login, dashboard, settings, reset-password, sessions, intake, progress, billing
- **QP Referral Hub**: `qp-homepage.netlify.app/referral-hub.html`
- **QP Sessions Page**: `qp-homepage.netlify.app/pages/one-on-sessions.html` — Public booking page with dynamic status
- **Fusion Admin**: `fusionsessions.com/admin.html` — Stays untouched until QP has full parity
- **Academy**: `qp-homepage.netlify.app/academy/`
- **Fusion Sessions**: `fusionsessions.com`

### Backend Services
- **Supabase** (rihlrfiqokqrlmzjjyxj): Database, auth, RLS policies, storage (avatars + session-recordings buckets)
- **Stripe**: Payment processing (shared account for both platforms)
- **Netlify**: Hosting + serverless functions (QP repo + Fusion repo)
- **Google Apps Script**: Email sending (3 scripts), Stripe webhook handling
- **Vimeo**: Video hosting for Fusion session recordings + optional session recording hosting

### Repo: `quantum-physician` (in ~/Downloads/quantum-physician/)
```
quantum-physician/
├── _headers
├── admin/
│   ├── index.html             # Admin panel HTML (~849 lines) — UPDATED SESSION 30
│   ├── admin.css              # Admin panel styles (~142 lines)
│   └── admin.js               # Admin panel logic (~5936 lines) — UPDATED SESSION 30
├── academy/
│   ├── builder.html, course.html, dashboard.html, index.html
│   ├── learn.html, login.html, preview.html, reset-password.html
│   ├── schedule.html, seed-course.html
│   ├── css/academy.css
│   └── js/
├── assets/
├── components/
│   ├── footer.html
│   └── header.html            # Updated: login/signup links
├── css/shared.css
├── docs/
│   ├── admin-master-plan.md
│   ├── full-infrastructure-doc.md
│   ├── fusion-gap-analysis.md
│   ├── session-system-design.md
│   └── session-26-crm-plan.md
├── js/
│   ├── events-panel.js
│   ├── GLTFLoader.min.js
│   └── shared.js              # Auth-aware header with avatar dropdown
├── members/
│   ├── login.html             # Auth gateway
│   ├── dashboard.html         # Main member hub (sidebar + cards) (~734 lines)
│   ├── settings.html          # Profile, avatar, password, notifications
│   ├── reset-password.html    # Password reset handler
│   ├── sessions.html          # Sessions & Recordings (~649 lines) — UPDATED SESSION 28
│   ├── intake.html            # Health intake form (~751 lines)
│   ├── progress.html          # Progress tracker (~700 lines)
│   └── billing.html           # Billing history (~332 lines)
├── netlify/functions/
│   ├── academy-checkout.js
│   ├── academy-webhook.js
│   ├── admin-auth.js
│   ├── admin-proxy.js         # Server-side proxy for all admin ops (32 tables)
│   ├── session-checkout.js    # Stripe checkout for 1-on-1 sessions
│   ├── session-cron.js        # Daily automated emails (8 AM ET) — NEW SESSION 30
│   ├── session-webhook.js     # Payment webhook for 1-on-1 sessions
│   └── stripe-refund.js
├── pages/
│   ├── one-on-sessions.html   # Public booking page (~1333 lines)
│   └── ...
├── netlify.toml
├── index.html                 # QP homepage
└── referral-hub.html
```

---

## Authentication System

### Admin Login Flow
1. User enters email + password on admin login screen
2. `admin-auth.js` Netlify function: `signInWithPassword()` → check `admin_users` → return `{success, admin, token}`
3. Token stored: `sessionStorage` (qp_admin_token, qp_admin_refresh, qp_admin_auth)

### Member Auth Flow
1. User visits `/members/login.html` → Sign In or Create Account
2. Supabase `signInWithPassword()` or `signUp()` with `full_name` in user_metadata
3. Session stored in Supabase localStorage (domain-specific)
4. All member pages check `sb.auth.getSession()` → redirect to login if no session

### Cross-Domain SSO (WORKING — Session 27)
- **QP → Fusion**: `goToFusion()` passes access_token + refresh_token in URL hash
- **Fusion receiver**: checks hash for SSO tokens before getSession(), calls setSession(), clears hash
- **Fusion → QP**: Not yet implemented (not yet needed)

### Admin Proxy (`admin-proxy.js`)
- Single Netlify function handling ALL admin Supabase operations
- **Dual clients**: `sbAnon` (validates caller) + `sbAdmin` (performs operations)
- **Allowlisted tables (32)**: admin_audit_log, admin_notes, admin_users, email_campaigns, email_log, email_tracking, profiles, promotions, purchases, qa_enrollments, qa_profiles, qa_bundles, qa_bundle_courses, qa_courses, qa_lessons, qa_modules, referral_codes, scheduled_emails, session_schedule, session_config, session_cycles, session_availability, session_clients, session_bookings, session_waitlist, session_notes, session_recordings, patient_intake, patient_checkins, patient_progress_notes, email_automation_log, system_config

---

## Database Tables (30 tables + admin_users + auth.users)

### Session System Tables (6 — Session 23-24)
| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `session_config` | session_price, session_duration_minutes, public_booking_status, timezone, zoom_link | Global settings |
| `session_cycles` | name, start_date, end_date, status | 4-month booking cycles |
| `session_availability` | cycle_id, date, start_time, end_time, status, visibility | Daily time blocks |
| `session_clients` | email, name, frequency, preferred_day, preferred_time, priority, status | Recurring client roster |
| `session_bookings` | cycle_id, client_id, email, date, start_time, end_time, status, type, stripe_payment_id, confirmation_token | Individual appointments |
| `session_waitlist` | email, name, preferred_days, preferred_times, message, status | Public waitlist |

### Patient CRM Tables (5 — Session 26)
| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `session_notes` | booking_id, note_type, content, body_regions (jsonb), visible_to_patient | Per-session practitioner notes |
| `session_recordings` | booking_id, recording_url, title, duration_minutes, **uploaded_at**, source_type, file_path, file_size_mb | Video recordings per booking |
| `patient_intake` | user_id, 30+ fields, symptoms (jsonb) | Health intake questionnaire |
| `patient_checkins` | user_id, symptoms (jsonb), energy, sleep | Patient self-reported progress |
| `patient_progress_notes` | user_id, note_type (alignment/milestone/observation), content | Longitudinal practitioner notes |

**⚠️ IMPORTANT**: `session_recordings` uses `uploaded_at` as the timestamp column, NOT `created_at`. All order-by queries must use `uploaded_at`.

### Automation & Config Tables (2 — Session 30)
| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `email_automation_log` | booking_id, email, automation_type, status, error_message, sent_at | Tracks every automated email send. UNIQUE on (booking_id, automation_type) for idempotency. |
| `system_config` | key (PK), value (jsonb), updated_at, updated_by | Key-value store for automation toggle states and system settings |

### Existing Tables (17 + admin_users)
| Table | Purpose |
|-------|---------|
| `purchases` | All transactions |
| `referral_codes` | Referral system (keyed by email, NOT user_id) |
| `profiles` | User profiles (includes avatar_url) |
| `credit_history` | Credit audit trail |
| `notification_preferences` | Member notification toggles |
| `qa_enrollments` | Academy enrollments |
| `qa_courses`, `qa_lessons`, `qa_modules` | Course catalog |
| `qa_lesson_progress` | Lesson completion |
| `admin_notes` | Admin notes per customer |
| `discussion_posts`, `qa_discussions` | Community forums |
| `email_campaigns`, `email_tracking`, `email_log` | Email system |
| `promotions` | Promo codes |
| `scheduled_emails` | Automated email queue |
| `session_schedule` | Fusion session dates/Zoom info |
| `admin_users` | Admin accounts + permissions |

---

## Supabase Storage Buckets

| Bucket | Access | Purpose | Added |
|--------|--------|---------|-------|
| `avatars` | PUBLIC (4 policies) | User profile photos | Session 25 |
| `session-recordings` | PUBLIC read, authenticated write/delete | Session recording MP4 uploads | Session 28 |
| `course-videos` | Private (2 policies) | Academy video content | Earlier |
| `course-files` | Private (2 policies) | Academy downloadable files | Earlier |
| `course-thumbnails` | PUBLIC | Academy course thumbnails | Earlier |
| `achievements` | PUBLIC | Achievement badge images | Earlier |

---

## Admin Panel Architecture (Session 29)

### CRM Merged into Clients Tab (Session 29)
- **Client Profiles sidebar entry REMOVED** — CRM only accessible through 1-on-1 Sessions → Clients tab
- **Sub-navigation**: "Client Roster" | "All Client Profiles" buttons at top of Clients tab
- **Three views**: `client-view-roster`, `client-view-all`, `crm-detail-view`
- **`switchClientView(view, btn)`** — toggles between roster and all profiles
- **`crmOpenClient(email)`** — hides both sub-views, shows 5-tab detail view, dims sub-nav
- **`crmBackToList()`** — returns to active sub-view (tracked by `clientSubView` global: 'roster'|'all')
- **Client cards are clickable** — whole card triggers `crmOpenClient()`, action buttons use `stopPropagation`

### Session Email Automation (Session 29 + 30)
- **"1-on-1 Reminders" sub-tab** in Email Automation page
- **4 toggle cards**: Day-Before, Post-Session Follow-Up, Intake Nudge, 72-Hour Expiry
- **Toggles persisted to `system_config` table** — `toggleAutomationConfig(key, checkbox)` writes to DB on every change (Session 30)
- **`loadSessionRemindersTab()`** — loads config from `system_config`, loads bookings data, renders reminders, loads automation log
- **`renderSessionReminders()`** — scans `sessBookingsData` for upcoming paid (tomorrow highlighted) and recently completed (last 7 days)
- **`buildSessionReminderHtml(type, booking)`** — QP-branded HTML templates for day-before and follow-up
- **`sendSessionReminder(type, bookingId, email)`** — sends via Apps Script, logs to `email_automation_log` for dedup with cron
- **Automation Log Viewer** — `loadAutomationLog()` shows last 50 automated sends with type/status badges (Session 30)
- **Netlify Cron**: `session-cron.js` runs daily at 8 AM ET, checks `system_config` for enabled automations, queries bookings, checks `email_automation_log` for already-sent, sends via new Apps Script, logs results
- **Idempotent**: UNIQUE INDEX on `(booking_id, automation_type)` + `alreadySent()` pre-check

### Key Global Variables (admin.js)
```javascript
var sessConfigData, sessCyclesData, sessAvailData, sessClientsData;
var sessBookingsData, sessWaitlistData, sessNotesData, sessRecsData;
var crmCurrentClient; // Currently viewed client in CRM
var clientSubView = 'roster'; // Active sub-view: 'roster' or 'all'
var crmBookings, crmNotes, crmRecordings, crmIntake, crmCheckins, crmProgressNotes;
```

### Helper Functions Added (Session 29)
```javascript
function fmtTime(t) // Converts "14:00:00" → "2:00 PM"
function filterCrmProgress() // Filters check-ins and practitioner notes by keyword/date/type
function toggleCrmBookingDetails(bookingId) // Expands/collapses notes+recordings in CRM Sessions tab
function crmDeleteInternalNote(id) // Renamed from duplicate crmDeleteNote
```

### refreshBookingsView() — THE Standard Refresh (Session 28)
All bookings tab actions MUST call this function instead of individual table refreshes.

### Body Regions System (Session 28)
- 28 standard bone-accurate regions extracted from GLB skeleton
- Stored as jsonb array on `session_notes.body_regions`
- Custom regions: user enters label + picks "nearest standard region" for 3D positioning

---

## Email System Architecture

### ⚠️ CRITICAL ARCHITECTURE DECISION (Session 29)
**Four self-contained email pipelines — never cross-contaminate:**

| Pipeline | Script | Template | Trigger | Status |
|----------|--------|----------|---------|--------|
| **Fusion Sessions** | FusionSessionsAutomation | Purple/neon | Apps Script cron (15 min) | ✅ Working |
| **Academy/Marketing** | BulkEmailSender v3 | Purple/neon + custom HTML | Manual from admin Email Center | ✅ Working |
| **1-on-1 Sessions** | QP Session Email Sender | QP teal/taupe, Georgia serif | Netlify cron (daily 8AM ET) → Apps Script | ✅ Built (Session 30) |
| **QP General** | TBD | QP branded | Transactional | ⬜ Future |

### Email Sending (ALL emails go through Google Apps Script)
- `APPS_SCRIPT_URL` in admin.js — BulkEmailSender v3 (for manual admin sends)
- `SESSION_EMAIL_SCRIPT_URL` env var — QP Session Email Sender (for cron)
- Manual admin sends: `mode:'no-cors'` — response is opaque
- Cron sends: server-side `fetch()` — gets full HTTP response

### 4 Google Apps Scripts (current)
1. **Stripe Webhook Handler** — Handles checkout.session.completed, routes Fusion vs Academy
2. **Fusion Sessions Email Automation** — `processScheduledEmails()` runs every 15 min via time trigger, reads `scheduled_emails` table
3. **Bulk Email Sender v3** — Called by admin Email Center, test emails, Offer Slot sends. Supports both plain text (auto-styled) and pre-built HTML
4. **QP Session Email Sender** (NEW Session 30) — Pipeline #3, called by `session-cron.js` and admin manual sends. Handles `sendSessionEmail` action. Deployment URL stored in `SESSION_EMAIL_SCRIPT_URL` env var.

---

## Netlify Functions (8)
| Function | Purpose | Auth |
|----------|---------|------|
| `admin-proxy.js` | All admin Supabase operations (32 tables) | Bearer token → admin_users check |
| `admin-auth.js` | Admin login | Email + password → Supabase auth |
| `academy-checkout.js` | Academy Stripe checkout sessions | Public |
| `academy-webhook.js` | Academy Stripe webhook handler | Stripe signature |
| `stripe-refund.js` | Process Stripe refunds | Bearer token |
| `session-checkout.js` | Create Stripe checkout for session bookings | Public |
| `session-webhook.js` | Handle session payment → update booking to `paid` | Stripe signature |
| `session-cron.js` | Daily automated emails for 1-on-1 sessions (8 AM ET) | Scheduled (cron) |

---

## Member Portal Architecture

### Design System
- **Colors**: Navy (#0e1a30, #0a1424, #12223d), Teal (#5ba8b2, #4acfd9), Gold (#c9a96e), Taupe (#ad9b84)
- **Fonts**: Playfair Display (headings), Lato (body)
- **Icons**: SVG sprite system — NO emojis. `<symbol>` elements referenced via `<use href="#i-xxx"/>`
- **Layout**: Fixed sidebar (260px) + scrollable main content

### SVG Icons Available in sessions.html
i-cal, i-video, i-book, i-chat, i-user, i-zap, i-settings, i-home, i-gift, i-logout, i-arrow, i-chevron, i-check, i-heart, i-layers, i-play, i-link, i-download, i-note, i-chart

---

## Known Issues (Session 30)
1. **email-decode.min.js 404** — Netlify phantom, harmless.
2. **Test email delivery** — `mode:'no-cors'` means no confirmation for manual admin sends. Cron runs server-side.
3. **Automation toggles persisted** — ✅ Fixed Session 30. Wired to `system_config` table.
4. **Cron needs env var** — `SESSION_EMAIL_SCRIPT_URL` must be set in Netlify for cron to work.
5. **Webhook untested with real payment** — session-webhook.js awaiting first real Stripe payment.
6. **Cross-domain SSO** — QP→Fusion working. Fusion→QP not yet implemented.
7. **notification_preferences columns** — Need to verify boolean columns exist.
8. **GitHub intermittent 500s** — Retry or manual Netlify deploy.
9. **Zoom recordings can't embed** — Download MP4 and upload instead.
10. **Supabase Free plan 1GB limit** — ~3-4 session recordings before hitting cap.
11. **session_recordings.uploaded_at** — NOT created_at. All queries must use uploaded_at.
12. **`patient_intake` email column** — Cron checks intake by email, but table may use `user_id` instead. Cron falls back to `client_id` check.
