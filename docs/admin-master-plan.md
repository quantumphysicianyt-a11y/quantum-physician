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
Todd (the founder/developer of Quantum Physician) and Claude have built this admin panel together across 21+ intensive sessions. Todd cares deeply about polish, design details, and getting things right. These handoff documents represent a **shared history** — every bug fix, every design decision, every architectural choice was made collaboratively and often through multiple iterations. The next Claude instance inherits this context and trust. **Treat these docs with the same care Todd does**: update them thoroughly at the end of every session, preserve hard-won lessons, and never make changes that contradict documented decisions without discussing with Todd first. This isn't just a codebase — it's a partnership.

**These 3 docs are the ONLY source of truth across chat sessions. Claude has NO memory between sessions.**

### The 3 Handoff Docs (+1 reference):
1. `admin-master-plan.md` — Full roadmap, session plan, what's built vs what's missing, priority recommendations
2. `fusion-gap-analysis.md` — Feature parity tracking (Fusion admin vs QP admin), what's migrated vs what's still missing
3. `full-infrastructure-doc.md` — Database tables, RLS policies, Netlify functions, Supabase clients, system architecture
4. `ACADEMY-HANDOFF.md` — Academy-specific platform docs (standalone reference, not updated every session)

### At the END of every build session, Claude MUST:
- **Update ALL 3 docs** — not just one. Every session touches multiple concerns.
- **Mark completed features as ✅** with "SESSION N" label
- **Document every database change, bug fix, architectural decision**
- **Output all 3 updated docs** as downloadable files

### At the START of every new chat, Todd uploads:
- These 3 docs + the current `admin/index.html`, `admin/admin.js`, `admin/admin.css`
- Claude reads all docs BEFORE writing any code

**Last updated:** Session 22 + Hotfixes (Feb 28, 2026) — Session 23 (1-on-1 Sessions) starting next

---

## Sessions 14-19 Summary (Course Builder & Academy)

These sessions focused on the **Quantum Academy Course Builder** and student experience:

### Session 14-15 — Course Builder v1 ✅
- Full course builder with lesson creation, ordering, and management
- Quiz builder with multiple question types
- Admin preview functionality
- Lesson templates (text, video, quiz, mixed)

### Session 16-17 — Course Builder v2 + Student Experience ✅
- Full-page lesson viewer with progress bars, tip boxes, images, key takeaways
- Sidebar grouping with animations and hover effects
- Light/dark mode with theme toggle
- Demo course generator for testing

### Session 18 — Student Tools ✅
- Student notes panel with print functionality
- Interactive checkboxes in lessons
- Focus timer with Pomodoro presets
- Badge system fixes

### Session 19 — Email Center Card Library Port ✅
- 11 pre-built card templates ported to Email Center
- Drag-to-reorder card pills
- Live auto-preview with 800ms debounce
- CTA button library (Watch Sessions, Go to Dashboard, Referral Hub, Explore Academy, Join Community, Custom)
- Cursor-position merge tag insert
- Discount auto-strip (prevents duplicate discount sections)
- Session image token rendering in preview

---

## Session 20 Completion Summary — Email Center Full Feature Build (Feb 27, 2026)

### Auth Token Auto-Refresh ✅
- **Problem**: Supabase session tokens expire after 1 hour, causing "0 recipients" and 401 errors
- **Solution**: Three-layer protection:
  1. `onAuthStateChange` listener — auto-saves new token whenever Supabase internally refreshes
  2. `adminProxy` auto-retry on 401 — refreshes token and retries the request once
  3. Background refresh every 45 minutes — proactive refresh before expiry
  4. Session restore on page load — restores Supabase session from stored refresh_token
- **Impact**: No more forced logouts. Session survives indefinitely as long as tab is open
- **Note**: First login after deploy stores the refresh_token. After that, it self-sustains.

### Test Email Fix ✅
- **Problem**: Test email tried to insert into `email_log` table (missing `body` column), then tried `/.netlify/functions/send-email` (doesn't exist — returns 404)
- **Root cause**: Emails are sent via Google Apps Script (`APPS_SCRIPT_URL`), not Netlify functions
- **Fix**: Removed email_log insert, changed to use `APPS_SCRIPT_URL` with `mode:'no-cors'`
- **Styled modal**: Replaced browser `prompt()` with themed modal matching admin design (dark card, input field, Cancel/Send buttons, overlay click to close, Enter key support)

### URL Corrections ✅
- **Problem**: CTA buttons and card library templates had stale URLs (`fusionsessions.quantumphysician.com`, `fusionsessions.netlify.app`)
- **Fix**: All Fusion URLs normalized. HOWEVER — `fusionsessions.com` turned out to NOT be the live domain (ERR_CONNECTION_REFUSED). The correct subdomain needs verification.
- **⚠️ IMPORTANT**: The live Fusion Sessions site domain needs to be confirmed by Todd. Current URLs in code use `fusionsessions.com` but this may need to be reverted to `fusionsessions.quantumphysician.com` or similar. Check with Todd at start of next session.

### Rich Text Editor ✅
- **Full WYSIWYG editor** replaces the plain textarea in Email Center
- **Pinned toolbar**: Undo/Redo, Heading (Normal/H1/H2/H3), Font family (Arial/Georgia/Playfair/Courier/Verdana/Trebuchet), Font size (XS-2X), Bold/Italic/Underline/Strikethrough, Text color picker, Highlight color picker, Align L/C/R, Bullet list, Numbered list, Insert link, Card divider (---)
- **"More ▾" dropdown**: Insert Image (URL), Emoji picker (48 emojis in grid), Blockquote, Insert Table (row/col picker), Indent/Outdent, Line Spacing (1x-2.5x), Clear Formatting, Source Code toggle
- **Source code toggle**: Switch between rich editor and raw markdown. `{ }` button stays clickable in source mode, shows "Rich" to indicate return path
- **Bi-directional sync**: Rich editor ↔ hidden textarea. Converts bold to `**bold**`, links to `[text](url)`, etc.
- **Template loading**: Loading a template updates both the textarea and rich editor
- **Merge tags**: Insert `{{name}}`, `{{email}}`, `{{referral_code}}` as styled inline spans in rich mode
- **CTA buttons**: Insert as styled links in rich mode, markdown links in source mode
- **Card library**: Appends card text and updates rich editor

### Smart CTA Button System ✅ (from Session 19, refined Session 20)
- **Markdown link detection**: `[Button Text](url)` in card → extracts label + URL for CTA button
- **Keyword fallback**: Bundle→"COMPLETE YOUR BUNDLE", Dashboard→"GO TO DASHBOARD", etc.
- **Default**: "LEARN MORE" when no keyword matches
- Markdown links stripped from card body (CTA button handles the link)

### Files Modified (Session 20)
- `admin/index.html` — Rich text editor toolbar + contenteditable div, card library UI, CTA bar, preview area, test email button, brand/discount onchange handlers, Cloudflare email obfuscation tags removed
- `admin/admin.js` — Auth auto-refresh (onAuthStateChange, 45-min interval, adminProxy 401 retry, session restore), test email rewrite (styled modal, Apps Script), URL corrections, rich editor functions (ecExec, ecHeading, ecToggleSource, ecRichSync, ecTextareaToRich, ecInsertLink, ecInsertDivider, ecInsertImage, ecInsertEmoji, ecInsertBlockquote, ecInsertTable, ecLineSpacing, ecToggleMore, overrides for insertEmailVar/ecInsertCTA/ecInsertLibraryCard/loadTemplate), EC card library (11 templates, drag-reorder, pills UI), smart CTA extraction
- `admin/admin.css` — Rich editor toolbar styles, dropdown styles, emoji grid, blockquote/table/image styles in editor

### Bugs Found & Fixed (Session 20)
1. **"body column not found"** — email_log table doesn't have a `body` column. Fixed by removing email_log insert from test email flow.
2. **"currentSession is not defined"** — Admin panel stores token in `sessionStorage.getItem('qp_admin_token')`, not `currentSession.access_token`.
3. **"Send failed: 404"** — No `send-email` Netlify function exists. Emails sent via Google Apps Script. Fixed to use `APPS_SCRIPT_URL`.
4. **Token expiry** — Supabase tokens expire in 1 hour. Fixed with auto-refresh system.
5. **Source toggle stuck** — `{ }` button was inside toolbar with `pointer-events:none`. Fixed by dimming individual buttons but keeping source button clickable.
6. **Emoji onclick quotes** — Emoji characters in JS string onclick handlers broke syntax. Fixed with data-index approach.
7. **`fusionsessions.com` unreachable** — Domain doesn't resolve. Replaced stale URLs but correct domain TBD.

### Architecture Decisions (Session 20)
- **Google Apps Script for all email sending** — No Netlify send-email function. Both bulk sends and test sends go through `APPS_SCRIPT_URL` with `mode:'no-cors'`.
- **Refresh token stored separately** — `qp_admin_refresh` in sessionStorage alongside `qp_admin_token`. Enables proactive refresh without re-login.
- **Rich editor as contenteditable div** — Not a third-party library. Custom sync to markdown-ish textarea format for compatibility with existing email builder pipeline.
- **Emoji picker as DOM overlay** — Not inline in toolbar (too many emojis). Centered fixed-position modal with grid layout.

---

---

## Session 21 Summary — Unified Rich Editor (ROLLED BACK) (Feb 27, 2026)

### What Was Attempted
- Built `createRichEditor(config)` reusable WYSIWYG component
- Mounted in Email Center (inline), SG popup, Recovery popup
- All three sharing one component with instance-based state

### Why It Was Rolled Back
The unified editor code existed in admin.js but was never tested against the live HTML. When deployed, cascading issues emerged:
1. `_ecEditor`/`_sgEditor` declared inside `onAuthStateChange` callback (not global scope)
2. `_reTextareaToRich()` setting innerHTML triggered input events → `_reSync` → infinite callback loops
3. CTA buttons lost cursor position (contenteditable focus loss when clicking toolbar buttons)
4. Old index.html had hardcoded `onclick="ecToggleMore()"` etc. calling dead functions
5. Floating pickers (line spacing, emoji, table) persisted across page navigation
6. Browser `prompt()` calls needed `qpPrompt()` for themed modals

### Rolled Back To
Commit `86eeaa7` — Pre-Session 21 state. Both admin.js and index.html restored.

### Pre-Existing Issue Discovered
**CTA buttons don't work with rich editor** — This was broken BEFORE Session 21. The CTA buttons call `ecInsertCTA()` which writes `[Label](url)` to the hidden `email-body` textarea, but the visible editor is a separate contenteditable `ec-editor-rich` div. The two are not synced for CTA inserts.

### Lessons for Next Attempt (Session 22 or dedicated session)
1. **Build incrementally** — Mount editor in EC first, test thoroughly, THEN add to SG popup
2. **Global scope** — `_ecEditor`/`_sgEditor` MUST be declared at file top level, not inside any callback
3. **Syncing guard** — `_reTextareaToRich()` must set `inst._syncing=true` before setting innerHTML, and `_reSync` must check this flag to prevent loops
4. **Selection save/restore** — Save selection on editor `blur` event, restore before any insert operation (CTA, merge tag, link, image) since toolbar button clicks steal focus
5. **CTA strategy** — Insert as markdown into textarea, call `_reTextareaToRich()` with syncing guard to update visual editor. Don't use `execCommand('insertHTML')` for CTA/merge tags — unreliable with focus loss
6. **Use `qpPrompt()`** not `prompt()` for link URL, image URL, custom CTA inputs
7. **Cleanup on nav** — Add picker removal to `go()` function for floating pickers
8. **Test the HTML** — The index.html must match the JS. Old inline onclick handlers must be replaced with mount divs.

### Files (Rolled Back)
- `admin/admin.js` — Restored to `86eeaa7`
- `admin/index.html` — Restored to `86eeaa7`
- Handoff docs updated with rollback notes
---

## Session 22 Summary — Unified Rich Editor Component (Feb 28, 2026)

### What Was Built
- **`createRichEditor(config)` factory function** — Reusable WYSIWYG editor component with instance-based state
- Mounted in **Email Center** (inline, via `initECEditor()` on page load) and **SG popup + Recovery popup** (via `createRichEditor()` on modal open)
- All three editors share the same component code with independent state per instance

### Architecture Decisions (Session 22)
- **Instance registry** (`_reInstances`): Each editor tracked by ID ('ec', 'sg'). Destroyed on page nav (EC) or modal close (SG).
- **Selection save/restore**: Editor saves cursor range on `blur` event, restores before any insert operation (CTA, merge tag, link, image). Fixes the pre-existing CTA focus-loss bug from Session 20.
- **Syncing guard** (`inst._syncing`): Prevents infinite loops when `_reTextareaToRich()` sets innerHTML which would trigger `oninput` → `_reSync()` → loop.
- **Bridge pattern**: Legacy `ecExec()`, `ecInsertCTA()`, `insertEmailVar()`, etc. are thin wrappers that route to the unified `_re*` API. Existing `onclick` handlers in HTML and card library code continue to work unchanged.
- **Smart routing**: `insertEmailVar()` and `ecInsertCTA()` check if SG modal is open and route to the SG editor instance, otherwise use EC.
- **Cleanup on nav**: `go()` function calls `_reCleanupPickers()` and destroys EC editor instance. Floating pickers (emoji, table, spacing) are removed.
- **Mount div pattern**: HTML has `<div id="ec-editor-mount">` (EC) and `<div id="sg-editor-mount">` (SG). Component builds toolbar + contenteditable inside the mount div dynamically.

### Session 21 Lessons Applied
1. ✅ Built incrementally (component first, then EC mount, then SG mount)
2. ✅ Global scope — `_reInstances`, `_ecEditor` at file top level, not inside callbacks
3. ✅ Syncing guard — `inst._syncing` flag prevents infinite loops
4. ✅ Selection save/restore — `blur` event saves range, `_reRestoreSelection()` before inserts
5. ✅ CTA strategy — uses `_reRestoreSelection()` + `execCommand('insertHTML')` with focus restored
6. ✅ Cleanup on nav — `_reCleanupPickers()` in `go()` function
7. ✅ HTML matches JS — replaced hardcoded toolbar with mount div, fixed broken duplicate `<div>` tag

### Files Modified (Session 22)
- `admin/index.html` — Replaced ~90 lines of hardcoded EC toolbar/editor HTML with `<div id="ec-editor-mount">`. Fixed broken `<div id="ec-editor-rich"<div id="ec-editor-rich"` duplicate tag.
- `admin/admin.js` — Added `createRichEditor()` component (~300 lines), EC bridge code (~80 lines), SG popup mount integration. Removed 388 lines of old Session 20 EC-specific editor code. Total: 3290 lines (was 3132).
- `admin/admin.css` — Updated `.re-toolbar`, `.re-editor`, `.re-select`, `.ec-tb-sep`, `.ec-tb-color-wrap`, `.ec-emoji-btn` styles. Replaced old Session 21 `.re-editable` styles.

### Known Cleanup (Low Priority)
- Old Session 19-20 `ecInsertLibraryCard` / `insertEmailVar` / `ecInsertCTA` definitions (lines ~2635-2744) are now dead code, overridden by bridge functions. Can be removed in a future cleanup pass.
- `prompt()` used for link/image/CTA URLs. Could be upgraded to `qpPrompt()` for themed modals in a future pass.

### Post-Session 22 Hotfixes (same day, Feb 28 2026)
1. **Safari regex fix** ✅ — Replaced `(?<!\*)` lookbehind in `_reTextareaToRich` with Safari-safe `(^|[^*])\*...\*(?!\*)` pattern. Lookbehinds crash Safari/WebKit.
2. **Draggable CTA pills** ✅ — CTAs now insert as their own `---` section using `[CTA:Label](url)` format. They appear as purple-bordered 🔗 pills in the drag-and-drop organizer alongside card pills. Both `buildRichEmail` and `buildAcademyEmail` detect `[CTA:...]` sections and render them as standalone gradient buttons (not wrapped in card boxes). Rich editor renders them as non-editable gradient button spans with `data-cta-url` attribute for round-tripping.
3. **Section controls label** ✅ — "Cards" → "Cards & CTAs" in both EC and SG pill strips.
4. **Email builder link rendering** ✅ — `[text](url)` markdown links in card sections now convert to styled `<a>` tags instead of being stripped. Applied to both Fusion and Academy email builders.

### Testing Notes
- **EC editor**: Navigate to Email Center page. Toolbar + editor should render in the mount div. All formatting, cards, CTAs, merge tags, source toggle should work.
- **SG popup**: Click any "Compose Email" button from Smart Suggestions. Modal should open with rich editor instead of plain textarea. Same full toolbar available.
- **Recovery popup**: Use Webhook Recovery Tool → Compose Email. Should also get rich editor.
- **Focus test**: Click a CTA button in the toolbar bar — text should insert at cursor position in the editor, not at the end.
- **Source toggle**: Switch to source mode, edit markdown, switch back — changes should persist.
- **Page nav**: Navigate away from Email Center and back — editor should re-initialize cleanly.

---

## Updated Session Roadmap

### Sessions 3–22 — ALL COMPLETED ✅

### Session 23 — 1-on-1 Sessions System (STARTING NOW)
Dr. Tracey's private BodyTalk sessions currently managed manually. Building a full booking cycle system:

**Core Concept: 4-Month Booking Cycles**
- Dr. Tracey works in 4-month segments (e.g., March-June, July-October, Nov-Feb)
- She blocks available days (usually Tue/Wed/Thu, varies for teaching/travel)
- Recurring clients are auto-populated into the cycle first (priority placement)
- Clients receive proposed dates → confirm/decline/request changes via tokenized link
- Remaining open slots become available to the public on a set date (creates anticipation/scarcity)
- Single session type, one price

**Admin Panel (page-sessions):**
- ⬜ Cycle Manager — create/manage 4-month cycles, status pipeline (Planning → Client Confirmation → Public Open → Active → Completed)
- ⬜ Availability Builder — calendar grid, click days to toggle available/blocked/teaching/travel, bulk actions ("Mark all Tuesdays"), time slot config per day
- ⬜ Auto-Populate Engine — one-click places recurring clients based on preferred day/time/frequency, preview before committing, conflict detection
- ⬜ Client Roster Manager — recurring clients list with frequency, preferred day/time, status (active/paused/waitlist), booking history
- ⬜ Booking Grid — day/week timeline view, color-coded statuses, click to manage
- ⬜ Client Communication Dashboard — batch send confirmations, track responses, auto-reminders
- ⬜ Public Booking Controls — toggle open/closed, set "opens at" date, view available slots
- ⬜ Waitlist Manager — queue, auto-notify on cancellations, one-click offer slot
- ⬜ Analytics — utilization rate, retention, revenue per cycle, cancellation/no-show rate

**Frontend (pages/one-on-sessions.html):**
- ⬜ Session info page with booking status banner (Currently Booking / Fully Booked / Next Opens [Date] countdown)
- ⬜ Available slots calendar + Stripe checkout for public bookings
- ⬜ Client Confirmation Portal — tokenized link, confirm/decline/request change per appointment
- ⬜ Waitlist signup form
- ⬜ My Appointments view (logged-in users) with add-to-calendar

**Database Tables (6 new):**
- `session_config` — global settings (cycle length, price, duration, timezone, buffer)
- `session_cycles` — each 4-month cycle with status pipeline
- `session_availability` — daily time blocks with status (available/blocked/teaching/travel)
- `session_clients` — recurring client roster with frequency/preferences
- `session_bookings` — individual appointments with confirmation workflow
- `session_waitlist` — public waitlist queue

**Automation:**
- Auto-email: confirmations, 24hr + 1hr reminders, waitlist notifications, cycle opening alerts
- Auto-free declined/unconfirmed slots after deadline
- Cycle summary report to Tracey

**Reference:** Full design spec in `docs/session-system-design.md`

### Session 24+ — Future Features
- **Live Event Page**: Branded Zoom experience page (pre/during/post states), countdown, embedded Zoom, reactions, replay mode, access control, swappable layouts
- **Student tools expansion**: Flashcards, text highlighting, reflection journal, lesson summarizer, student progress dashboard, goal tracking (build into preview toolbar)
- **Custom card templates**: Save your own cards to library, card preview thumbnails
- **AI Copilot**: Smart email writing assistance, content suggestions
- **Memberships / Subscriptions**: Recurring billing integration
- **Multi-instructor support**: Course creator roles for guest instructors

---

## Known Issues (Session 20)
1. **✅ Fusion Sessions domain confirmed** — `fusionsessions.com` resolves correctly (confirmed Session 21).
2. **email-decode.min.js 404** — Netlify phantom. Harmless.
3. **Cloudflare email obfuscation** — Tags stripped from index.html but may reappear on re-deploy if Cloudflare is active.
4. **Rich editor → email rendering** — The rich editor syncs to markdown format. Some advanced formatting (tables, images, blockquotes) may not render perfectly in the email builder HTML. Email preview should be checked.
5. **Test email no delivery confirmation** — `mode:'no-cors'` means we can't read the Apps Script response. Toast always says "sent" even if it failed. Check inbox manually.

---

## Google Apps Script Status (3 scripts)
1. **Stripe Webhook Handler** — Handles purchases, routes Fusion vs Academy, sends thank-you emails
2. **Fusion Sessions Email Automation** — Runs every 15 min, processes `scheduled_emails` table
3. **Bulk Email Sender v3** — Called by QP admin Email Center. Supports `isHtml` flag for pre-built HTML emails. Also handles test emails.

### Apps Script URLs
- Bulk sender: `APPS_SCRIPT_URL` constant in admin.js (line ~833)
- Automation: Separate Apps Script with its own trigger

---

## Supabase API Key System (CRITICAL — Session 20 Learning)
Two completely separate key systems:
1. **Legacy JWT Keys** (Settings → API → "Legacy anon, service_role API keys"):
   - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (~170-180 chars)
   - `anon` (public) — used by all client-side code
   - `service_role` (secret) — used by admin-proxy.js and Netlify functions
   - **ALL existing code uses this format**
2. **New Secret Keys** (Settings → API → "Secret keys"):
   - Format: `sb_secret_...` (~40 chars)
   - NOT used by any existing code
   - Regenerating these does NOT affect legacy keys

To rotate the service_role key: Settings → JWT Secret (nuclear option — breaks everything until all sites updated).

---

## Lessons Learned (ALL SESSIONS — IMPORTANT)
1. **All writes go through `proxyFrom()` → `admin-proxy.js`** — No client-side service keys
2. **Use `sb` (anon) for auth, never sbAdmin** — Service role bypasses authentication
3. **Check RLS policies before first write to any table**
4. **After admin actions: `await loadAllData(); re-render()`**
5. **Python for complex JS replacements, not sed** — Sed on minified JS is fragile
6. **Never nest modals inside `.page` divs** — Append to `document.body`
7. **Emails send via Google Apps Script**, not Netlify functions
8. **`mode:'no-cors'` for Apps Script** — Can't read response, but send works
9. **Supabase tokens expire in 1 hour** — Must auto-refresh via onAuthStateChange + refresh_token
10. **Store refresh_token alongside access_token** — Enables proactive refresh
11. **adminProxy should auto-retry on 401** — Transparent to calling code
12. **`sessionStorage.getItem('qp_admin_token')` for auth token** — NOT `currentSession.access_token`
13. **Service keys: legacy JWT vs new sb_secret are SEPARATE systems** — Don't confuse them
14. **After deploying auth changes: log out and back in once** — To store the new refresh_token
15. **Rich editor sync: contenteditable → markdown textarea** — Keep email builder pipeline unchanged
16. **Terminal heredoc for complex HTML/JS is fragile** — Use Python for large edits
17. **`git add` specific files only** — Prevent accidental overwrites
