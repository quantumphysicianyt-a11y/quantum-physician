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

**Last updated:** Session 30 (Mar 4, 2026)

---

## Session 30 Summary — Automated Email System for 1-on-1 Sessions (Mar 4, 2026)

### TRUE Automated Email Pipeline Built ✅
- **Self-contained Pipeline #3** — completely isolated from Fusion (#1) and Academy (#2) email systems
- **Netlify scheduled function** (`session-cron.js`) — runs daily at 8 AM ET (13:00 UTC via `netlify.toml` cron)
- **4 automation types**: Day-Before Reminder, Post-Session Follow-Up, Intake Form Nudge, 72-Hour Payment Expiry
- **Idempotent send logic** — UNIQUE INDEX on `(booking_id, automation_type)` prevents double-sends; `alreadySent()` check before every send
- **5 QP-branded email templates** in cron: day-before, follow-up, intake nudge, 48h expiry warning, 72h expiry notice
- **Payment expiry auto-action** — 72h expired bookings get status updated to `expired` + availability slot freed

### New Database Tables ✅
- **`email_automation_log`** — tracks every automated email (booking_id, email, automation_type, status, error_message, sent_at). Unique constraint on booking_id + automation_type.
- **`system_config`** — key-value store for toggle persistence (auto_day_before, auto_follow_up, auto_intake_nudge, auto_payment_expiry). Seeded with defaults.

### Admin UI Wired to Database ✅
- **Toggle persistence** — all 4 checkboxes now call `toggleAutomationConfig()` which writes to `system_config` table. State survives page reload.
- **Automation Log Viewer** — new section below reminders list showing last 50 sends with timestamp, recipient, type badge, status badge, error message
- **Manual sends now log to `email_automation_log`** — `sendSessionReminder()` inserts to log table so cron won't double-send

### New Google Apps Script ✅
- **QP Session Email Sender** (Pipeline #3) — standalone script, completely separate from BulkEmailSender v3 and FusionSessionsAutomation
- Handles `sendSessionEmail` action
- Sends from `tracey@quantumphysician.com` alias as "Dr. Tracey Clark — Quantum Physician"
- Includes `doGet` health check endpoint and `testSend()` function

### Admin Proxy Updated ✅
- Added `email_automation_log` and `system_config` to ALLOWED_TABLES (now 32 total)

### Cleanup ✅
- **Orphaned test recordings SQL** included in migration script
- Migration SQL file: `session-30-migration.sql`

### Files Created
- `netlify/functions/session-cron.js` — NEW (428 lines)
- `qp-session-email-script.gs` — NEW Google Apps Script for Pipeline #3

### Files Modified
- `admin/admin.js` — ~5936 lines (from ~5855)
- `admin/index.html` — ~849 lines (from ~839)
- `netlify/functions/admin-proxy.js` — 32 allowed tables (from 30)

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

## 🔴 PRIORITY NEXT STEPS (Session 31)

### 1. Deploy & Test Email Automation Pipeline (FIRST PRIORITY)
**Todd's deployment checklist:**
1. Run `session-30-migration.sql` in Supabase SQL Editor (creates 2 tables + cleanup)
2. Deploy updated `admin-proxy.js` (32 tables)
3. Create new Google Apps Script from `qp-session-email-script.gs`:
   - New project in Google Apps Script
   - Paste code → Deploy → New deployment → Web app → Execute as Me → Anyone can access
   - Copy deployment URL
4. Set Netlify env var: `SESSION_EMAIL_SCRIPT_URL` = deployment URL
5. Deploy `session-cron.js` + `netlify.toml` cron schedule
6. Test: Run `testSend()` in Apps Script → verify email arrives
7. Test: Trigger cron manually in Netlify Functions dashboard
8. Test: Create a test booking for tomorrow → verify day-before email fires
9. Test: Toggle automation on/off in admin → verify persists across reload
10. Test: Check automation log viewer shows entries

### 2. End-to-End Stripe Payment Test
- Test with real transaction or Stripe test mode
- Verify webhook → booking update → confirmation email
- Test all 3 checkout flows: sessions, Academy, Fusion

### 3. Three.js 3D Body Model Rebuild
- Replace 2D body map overlay on progress.html
- Use 28 bone-accurate region coordinates from Session 28

### 4. Outstanding Items
- Stripe checkout branding review (all 3 checkout flows)
- notification_preferences column verification
- GitHub intermittent 500s monitoring

### Future Features
- **Pre/post session patient forms** — recurring quick check-ins (needs Tracey's input on process before building)
- **Student tools**: Flashcards, highlighting, reflection journal, summarizer, progress dashboard, goal tracking
- **Custom card templates**: Save your own cards in Email Center
- **Session invoicing**: Multi-currency (CAD+HST, EUR), printable PDFs, refund buttons, batch generation
- **AI Copilot**: Smart email writing
- **Memberships / Subscriptions**
- **Live Event Page**: Branded Zoom experience

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

## File Sizes (Session 30)
- `admin/index.html` — ~849 lines
- `admin/admin.js` — ~5936 lines
- `admin/admin.css` — ~142 lines
- `netlify/functions/admin-proxy.js` — 32 allowed tables
- `netlify/functions/session-cron.js` — ~428 lines (NEW)
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
