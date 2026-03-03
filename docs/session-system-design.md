# 1-on-1 Sessions System — Full Design Spec

**Last updated:** Session 24 (Mar 2, 2026)

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

---

## BUILD PROGRESS

### ✅ BUILT (Session 23)
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

### ✅ BUILT (Session 24)
- **session-checkout.js** Netlify function — dual mode: token-based (email CTAs) + public booking (frontend calendar)
- **session-webhook.js** Netlify function — handles `checkout.session.completed`, updates booking to `paid`, sends confirmation email
- **Admin: confirmation tokens** — all 4 booking insert points generate 64-char hex tokens
- **Admin: Pay Link button** — copies checkout URL with token to clipboard
- **Admin: Mark Paid** — manual payment confirmation for non-Stripe payments
- **Admin: status badges** — `paid` (green), `expired` (muted) badges in bookings grid
- **Frontend: `?pay=TOKEN` handler** — instant redirect to Stripe, page hidden during redirect
- **Frontend: slot selection modal** — name/email capture → Stripe checkout redirect
- **Frontend: `?payment=success` overlay** — floating navy card over blurred sessions page
- **Frontend: `?payment=cancelled` overlay** — same style, "slot still reserved for 72 hours"
- **Database: `confirmation_token` column** added to session_bookings
- **Database: status constraint updated** — added `paid` and `expired` to allowed values
- **Stripe: webhook endpoint configured** — signing secret stored in Netlify env vars
- **Stripe: product image** — `assets/images/1on1-sessions-payment.png` shown on checkout page

### 🔴 NOT YET BUILT (Session 25 priorities)
- End-to-end payment test with real Stripe transaction
- Patient CRM / Portal (intake forms, session notes, progress tracking, recorded sessions)
- QP-branded premium email template
- Full email automation (confirmations, reminders, follow-ups)
- Client Confirmation Portal (tokenized, no login)
- 72-hour offer expiry automation
- 48-hour cancellation enforcement

### ⬜ FUTURE
- My Appointments view (logged-in users)
- Add-to-calendar (.ics) generation
- Analytics dashboard (utilization, retention, revenue)
- Post-session follow-up automation
- Cycle summary report to Tracey

---

## DATABASE TABLES

### `session_config` — Global settings ✅ CREATED
- id, cycle_months (default 4), session_duration_minutes (60), session_price (150)
- timezone, booking_buffer_minutes (15, gap between sessions)
- current_cycle_start, current_cycle_end
- public_booking_opens_at (when open slots become bookable)
- public_booking_status: 'closed' | 'open' | 'coming_soon'
- waitlist_enabled (boolean)
- confirmation_deadline_days (how long clients have to confirm)
- zoom_link (standing Zoom link or per-booking)

### `session_availability` — Dr. Tracey's available time blocks ✅ CREATED
- id, date, start_time, end_time, cycle_id
- status: 'available' | 'blocked' | 'teaching' | 'travel' | 'personal'
- visibility: 'public' | 'private' (private = recurring clients only)
- notes (optional - "Teaching BodyTalk Access in Toronto")
- created_at

### `session_cycles` — Each 4-month booking cycle ✅ CREATED
- id, name (e.g., "Spring 2026"), start_date, end_date
- status: 'planning' | 'client_confirmation' | 'public_open' | 'active' | 'completed'
- client_confirmation_sent_at
- client_confirmation_deadline
- public_opens_at
- notes
- created_at

### `session_clients` — Recurring client roster ✅ CREATED
- id, email, name, profile_id (FK to profiles)
- frequency: 'weekly' | 'biweekly' | 'monthly' | 'every_2_months'
- preferred_day: 'monday' | 'tuesday' | ...
- preferred_time (e.g., "10:00")
- status: 'active' | 'paused' | 'waitlist' | 'inactive'
- priority (for placement order)
- notes
- started_at, created_at

### `session_bookings` — Individual appointments ✅ CREATED
- id, cycle_id, client_id (nullable for public bookings)
- email, name
- date, start_time, end_time
- **status: 'proposed' | 'paid' | 'completed' | 'cancelled' | 'no_show' | 'declined'**
  - ⚠️ CHANGED from original spec: No separate 'confirmed' state. Confirm & pay is one step.
  - ⚠️ REMOVED: 'rescheduled' (just cancel + rebook)
- type: 'recurring' | 'public' | 'manual'
- stripe_payment_id (for paid bookings)
- zoom_link
- notes
- reminder_sent_at
- confirmation_token (for email confirm/pay links)
- proposed_at, confirmed_at, cancelled_at
- created_at

**Booking Status Flow:**
```
proposed → paid → completed
                → cancelled (48-hour policy applies)
                → no_show
proposed → declined (slot freed, offered to next waitlister)
proposed → expired (72 hours passed without payment)
```

### `session_waitlist` — People waiting for openings ✅ CREATED
- id, email, name, profile_id
- preferred_days (json array), preferred_times (json array)
- message (optional note from person)
- status: 'waiting' | 'notified' | 'booked' | 'expired'
- notified_at, created_at

### RLS Policies ✅ ADDED
- session_config, session_cycles, session_availability, session_bookings: Public SELECT
- session_waitlist: Public INSERT
- All tables: Admin access via admin-proxy (service role)

---

## ADMIN PANEL FEATURES

### 1. Cycle Manager ✅ BUILT
- Current cycle status with visual progress bar (Planning → Client Confirm → Public Open → Active → Complete)
- Create new cycle with name + start/end dates
- Advance/regress cycle status
- Edit/rename, delete cycles
- Select cycle to filter all other tabs

### 2. Availability Builder ✅ BUILT
- Monthly calendar grid with click-to-toggle days
- Per-day config: start_time, end_time, status, visibility, notes
- Bulk actions: mark all weekdays available
- Import from previous cycle
- Color indicators: green=available, grey=blocked

### 3. Auto-Populate Engine ✅ BUILT
- Places recurring clients by preferred day/time/frequency
- Conflict detection (skips days that are blocked or already booked)
- Computes end_time from session_config.session_duration_minutes
- Batch insert with progress feedback
- Creates bookings as 'proposed' status

### 4. Client Roster Manager ✅ BUILT
- Add, edit, pause, activate, remove clients
- Frequency, preferred day/time, priority, notes
- Client Date Assignment modal: view/add/remove proposed dates per client
- Custom date entry for one-off scheduling

### 5. Booking Grid ✅ BUILT
- Filterable table: search, status filter, type filter
- Status updates (proposed → paid → completed, etc.)
- Delete bookings
- Send All Confirmations (batch email)

### 6. Client Communication ✅ BUILT
- Client Quick Email with template picker (confirmation, reminder, schedule change, general)
- Merge fields: {{name}}, {{email}}, {{next_date}}, {{next_time}}, {{dates_list}}
- Preview and send via Apps Script

### 7. Public Booking Controls ✅ BUILT
- Toggle: open / coming_soon / closed
- Updates session_config.public_booking_status
- Frontend reads this to show appropriate state

### 8. Waitlist Manager ✅ BUILT
- View all waitlist entries with preferences
- **Offer Slot flow** (major upgrade from original spec):
  1. Click "Offer Slot" → modal shows waitlister's preferences
  2. Date picker filtered to available days, auto-selects matching preferred day
  3. Time picker with duration/price display
  4. Live email preview updates as date/time changes
  5. "Preview Email" → renders branded email in iframe modal
  6. "Send Test" → sends test email to admin via Apps Script
  7. "Send Offer Email" → creates proposed booking + updates waitlist to 'notified' + opens full email composer
  8. Email includes: specific date/time, 72-hour reservation, "Confirm & Pay Now" CTA
- Remove from waitlist

### 9. Analytics & Reports ⬜ NOT YET BUILT
- Utilization rate, client retention, revenue per cycle
- Most popular days/times, cancellation/no-show rate
- Waitlist conversion rate

### 10. Reminders & Automation ⬜ NOT YET BUILT (Session 24 priority)
- Auto-send 24hr + 1hr appointment reminders
- Auto-send confirmation request emails with confirm/pay links
- Auto-send "cycle opening soon" to waitlist
- Auto-expire unpaid proposed bookings after 72 hours
- Auto-mark no-shows after appointment time
- Post-session follow-up email
- Cycle summary report to Tracey

---

## FRONTEND (PUBLIC-FACING) FEATURES

### 1. Session Info Page ✅ BUILT (pages/one-on-sessions.html)
- Branded page with hero, Dr. Tracey bio, root-cause approach, how remote sessions work
- "Why Choose a Session" grid, integrative medicine cards, testimonials
- Final CTA section, floating CTA button

### 2. Booking Status Banner ✅ BUILT
- **"Booking Is Open"** (status=open + active cycle): Shows monthly calendar with available days
- **"Coming Soon"** (status=coming_soon): Live countdown timer + waitlist CTA
- **"All Sessions Filled"** (no active cycle or status=closed): Elegant scarcity design explaining 4-month cycle model, next cycle date, waitlist signup
- Hero/floating/final CTAs dynamically update text based on state

### 3. Available Slots Grid ✅ PARTIALLY BUILT
- Monthly calendar with available days highlighted in teal
- Click day → time slots generated from availability blocks (respects duration + buffer)
- Taken slots shown as greyed-out/strikethrough
- **⬜ NEEDS**: Stripe checkout integration (currently shows alert placeholder)

### 4. Waitlist Signup ✅ BUILT
- Name, email, preferred day, preferred time, optional message
- Inserts into session_waitlist via Supabase anon client
- Success state hides form, shows confirmation

### 5. Client Confirmation Portal ⬜ NOT YET BUILT
- Unique tokenized link (no login required)
- Shows all proposed appointments for the cycle
- Per-appointment: Confirm & Pay | Decline | Request Change
- "Request Change" → shows alternative available slots
- Bulk confirm all button
- Summary: "3 paid, 1 declined, 1 pending"

### 6. My Appointments ⬜ NOT YET BUILT
- Upcoming appointments for logged-in users
- Past appointment history
- Cancel/reschedule (within 48-hour policy)
- Add to calendar (.ics)

---

## PAYMENT FLOW (Session 24 — BUILT ✅)

### Stripe Checkout for Sessions
1. Client clicks "Confirm & Pay" (from email CTA → `?pay=TOKEN`) or selects slot on public calendar
2. **Token-based flow**: Frontend calls `session-checkout.js` with `{token}` → validates booking, checks 72-hour expiry → creates Stripe checkout
3. **Public booking flow**: Frontend calls `session-checkout.js` with `{email, name, date, start_time}` → validates availability, creates proposed booking → creates Stripe checkout
4. Client completes payment on Stripe ($150)
5. Webhook (`checkout.session.completed`) fires `session-webhook.js`:
   - Updates booking: `proposed` → `paid`, stores `stripe_payment_id`, sets `confirmed_at`
   - Updates waitlist entry to `booked` if applicable
   - Sends confirmation email via Apps Script with Zoom link
   - Logs to `admin_audit_log`
6. Client redirected to `?payment=success` → floating overlay confirmation

### Stripe Configuration
- **Webhook endpoint**: `https://qp-homepage.netlify.app/.netlify/functions/session-webhook`
- **Events**: `checkout.session.completed`
- **Signing secret**: `STRIPE_SESSION_WEBHOOK_SECRET` (Netlify env var)
- **Product image**: `https://qp-homepage.netlify.app/assets/images/1on1-sessions-payment.png`
- **Dynamic pricing**: No Stripe product IDs — uses `session_config.session_price` ($150)

### Confirmation Token System
- 64-character hex tokens (256-bit entropy) generated on every proposed booking
- Token stored in `session_bookings.confirmation_token`
- Pay link format: `https://qp-homepage.netlify.app/pages/one-on-sessions.html?pay={token}`
- Single-use: consumed when booking transitions to `paid`
- Expiry: 72-hour window enforced by `proposed_at` timestamp

### 72-Hour Offer Expiry
- Proposed bookings created via Offer Slot have `proposed_at` timestamp
- Automation checks: if `proposed_at` + 72 hours < now AND status = 'proposed' → set status to 'expired'
- Freed slot can be offered to next waitlister

### 48-Hour Cancellation Policy (TBD with Dr. Tracey)
- Cancellations more than 48 hours before session: full refund
- Cancellations within 48 hours: no refund (or partial — TBD)
- Implementation: check `booking.date + booking.start_time - 48 hours` vs now

---

## AUTOMATION SEQUENCES (to build)

### Vision: Hands-Off Operation
The goal is that Dr. Tracey only needs to:
1. Create a new cycle + set availability (10 min setup)
2. Click "Auto-Populate" + "Send Confirmations" (2 clicks)
3. Review exceptions flagged by the system (declines, no-shows, rescheduling)

Everything else is automated:

### Email Sequences
- **Client Confirmation**: "Hi {{name}}, your next sessions are ready! [Confirm & Pay]" — auto-sent when auto-populate runs
- **Confirmation Reminder** (48hr before deadline): "Please confirm your sessions by [date]"
- **Payment Confirmed**: "Your session on [date] at [time] is confirmed! Here's your Zoom link: [link]"
- **24hr Reminder**: "Your session with Dr. Tracey is tomorrow at [time]. Zoom: [link]"
- **1hr Reminder**: "Your session starts in 1 hour. Join here: [link]"
- **Post-Session Follow-up**: "Thank you for your session! [Feedback / Rebook for next cycle]"
- **Waitlist Slot Available**: "Great news! A slot has opened up — [date] at [time]. [Confirm & Pay — 72hr window]"
- **Public Opening**: "The [Spring 2026] booking window is now open! [Book Now]"
- **Cycle Summary** (to Tracey): "Cycle populated: 45/52 slots filled, 7 open for public, $X revenue"
- **Offer Expiry Warning** (48hr into 72hr window): "Your reserved slot expires in 24 hours. [Confirm & Pay Now]"

### Scheduled Jobs (Google Apps Script or Supabase cron)
- Every 15 min: check for bookings needing 24hr/1hr reminders → send
- Every hour: check for expired offers (72hr) → mark expired, notify admin
- Daily: check for upcoming confirmation deadlines → send reminders
- On cycle status change: trigger appropriate email batch

---

## QP-BRANDED EMAIL TEMPLATE (to build)

All session emails should use a premium Quantum Physician template:
- Navy (#131e3d) background sections
- Teal (#5ba8b2) accents and CTAs
- Playfair Display headings
- Clean, professional, high-end feel
- Consistent header with QP logo
- Footer with contact info, social links, unsubscribe

Session-specific email elements:
- **Appointment card**: highlighted date/time/duration/price block
- **"Confirm & Pay" CTA button**: prominent, teal gradient, links to Stripe checkout
- **"View All Appointments" CTA**: for confirmation portal
- **Zoom link card**: for confirmed sessions
- **Countdown/urgency**: "Reserved for 72 hours" / "Your session is tomorrow"

---

## PATIENT CRM / PORTAL (to build — MAJOR FEATURE)

### Overview
A built-in CRM tailored for Dr. Tracey's practice, integrated directly into the booking/payment/session flow. Not a generic CRM — purpose-built for tracking patient healing journeys.

### Components

**1. Intake Form (pre-first-session)**
- Health history, current symptoms, goals
- What they've tried before, medications, allergies
- Triggered automatically after first payment
- Stored per-client, accessible from admin + patient portal

**2. Per-Session Notes (Tracey-side)**
- What was addressed, observations, alignments found
- Recommendations given, homework assigned
- Recorded per session, linked to booking
- Private to Tracey (not visible to patient unless shared)

**3. Progress Check-ins (patient-side, periodic)**
- Short form: "How are you feeling since last session?"
- Rate symptoms, report changes, flag concerns
- Triggered automatically 48 hours post-session
- Feeds into progress tracking data

**4. Progress Tracking Dashboard**
- Chart symptom scores over time
- Track which alignments were addressed per session
- See trends across sessions (are things improving?)
- Visual data points that show the patient and Tracey that healing is working
- Accessible from admin panel + patient portal

**5. Recorded Session Storage**
- Zoom recordings uploaded per client by Tracey
- Stored securely, accessible from admin panel
- Patient can access their own recordings via patient portal
- Organized by session date

**6. Patient-Facing Portal**
- Clients access their own data: intake, recordings, notes (shared ones), check-ins, progress
- Tokenized or login-based access
- Full patient journey in one place
- No need for separate patient management software

### Admin Panel Integration
- Click any client in the Client Roster → see full patient journey
- Tabs: Overview, Intake, Session Notes, Check-ins, Progress, Recordings
- Quick actions: add note, upload recording, send check-in request
