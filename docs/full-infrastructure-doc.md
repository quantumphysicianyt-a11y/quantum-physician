# QP Admin Panel — Full Infrastructure Documentation

**Last updated:** Session 29 (Mar 3, 2026)

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
│   ├── index.html             # Admin panel HTML (~773 lines)
│   ├── admin.css              # Admin panel styles (~142 lines)
│   └── admin.js               # Admin panel logic (~5471 lines)
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
│   ├── admin-proxy.js         # Server-side proxy for all admin ops (30 tables)
│   ├── session-checkout.js    # Stripe checkout for 1-on-1 sessions
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
- **Allowlisted tables (30)**: admin_audit_log, admin_notes, admin_users, email_campaigns, email_log, email_tracking, profiles, promotions, purchases, qa_enrollments, qa_profiles, qa_bundles, qa_bundle_courses, qa_courses, qa_lessons, qa_modules, referral_codes, scheduled_emails, session_schedule, session_config, session_cycles, session_availability, session_clients, session_bookings, session_waitlist, session_notes, session_recordings, patient_intake, patient_checkins, patient_progress_notes

---

## Database Tables (28 tables + admin_users + auth.users)

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
| `session-recordings` | PUBLIC read, authenticated write/delete | Session recording MP4 uploads | **Session 28** |
| `course-videos` | Private (2 policies) | Academy video content | Earlier |
| `course-files` | Private (2 policies) | Academy downloadable files | Earlier |
| `course-thumbnails` | PUBLIC | Academy course thumbnails | Earlier |
| `achievements` | PUBLIC | Achievement badge images | Earlier |

### Session Recordings Storage Notes
- **Free plan**: 1GB total storage (~3-4 recordings at 300MB each)
- **Pro plan** ($25/mo): 100GB included, overage $0.021/GB/month
- **Bandwidth**: Free plan 10GB, Pro 250GB ($0.09/GB overage)
- **File organization**: `{booking_id}/{timestamp}.{ext}`
- **Max file size**: 50MB per upload (set in bucket config)
- **Alternative**: Tracey can paste Vimeo/Google Drive/Zoom URLs instead of uploading
- **Decision**: Start with Free plan + URL pasting, upgrade to Pro when storage needed

---

## Admin Panel Architecture (Session 29)

### Sidebar Navigation (Session 29)
- **Client Profiles sidebar entry REMOVED** — CRM is now embedded in the Clients tab of 1-on-1 Sessions
- Clients tab has sub-navigation: "Client Roster" | "All Client Profiles"
- "Profile →" button on each roster client opens 5-tab CRM detail view inline

### Key Global Variables (admin.js)
```javascript
var sessConfigData, sessCyclesData, sessAvailData, sessClientsData;
var sessBookingsData, sessWaitlistData, sessNotesData, sessRecsData;
var crmCurrentClient; // Currently viewed client in CRM
```

### refreshBookingsView() — THE Standard Refresh (Session 28)
All bookings tab actions MUST call this function instead of individual table refreshes:
```javascript
async function refreshBookingsView(){
  var [bk, nt, rc] = await Promise.all([
    proxyFrom('session_bookings').select('*').order('date',{ascending:true}),
    proxyFrom('session_notes').select('*').order('created_at',{ascending:false}),
    proxyFrom('session_recordings').select('*').order('uploaded_at',{ascending:false})
  ]);
  sessBookingsData = bk.data || [];
  sessNotesData = nt.data || [];
  sessRecsData = rc.data || [];
  renderBookingsGrid();
  renderSessionsStats();
}
```

### Body Regions System (Session 28)
- 28 standard bone-accurate regions extracted from GLB skeleton
- Stored as jsonb array on `session_notes.body_regions`
- Custom regions: user enters label + picks "nearest standard region" for 3D positioning
- Custom labels appended to note content as `[Custom alignments: ...]`
- Region coordinates stored in admin.js `bodyRegionCoords` object

### Recording System (Session 28)
- **Upload flow**: drag & drop MP4 → Supabase Storage bucket → save URL to session_recordings
- **URL flow**: paste Vimeo/GDrive/YouTube/Zoom link → save to session_recordings with source_type='external'
- **Patient display**: auto-detects source type → renders appropriate embed (HTML5 video, Vimeo iframe, GDrive iframe, YouTube iframe, or external link)
- **Admin display**: collapsible rows with Hosted/External badge, Play link, Delete button

### Session Email Automation (Session 29)
- **Location**: Email Automation page → "1-on-1 Reminders" sub-tab
- **Templates**: QP-branded emails (Georgia serif, gradient appointment card, teal CTAs)
  - `buildSessionReminderHtml('day-before', booking)` — Zoom link, date/time, prep tips
  - `buildSessionReminderHtml('follow-up', booking)` — Thank you, post-session guidance, portal link
  - Intake form reminder (via `crmSendIntakeReminder()`)
- **Send mechanism**: Google Apps Script `APPS_SCRIPT_URL` with `mode:'no-cors'`
- **Preview**: iframe-based modal (`showEmailPreviewModal()`)
- **4 toggles** (UI only, not persisted): day-before, post-session, intake nudge, 72-hour expiry
- **Pending reminders list**: scans `sessBookingsData` for upcoming paid and recently completed sessions

---

## Netlify Functions (7)
| Function | Purpose | Auth |
|----------|---------|------|
| `admin-proxy.js` | All admin Supabase operations (30 tables) | Bearer token → admin_users check |
| `admin-auth.js` | Admin login | Email + password → Supabase auth |
| `academy-checkout.js` | Academy Stripe checkout sessions | Public |
| `academy-webhook.js` | Academy Stripe webhook handler | Stripe signature |
| `stripe-refund.js` | Process Stripe refunds | Bearer token |
| `session-checkout.js` | Create Stripe checkout for session bookings | Public |
| `session-webhook.js` | Handle session payment → update booking to `paid` | Stripe signature |

---

## Email System Architecture

### Email Sending (ALL emails go through Google Apps Script)
- `APPS_SCRIPT_URL` in admin.js
- `mode:'no-cors'` — response is opaque, can't confirm delivery

### 3 Google Apps Scripts
1. **Stripe Webhook Handler** — Handles checkout.session.completed, routes Fusion vs Academy
2. **Fusion Sessions Email Automation** — Runs every 15 min via time trigger
3. **Bulk Email Sender v3** — Called by admin Email Center, test emails, Offer Slot sends

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

## Known Issues (Session 29)
1. **email-decode.min.js 404** — Netlify phantom, harmless.
2. **Test email delivery** — `mode:'no-cors'` means no confirmation.
3. **Webhook untested with real payment** — session-webhook.js deployed but awaiting first real Stripe payment.
4. **Cross-domain SSO** — QP→Fusion working. Fusion→QP not yet implemented.
5. **notification_preferences columns** — Need to verify boolean columns exist.
6. **GitHub intermittent 500s** — Occurred during Session 27. Retry or manual Netlify deploy.
7. **Zoom recordings can't embed** — Zoom blocks iframes. Download MP4 and upload instead.
8. **Supabase Free plan 1GB limit** — ~3-4 session recordings before hitting cap.
9. **Orphaned test recordings** — 4 records in session_recordings with booking_id `aa000001-...` can be deleted.
10. **session_recordings.uploaded_at** — NOT created_at. All queries must use uploaded_at.
11. **Automation toggles not persisted** — Reminder toggle states reset on page reload (UI only).
12. **Duplicate function name fixed (S29)** — `crmDeleteNote` was defined twice. Renamed internal to `crmDeleteInternalNote`.
