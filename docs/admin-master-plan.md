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
Todd (the founder/developer of Quantum Physician) and Claude have built this admin panel together across 28+ intensive sessions. Todd cares deeply about polish, design details, and getting things right. These handoff documents represent a **shared history** — every bug fix, every design decision, every architectural choice was made collaboratively and often through multiple iterations. The next Claude instance inherits this context and trust. **Treat these docs with the same care Todd does**: update them thoroughly at the end of every session, preserve hard-won lessons, and never make changes that contradict documented decisions without discussing with Todd first. This isn't just a codebase — it's a partnership.

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

**Last updated:** Session 29 (Mar 3, 2026)

---

## Session 29 Summary — CRM Merge, Email Automation, Cleanup (Mar 3, 2026)

### CRM Merged into Clients Tab ✅
- **Removed** standalone `page-crm` sidebar entry and its page div
- **Added sub-navigation** to Clients tab: "Client Roster" | "All Client Profiles"
- Client Roster now has a **"Profile →" button** on each client that opens the 5-tab CRM detail view inline
- "All Client Profiles" shows the full CRM list (including non-roster public clients) with search/filter/sort
- CRM detail view (Sessions, Intake, Progress, Billing, Notes) now lives inside `sess-tab-clients`
- **Back button** returns to whichever sub-view was active (roster or all profiles)
- Sub-nav buttons dim when detail view is open
- Removed `crm` from TITLES constant and loadPageData switch
- **Bug fix**: renamed duplicate `crmDeleteNote` → `crmDeleteInternalNote` (was overwriting session note delete)

### Email Automation — 1-on-1 Session Reminders ✅
- **New "1-on-1 Reminders" sub-tab** in Email Automation page
- **4 automation toggles**: Day-Before Reminder, Post-Session Follow-Up, Intake Form Nudge, 72-Hour Payment Expiry
- **Day-before reminder email**: QP-branded (Georgia serif, gradient appointment card), includes Zoom link, date/time, preparation tips, portal deep link
- **Post-session follow-up email**: Thanks patient, post-session guidance list, links to progress tracker
- **Intake form reminder**: Sends branded email with link to `/members/intake.html` (replaces "coming soon" placeholder)
- **Preview system**: iframe-based email preview modal for both templates
- **Per-booking send**: individual "Send Reminder" / "Send Follow-Up" buttons next to each booking
- **Batch send**: `sendBatchReminders()` for all tomorrow's sessions at once
- **Pending reminders list**: shows upcoming paid sessions (highlights tomorrow's) and recently completed sessions
- All sends go through existing Google Apps Script `APPS_SCRIPT_URL` with `mode:'no-cors'`
- All sends logged via `logAudit()`

### Files Modified
- `admin/index.html` — ~839 lines (from ~773): removed page-crm, embedded CRM in Clients tab, added reminders tab
- `admin/admin.js` — ~5741 lines (from ~5471): CRM merge functions, session reminder automation, email templates
- `members/sessions.html` — unchanged (carried forward from S28)

### No Database Changes
- No new tables or columns needed this session

---

## Session 28 Summary — Body Regions, Notes System, Recording System, Real-Time Refresh (Mar 3, 2026)

### 3D Body Model: 28 Bone-Accurate Regions ✅
- Extracted inverse bind matrix positions from GLB skeleton using Three.js
- 28 standard regions mapped to precise 3D coordinates (with male/female offsets)
- Regions: atlas, c1-c2, cervical-spine, left-neck, right-neck, thoracic-spine, lumbar-spine, sacrum, coccyx, left-shoulder, right-shoulder, left-elbow, right-elbow, left-wrist, right-wrist, left-hip, right-hip, left-knee, right-knee, left-ankle, right-ankle, pelvis, sternum, left-ribs, right-ribs, tmj, cranium, full-spine
- All positions verified against the GLB model's actual bone structure

### Admin Region Picker Modal ✅
- 28 tappable region chips in a grid layout
- Multi-select: chips toggle teal when selected
- **Custom regions**: text input + "nearest standard region" dropdown + "+ Add" button
- Custom regions create teal chips showing custom label + placement region
- Custom labels stored in note content as `[Custom alignments: ...]`
- Placement mapped to nearest standard region's coordinates on 3D body map
- No database schema changes — uses existing `body_regions` jsonb column

### Session Notes System (Full CRUD) ✅
- **Add note**: from any booking status (proposed, confirmed, paid, completed)
- **Edit note**: reopens modal with content, regions pre-selected, visibility state
- **Delete note**: with confirmation dialog
- **Toggle visibility**: one-click 🔓/🔒 to share/hide from patient
- **YES/NO visibility toggle** in modal — large button, dark card, helper text
- **Multiple notes per session**: unlimited notes per booking
- **Collapsible in bookings grid**: toggle row shows `▸ 📝 2 notes · 🎥 1 recording click to expand`
- Notes show: type badge, content, body region pills, visibility badge, time ago, action buttons

### Recording Upload System ✅
- **Upload modal** with two tabs: "Upload File" and "Paste URL"
- **Upload File tab**: drag & drop or click-to-select, MP4/MOV/WebM, 50MB max, progress bar
  - Uploads to Supabase Storage bucket `session-recordings`
  - Stores `source_type: 'supabase'`, `file_path`, `file_size_mb`
- **Paste URL tab**: Zoom, Vimeo, Google Drive, YouTube, any link
  - Stores `source_type: 'external'`
- **Admin recording indicators**: `🎥 1 recording` in collapsible toggle row
- **Expanded view**: shows each recording with Hosted/External badge, title, size, Play link, 🗑 Delete button
- **Delete recording**: confirmation dialog, deletes from Supabase Storage if hosted

### Smart Video Embeds (Patient Side — sessions.html) ✅
- **Supabase hosted**: Native HTML5 `<video>` player + Download button
- **Vimeo**: Embedded Vimeo player (title/byline/portrait stripped) + "Watch on Vimeo" link
- **Google Drive**: Embedded Google Drive preview player
- **YouTube**: Embedded YouTube player
- **Zoom/other**: "Opens in new tab" fallback link (Zoom blocks iframe embeds)
- **Detection**: regex matching on URL pattern, auto-selects correct embed type

### Patient sessions.html Deep Linking ✅
- `?highlight=bookingId` URL parameter
- Auto-switches to Past tab
- Finds session card by `data-booking-id`
- Expands details, highlights with teal border, smooth scrolls
- Triggered from progress.html 3D body map "View Session →" links

### Real-Time Refresh System ✅
- **New `refreshBookingsView()` function**: parallel fetch of bookings + notes + recordings via `Promise.all`
- Replaces all scattered manual reload calls
- **Every action triggers it**: add/edit/delete notes, add/delete recordings, status changes, delete bookings
- **Bookings tab switch** also triggers fresh pull
- Eliminates need for hard-refresh after actions

### UI Polish ✅
- **Green "✓ Complete" button** replaces subtle ghost-style "Complete" on paid bookings
- **Body region badges** on patient sessions.html (teal pills matching admin styling)
- **Download icon** added to SVG sprite in sessions.html

### Bug Fixes ✅
- **`session_recordings` column name**: table uses `uploaded_at`, not `created_at` — was causing 400 errors from admin-proxy, recordings returned 0. Fixed all 3 references.
- **Recording indicator not showing**: was placed in status column which renders before bRecs is computed. Moved to collapsible toggle row where data is already filtered.

### Database Changes
- `session_recordings` table: added `source_type` (text, default 'external'), `file_path` (text), `file_size_mb` (numeric) via SQL migration
- Supabase Storage bucket `session-recordings` created (public read, authenticated write/delete)

### Files Modified
- `admin/admin.js` — ~5471 lines (from ~5048)
- `members/sessions.html` — ~649 lines (from ~551)
- `netlify/functions/admin-proxy.js` — unchanged (session_recordings was already whitelisted)

---

## Sessions 26-27 Summary (condensed)

### Session 26 — Patient Portal Pages + SQL Migration
- 4 patient portal pages: sessions.html, intake.html, progress.html, billing.html
- 5 new database tables with RLS policies
- Admin-proxy updated (30 allowed tables)
- Cross-domain SSO attempted (QP side done, Fusion caused loading hang)

### Session 27 — SSO Fix + Admin CRM + Progress Enhancements
- Cross-domain SSO fixed (Cloudflare truncation was root cause)
- Admin CRM: Client Profiles with 5-tab detail view
- Progress page: collapsible charts, symptom/energy charts, before/after toggle, quick stats, body map, milestone markers
- Demo data populated for testing

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

## 🔴 PRIORITY NEXT STEPS (Session 30)

### 1. Three.js 3D Body Model Rebuild (HIGH PRIORITY)
- Replace 2D body map overlay on progress.html with proper 3D model
- Use the 28 bone-accurate region coordinates from Session 28
- Interactive: click markers to see session details

### 2. End-to-End Stripe Payment Test
- Test with real transaction or Stripe test mode
- Verify webhook → booking update → confirmation email
- Test all 3 checkout flows: sessions, Academy, Fusion

### 3. 72-Hour Offer Expiry Automation
- Wire the toggle in Email Automation to actually auto-expire proposed bookings
- Send 48-hour reminder, then auto-decline at 72 hours
- Requires either a Netlify scheduled function or Google Apps Script time trigger

### 4. Email Automation Polish
- Hook up toggles to persistent config (save to session_config or new automation_config table)
- Add Supabase cron / Google Apps Script trigger for daily auto-scan (instead of manual "Generate")
- Add email tracking for session reminders

### 5. Outstanding Items
- Stripe checkout branding review (all 3 checkout flows)
- notification_preferences column verification
- Fusion→QP SSO (not yet needed but planned)

### Future Features
- **Student tools**: Flashcards, highlighting, reflection journal, summarizer, progress dashboard, goal tracking
- **Custom card templates**: Save your own cards in Email Center
- **AI Copilot**: Smart email writing
- **Memberships / Subscriptions**
- **Live Event Page**: Branded Zoom experience

---

## Known Issues (Session 29)
1. **email-decode.min.js 404** — Netlify phantom. Harmless.
2. **Test email no delivery confirmation** — `mode:'no-cors'` means opaque response. Check inbox manually.
3. **Rich editor → email fidelity** — Advanced formatting may not render perfectly in all email clients.
4. **Token refresh first-login** — After deploying auth changes, must log out + back in once.
5. **Dead code from Session 19-20** — Old EC overrides still present. Low priority cleanup.
6. **Webhook untested with real payment** — session-webhook.js deployed but not yet triggered by actual Stripe payment.
7. **Calendar needs active cycle** — Frontend shows "filled" when all cycles completed. Intentional.
8. **Cross-domain SSO working** — QP→Fusion deployed and tested (Session 27). Fusion→QP not yet needed.
9. **notification_preferences columns** — Need to verify boolean columns exist.
10. **GitHub intermittent 500s** — Occurred during Session 27 deploys. Retry or manual Netlify deploy.
11. **Zoom recordings can't embed** — Zoom blocks iframe embeds. Workaround: download MP4 from Zoom, upload via admin.
12. **Supabase Free plan storage limit** — 1GB storage. Sufficient for ~3-4 recordings. Pro plan ($25/mo) gives 100GB with overage at $0.021/GB. Decision deferred.
13. **Old test recordings have dummy booking_id** — 4 records with `aa000001-...` booking_id are orphaned. Can be deleted from session_recordings table. (SQL provided below)
14. **Automation toggles not persisted** — The 4 reminder toggles in Email Automation are checkbox-only (no DB save). They reset on page reload. Future: save to session_config or new table.
15. **Batch reminder needs cron** — "Generate Reminders Now" is manual. For true automation, add a Google Apps Script time trigger or Netlify scheduled function to auto-send day-before reminders daily.

---

## File Sizes (Session 29)
- `admin/index.html` — ~839 lines (was ~773 in S28)
- `admin/admin.js` — ~5741 lines (was ~5471 in S28)
- `admin/admin.css` — ~142 lines
- `pages/one-on-sessions.html` — ~1333 lines
- `members/login.html` — ~NEW (Session 25)
- `members/dashboard.html` — ~734 lines (Session 26)
- `members/settings.html` — ~NEW (Session 25)
- `members/reset-password.html` — ~NEW (Session 25)
- `members/sessions.html` — ~649 lines (Updated Session 28)
- `members/intake.html` — ~751 lines (Session 26)
- `members/progress.html` — ~700 lines (Session 27)
- `members/billing.html` — ~332 lines (Session 26)
- `js/shared.js` — UPDATED (auth-aware header)
- `netlify/functions/admin-proxy.js` — 30 allowed tables

---

## Lessons Learned (ALL SESSIONS)
1-35: See previous docs.
36. **Column name mismatches cause proxy 400 errors** — `session_recordings` uses `uploaded_at`, not `created_at`. Always verify actual column names in Supabase Table Editor before writing order-by queries.
37. **Proxy 400 ≠ table not whitelisted** — The proxy returns 400 for both "invalid table" and "Postgres query error". Check the actual error message. If the table IS in ALLOWED_TABLES, the 400 is from the database query itself.
38. **Promise.all silently swallows individual failures** — When one of 8 parallel proxy calls fails, the others succeed but the failed one returns `{data: null}`. This makes it look like data is missing rather than erroring. Add console.log to diagnose.
39. **Recording upload works on Free plan** — Supabase Storage bucket works on Free tier (1GB limit, 50MB per file). No Pro plan required to start using it.
40. **Vimeo embed cleanup** — Add `?title=0&byline=0&portrait=0` to Vimeo player URL to remove the overlay showing uploader name/avatar. Reduces dead space significantly.
41. **refreshBookingsView() is the standard** — All bookings tab actions should call this one function instead of individual table refreshes. It does parallel fetch of bookings + notes + recordings and re-renders everything.
42. **Duplicate function names silently overwrite** — Session 28 had two `crmDeleteNote` functions (one for session notes, one for internal notes). JS silently uses the last-defined one, causing the first to be unreachable. Always use unique names. Fixed in S29 by renaming to `crmDeleteInternalNote`.
43. **Embedded sub-views beat standalone pages** — Merging CRM into the Clients tab (with sub-nav switching) is cleaner than a separate sidebar entry. Less navigation overhead, shared data context, and the client roster → profile flow is natural.
