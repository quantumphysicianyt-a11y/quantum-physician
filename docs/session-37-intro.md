# Session 37 — Intro for Claude

Hi Claude — you're continuing a long-running build of the **Quantum Physician (QP)** platform with Todd, the founder and sole developer. You've built this together across 36 sessions. Read the three handoff docs carefully before touching any code.

## What was completed in Session 36

### Webhook Bug Fix
- `stripe_session_id` wasn't being populated on `session_bookings` during payment webhook — the cancel button in `sessions.html` depends on this field. Fixed in `session-webhook.js`.

### Clickable Automation Stat Cards
- Stat cards (sent, failed, skipped, per-type) on the automation log are now clickable — they filter the log table and scroll into view.

### Session Types System
- New `session_types` table: Zoom Session (€200, 30min, EUR), Recorded Session (€150, 30min, EUR)
- Admin CRUD in new "Session Types" tab under Sessions
- Based on Tracey's voice transcripts describing her two session types and pricing

### Multi-Currency Foundation
- `session_bookings` gets `session_type_id` (FK), `amount_cents`, `currency` — price snapshot at booking time
- `session_clients` gets `currency` (default EUR), `tax_label`, `tax_rate` — for Canadian HST clients
- Tracey charges EUR for international clients, CAD+HST for Canadian clients

### Dual Offer Flow (Regular vs Public)
- **Regular clients** (`client_type = 'regular'`): booking created as `proposed`, "Confirm Your Date" email (7-day window), payment collected via day-before reminder — NOT a gate to the session
- **Public clients**: booking created as `proposed`, "Confirm & Pay" email (72hr window) with Stripe payment link — must pay to confirm
- Detection via shared `isRegularClient(email)` function
- ★ Regular badge consistent across waitlist, bookings grid, CRM profile, All Client Profiles

### Day-Before Cron Upgrade
- Health update request in all reminders ("share updates on your health and goals")
- Session-type-aware (duration, type name, zoom detection)
- Zoom link only shown for zoom session types
- Soft payment nudge for unpaid regulars (subtle button, not main CTA)
- Already-paid clients see no payment section

## Files modified in Session 36
- `admin/admin.js` — session types CRUD, dual offer flow, regular badge consistency, clickable stat cards
- `admin/index.html` — Session Types tab added
- `netlify/functions/admin-proxy.js` — `session_types` added to allowed tables (34 total)
- `netlify/functions/session-webhook.js` — populate `stripe_session_id` on payment
- `netlify/functions/session-cron.js` — day-before reminder with health update, session types, regular payment nudge

## SQL run in Session 36
```sql
CREATE TABLE session_types (id uuid PK, name, description, duration_minutes, price_cents, currency, is_active, sort_order);
INSERT: Zoom Session (€200, 30min, EUR), Recorded Session (€150, 30min, EUR);
ALTER TABLE session_bookings ADD session_type_id uuid FK, amount_cents integer, currency text DEFAULT 'EUR';
ALTER TABLE session_clients ADD currency text DEFAULT 'EUR', tax_label text, tax_rate numeric(5,2);
```

## What to work on in Session 37 (Todd will confirm priorities)

### Critical — Complete the payment flows
1. **Fix `one-on-sessions.html` pay token handling** — Public "Confirm & Pay" link currently lands on "All Sessions Filled" instead of Stripe checkout. The `?pay=TOKEN` needs to look up the booking, show session details, and redirect to Stripe checkout.
2. **Update `session-checkout.js` for multi-currency** — needs to accept `currency` param and create Stripe checkout in EUR or CAD accordingly.
3. **Regular client "Confirm Date" landing** — regulars clicking "Confirm Your Date" need a page that just confirms the date (moves booking from `proposed` → `confirmed`) without requiring payment.

### Polish
4. **Client roster currency editor** — add currency/tax dropdown to the client edit modal so Tracey can mark Canadian clients as CAD+HST.
5. **Calendar buttons in day-before reminder emails** — add Google/Apple/Outlook buttons (same pattern as confirmation email).
6. **Test day-before cron end-to-end** — create a booking for tomorrow, trigger cron manually, verify email content for both regular and paid flows.

### Tracey's Process Insights (from Session 36 voice transcripts)
- Two session types: Zoom (€200) and Recorded (€150), both 30 minutes
- Charges in EUR for international, CAD+HST for Canadian clients
- Currently uses PayPal (international) and Square (Canadian) — consolidating to Stripe
- Day-before reminder asks for health updates + goals
- Payment is a soft nudge for regulars, not a blocker
- 4-month booking cycles confirmed, waitlist for new clients confirmed
- No special "first session" type — all sessions same format

## Important reminders
- Always run `node --check admin.js` after editing admin.js before deploying
- Use Python string replacement (not sed) for complex JS edits
- `session_recordings` uses `uploaded_at` NOT `created_at`
- Deploy commands always: `cd ~/Downloads/quantum-physician` → `cp` → `git add` → `git commit` → `git push origin main`
- `isRegularClient(email)` and `regularBadgeHtml(small)` are shared functions — use them instead of inline checks
- Session types are loaded as `sessTypesData` global, fetched in parallel with all session data
