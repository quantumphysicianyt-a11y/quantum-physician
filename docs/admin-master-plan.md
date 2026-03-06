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

**Last updated:** Session 36 (Mar 5, 2026)

---

## Session 36 Summary — Session Types, Dual Offer Flow, Regular Client UX (Mar 5, 2026)

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

## ✅ All Completed Features (cumulative through Session 35)

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

---

## 🔴 Next Priorities

### Immediate (Session 37)
- ⬜ Fix `one-on-sessions.html` pay token handling — public Confirm & Pay link lands on "All Sessions Filled" instead of checkout
- ⬜ Update `session-checkout.js` to accept `currency` param for EUR/CAD Stripe checkout
- ⬜ Client roster: add currency/tax dropdown to client edit modal (mark Canadian clients)
- ⬜ Add calendar buttons (.ics) to day-before reminder emails
- ⬜ Test day-before cron end-to-end (create tomorrow booking, trigger cron manually)
- ⬜ Test public offer flow end-to-end with Stripe payment

### Short-term
- ⬜ 24hr reschedule policy enforcement (block reschedules within 24hrs in admin)
- ⬜ Regular client "Confirm Date" landing page — dedicated confirmation page for regulars (not Stripe checkout)
- ⬜ Backfill existing bookings with session_type_id where applicable

### Needs Tracey's Input
- ⬜ Pre/post session patient forms — token-based, mobile-first, 30-60 sec, feeds progress charts
- ⬜ Invoice defaults: payment terms, tax (HST for Canadian clients?), auto-send preference
- ⬜ Does she want different Zoom links per session type or one global link?

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
