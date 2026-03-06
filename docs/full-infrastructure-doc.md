# QP Admin Panel — Full Infrastructure Documentation

**Last updated:** Session 36 (Mar 5, 2026)

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
- **Supabase** (rihlrfiqokqrlmzjjyxj): Database, auth, RLS policies, storage (7 buckets)
- **Stripe**: Payment processing (shared account for both platforms)
- **Netlify**: Hosting + serverless functions (QP repo + Fusion repo)
- **Google Apps Script**: Email sending (3 scripts), Stripe webhook handling
- **Vimeo**: Video hosting for Fusion session recordings + optional session recording hosting

### Repo: `quantum-physician` (in ~/Downloads/quantum-physician/)
```
quantum-physician/
├── _headers
├── admin/
│   ├── index.html             # Admin panel HTML — UPDATED SESSION 36
│   ├── admin.css              # Admin panel styles
│   └── admin.js               # Admin panel logic — UPDATED SESSION 36
├── academy/
├── assets/
├── components/
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
│   └── shared.js
├── members/
│   ├── login.html
│   ├── dashboard.html
│   ├── settings.html
│   ├── reset-password.html
│   ├── sessions.html          # UPDATED SESSION 35 (cancel button + policy modal)
│   ├── intake.html
│   ├── progress.html
│   └── billing.html           # UPDATED SESSION 33 (invoices section)
├── netlify/functions/
│   ├── academy-checkout.js
│   ├── academy-webhook.js
│   ├── admin-auth.js
│   ├── admin-proxy.js         # 33 allowed tables + RPC handler
│   ├── generate-invoice.js    # PDF invoice generation (pdfkit)
│   ├── generate-ics.js        # .ics calendar file generation — NEW SESSION 35
│   ├── session-checkout.js
│   ├── session-cron.js        # Daily automated emails (8 AM ET) — UPDATED SESSION 36
│   ├── session-webhook.js     # Payment webhook + auto-invoice + calendar buttons — UPDATED SESSION 36
│   └── stripe-refund.js       # Refund + 24hr cancellation policy — REBUILT SESSION 35
├── pages/
│   └── one-on-sessions.html
├── netlify.toml
├── index.html
└── referral-hub.html
```

---

## Netlify Functions (10)
| Function | Purpose | Auth |
|----------|---------|------|
| `admin-proxy.js` | All admin Supabase operations (34 tables + RPC) | Bearer token → admin_users check |
| `admin-auth.js` | Admin login | Email + password → Supabase auth |
| `academy-checkout.js` | Academy Stripe checkout sessions | Public |
| `academy-webhook.js` | Academy Stripe webhook handler | Stripe signature |
| `stripe-refund.js` | Process cancellations with 24hr policy enforcement | Public (called from member portal) |
| `session-checkout.js` | Create Stripe checkout for session bookings | Public |
| `session-webhook.js` | Handle session payment → update booking + auto-create invoice + generate PDF + send emails + calendar buttons | Stripe signature |
| `session-cron.js` | Daily automated emails for 1-on-1 sessions (8 AM ET) | Scheduled (cron) |
| `generate-invoice.js` | Generate QP-branded PDF invoice with pdfkit, upload to Storage | Bearer token OR internal flag |
| `generate-ics.js` | Generate .ics calendar file from query params | Public |

---

## Database Tables (32 + admin_users + auth.users)

### Session System Tables (7)
| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `session_config` | session_price, session_duration_minutes, public_booking_status, timezone, zoom_link | Global settings |
| `session_cycles` | name, start_date, end_date, status | 4-month booking cycles |
| `session_availability` | cycle_id, date, start_time, end_time, status, visibility | Daily time blocks |
| `session_clients` | email, name, frequency, preferred_day, preferred_time, priority, status, client_type (standard/regular), **currency**, **tax_label**, **tax_rate** | Recurring client roster |
| `session_bookings` | cycle_id, client_id, email, date, start_time, end_time, status, type, **session_type_id**, **amount_cents**, **currency**, stripe_payment_id, stripe_session_id, confirmation_token, payment_requested_at, rescheduled_from, reschedule_reason, client_cancelled, admin_acknowledged, cancellation_reason, cancelled_at | Individual appointments |
| `session_waitlist` | email, name, preferred_days, preferred_times, message, status | Public waitlist |
| `session_types` | name, description, duration_minutes, price_cents, currency, is_active, sort_order | Session type definitions (Zoom €200, Recorded €150) |

**`session_bookings` status values:** `proposed`, `paid`, `confirmed`, `completed`, `cancelled`, `cancelled_no_refund`, `no_show`, `declined`, `expired`, `rescheduled`

**New in Session 36:**
- `session_types` table with RLS (public read for active types)
- `session_bookings`: `session_type_id` (FK), `amount_cents`, `currency` — price snapshot at booking time
- `session_clients`: `currency` (default EUR), `tax_label`, `tax_rate` — per-client currency/tax override

**New in Session 35:**
- `stripe_session_id text` — Stripe checkout session ID (for refund processing)
- `client_cancelled boolean DEFAULT false` — true when client self-cancels
- `admin_acknowledged boolean DEFAULT false` — Tracey must acknowledge client cancellations
- `cancellation_reason text`, `cancelled_at timestamptz`

### Patient CRM Tables (5)
| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `session_notes` | booking_id, note_type, content, body_regions (jsonb), visible_to_patient | Per-session practitioner notes |
| `session_recordings` | booking_id, recording_url, title, duration_minutes, **uploaded_at**, source_type, file_path, file_size_mb | Video recordings per booking |
| `patient_intake` | user_id, 30+ fields, symptoms (jsonb) | Health intake questionnaire |
| `patient_checkins` | user_id, symptoms (jsonb), energy, sleep | Patient self-reported progress |
| `patient_progress_notes` | user_id, note_type, content | Longitudinal practitioner notes |

**⚠️ IMPORTANT**: `session_recordings` uses `uploaded_at` NOT `created_at`. All order-by queries must use `uploaded_at`.

### Invoice Table (1 — Session 33)
| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `invoices` | invoice_number (unique, QP-YYYY-NNNN), booking_id FK, client_id FK, email, name, description, amount_cents, currency, tax_label, tax_rate, tax_cents, total_cents, status (draft/sent/paid/void/overdue), issued_at, due_date, paid_at, voided_at, stripe_payment_id, pay_url, pdf_path, pdf_generated_at, notes | Per-session paid invoices with PDF storage |

**Supporting objects:** `invoice_number_seq` (sequence), `generate_invoice_number()` (SECURITY DEFINER function)
**RLS:** Patient read via `lower(email) = lower(auth.jwt()->>'email')`

### Automation & Config Tables (2)
| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `email_automation_log` | booking_id, email, automation_type, status, error_message, sent_at | Tracks every automated email send. UNIQUE on (booking_id, automation_type) |
| `system_config` | key (PK), value (jsonb), updated_at, updated_by | Key-value store for automation toggles + system settings |

### Existing Tables (17 + admin_users)
purchases, referral_codes, profiles, credit_history, notification_preferences, qa_enrollments, qa_courses, qa_lessons, qa_modules, qa_lesson_progress, admin_notes, discussion_posts, qa_discussions, email_campaigns, email_tracking, email_log, promotions, scheduled_emails, session_schedule, admin_users

---

## Supabase Storage Buckets (7)
| Bucket | Access | Purpose | Added |
|--------|--------|---------|-------|
| `avatars` | PUBLIC | User profile photos | Session 25 |
| `session-recordings` | PUBLIC read, auth write/delete | Session recording MP4 uploads | Session 28 |
| `invoices` | PRIVATE (signed URLs) | PDF invoices | Session 33 |
| `course-videos` | Private | Academy video content | Earlier |
| `course-files` | Private | Academy downloadable files | Earlier |
| `course-thumbnails` | PUBLIC | Academy course thumbnails | Earlier |
| `achievements` | PUBLIC | Achievement badge images | Earlier |

---

## Cancellation Flow (Session 35)

### Client-initiated (members/sessions.html)
1. Cancel button appears on upcoming paid/confirmed bookings with `stripe_session_id`
2. Modal shows 24hr policy warning (green = refund eligible, red = no refund)
3. Client confirms → POST to `/.netlify/functions/stripe-refund` with `{booking_id, stripe_session_id, initiated_by: 'client'}`
4. `stripe-refund.js` checks hours until session:
   - **< 24hrs**: marks `cancelled_no_refund`, `client_cancelled=true`, `admin_acknowledged=false`, sends no-refund email
   - **≥ 24hrs**: Stripe refund processed, marks `cancelled`, `client_cancelled=true`, `admin_acknowledged=false`, sends refund email
5. Admin sees 🔔 Client badge on unacknowledged cancellations, clicks ✓ Ack to dismiss

### Admin-initiated (admin bookings grid)
- Cancel button as before → marks `cancelled`, `admin_acknowledged=true` (no ack needed)
- No Stripe refund triggered (admin handles manually if needed)

---

## Calendar Invite Flow (Session 35)

### Confirmation email
`buildConfirmationEmailHtml()` accepts `rawDate`, `rawStart`, `rawEnd` params and generates:
- **Google Calendar button** → `https://calendar.google.com/calendar/render?...` pre-filled URL
- **Apple Calendar button** → `/.netlify/functions/generate-ics?date=...&start=...&end=...&name=...&zoom=...`
- **Outlook button** → same `.ics` URL

### `generate-ics.js`
- Builds VCALENDAR with VEVENT, two VALARM reminders (24hr + 1hr)
- Dr. Tracey Clark as ORGANIZER, client as ATTENDEE
- Returns `text/calendar` with `Content-Disposition: attachment`

---

## Dual Offer Flow (Session 36)

### Regular Clients (`session_clients.client_type = 'regular'`)
1. Tracey offers slot via admin → booking created as `proposed`
2. Client receives "Confirm Your Date" email (7-day window, no payment CTA)
3. Client confirms → booking moves to `confirmed`
4. Day-before cron sends reminder: health update request + Zoom link + soft payment nudge
5. Client pays at their convenience (not a gate — session happens regardless)
6. Payment webhook marks `paid` + generates invoice

### Public Clients (everyone else)
1. Tracey offers slot via admin → booking created as `proposed`
2. Client receives "Confirm & Pay" email (72-hour window, Stripe payment link)
3. Client pays → webhook marks `paid` + confirmed + sends confirmation email + invoice
4. Day-before cron sends reminder: health update request + Zoom link (no payment section)

### Detection
- `isRegularClient(email)` — shared function in admin.js, checks `sessClientsData`
- `regularBadgeHtml(small)` — consistent ★ Regular badge used across all views
- Cron uses `session_clients` table lookup via `clientMap[email]`

---

## Session Types (Session 36)

### `session_types` Table
| Column | Type | Purpose |
|--------|------|---------|
| `name` | text | "Zoom Session", "Recorded Session" |
| `description` | text | Brief description |
| `duration_minutes` | integer | 30 (both types currently) |
| `price_cents` | integer | 20000 (€200) / 15000 (€150) |
| `currency` | text | EUR (default) |
| `is_active` | boolean | Show in dropdowns |
| `sort_order` | integer | Display ordering |

### Price Snapshot on Bookings
When a booking is created, `session_type_id`, `amount_cents`, and `currency` are copied from the session type to the booking. This ensures price changes don't retroactively affect existing bookings.

### Zoom Detection
Day-before cron checks if `session_type.name` contains "zoom" (case-insensitive) to decide whether to include the Zoom link button.

---
| # | Pipeline | Template Style | Trigger | Log Table | Status |
|---|----------|---------------|---------|-----------|--------|
| 1 | Fusion Sessions | Purple/neon gradient | Apps Script cron (15 min) | `scheduled_emails` + `email_log` | ✅ Live |
| 2 | Academy/Marketing | Purple/neon + custom HTML | Manual from admin | `email_campaigns` + `email_tracking` | ✅ Live |
| 3 | 1-on-1 Sessions | QP teal/taupe, Georgia serif | Netlify cron (8 AM ET) → Apps Script | `email_automation_log` | ✅ Live |
| 4 | QP General | QP branded | Transactional | TBD | ⬜ Future |

**Session email types (Pipeline #3):**
- Confirmation (on payment) + invoice + calendar buttons
- Day-before reminder
- Post-session follow-up
- Intake nudge
- 72hr expiry notice
- 7-day regular expiry (5-day warning + expiry)
- Cancellation (refund or no-refund variant) — NEW Session 35

---

## Admin Panel Architecture

### CRM / Clients Tab Structure
- **Sub-navigation**: "Client Roster" | "All Client Profiles"
- **Three views**: `client-view-roster`, `client-view-all`, `crm-detail-view`
- **`switchClientView(view, btn)`** — toggles between roster and all profiles
- **`crmOpenClient(email)`** — hides sub-views, shows 6-tab detail (Sessions, Intake, Progress, Billing, Notes, Emails)
- **`crmBackToList()`** — returns to active sub-view (tracked by `clientSubView` global)
- **`sessEmailClient(email, name)`** — routes to `openClientEmail(cl.id)` — fixed Session 35

### CRM Client Detail Tabs
1. **Sessions** — sortable bookings table
2. **Intake** — health intake form responses
3. **Progress** — symptom charts, milestones
4. **Billing** — invoices + other purchases
5. **Notes** — practitioner notes
6. **Emails** — session email history (filters, sort)

### Bookings Grid Status Badges
```javascript
cancelled_no_refund → red badge "Cancelled (No Refund)"  // NEW Session 35
cancelled → grey badge "Cancelled"
// + 🔔 Client badge if client_cancelled=true && !admin_acknowledged
```

### Key Global Variables (admin.js)
```javascript
var sessConfigData, sessCyclesData, sessAvailData, sessClientsData;
var sessBookingsData, sessNotesData, sessRecordingsData;
var sessSelectedCycleId, sessBookView, clientSubView;
var auditSortCol, auditSortDir;  // sort state for audit log
```

---

## Known Issues / Watch Points (Session 36)
1. **email-decode.min.js 404** — Netlify phantom, harmless
2. **`one-on-sessions.html` pay token** — Public "Confirm & Pay" link lands on "All Sessions Filled" page. The `?pay=TOKEN` handling needs to be fixed to show the Stripe checkout for that specific booking
3. **`session-checkout.js` currency** — Currently creates USD Stripe checkout. Needs update to accept `currency` param for EUR/CAD sessions
4. **Regular "Confirm Date" landing** — Regulars clicking "Confirm Your Date" currently go to the same pay page. Need a dedicated confirmation endpoint that just marks `confirmed` without payment
5. **Cross-domain SSO** — QP→Fusion working. Fusion→QP not yet implemented
6. **Supabase Free plan 1GB limit** — ~3-4 session recordings before hitting cap
7. **session_recordings.uploaded_at** — NOT created_at. All queries must use uploaded_at
8. **BulkEmailSender = FusionSessionsEmailer** — Same Apps Script, different names
9. **Zoom recordings can't embed** — Download MP4 and upload instead

---

## Recurring Bug Patterns (Hard-Won Lessons)
- **Apostrophes in single-quoted JS strings** → use `&rsquo;` not `'`
- **`$()` shorthand gets stripped by bash heredocs** → use `document.getElementById()` and Python `create_file`
- **GitHub HTTP 500s** → `git push origin main --force` + manual Netlify deploy trigger
- **sed with complex escaping** → always use Python string replacement instead
- **Line continuation `\` in JS strings** → never use; causes SyntaxError. Put everything on one line or split into multiple `+` concatenations
- **`node --check admin.js`** → always verify syntax before deploying admin.js
