# QP Admin Panel — Master Plan Cross-Reference

## ⚠️ CRITICAL STRATEGIC DECISION (DO NOT LOSE)
**The QP unified admin will REPLACE the Fusion admin entirely.** This was decided early in the project. The approach:
1. **Build QP admin first** with full feature parity (and beyond)
2. **Do NOT modify or break the Fusion admin** while building — it stays live and untouched
3. **Once QP admin has all Fusion features migrated**, retire the Fusion admin (fusionsessions.com/admin.html)
4. **One admin panel to rule them all** — manages both Academy and Fusion from qp-homepage.netlify.app/admin/

Both sites share the same Supabase project, same Stripe account, same user pool. The unified admin reads/writes the same tables the Fusion admin does. The Fusion admin stays running as-is until the QP admin is 100% ready to take over.

## 📋 SESSION HANDOFF PROTOCOL — READ THIS FIRST

### A Note on This Collaboration
Todd (the founder/developer of Quantum Physician) and Claude have built this admin panel together across 35+ intensive sessions. Todd cares deeply about polish, design details, and getting things right. These handoff documents represent a **shared history** — every bug fix, every design decision, every architectural choice was made collaboratively and often through multiple iterations. The next Claude instance inherits this context and trust. **Treat these docs with the same care Todd does**: update them thoroughly at the end of every session, preserve hard-won lessons, and never make changes that contradict documented decisions without discussing with Todd first. This isn't just a codebase — it's a partnership.

**These 3 docs are the ONLY source of truth across chat sessions. Claude has NO memory between sessions.**

### The 3 Handoff Docs (+2 references):
1. `admin-master-plan.md` — Full roadmap, session plan, what's built vs what's missing, priority recommendations
2. `fusion-gap-analysis.md` — Feature parity tracking (Fusion admin vs QP admin), what's migrated vs what's still missing
3. `full-infrastructure-doc.md` — Database tables, RLS policies, Netlify functions, Supabase clients, system architecture
4. `ACADEMY-HANDOFF.md` — Academy-specific platform docs (standalone reference, not updated every session)
5. `session-26-crm-plan.md` — Detailed build plan for Patient Portal & CRM (SESSION 25 planning doc)

### At the END of every build session, Claude MUST:
- **Update ALL 3 docs** — not just one. Every session touches multiple concerns.
- **Mark completed features as ✅** with "SESSION N" label
- **Document every database change, bug fix, architectural decision**
- **Output all 3 updated docs** as downloadable files

### At the START of every new chat, Todd uploads:
- These 3 docs + the current `admin/index.html`, `admin/admin.js`, `admin/admin.css`
- Claude reads all docs BEFORE writing any code

**Last updated:** Session 39 (Mar 7, 2026)

---

## Session 39 Summary — CONFIRM_WINDOW Launch Fix, Global Loading Spinners (Mar 7, 2026)

### ✅ CONFIRM_WINDOW_MS → 7 Days (LAUNCH BLOCKER RESOLVED)
- Changed `admin.js` line 3749 from `5*60*1000` (5 min test) to `7*24*60*60*1000` (7 days production)
- This controls how long regular clients have to confirm their dates before the cycle can advance

### ✅ Global Loading Spinners — 63 Buttons Wrapped
- Extended `withSpinner()` to handle `btn=null` gracefully (returns asyncFn() result for overflow menu calls)
- Systematically wrapped **every async action button** across all admin sections with `withSpinner(this, function(){return ...})`
- 49 buttons in `admin.js` + 14 buttons in `index.html` = 63 total
- **Sections covered:**
  - **Bookings grid** (already done Session 38): Confirm, Mark Paid, Complete, Reactivate, Acknowledge
  - **Session Types**: Save, Delete
  - **Cycle Manager**: Advance (all stages including post-countdown glow, waitlist skip, default), Delete
  - **Client Roster**: Save Edit Client
  - **Public Booking**: Open, Coming Soon, Close toggles
  - **Offer Slot**: Send Offer
  - **Academy**: Course Save, Student Unenroll
  - **Community**: Post Pin, Hide, Delete
  - **Promotions**: Deactivate, Reactivate, Archive, Delete, Save Edit
  - **Admin Users**: Toggle Active/Disable, Save Edit
  - **Moderators**: Remove
  - **Scheduled Emails**: Send Now, Cancel, Retry, Resend, Reactivate, Save
  - **Session Schedule**: Save
  - **Invoices**: Save, Save & Send, Resend
  - **Session Reminders**: Send Day-Before, Send Follow-Up
  - **index.html buttons**: Add Client, Bulk Availability, Create Cycle, Bulk Request Payments, Bulk Send Reminders, Send All Confirmations, Bulk Generate Invoices, Create Promotion, Grant Access, Assign Mod, Add Admin, Bulk Enroll CSV, Save Query Preset, Save Scheduled Email

### Files Modified This Session
- `admin/admin.js` — CONFIRM_WINDOW_MS fix, withSpinner upgrade (null handling), 49 button wraps
- `admin/index.html` — 14 button wraps

### Known Issues / TODO for Session 40
- ⬜ Multi-date confirmation email test (biweekly test client)
- ⬜ Availability calendar click-to-expand + drag-and-drop
- ⬜ Cycle header dropdown to switch active cycle from banner
- ⬜ Regular reschedule request flow
- ⬜ Confirmation email tone update per Tracey
- ⬜ Client roster currency/tax editor
- ⬜ Invoice currency from booking (webhook still hardcoded)
- ⬜ Review and polish all Stripe checkout screens for consistent QP branding

---

## ⚠️ LAUNCH BLOCKER — CONFIRM_WINDOW_MS ✅ RESOLVED (Session 39)
~~**`admin.js` line ~3755**: `CONFIRM_WINDOW_MS` is set to `5*60*1000` (5 minutes) for testing.~~
~~**MUST change to `7*24*60*60*1000` (7 days) before launch.**~~
**Fixed Session 39** — now set to 7 days production.

---

## Session 38 Summary — Premium Sessions Page, Bookings Grid Redesign, Waitlist Modal (Mar 7, 2026)

### Sessions Page — Floating Orb CTA ✅
- Circular 120px floating orb (bottom-right) matching homepage `floatingCta` pattern
- Dark gradient background, teal pulse ring (`pulseRing 2s`), float bounce animation (`floatBounce 3s`)
- Stage-aware label: "BOOK A SESSION" when open, "JOIN WAITLIST" when closed
- Hover: teal glow shadow, navy gradient, scale up

### Sessions Page — Premium Calendar Modal ✅
- Full-screen overlay modal opens from orb, hero CTA, final CTA, and "Why Choose" cards
- QP logo (56px) + "✦ Private Healing Sessions" kicker + animated entrance
- Floating glow orb, shimmer sweep, border pulse animations on modal box
- Staggered fadeUp entrance (`.animate-in` triggered 50ms after modal visible)
- Three states: Open (calendar + time slots), Coming Soon (countdown), Closed (filled message + next cycle + waitlist CTA)
- Close via X, overlay click, or Escape
- `overflow:hidden` on body when open

### Sessions Page — Inline Booking Card ✅
- Replaced old full-page calendar with single animated `.book-card`
- Same premium effects: glow orb, shimmer, border pulse, staggered fadeUp
- QP logo, kicker, title, price (teal highlight), availability count badge, "View Calendar & Book" CTA
- Checks for **future** available slots (not just `public_booking_status`) to prevent open/filled mismatch

### Waitlist Modal ✅
- Moved waitlist form from inline section to premium modal
- Same visual style as calendar modal (glow, shimmer, border pulse)
- QP logo + "✦ Join the Waitlist" kicker + "Be the First to Know" heading
- Form: name, email, preferred days/time, message
- **Duplicate email prevention**: checks `session_waitlist` for existing entry before insert
- Success state: hides form header, shows logo + checkmark + "You're on the list!" + Close
- All "Join the Waitlist" buttons now call `openWaitlistModal()`

### Autofill Fix ✅
- Global CSS rule for `input:-webkit-autofill` forces dark navy background + white text
- `transition: background-color 5000s` prevents Chrome flash

### Bookings Grid Action Bar Redesign ✅
- **Primary action button** per status (Confirm, Mark Paid, Complete, Reactivate, + Note, ✓ Acknowledge)
- **"⋯" overflow menu** with all secondary actions in a dropdown
- Overflow menu: positioned dropdown, closes on outside click, danger items highlighted red
- "📝 Add Note" available in overflow for ALL booking statuses

### Loading Spinner System ✅
- `withSpinner(btn, asyncFn)` — wraps any async button action
- Captures button width, replaces with spinner, disables during operation, restores on complete
- Applied to all primary action buttons in bookings grid

### Files Modified This Session
- `pages/one-on-sessions.html` — floating orb, calendar modal, inline booking card, waitlist modal, animations, autofill fix
- `admin/admin.js` — bookings grid action bar redesign, `withSpinner`, `bookingPrimaryAction`, `bookingOverflowMenu`, `openInvoiceForBooking`
- `admin/admin.css` — overflow menu styles (`.of-menu`, `.of-item`, `.of-danger`)

### Known Issues / TODO for Session 39
- ⬜ **CONFIRM_WINDOW_MS** — change from 5 min to 7 days before launch
- ⬜ Multi-date confirmation email test (biweekly test client)
- ⬜ Global loading spinners across all admin sections (currently only on bookings grid)
- ⬜ Availability calendar click-to-expand + drag-and-drop
- ⬜ Cycle header dropdown to switch active cycle from banner
- ⬜ Bulk availability "Apply" button spinner

### Public Confirm & Pay Fix ✅
- **Bug**: Public clients clicking "Confirm & Pay" from email landed on "All Sessions Filled" instead of Stripe checkout — dual competing handlers in IIFE race condition
- **Fix**: Consolidated IIFE in `one-on-sessions.html`, `session-checkout.js` now reads booking-level `amount_cents`/`currency` (was hardcoded $150 USD)
- Multi-currency Stripe checkout (EUR/CAD/USD) with Canadian HST auto-calculation

### Confirm Token Flow ✅ (Regular Clients)
- New `?confirm=TOKEN` URL path for regular clients (separate from `?pay=TOKEN`)
- `session-checkout.js` new `action: "confirm"` handler — marks `proposed → confirmed` without payment
- Branded "Date Confirmed!" overlay with date/time card and "View My Sessions" CTA
- Error states: already confirmed (teal check), expired (amber), generic error

### Cycle Automation Engine ✅
- **6-stage progress bar**: Planning → Client Confirm → Waitlist (48hr) → Public Open → Active → Complete
- New `waitlist_open` stage added to DB constraint and all admin UI
- **"Advance →" triggers automated actions per stage:**
  - Planning → Client Confirm: auto-populate + batch send personalized confirm emails (grouped by client, multiple dates per email)
  - Client Confirm → Waitlist: batch email all waitlisted people with "Exclusive Early Access — 48hrs"
  - Waitlist → Public Open: auto-set `public_booking_status = 'open'`
  - Public Open → Active: close public booking
  - Active → Complete: expire remaining proposed bookings
- **Locked advance with countdown timer** during Client Confirm stage (5 min test, 7 days production)
- Timer counts down live, button disabled until window expires, then glows with pulse animation
- Toast notification when window closes: "Confirmation window closed — ready to advance!"
- **Stage-specific button labels**: "Send Confirmations & Advance →", "Advance to Waitlist →", "Open to Public →", etc.

### Regress-Safe Advance ✅
- When regressing to Planning and re-advancing, system detects emails were already sent
- Two-step modal: "Resend All Emails?" → No → "Advance Without Resending?"
- Prevents accidental duplicate email blasts

### Waitlist Email ✅
- Branded "Exclusive Early Access" email with 48hr urgency
- Slot count hidden when over 25 — shows "Limited Spots Available" instead
- Booking page auto-opens during waitlist stage

### Cron Auto-Advance ✅
- `session-cron.js` checks daily: waitlist 48hr expired → auto-advance to public_open
- Cycle end date passed → auto-complete + expire remaining proposed bookings

### SQL Migration
```sql
ALTER TABLE session_cycles ADD COLUMN IF NOT EXISTS waitlist_opens_at timestamptz;
ALTER TABLE session_cycles ADD COLUMN IF NOT EXISTS waitlist_expires_at timestamptz;
ALTER TABLE session_cycles ADD COLUMN IF NOT EXISTS auto_emails_sent jsonb DEFAULT '{}';
ALTER TABLE session_cycles DROP CONSTRAINT IF EXISTS session_cycles_status_check;
ALTER TABLE session_cycles ADD CONSTRAINT session_cycles_status_check 
  CHECK (status IN ('planning', 'client_confirmation', 'waitlist_open', 'public_open', 'active', 'completed'));
```

### Files Modified This Session
- `admin/admin.js` — cycle automation engine, advance logic, countdown timer, batch email builders, regress-safe advance, waitlist email, `?confirm=` URL fix
- `admin/index.html` — glow animation CSS, hidden Send Confirmations button
- `netlify/functions/session-checkout.js` — confirm action handler, multi-currency checkout
- `netlify/functions/session-cron.js` — cycle auto-advance checks
- `pages/one-on-sessions.html` — confirm token IIFE handler, branded confirmation overlay

### Known Issues / TODO for Session 38
- ⬜ Sessions page calendar UX — needs floating CTA button + popup calendar (not buried at page bottom). Pattern exists on homepage (floatingCta). Stage-aware label.
- ⬜ Multi-date confirmation email testing — need test client with biweekly frequency to verify grouped dates in one email
- ⬜ Change `CONFIRM_WINDOW_MS` from 5 min (test) to 7 days (production) before launch
- ⬜ Loading spinners on ALL admin button actions (inconsistent UX)
- ⬜ Bookings grid action bar redesign — primary action + overflow menu (option 3), attention indicators
- ⬜ Availability calendar interactivity — click day to expand, drag-and-drop appointments
- ⬜ Regular reschedule request flow — "Can't Make This Date" button, preferred alternate form, auto-reschedule if slot available (10-20 min delay), admin notification only if unavailable. Needs Tracey confirmation.
- ⬜ Confirmation email tone update per Tracey: emphasize "practice is full, regulars get first priority, here are your dates"
- ⬜ "Confirm All" + individual Confirm/Decline/Change Date buttons in multi-date email (needs Tracey input)
- ⬜ Cycle header dropdown to switch active cycle without going to Cycles tab
- ⬜ Bulk availability "Apply" button needs loading spinner

### Webhook Bug Fix ✅
- **Bug**: `stripe_session_id` was never populated on `session_bookings` when payment came through the webhook — cancel button in `sessions.html` requires this field to show
- **Fix**: Added `stripe_session_id: stripeSessionId` to the booking update in `session-webhook.js`
- **Backfill SQL**: `UPDATE session_bookings SET stripe_session_id = stripe_payment_id WHERE status = 'paid' AND stripe_session_id IS NULL AND stripe_payment_id IS NOT NULL;`

### Clickable Automation Stat Cards ✅
- Stat cards (sent, failed, skipped, per-type) on the automation log dashboard are now clickable
- Click filters the log table below and smooth-scrolls into view
- `clickAutoStat(filter)` finds and activates the matching filter button, or applies direct filter for type-specific cards

### Session Types System ✅
- **New `session_types` table**: `id`, `name`, `description`, `duration_minutes`, `price_cents`, `currency`, `is_active`, `sort_order`
- **Seeded types**: Zoom Session (€200, 30min, EUR) and Recorded Session (€150, 30min, EUR)
- **Admin UI**: New "Session Types" tab in Sessions page with full CRUD (add, edit, delete)
- Real-time updates with spinner on save/delete (re-fetches from DB after mutation)
- `sessTypesData` global loaded in parallel with all session data
- `admin-proxy.js` updated: `session_types` added to allowed tables (now 34 total)

### Multi-Currency Foundation ✅
- **`session_bookings`** new columns: `session_type_id` (FK), `amount_cents`, `currency` — snapshot price at booking time
- **`session_clients`** new columns: `currency` (default EUR), `tax_label`, `tax_rate` — for Canadian HST clients
- Prices display with correct currency symbol (€ / CA$ / $) throughout admin

### Dual Offer Flow (Regular vs Public) ✅
- **Regular clients** (`client_type = 'regular'` in `session_clients`):
  - Offer Slot modal shows ★ Regular Client badge + descriptive text
  - Booking created as `proposed` — client confirms the date (7-day window)
  - Email says "Confirm Your Date" CTA, "payment link sent day before"
  - No upfront payment required
- **Public clients** (everyone else):
  - Standard "Send Offer" flow with Stripe payment link
  - Booking created as `proposed` — 72hr to confirm & pay
  - Email says "Confirm & Pay" CTA with Stripe checkout link
- Both flows include `session_type_id`, `amount_cents`, `currency` on the booking
- Offer Slot modal has session type dropdown with auto-updating duration/price summary

### Day-Before Cron Upgrade ✅
- `session-cron.js` now loads `session_clients` and `session_types` tables
- **All clients**: health update request ("share updates on your health and goals for tomorrow"), prep tips
- **Zoom sessions only**: Zoom link button (detected by session type name containing "zoom")
- **Regular + unpaid**: soft payment nudge — subtle outlined "Complete Payment" button (not the main CTA)
- **Already-paid clients**: no payment section
- Session type name and duration displayed in session details card (was hardcoded "60-Minute 1-on-1 Session")

### ★ Regular Badge Consistency ✅
- Shared `isRegularClient(email)` function checks `sessClientsData` by email
- Shared `regularBadgeHtml(small)` renders consistent teal ★ Regular badge
- Badge now appears in: waitlist rows, bookings grid (client column), CRM profile header, All Client Profiles table, Offer Slot modal
- Bookings grid checks both `email` and `client_id` for regular detection (covers waitlist-origin bookings)

### SQL Migration Run This Session
```sql
-- Session Types table + seed data
CREATE TABLE session_types (id uuid PK, name, description, duration_minutes, price_cents, currency, is_active, sort_order, created_at, updated_at);
INSERT: Zoom Session (€200, 30min), Recorded Session (€150, 30min)

-- Booking columns
ALTER TABLE session_bookings ADD session_type_id uuid FK, amount_cents integer, currency text DEFAULT 'EUR';

-- Client columns  
ALTER TABLE session_clients ADD currency text DEFAULT 'EUR', tax_label text, tax_rate numeric(5,2);
```

### Files Modified This Session
- `admin/admin.js` — session types CRUD, dual offer flow, regular badge consistency, clickable stat cards
- `admin/index.html` — Session Types tab
- `netlify/functions/admin-proxy.js` — added `session_types` to allowed tables
- `netlify/functions/session-webhook.js` — populate `stripe_session_id` on payment
- `netlify/functions/session-cron.js` — day-before reminder with health update, session types, regular payment nudge

---

## Session 35 Summary — Email Button Fix, 24hr Cancellation Policy, Calendar Invites (Mar 5, 2026)

### Email Button Fix (CRM Profile) ✅
- **Bug**: Email button in CRM client profile was calling undefined `sessEmailClient()` function — nothing happened on click
- **Fix**: Added `sessEmailClient(email, name)` function that looks up client by email in `sessClientsData` and routes to `openClientEmail(cl.id)`
- Also fixed a secondary syntax error where `function openClientEmail(clientId){` declaration was accidentally dropped during the fix, leaving orphaned function body and breaking all of admin.js
- **Files**: `admin/admin.js`

### 24-Hour Cancellation Policy ✅
- **Policy**: Clients can cancel anytime, but within 24 hours of session = no refund. Outside 24 hours = full Stripe refund.
- **New DB columns** on `session_bookings`:
  - `client_cancelled boolean DEFAULT false` — flags self-cancellations
  - `admin_acknowledged boolean DEFAULT false` — Tracey must acknowledge client cancellations
  - `cancellation_reason text`
  - `cancelled_at timestamptz`
  - `stripe_session_id text` — links booking to Stripe checkout session for refund processing
- **New status**: `cancelled_no_refund` — booking cancelled within 24hr window, no refund issued
- **`stripe-refund.js` rebuilt** — now accepts `booking_id` + `initiated_by` params:
  - Fetches booking, calculates hours until session
  - Within 24hrs → marks `cancelled_no_refund`, skips Stripe refund, sends no-refund email
  - Outside 24hrs → processes full Stripe refund, marks `cancelled`, sends refund confirmation email
  - Both paths send QP-branded cancellation email (dark navy, teal/taupe, session card with strikethrough date)
- **`members/sessions.html`** — Cancel button added to upcoming paid/confirmed bookings that have a `stripe_session_id`:
  - Shows 24hr policy warning modal (red = no refund, green = full refund eligible)
  - Confirm → calls `stripe-refund.js` with `initiated_by: 'client'`
  - Shows toast notification on completion, reloads sessions
- **`admin/admin.js`** updates:
  - `cancelled_no_refund` status badge (red, distinct from plain `cancelled`)
  - 🔔 **Client** badge on bookings where `client_cancelled=true` AND `admin_acknowledged=false`
  - **✓ Ack** button → `acknowledgeClientCancel()` sets `admin_acknowledged=true`
  - `cancelled_no_refund` included in Cancelled view filter and Reactivate/Reschedule buttons

### Add-to-Calendar Buttons ✅
- **`generate-ics.js`** — new Netlify function at `/.netlify/functions/generate-ics`
  - Accepts query params: `date`, `start`, `end`, `name`, `zoom`
  - Returns `.ics` file with 24hr + 1hr VALARM reminders, Dr. Tracey as organizer
  - Tested and working — downloads correct `.ics`, imports cleanly into Apple Calendar
- **Confirmation email updated** — three calendar pill buttons added below Zoom button:
  - **Google Calendar** → pre-filled Google Calendar URL (opens in browser)
  - **Apple Calendar** → downloads `.ics` via `generate-ics.js`
  - **Outlook** → same `.ics` download
- **24hr reschedule policy note** updated in confirmation email (was "48 hours" — now "24 hours")
- **`buildConfirmationEmailHtml()`** now accepts `rawDate`, `rawStart`, `rawEnd` params for calendar URL generation
- **Files**: `netlify/functions/session-webhook.js`, `netlify/functions/generate-ics.js`

### Files Modified This Session
- `admin/admin.js` — sessEmailClient fix, cancelled_no_refund badge, acknowledge flow
- `netlify/functions/stripe-refund.js` — rebuilt with 24hr policy, cancellation emails
- `members/sessions.html` — cancel button + modal + confirmCancelSession flow
- `netlify/functions/session-webhook.js` — calendar buttons in confirmation email, rawDate/rawStart/rawEnd params
- `netlify/functions/generate-ics.js` — NEW

### SQL Migration Run This Session
```sql
ALTER TABLE session_bookings
  ADD COLUMN IF NOT EXISTS client_cancelled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_acknowledged boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_session_id text;
```

---

## Session 34 Summary — Stripe Webhook E2E Test, Invoice Polish, Sort Dropdowns (Mar 5, 2026)

### End-to-End Webhook Test ✅
- Full Stripe payment chain verified: webhook → booking marked paid → invoice created → PDF generated → invoice email + confirmation email delivered
- Test booking: `25e982ca-ad43-49b0-babb-09909a5ad61a` (btsol@hey.com, Mar 5 2026, $150)

### Invoice Email Polish ✅
- Rebuilt `buildPaidInvoiceEmailHtml()` to match premium reminder template structure (logo banner, hero title, session details table, green PAID badge, PDF download button, Tracey headshot signature)

### Invoice PDF Spacing Fixes ✅
- Header email pushed lower (y=80) for breathing room
- Footer made dynamic: `fY = H - 100` (pinned to bottom)
- Footer fully centered: headshot, name, tagline all centered
- Divider dynamic: `y = Math.max(y + 14, dy + 14)` prevents PAID date overlapping session row

### Sort Dropdowns ✅
- **Audit Log**: Newest First / Oldest First / Email A→Z / Email Z→A / Action A→Z / Admin A→Z (server-side Supabase `.order()`)
- **Client Roster**: Priority / Name A→Z / Email A→Z / Frequency / Status (client-side `Array.sort()`)

---

## Session 33 Summary — Invoice System, Auto-Invoice Webhook, CRM Enhancements (Mar 5, 2026)
*(see previous handoff for full details)*

---

## ✅ All Completed Features (cumulative through Session 38)

### Core Admin
- Analytics dashboard, Email Center, Promotions Manager, Orders Browser
- Card Library (drag-and-drop), Smart Suggestions, Audit Log
- Referral code management, bulk enrollment CSV, community moderation
- Admin roles + 12 permission flags, admin-proxy server-side security pattern

### 1-on-1 Sessions System
- Cycle Manager, Availability Calendar, Client Roster (with sort dropdown), Bookings Grid (sortable headers, Payment column, Active/Completed/Cancelled/All tabs)
- Offer Slot flow, Stripe checkout + payment webhook, auto-invoice on payment
- Reschedule system, bulk actions, reactivate button
- Regulars flow (client_type, auto-confirm, payment request emails)

### Patient CRM & Portal
- 4 patient portal pages (sessions, intake, progress, billing)
- CRM merged into Clients tab (Client Roster | All Client Profiles)
- Session notes (CRUD, body regions, visibility), recordings system
- Progress tracking (charts, milestones, filters), 3D body model (Three.js, 28 bone-accurate regions)
- Billing tab with invoices + sortable columns
- CRM Emails tab (6th tab, per-client session email history)
- Clickable client names everywhere → CRM profile

### Invoice System
- `invoices` table, auto-incrementing `QP-YYYY-NNNN` numbers, RLS
- PDF generation (pdfkit, QP-branded, PAID watermark, signed URL preview)
- Admin Invoices sub-tab (sortable, bulk generate per cycle, progress bar)
- Auto-invoice on Stripe payment (webhook)
- Patient billing.html with invoice cards + themed PDF modal

### Email Automation
- 5 toggle cards (Day-Before, Follow-Up, Intake Nudge, 72hr Expiry, 7-Day Regular Expiry)
- Netlify cron (8 AM ET), idempotent, confirmed working
- Automation log viewer (200 entries, stats, filters, sort)
- Next Cron Run Preview

### Cancellation System (Session 35)
- 24hr cancellation policy enforced (no refund within window)
- Client cancel button on sessions.html with policy warning modal
- Admin acknowledge flow for client-initiated cancellations
- QP-branded cancellation emails (refund + no-refund variants)

### Calendar Invites (Session 35)
- Add-to-calendar buttons in confirmation email (Google, Apple, Outlook)
- `generate-ics.js` function with 24hr + 1hr reminders

### Session Types & Multi-Currency (Session 36)
- `session_types` table with admin CRUD (Zoom €200 / Recorded €150 / 30min EUR)
- Per-booking price snapshot (`session_type_id`, `amount_cents`, `currency`)
- Per-client currency override (`currency`, `tax_label`, `tax_rate` on `session_clients`)
- Session type dropdown in Offer Slot modal

### Dual Offer Flow (Session 36)
- Regular clients: confirm date (7 days), payment via day-before reminder
- Public clients: confirm & pay via Stripe (72hr expiry)
- ★ Regular badge consistent across waitlist, bookings, CRM, profiles

### Day-Before Cron Upgrade (Session 36)
- Health update request in all day-before reminders
- Session-type-aware (duration, type name, zoom detection)
- Soft payment nudge for unpaid regulars (not a gate)

### Premium Sessions Page (Session 38)
- Floating orb CTA (120px, pulse ring, float bounce, stage-aware label)
- Calendar popup modal (QP logo, staggered fadeUp, glow/shimmer/border pulse, 3 states)
- Inline animated booking card (.book-card with glow orb, shimmer, availability badge)
- Waitlist modal (replaces inline form, duplicate email prevention, premium styling)
- Autofill dark-theme fix (global CSS)
- Future-slot check syncs inline card + modal (no open/filled mismatch)

### Bookings Grid Redesign (Session 38)
- Primary action button + "⋯" overflow menu per booking row
- `withSpinner()` loading spinner system on primary actions
- `openInvoiceForBooking()` wrapper for overflow menu
- "Add Note" available in overflow for all statuses

### Global Loading Spinners (Session 39)
- `withSpinner()` extended to handle null btn (overflow menu calls)
- 63 async action buttons wrapped across ALL admin sections
- Covers: Session Types, Cycle Manager, Client Roster, Public Booking, Offer Slot, Academy, Community, Promotions, Admin Users, Moderators, Scheduled Emails, Session Schedule, Invoices, Reminders, and all index.html action buttons

---

## 🔴 Next Priorities

### Immediate (Session 40)
- ⬜ Multi-date confirmation email test (biweekly test client)
- ⬜ Availability calendar click-to-expand + drag-and-drop
- ⬜ Cycle header dropdown to switch cycles from banner

### Short-term
- ⬜ Regular reschedule request flow (Can't Make This Date → auto-reschedule or admin notification)
- ⬜ Confirmation email tone update per Tracey (practice full, regulars first priority)
- ⬜ "Confirm All" + individual Confirm/Decline/Change Date in multi-date email (needs Tracey)
- ⬜ 24hr reschedule policy enforcement in admin
- ⬜ Client roster: currency/tax dropdown in edit modal
- ⬜ Invoice currency pull from `session_bookings.currency` (webhook still hardcoded)
- ⬜ Review and polish all Stripe checkout screens (session bookings, Academy, Fusion) for consistent QP branding (carried from Session 24)

### Needs Tracey's Input
- ⬜ Pre/post session patient forms — token-based, mobile-first, 30-60 sec, feeds progress charts
- ⬜ Invoice defaults: payment terms, tax (HST for Canadian clients?), auto-send preference
- ⬜ Reschedule request flow details
- ⬜ Multi-date email Confirm All / individual buttons design

### Future
- ⬜ Student tools (flashcards, highlighting, journal, summarizer)
- ⬜ Custom card templates (save your own)
- ⬜ AI Copilot for email writing / documentation / transcription
- ⬜ Memberships / Subscriptions
- ⬜ SMS reminders
- ⬜ In-app secure messaging
- ⬜ Multiple preferred times per client (better auto-populate for larger rosters)
- ⬜ Consent forms / HIPAA agreements
- ⬜ Patient satisfaction surveys
- ⬜ Public Open vs Active stage merge (future discussion)
