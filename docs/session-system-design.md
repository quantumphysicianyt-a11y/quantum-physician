# 1-on-1 Sessions System — Full Design Spec

**Last updated:** Session 33 (Mar 5, 2026)

## Dr. Tracey's Current Manual Workflow
1. Works in **4-month booking cycles** (e.g., March-June, July-October, Nov-Feb)
2. Blocks out available days (usually Tue/Wed/Thu but varies due to teaching/travel)
3. Takes her **existing recurring clients** and populates them into the new 4-month schedule
4. Sends each client their proposed appointment dates
5. Clients confirm & pay, request changes, or skip months
6. Once existing clients are placed, **remaining open slots become public**
7. Public slots create anticipation — "Next booking window opens [date]"
8. Repeat every 4 months

## Key Design Principles
- Existing clients get priority placement before public booking opens
- 4-month cycles create scarcity/anticipation
- Dr. Tracey controls the schedule, not a free-for-all calendar
- Automation replaces the manual "copy last cycle + adjust" process
- Single session type, one price ($150 for 60 min — set in session_config)
- **All bookings require payment** — recurring and public alike
- **48-hour cancellation policy** (details TBD with Dr. Tracey)
- **72-hour reservation window** for offered/proposed slots — auto-expires if unpaid
- **Regulars flow (Tracey request, Session 31)** — trusted clients confirm date without upfront payment, 7-day expiry, pay after session

---

## BUILD PROGRESS

### ✅ BUILT (Session 23) — Core System
- All 6 database tables created with RLS policies
- Full admin panel Sessions tab (5 sub-tabs)
- Cycle Manager with status pipeline + visual progress bar
- Availability Calendar with bulk actions + import from previous cycle
- Client Roster with CRUD + preferences
- Auto-Populate Engine for recurring clients
- Client Date Assignment with available day picker + custom dates
- Bookings Grid with filters + status management
- Client Quick Email with templates + merge fields
- Public Booking Controls (open/coming_soon/closed toggle)
- Waitlist Manager with offer slot flow
- Offer Slot: date picker → preference matching → email preview → test send → Confirm & Pay CTA
- Frontend: dynamic booking page with 3 states (open/coming_soon/filled)
- Frontend: waitlist signup form with preferred day/time/message
- Frontend: monthly calendar with time slot picker (when open)

### ✅ BUILT (Session 24) — Stripe Payments
- **session-checkout.js** Netlify function — dual mode: token-based + public booking
- **session-webhook.js** Netlify function — handles checkout.session.completed
- Admin: confirmation tokens, Pay Link button, Mark Paid, status badges
- Frontend: ?pay=TOKEN handler, slot selection modal, payment success/cancelled overlays
- Database: confirmation_token column, updated status constraint
- Stripe: webhook endpoint configured, product image

### ✅ BUILT (Session 25) — Member Portal
- Login/signup/reset-password pages
- Member dashboard with sidebar layout + customizable cards
- Settings page (profile, avatar, password, notifications)
- Auth-aware shared header with avatar dropdown
- SVG icon system standardized
- Cross-domain SSO (QP → Fusion token passing)

### ✅ BUILT (Session 26) — Patient Portal Pages
- 4 patient pages: sessions.html, intake.html, progress.html, billing.html
- My Health sidebar section in dashboard
- 5 new database tables: session_notes, session_recordings, patient_intake, patient_checkins, patient_progress_notes
- RLS policies for all patient tables

### ✅ BUILT (Session 27) — CRM + Progress Enhancements
- Cross-domain SSO fixed (Cloudflare truncation root cause)
- Admin CRM: Client Profiles with 5-tab detail view
- Progress page: collapsible charts, symptom/energy charts, before/after toggle, quick stats, body map, milestone markers
- Demo data: 4 bookings, 4 notes, 2 recordings, intake form, 12 monthly check-ins, 3 progress notes

### ✅ BUILT (Session 28) — Notes, Recordings, Body Regions
- **28 bone-accurate body regions** extracted from GLB skeleton inverse bind matrices
- **Admin region picker modal**: 28 tappable chips + custom alignment input with nearest-region dropdown
- **Session notes full CRUD**: add/edit/delete, body regions, YES/NO visibility toggle
- **Multiple notes per session**: collapsible in bookings grid with emoji indicators
- **Recording upload system**: drag & drop MP4 to Supabase Storage OR paste URL (Vimeo/GDrive/YouTube/Zoom)
- **Smart video embeds on patient side**: auto-detects source → HTML5 player / Vimeo iframe / GDrive iframe / YouTube iframe / external link
- **Deep linking**: `?highlight=bookingId` on sessions.html opens Past tab, expands card, scrolls
- **Real-time refresh**: `refreshBookingsView()` replaces all scattered reloads
- **Green "✓ Complete" button** on paid bookings
- **Recording indicators**: `📝 2 notes · 🎥 1 recording` in collapsible toggle row
- **Bug fix**: session_recordings uses `uploaded_at` NOT `created_at` (was causing 400 errors)

### ✅ BUILT (Session 29) — CRM Merge + Email Automation UI
- **CRM merged into Clients tab** — removed standalone page-crm, sub-nav: Client Roster | All Client Profiles
- **Clickable client cards** — whole card opens profile, teal hover, action buttons use stopPropagation
- **Session notes collapsed by default** — click row/badge to expand, ▼/▲ toggle arrow
- **Progress tab filters** — keyword search, date range (3mo/6mo/1yr/all), type filter (check-ins/alignments/milestones/observations)
- **Email automation UI** — 4 toggle cards, QP-branded templates, preview modals, per-session send buttons
- **Bug fixes**: duplicate crmDeleteNote, missing fmtTime, data-table→tbl class, profile fetch resilience, reminders panel nesting

### ✅ BUILT (Session 30) — Automated Email System (Deployed & Tested)
- **Netlify cron** (`session-cron.js`) — daily 8 AM ET, 5 automation types, fully automated
- **Google Apps Script Pipeline #3** — standalone, Version 3 deployed, `SESSION_EMAIL_SCRIPT_URL` env var set
- **Premium QP-branded templates** — dark navy, Tracey headshot, teal/taupe, Georgia serif (rebuilt to match Academy quality)
- **`email_automation_log` + `system_config` tables** — idempotent sends, persistent toggles
- **Idempotency confirmed both directions** — manual send blocks cron, cron blocks manual
- **Admin UX fixes** — toggle flash removed, tab/sub-tab persistence, send buttons always visible
- **Admin manual sends** routed through BulkEmailSender v3 with `isHtml:true` (confirmed working)
- **72-hour auto-expiry** — proposed bookings auto-expire, slots freed, notice sent

### ✅ BUILT (Session 31) — Regulars Flow, Bookings Overhaul, Reschedule System
- **Create Cycle 401 fix** — `ensureFreshToken()` pre-flight + duplicate `initAdmin()` removal
- **UUID token fix** — `generateBookingToken()` now produces valid UUID v4 (was causing 400 on date assignment)
- **Regulars flow** — `client_type` column, auto-confirm for regulars, payment request email system
- **Bookings grid**: Payment column, sortable headers, Active/Completed/Cancelled/All sub-tabs
- **Bulk actions**: Preview checklists with themed checkboxes for payment requests + reminders
- **Reschedule system**: Reason modal (6 options + note), purple "Rescheduled" badge, `rescheduled_from` linking, clickable detail popup
- **Reactivate button** on cancelled bookings + confirmation dialogs on Cancel/Decline/No Show
- **CRM profile**: Full action buttons (Dates, Email, Edit, Pause, Remove) + dates modal header actions

### ✅ BUILT (Session 32) — Email Visibility, Automation Dashboard, Cron Update
- **Cron 7-day regular expiry** — `session-cron.js` updated: 5-day warning + 7-day auto-expire for confirmed regulars
- **Own toggle**: `auto_regular_expiry` config key (independent from 72h standard)
- **CRM Emails tab** — 6th tab on client profile, session-only scope from `email_automation_log`
- **Filters**: type buttons (All, Day-Before, Follow-Up, Intake, Expiry, Failed) + date dropdown + sortable columns
- **7-Day Regular Expiry toggle card** — 5th card on 1-on-1 Reminders tab
- **Automation dashboard upgrade** — 200 entries, 7-day summary stats, filter buttons, date dropdown, sortable columns
- **Next Cron Run Preview** — shows queued automations cross-referencing bookings vs log
- **Day-before reminders** expanded to include `confirmed` bookings (not just `paid`)
- **2 new email templates**: `buildRegularExpiryWarningEmail()`, `buildRegularExpiryNoticeEmail()`
- **2 new automation types**: `regular_expiry_5d`, `regular_expiry_7d`

### ✅ BUILT (Session 33) — Invoice System + Auto-Invoice Webhook
- **`invoices` table** with `QP-YYYY-NNNN` auto-numbering (sequence + DB function)
- **PDF generation** (`generate-invoice.js`) — pdfkit, QP logo, Tracey headshot, session details, PAID watermark, navy/teal branding
- **Auto-invoice on Stripe payment** — `session-webhook.js` creates invoice + PDF + emails client automatically on `checkout.session.completed`
- **Admin Invoices sub-tab** — sortable grid, search, stats, bulk generate with progress bar, instant PDF preview modal
- **Patient billing.html** — invoice cards with themed PDF modal, signed URL download
- **CRM Billing tab** — per-client invoices with sortable columns, PDF download, email resend
- **CRM Sessions tab** — sortable Date/Time/Status columns
- **Clickable client names** — bookings grid, invoices grid, waitlist → auto-navigate to CRM profile

### ⬜ NOT YET BUILT

- End-to-end Stripe payment test
- Invoice PDF polish (tighter spacing)
- 48-hour cancellation enforcement


### ⬜ FUTURE
- Analytics dashboard (utilization, retention, revenue)
- Cycle summary report to Tracey
- Multi-currency invoicing (CAD+HST, EUR)
- Memberships / Subscriptions

---

## DATABASE TABLES

### Core Session Tables (6 — Session 23-24)

| Table | Key Columns |
|-------|-------------|
| `session_config` | session_price ($150), session_duration_minutes (60), booking_buffer_minutes, public_booking_status, timezone, zoom_link |
| `session_cycles` | name, start_date, end_date, status (planning/client_confirm/public_open/active/complete) |
| `session_availability` | cycle_id, date, start_time, end_time, status (available/booked/blocked), visibility (recurring/public/both) |
| `session_clients` | email, name, frequency, preferred_day, preferred_time, priority, status (active/paused/inactive), **client_type** (standard/regular — Session 31) |
| `session_bookings` | cycle_id, client_id, email, name, date, start_time, end_time, status, type (recurring/public), stripe_payment_id, confirmation_token, **payment_requested_at** (Session 31), **rescheduled_from** uuid (Session 31), **reschedule_reason** text (Session 31) |
| `session_waitlist` | email, name, preferred_days (jsonb), preferred_times (jsonb), message, status (pending/notified/booked/expired) |

### Patient CRM Tables (5 — Session 26+28)

| Table | Key Columns |
|-------|-------------|
| `session_notes` | booking_id, note_type (session/followup/internal), content, body_regions (jsonb), visible_to_patient (bool), created_at |
| `session_recordings` | booking_id, recording_url, title, duration_minutes, **uploaded_at** (⚠️ not created_at), source_type (external/supabase), file_path, file_size_mb |
| `patient_intake` | user_id, 30+ fields, symptoms (jsonb), created_at, updated_at |
| `patient_checkins` | user_id, check_in_date, symptoms (jsonb), energy (int), sleep (int), notes, created_at |
| `patient_progress_notes` | user_id, note_type (alignment/milestone/observation), content, created_at |

### Supabase Storage
| Bucket | Purpose |
|--------|---------|
| `session-recordings` | MP4 uploads from admin. Public read, auth write/delete. Files: `{booking_id}/{timestamp}.{ext}`. 50MB max per file. |

---

## Booking Status Flow

### Standard Clients
```
proposed → paid → completed
                → cancelled
                → no_show
proposed → declined (slot freed)
proposed → expired (72 hours passed without payment)
```

### Regular (Trusted) Clients — Session 31
```
proposed → confirmed (auto, no payment) → completed → paid (post-session)
                                        → cancelled
                                        → no_show
confirmed → rescheduled (with reason + note)
```

### Rescheduled Flow — Session 31
```
Any status → rescheduled (old booking, purple badge)
  → new booking created with rescheduled_from linking to original
  → reason stored: client_request | practitioner_unavailable | illness | scheduling_conflict | no_show_rebooking | other
  → auto-note added to old booking with original date + reason
```

### Cancelled → Reactivate
```
cancelled/declined/expired → proposed (via Reactivate button, clears timestamps)
```

---

## Admin Bookings Grid (Session 28 + 31)

### Sub-Tabs (Session 31)
- **Active**: Proposed, Confirmed, Paid — what needs attention
- **Completed**: Completed, No Show — session history
- **Cancelled**: Cancelled, Declined, Expired, Rescheduled — with Reactivate + Reschedule buttons
- **All**: Everything

### Sortable Columns (Session 31)
Click any header for asc/desc sort: Date, Time, Client, Type, Status, Payment

### Per-Booking Row (7 columns)
- Date, Time, Client (email + name + Regular badge + rescheduled indicator), Type, Status, **Payment** (Session 31), Actions

### Payment Column (Session 31)
- **Paid** (green badge) — Stripe payment confirmed or manually marked
- **Unpaid · Request** (red button) — Completed regular, no payment, click to send request
- **Requested** (yellow badge) + Resend — Payment email already sent, with resend option
- **—** — Not applicable (proposed, confirmed, or non-regular completed)

### Actions by Status
- **Proposed**: Pay Link (🔗), Confirm (regulars only), Mark Paid, Decline, + Note
- **Proposed (Regular)**: Confirm button (skips payment)
- **Confirmed / Paid**: Complete, No Show, Cancel (all with confirmation dialogs), + Note, + Recording
- **Completed**: + Note, + Recording
- **Cancelled / Declined / Expired**: Reactivate, Reschedule, + Note
- **Rescheduled**: + Note only (no further actions)
- All rows: 🗑 Delete

### Bulk Actions (Session 31)
- **💳 Bulk Request Payments** — modal with checklist of all completed unpaid regulars
- **📧 Bulk Send Reminders** — modal with checklist of all tomorrow's sessions
- Custom `.qp-check` themed checkboxes, Select All toggle

### Collapsible Notes/Recordings Row
- Toggle: `▸ 📝 2 notes · 🎥 1 recording click to expand`
- **Note rows** (teal bg): type badge, visibility badge, content, body region pills, time ago, Edit/Toggle/Delete buttons
- **Recording rows** (green bg): 🎥 RECORDING, Hosted/External badge, title, size, time ago, Play link, Delete button

### + Note Modal
- Content textarea
- 28 region chips (multi-select)
- Custom region input + nearest standard region dropdown + "+ Add"
- YES/NO visibility toggle with helper text
- Save / Cancel

### + Recording Modal
- Two tabs: Upload File | Paste URL
- Upload: drag & drop zone, file info, progress bar
- Paste: text input for any video URL
- Title field
- Save / Cancel

### refreshBookingsView()
All actions call this one function: parallel fetch of bookings + notes + recordings, then re-render grid + stats. Eliminates need for hard refresh.

---

## Patient Sessions Page (Session 28)

### Smart Video Embed Detection
```javascript
function renderRecording(r) {
  // Supabase hosted → HTML5 <video> player + download
  // Vimeo → embedded player (title=0&byline=0&portrait=0)
  // Google Drive → embedded preview player
  // YouTube → embedded player
  // Fallback → "Opens in new tab" link
}
```

### Deep Linking
`sessions.html?highlight={bookingId}` → auto-switches to Past tab → finds card by data-booking-id → expands details → highlights with teal border → smooth scrolls

### Notes Display
- Only shows `visible_to_patient = true` notes
- Body region badges (teal pills) under each note
- Region names with hyphens replaced by spaces
