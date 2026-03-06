# Session 34 — 1-on-1 Sessions Completion Sprint

## Context
This is Session 34 of building the Quantum Physician admin panel and patient platform. Session 33 delivered the invoice system (auto-generation on Stripe payment, branded PDF with PAID watermark, admin + patient portal views). The 1-on-1 Sessions system is functionally complete — but the Stripe payment chain has never been tested with a real payment. This session finishes the remaining gaps.

## Priority 1: End-to-End Stripe Payment Test

The session-webhook.js was updated in Session 33 to auto-create invoices on payment, but has never been triggered by a real Stripe payment. This is the single most important test — it validates the entire chain:

**Flow to test:**
1. Client visits `/pages/one-on-sessions.html`
2. Selects a time slot → Stripe checkout via `session-checkout.js`
3. Pays → Stripe fires `checkout.session.completed`
4. `session-webhook.js` receives it and:
   - Updates booking to `paid`
   - Sends confirmation email
   - Creates invoice record (`QP-YYYY-NNNN`)
   - Generates branded PDF (calls `generate-invoice.js`)
   - Emails paid invoice to client
   - Logs to audit

**What to verify:**
- Booking status changes to `paid` in admin
- Confirmation email arrives
- Invoice appears in admin Invoices tab with PDF
- Invoice email arrives with PDF download link
- Invoice appears on patient billing.html
- PDF downloads correctly from both admin and patient side

**Also test:**
- Token-based checkout (admin sends pay link to roster client)
- Academy checkout (course purchase)

**Known env vars needed:**
- `STRIPE_SESSION_WEBHOOK_SECRET` — separate signing secret for the session webhook endpoint
- `SESSION_EMAIL_SCRIPT_URL` — Apps Script URL for Pipeline #3
- Both should already be set in Netlify from Session 30

## Priority 2: Invoice PDF Polish

Current PDF is functional but spacing could be tighter. Specific fixes:
- Reduce dead space between sections
- Verify logo and headshot render correctly across PDF viewers (Chrome, Safari, Preview.app)
- Test tax row rendering with a CAD + HST invoice
- Consider: should the footer "Thank you" message be configurable per-invoice or always the same?

## Priority 3: Sortable Columns on Remaining Tables

These admin tables still have static headers (no click-to-sort):
- Client Roster (sort by name, email, frequency, status, type)
- Students table (already has dropdown sort — could add column headers too)
- Orders table (sort by date, email, product, amount)
- Audit Log (sort by date, action, email)

Pattern is established — same `sortArrow`, `thStyle`, `thActive` approach used in bookings grid, invoices, CRM sessions, CRM billing, automation log.

## Priority 4: Remaining 1-on-1 Features

**48-hour cancellation enforcement:**
- Currently just a policy statement, not enforced in code
- Add check: if booking date is within 48 hours, disable Cancel button or show warning
- Configurable in session_config (cancellation_hours)

**Add-to-calendar (.ics):**
- Generate .ics file attachment for confirmation emails
- Also add "Add to Calendar" button on patient sessions.html
- Standard iCal format with session date/time, Zoom link, Dr. Tracey's info

**Clickable stat cards on automation dashboard:**
- Summary stat boxes should filter the log when clicked
- e.g., click "5 Failed" → filters log to show only failed entries

## Files to Upload at Session Start
- `admin/index.html`
- `admin/admin.js`
- `admin/admin.css`
- `netlify/functions/admin-proxy.js`
- `netlify/functions/session-webhook.js`
- `netlify/functions/generate-invoice.js`
- `members/billing.html`
- All 4 handoff docs (admin-master-plan.md, full-infrastructure-doc.md, fusion-gap-analysis.md, session-system-design.md)

## Tech Reminders
- Admin is vanilla JS, single-page app (~7,550 lines admin.js, ~901 lines index.html)
- All admin DB ops go through `admin-proxy.js` (33 tables + RPC, service key server-side)
- Patient pages use Supabase anon key + RLS policies
- Invoices bucket is private — needs signed URLs for patient access
- `generate-invoice.js` accepts `internal: true` from webhook (skips admin auth)
- Deploy: `cd ~/Downloads/quantum-physician`, `git add -A`, `git commit -m "message"`, `git push origin main`
- Node.js is installed (v24.14.0, npm 11.9.0)
- pdfkit is in package.json at repo root
