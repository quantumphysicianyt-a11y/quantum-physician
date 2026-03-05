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
Todd (the founder/developer of Quantum Physician) and Claude have built this admin panel together across 29+ intensive sessions. Todd cares deeply about polish, design details, and getting things right. These handoff documents represent a **shared history** — every bug fix, every design decision, every architectural choice was made collaboratively and often through multiple iterations. The next Claude instance inherits this context and trust. **Treat these docs with the same care Todd does**: update them thoroughly at the end of every session, preserve hard-won lessons, and never make changes that contradict documented decisions without discussing with Todd first. This isn't just a codebase — it's a partnership.

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

**Last updated:** Session 32 (Mar 4, 2026)

---

## Session 32 Summary — Email Visibility, Automation Dashboard, Invoice Planning (Mar 4, 2026)

### Cron 7-Day Expiry for Regulars ✅
- `session-cron.js` updated: 5-day payment warning + 7-day auto-expire for `confirmed` regular bookings
- **Own config toggle**: `auto_regular_expiry` in `system_config` (independent from 72h standard toggle)
- Session-date guard: only warns/expires after the session date has passed (regulars pay post-session)
- Two new QP-branded email templates: `buildRegularExpiryWarningEmail()`, `buildRegularExpiryNoticeEmail()`
- Two new automation types: `regular_expiry_5d`, `regular_expiry_7d`
- Day-before reminders now also cover `confirmed` bookings (not just `paid`)

### CRM Emails Tab ✅
- **6th tab on client profile** (Sessions, Intake Form, Progress, Billing, Notes, Emails)
- **Session-only scope** — pulls exclusively from `email_automation_log` (no marketing/Fusion crossover)
- Summary stat boxes: Sent, Failed, Skipped, Total
- **Type filter buttons**: All, Day-Before, Follow-Up, Intake, Expiry, Failed
- **Date dropdown**: Auto-populated month/year options, combines with type filter
- **Sortable columns**: Date, Subject, Type, Status — click headers for asc/desc with ▲/▼ arrows
- Error messages shown as ⚠ tooltip on failed entries

### 7-Day Regular Expiry Toggle Card ✅
- 5th toggle card on 1-on-1 Reminders tab (after 72-Hour Payment Expiry)
- Independent `auto_regular_expiry` config key
- Description: "For regular (trusted) clients: sends a payment reminder at 5 days post-session, then auto-expires confirmed bookings at 7 days if unpaid."

### Automation Dashboard Upgrade ✅
- **200 entries** loaded (up from 50)
- **7-day summary stats bar**: sent count, failed, skipped, per-type breakdown
- **Filter buttons**: All, Sent, Failed, Skipped, Day-Before, Follow-Up, Intake, Expiry (all)
- **Date dropdown**: Month/year filter, combines with type/status filters
- **Sortable columns**: Sent, Recipient, Type, Status — click headers for asc/desc
- `formatAutomationType` and `getAutomationBadgeClass` updated with `regular_expiry_5d` and `regular_expiry_7d`

### Next Cron Run Preview ✅
- New section above Automation Send Log on 1-on-1 Reminders tab
- Cross-references current bookings against `email_automation_log` to show unsent items
- Shows: tomorrow's reminders, yesterday's follow-ups, 48h warnings, 72h expires, 5-day regular warnings, 7-day regular expires
- Green checkmark "Nothing queued" when no automations pending

### Invoice System Planning ✅
- Full design spec delivered: `invoice-system-plan.md`
- Schema: `invoices` table with auto-incrementing `QP-YYYY-NNNN` numbers, status flow (draft→sent→paid/overdue/void)
- PDF generation via Netlify function (`generate-invoice.js`) + pdfkit, stored in Supabase `invoices` bucket
- Admin: Invoices sub-tab, per-booking "📄 Invoice" button, bulk generation per cycle
- Patient portal: Invoices section on billing.html with download/pay
- Multi-currency ready (USD default, CAD+HST, EUR future)
- 4-phase implementation plan for Session 33
- 5 open questions for Dr. Tracey

### 3D Body Model Confirmed Done ✅
- Three.js 3D body model on progress.html already built and deployed (was incorrectly listed as pending)
- GLB mesh, 28 bone-accurate regions, session markers, rotate/zoom — all working
- Removed from priority list

### Files Modified
- `admin/admin.js` — ~6734 lines (from ~6456)
- `admin/index.html` — ~883 lines (from ~864)
- `netlify/functions/session-cron.js` — ~578 lines (from ~456)

### Lessons Learned
59. **Keep 1-on-1 session data isolated** — CRM client profiles should only show session-related data (automation emails, session notes, bookings). Marketing campaigns and Fusion emails belong in the platform-wide views (Customers, Email Automation). Don't cross-contaminate the session bubble.
60. **Next-run previews build trust** — Showing what the cron *will* do before it runs eliminates the "blindly trust" problem. Cross-reference current data against the log to find what hasn't been sent yet.
61. **Clickable stat cards are expected** — When users see summary stat boxes, they expect clicking them to filter. Back burner but plan for it.

---

## Session 31 Summary — Regulars Flow, Bookings Grid Overhaul, CRM Actions (Mar 4, 2026)

### Create Cycle 401 Fix ✅
- **Root cause**: Auth token expiry race condition — tokens expired during write operations
- **Fix**: `ensureFreshToken()` pre-flight helper added to `createCycle()` and all write operations
- **Duplicate `initAdmin()` call removed** — was running initAdmin twice on page load (leftover from earlier session), causing double network load, double event listeners, memory spike → browser crashes

### generateBookingToken UUID Fix ✅
- **Root cause**: `confirmation_token` column typed as `uuid` but `generateBookingToken()` produced 64-char hex string
- **Fix**: Rewrote to produce valid UUID v4 format (`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`)
- This was a pre-existing bug — date assignment had been broken since the column type changed

### Regulars / Post-Session Payment Flow ✅
- **New column**: `session_clients.client_type` (text, default 'standard') — values: 'standard' | 'regular'
- **Add Client form**: Client Type dropdown (Standard / Regular)
- **Edit Client modal**: Client Type dropdown
- **Roster cards**: Teal "Regular" badge on trusted clients
- **Auto-confirm**: Regular clients' bookings start as `confirmed` (not `proposed`) with `confirmed_at` timestamp
- **Booking status flow for Regulars**: `proposed → confirmed → completed → paid` (post-session)
- **Payment Request email**: QP-branded HTML email with pay link, sent via BulkEmailSender v3
- **`requestRegularPayment()`**: Generates/retrieves confirmation token, builds email, sends, logs to audit
- **`sendSessionEmail()`**: Wrapper helper for Apps Script sends with console logging
- **Reminders include confirmed**: Day-before reminders fire for both `paid` and `confirmed` bookings

### Bookings Grid Overhaul ✅
- **Payment column** (new): Separates payment status from session status
  - Paid (green badge), Unpaid · Request (red button), Requested + Resend, — (n/a)
- **Sortable columns**: Click any header (Date, Time, Client, Type, Status, Payment) for asc/desc
  - Active column highlights in teal with ↑/↓ arrow
- **Active/Completed/Cancelled/All sub-tabs**: Filters bookings by lifecycle stage
  - Active: Proposed, Confirmed, Paid
  - Completed: Completed, No Show
  - Cancelled: Cancelled, Declined, Expired, Rescheduled
  - All: Everything
- **Bulk actions** hide on Completed/Cancelled views
- **View-aware empty states**: Different messages per view

### Bulk Actions with Preview Checklists ✅
- **Bulk Request Payments**: Modal listing all completed unpaid regulars with checkboxes
- **Bulk Send Reminders**: Modal listing all tomorrow's sessions with checkboxes
- **Select All / individual uncheck**: Custom teal QP-themed checkboxes (`.qp-check` CSS class)
- **"Previously sent" indicator**: Shows if payment was already requested

### Reschedule System ✅
- **"Rescheduled" status**: New booking status with purple badge
- **Reason selector modal**: 6 options (Client requested, Practitioner unavailable, Illness, Scheduling conflict, No-show rebooking, Other) + optional note
- **Auto-note**: Records reason + original date on the old booking
- **`rescheduled_from` column**: Links new booking to original
- **Purple "↩ Rescheduled from [date]" indicator**: Clickable — opens detail popup with reason, original date, and notes
- **Two reschedule paths**: Roster clients → date picker modal, Public bookings → date/time picker modal
- **Reactivate button**: Moves cancelled bookings back to Proposed

### Confirmation Dialogs ✅
- Cancel, Decline, No Show now require confirmation with client name + date
- Prevents accidental status changes

### CRM Profile Actions ✅
- **Full action bar on CRM profile header**: Dates, Email, Edit, Pause, Remove buttons under client name
- **Action buttons in dates modal header**: Email, Edit, Pause accessible without leaving modal
- **Complete button UX**: Removed misleading checkmark ("✓ Complete" → "Complete")

### New Database Columns (Session 31)
```sql
ALTER TABLE session_clients ADD COLUMN IF NOT EXISTS client_type text DEFAULT 'standard';
ALTER TABLE session_bookings ADD COLUMN IF NOT EXISTS payment_requested_at timestamptz;
ALTER TABLE session_bookings ADD COLUMN IF NOT EXISTS rescheduled_from uuid;
ALTER TABLE session_bookings ADD COLUMN IF NOT EXISTS reschedule_reason text;
```

### New CSS
- **`.qp-check`** — Custom themed checkboxes: teal gradient when checked, subtle glow on hover, dark mode + light mode

### Files Modified
- `admin/admin.js` — ~6456 lines (from ~5966)
- `admin/index.html` — ~864 lines (from ~849)
- `admin/admin.css` — ~181 lines (from ~142)

### Lessons Learned
54. **Duplicate `class` attributes are silently ignored** — `class="a" class="b"` only applies "a". Merge into `class="a b"`.
55. **Supabase rejects explicit null on typed columns** — Sending `confirmed_at: null` fails if column has constraints. Build insert object conditionally.
56. **`confirmation_token` column type matters** — If DB column is `uuid`, the value MUST be valid UUID format. Random hex strings cause 400 errors.
57. **Duplicate `initAdmin()` calls cause cascading failures** — Double initialization = double network load, double event listeners, memory spikes, browser crashes.
58. **Payment status ≠ session status** — Separating into two columns (Status + Payment) eliminates the confusion of "Completed" next to action buttons.

---

## Session 30 Summary — Automated Email System for 1-on-1 Sessions (Mar 4, 2026)

### TRUE Automated Email Pipeline Built & Deployed ✅
- **Self-contained Pipeline #3** — completely isolated from Fusion (#1) and Academy (#2) email systems
- **Netlify scheduled function** (`session-cron.js`) — runs daily at 8 AM ET (13:00 UTC via `netlify.toml` cron)
- **4 automation types**: Day-Before Reminder, Post-Session Follow-Up, Intake Form Nudge, 72-Hour Payment Expiry
- **Idempotent send logic** — UNIQUE INDEX on `(booking_id, automation_type)` prevents double-sends; `alreadySent()` check before every send
- **5 QP-branded email templates** in cron: day-before, follow-up, intake nudge, 48h expiry warning, 72h expiry notice
- **Payment expiry auto-action** — 72h expired bookings get status updated to `expired` + availability slot freed
- **Fully tested end-to-end**: cron send confirmed, manual send confirmed, idempotency confirmed both directions

### Premium QP-Branded Email Templates ✅
- Rebuilt ALL templates (admin.js + session-cron.js) to match Academy/Fusion quality level
- Dark navy container (#0e1a30), rounded corners, box shadow
- Gradient header banner with QP logo
- Dr. Tracey's headshot in every signature (circular photo)
- Teal (#5ba8b2) / taupe (#ad9b84) accent system
- Left-border info boxes, gradient detail cards, uppercase letter-spaced labels
- Pill CTAs with gradient backgrounds + uppercase letter-spacing
- Shared `wrapTemplate()` in cron for DRY template generation

### New Database Tables ✅
- **`email_automation_log`** — tracks every automated email (booking_id, email, automation_type, status, error_message, sent_at). Unique constraint on booking_id + automation_type.
- **`system_config`** — key-value store for toggle persistence (auto_day_before, auto_follow_up, auto_intake_nudge, auto_payment_expiry). Seeded with defaults.

### Admin UI Improvements ✅
- **Toggle persistence** — all 4 checkboxes write to `system_config`. State survives page reload.
- **Toggle flash fixed** — removed default `checked` attributes; toggles load from DB correctly.
- **Tab persistence** — `sessionStorage` saves current page + sub-tab. Reload stays on same page.
- **Sub-tab persistence** — Email Automation sub-tabs (Scheduled/Logs/Sessions/Reminders) persist across reload.
- **Send buttons always visible** — Send Reminder / Send Follow-Up buttons show regardless of toggle state. Toggles only control the cron auto-send.
- **Automation Log Viewer** — last 50 sends with timestamp, recipient, type badge, status badge, error message.
- **Manual sends log to `email_automation_log`** — cron respects manual sends (idempotency both directions).

### Deployment Fixes (discovered during testing) ✅
- **Admin manual send payload fixed** — was sending `{action:'sendEmail', htmlBody}` to BulkEmailSender which expects `{to, body, isHtml}`. Fixed to use correct format: `isHtml: true`, `body` (not `htmlBody`), `Content-Type: text/plain`.
- **Apps Script Version 3 deployed** — initial deploy was Version 1 (empty `doPost`). Created New Deployment to activate the code.
- **`SESSION_EMAIL_SCRIPT_URL` env var** — set in Netlify pointing to Web app URL (not Deployment ID).

### New Google Apps Script ✅
- **QP Session Email Sender** (Pipeline #3) — standalone script, Version 3 deployed
- Handles `sendSessionEmail` action + legacy `sendEmail` + direct send (no action field)
- Sends from `tracey@quantumphysician.com` alias as "Dr. Tracey Clark — Quantum Physician"
- `doGet` health check + `testSend()` function

### Admin Proxy Updated ✅
- Added `email_automation_log` and `system_config` to ALLOWED_TABLES (now 32 total)

### Files Created
- `netlify/functions/session-cron.js` — NEW (~456 lines)
- `qp-session-email-script.gs` — NEW Google Apps Script for Pipeline #3 (137 lines)

### Files Modified
- `admin/admin.js` — ~5966 lines (from ~5855)
- `admin/index.html` — ~849 lines (from ~839)
- `netlify/functions/admin-proxy.js` — 32 allowed tables (from 30)
- `netlify.toml` — added `[functions."session-cron"]` cron schedule

---

## Session 29 Summary — CRM Merge, Email Automation, UX Polish (Mar 3, 2026)

### CRM Merged into Clients Tab ✅
- **Removed standalone `page-crm`** sidebar entry and page div entirely
- **Embedded CRM inside Clients tab** with sub-navigation: "Client Roster" | "All Client Profiles"
- **Client Roster cards are fully clickable** — click anywhere on card to open profile (teal hover border)
- **Client name rendered in teal** for visual affordance
- **Action buttons** (Dates, Email, Edit, Pause, Remove) have `stopPropagation` — work independently
- **"Profile →" button removed** — whole card does that now
- **Back button** returns to whichever sub-view you came from (roster or all profiles)
- **Sub-nav buttons dim** when viewing a profile, re-enable on back

### Session Notes Collapsed by Default ✅
- Notes and recordings **hidden by default** in CRM Sessions tab
- **Click row or badge** to expand/collapse
- **▼/▲ arrow** in Actions column with own `onclick` (teal color, padded hit area)
- Note/recording counts show as clickable badges ("1 note", "1" recording)
- **+ Note / + Recording** buttons still work independently via `stopPropagation`

### Progress Tab Filters ✅
- **Keyword search** — filters check-ins by symptom names/notes, practitioner notes by content
- **Date range dropdown** — All Time, Last 3 Months, Last 6 Months, Last Year
- **Type filter** — All Types, Check-Ins Only, Alignments, Milestones, Observations
- **Counts in section headers** — "PATIENT CHECK-INS (8)", "PRACTITIONER NOTES (3)"
- **Total item count** next to filters
- **Filter state persists** when adding new notes (doesn't reset selections)

### Email Automation — 1-on-1 Reminders Tab ✅
- **New "1-on-1 Reminders" sub-tab** in Email Automation page
- **4 automation toggle cards**: Day-Before Reminder, Post-Session Follow-Up, Intake Form Nudge, 72-Hour Payment Expiry
- **Generate Reminders Now** — scans bookings, populates upcoming paid sessions + recently completed
- **Preview Day-Before / Follow-Up** — iframe-based modal with QP-branded templates
- **Per-session Preview/Send buttons** — Send only appears for tomorrow's sessions
- **QP-branded email templates**: Georgia serif, gradient appointment cards, teal pill CTAs
- **Intake reminder wired** — `crmSendIntakeReminder()` now functional (was placeholder)
- ⚠️ **Toggles are UI-only** — not persisted to database. Reset on page reload.
- ⚠️ **All sending is manual** — no automated cron yet. Session 30 priority.

### Bug Fixes ✅
- **Duplicate `crmDeleteNote` function** — two functions with same name. Internal notes version renamed to `crmDeleteInternalNote()`
- **Missing `fmtTime` function** — `renderCrmSessions` used it but it was never defined. Added: converts "14:00" → "2:00 PM"
- **`data-table` CSS class doesn't exist** — CRM tables used `class="data-table"` but admin CSS only has `class="tbl"`. All 3 CRM tables fixed.
- **Profile fetch killing `Promise.all`** — `sb.from('profiles').maybeSingle()` (non-proxy) was in `Promise.all`. If it fails, all 7 fetches fail. Moved to separate try/catch.
- **Reminders panel nested inside Logs panel** — `autotab-logs` div was never closed before `autotab-reminders` started. Reminders was a child of Logs, so when Logs was hidden, Reminders was hidden too even with `display:block`. Fixed: proper sibling panels.

### Files Modified
- `admin/admin.js` — ~5855 lines (from ~5471)
- `admin/index.html` — ~839 lines (from ~773)

---

## Session 28 Summary — Body Regions, Notes System, Recording System, Real-Time Refresh (Mar 3, 2026)

### 3D Body Model: 28 Bone-Accurate Regions ✅
- Extracted inverse bind matrix positions from GLB skeleton using Three.js
- 28 standard regions mapped to precise 3D coordinates (with male/female offsets)

### Admin Region Picker Modal ✅
- 28 tappable region chips, multi-select, custom regions with nearest-standard mapping

### Session Notes System (Full CRUD) ✅
- Add/Edit/Delete notes, toggle visibility, multiple notes per session, body region pills

### Recording Upload System ✅
- Upload File (drag & drop, Supabase Storage) + Paste URL (Zoom, Vimeo, GDrive, YouTube)
- Smart video embeds on patient side, collapsible in admin

### Patient sessions.html Deep Linking ✅
- `?highlight=bookingId` URL parameter, auto-switches to Past tab, smooth scroll

### Real-Time Refresh System ✅
- `refreshBookingsView()` — parallel fetch of bookings + notes + recordings

### Bug Fixes ✅
- `session_recordings` column name: uses `uploaded_at`, not `created_at`
- Recording indicator placement fixed

---

## Sessions 26-27 Summary (condensed)

### Session 26 — Patient Portal Pages + SQL Migration
- 4 patient portal pages: sessions.html, intake.html, progress.html, billing.html
- 5 new database tables with RLS policies
- Admin-proxy updated (30 allowed tables)

### Session 27 — SSO Fix + Admin CRM + Progress Enhancements
- Cross-domain SSO fixed (Cloudflare truncation was root cause)
- Admin CRM: Client Profiles with 5-tab detail view
- Progress page: collapsible charts, symptom/energy charts, before/after toggle, quick stats, body map, milestone markers

---

## Sessions 14-25 Summary (condensed)
See previous handoff docs for full details. Key milestones:
- **Sessions 14-18**: Academy Course Builder + Student Experience
- **Sessions 19-20**: Email Center Card Library, Rich Text Editor, Auth Auto-Refresh
- **Session 21**: Unified Rich Editor (rolled back — lessons documented)
- **Session 22**: Unified Rich Editor rebuilt successfully + 7 hotfixes
- **Session 23**: Full 1-on-1 Sessions system — 6 database tables, admin panel tab, public booking page
- **Session 24**: Stripe payment backend + frontend checkout
- **Session 25**: QP Member Portal (login, dashboard, settings, reset-password, auth-aware header, SVG icons)

---

## 🔴 PRIORITY NEXT STEPS (Session 33)

### 1. Invoice System Build (Phase 1-2)
- Run SQL migration: `invoices` table + sequence + RLS + indexes
- Add `invoices` to admin-proxy allowlist (33 tables)
- Create Supabase Storage `invoices` bucket
- Build admin UI: Invoices sub-tab, Create/Edit modal, status management
- PDF generation with pdfkit (`generate-invoice.js` Netlify function)
- See `invoice-system-plan.md` for full spec

### 2. End-to-End Stripe Payment Test
- Test all 3 flows: session-checkout (token + public), academy-checkout, Fusion checkout
- Verify session-webhook.js handles real Stripe payment
- Review checkout branding across all flows

### 3. Outstanding Items
- Sortable columns on all admin tables (roster, students, orders, audit log)
- Clickable stat cards on automation dashboard (filter on click)
- Pre/post session patient forms (needs Tracey's input)
- SMS reminders (not yet mapped)

### Future Features
- **Pre/post session patient forms** — recurring quick check-ins (needs Tracey's input)
- **Student tools**: Flashcards, highlighting, reflection journal, summarizer
- **Custom card templates**: Save your own cards in Email Center
- **AI Copilot**: Smart email writing / AI documentation / transcription
- **Memberships / Subscriptions**
- **Live Event Page**: Branded Zoom experience
- **In-app secure messaging**
- **Consent forms / HIPAA agreements**
- **Multiple preferred times per client** (logged for larger rosters)

---

## Known Issues (Session 30)
1. **email-decode.min.js 404** — Netlify phantom. Harmless.
2. **Test email no delivery confirmation** — `mode:'no-cors'` means opaque response. Check inbox manually.
3. **Automation toggles now persisted** — ✅ Fixed in Session 30. Wired to `system_config` table.
4. **Cron needs deployment + env var** — `session-cron.js` deployed but needs `SESSION_EMAIL_SCRIPT_URL` env var set in Netlify.
5. **Webhook untested with real payment** — session-webhook.js deployed but not yet triggered by actual Stripe payment.
6. **Cross-domain SSO working** — QP→Fusion deployed and tested (Session 27). Fusion→QP not yet needed.
7. **notification_preferences columns** — Need to verify boolean columns exist.
8. **GitHub intermittent 500s** — Occurred during Session 27 deploys. Retry or manual Netlify deploy.
9. **Zoom recordings can't embed** — Zoom blocks iframe embeds. Workaround: download MP4 from Zoom, upload via admin.
10. **Supabase Free plan storage limit** — 1GB storage. Sufficient for ~3-4 recordings. Pro plan ($25/mo) gives 100GB.
11. **Orphaned test recordings** — Cleanup SQL included in Session 30 migration. Run it.
12. **Apps Script `mode:'no-cors'` for manual sends** — Admin manual sends still use `mode:'no-cors'` (browser limitation). Cron function runs server-side so gets full response.

---

## File Sizes (Post-Session 32)
- `admin/index.html` — ~883 lines
- `admin/admin.js` — ~6734 lines
- `admin/admin.css` — ~181 lines
- `netlify/functions/admin-proxy.js` — 32 allowed tables
- `netlify/functions/session-cron.js` — ~578 lines
- `pages/one-on-sessions.html` — ~1333 lines
- `members/sessions.html` — ~649 lines
- `members/intake.html` — ~751 lines
- `members/progress.html` — ~700 lines
- `members/billing.html` — ~332 lines
- `members/dashboard.html` — ~734 lines
- `js/shared.js` — auth-aware header

---

## Lessons Learned (ALL SESSIONS)
1-41: See previous docs.
42. **Duplicate function names silently overwrite** — JS allows two `function crmDeleteNote()` definitions. The second silently replaces the first. No error. Session notes delete was broken because internal notes delete overwrote it. Always use unique function names.
43. **Embedded sub-views beat standalone pages** — CRM as a standalone sidebar page was disconnected from the Clients tab. Merging it as sub-nav within the Clients tab makes the workflow seamless — roster → profile → back to roster.
44. **CSS class typos fail silently** — `class="data-table"` has no styling but produces no errors. Tables render with no spacing. Always verify CSS class names match actual stylesheet.
45. **Nested panel divs cause invisible content** — If panel A isn't closed before panel B starts, B becomes a child of A. When A is `display:none`, B is invisible even if B itself is `display:block`. Always verify HTML nesting with dev tools.
46. **Missing helper functions crash entire views** — `fmtTime is not defined` killed the entire Sessions tab render. When a function is used in a template, it must be defined. Add it near related helpers (`fmtDate`, `fmtMoney`).
47. **`stopPropagation` blocks child click handlers** — If a `<td>` has `stopPropagation`, clicks on child elements inside that td won't trigger parent row handlers. Give children their own `onclick` handlers.
48. **Idempotent automation requires both DB constraint + pre-check** — The UNIQUE INDEX on `(booking_id, automation_type)` is the safety net, but `alreadySent()` query before each send avoids noisy duplicate-key errors. Belt and suspenders.
49. **Server-side cron vs browser no-cors** — Admin manual sends use `mode:'no-cors'` and get opaque responses (can't confirm delivery). The Netlify cron function runs server-side with full `fetch()` and gets real HTTP responses. Always prefer server-side for reliability.
50. **Separate Apps Scripts for separate pipelines** — Option B (new script) beats Option A (extend existing) for isolation. Each pipeline has its own deployment URL, its own logs, its own failure modes. No shared state = no cross-contamination.
51. **Apps Script: save ≠ deploy** — Saving code in the editor does NOT update the live web app. Must click Deploy → New Deployment each time code changes. The Executions log will show `doGet` only (from health checks) if `doPost` code was never deployed.
52. **Match payload formats to the receiver** — Admin manual sends go to BulkEmailSender v3 which expects `{to, body, isHtml, recipientName}` with `Content-Type: text/plain`. Sending `{action, htmlBody}` silently fails because no-cors hides the error. Always verify the receiver's expected payload format.
53. **Deployment ID vs Web app URL** — Google Apps Script shows both after deploy. The Deployment ID is an internal identifier. The Web app URL (ending in `/exec`) is the callable endpoint. Use the `/exec` URL for env vars.
