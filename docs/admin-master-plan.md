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

**Last updated:** Session 21 (Feb 27, 2026)

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

## Session 21 Completion Summary — Unified Rich Editor Component + Dead Code Cleanup (Feb 27, 2026)

### Unified Rich Editor Component ✅
- **`createRichEditor(config)`** — Reusable WYSIWYG editor component that mounts into any container
- **Config**: `{containerId, onInput, placeholder, initialValue}`
- **Returns API**: `{getMarkdown(), setMarkdown(md), insertMergeTag(tag), insertCTA(key), insertCard(index), openCardLibrary(), updateSections(), destroy()}`
- **Full toolbar**: Undo/Redo, Heading, Font, Size, B/I/U/S, Text color, Highlight, Align, Lists, Link, Card Divider, More dropdown (Image/Emoji/Blockquote/Table/Indent/Outdent/Line Spacing/Clear Format/Source Code)
- **Internal functions**: All `_re*` prefixed — `_reExec`, `_reSync`, `_reTextareaToRich`, `_reAction`, `_reInsertLink`, `_reInsertDivider`, `_reToggleSource`, `_reToggleMore`, `_reInsertImage`, `_reInsertEmoji`, `_reInsertBlockquote`, `_reInsertTable`, `_reLineSpacing`, `_reInsertMergeTag`, `_reInsertCTA`, `_reInsertCard`, `_reOpenCardLibrary`, `_reUpdateSections`, `_reDeleteCard`, `_reDropCard`
- **Instance tracking**: `_richEditorInstances` map + `_richEditorCounter` for unique IDs

### SG Popup Upgrade ✅
- **Before**: Plain textarea with 3 merge tag buttons
- **After**: Full rich editor with complete toolbar, CTA button row (Watch Sessions, Dashboard, Referral Hub, Academy, Custom), merge tag buttons, Card Library button, source toggle, card pills with drag-reorder
- `_sgEditor` global holds the popup editor instance
- `sgCloseModal()` properly destroys the editor instance on close
- Recovery popup gets same editor for free (uses `sgSetupEmail()`)
- All SG functions (`sgInsertDiscountPitch`, `sgAutoPreview`, `sgPreview`, `sgTestEmail`, `sgSendAll`) now sync from `_sgEditor.textarea` → hidden `sg-body` textarea

### Email Center Wiring ✅
- **HTML**: Old hardcoded toolbar replaced with `<div id="ec-editor-mount"></div>`
- `initECEditor()` called on page show and DOMContentLoaded
- `_ecEditor` global holds the EC editor instance
- Override wrappers route `insertEmailVar()`, `ecInsertCTA()`, `ecOpenCardLibrary()`, `loadTemplate()`, `ecAutoPreview()` to the active editor instance
- EC editor textarea syncs to hidden `#email-body` for compatibility with existing preview/send pipeline

### Dead Code Cleanup ✅
- Removed 37 lines of duplicate code from Session 19-20 that was superseded by the unified editor
- Removed duplicates: `ecExtractCTA`, `clSvg`, `sgStartDrag`, `sgOverDrag`, `sgLeaveDrag`, `sgCardLabel`, `sgDragFrom`, old `insertEmailVar`
- **Pre-existing duplicates left untouched** (not Session 21 related): `insertDiscountBlock` (lines 1589/3200), `saveScheduledEmail` (lines 1987/2440) — the second definition creates a new scheduled email while the first edits an existing one, sharing the same function name (should be separate names in a future session)

### Files Modified (Session 21)
- `admin/admin.js` — Unified rich editor component (`createRichEditor` + all `_re*` functions), SG popup rewrite with editor mount, EC wiring with `initECEditor()`, override wrappers, dead code removal. 3451→3414 lines.
- `admin/index.html` — EC toolbar replaced with `<div id="ec-editor-mount"></div>` (already done, verified)
- `admin/admin.css` — `.re-editable` placeholder + focus + link + hr styles (already done, verified)

### Architecture Decisions (Session 21)
- **Instance-based design** — Each editor has unique ID prefix (`re-1-`, `re-2-`), own source mode state, own DOM elements. No global state conflicts between EC and SG editors.
- **Event delegation on toolbar** — Single click listener on toolbar uses `data-re-cmd` and `data-re-action` attributes instead of inline onclick handlers. Cleaner and allows dynamic toolbar creation.
- **Sync-to-textarea pattern preserved** — Rich editor still syncs to hidden textarea in markdown-ish format, preserving the existing email builder HTML pipeline unchanged.
- **Global `_sgEditor` and `_ecEditor`** — Simple approach for routing. Override wrappers check which editor is active.

### Bugs Found & Fixed (Session 21)
1. **Duplicate function definitions** — Session 21 code was added but old Session 19-20 duplicates weren't removed. Functions like `clSvg`, `ecExtractCTA`, `sgStartDrag` etc were defined twice. The JS engine used the last definition, which was the OLD version. Fixed by removing the 37 dead lines.

### Known Issues (Session 21)
1. **`fusionsessions.com` now resolves** — Todd confirmed domain works. Session 20 warning is resolved. ✅
2. **Pre-existing duplicate: `saveScheduledEmail`** — Two functions with same name do different things (edit vs create). Low priority fix for future session.
3. **Pre-existing duplicate: `insertDiscountBlock`** — Second definition overrides first. Works but messy. Low priority.

---

## Updated Session Roadmap

### Sessions 3–21 — ALL COMPLETED ✅

### Session 21 — Unified Rich Editor Component ✅
- Refactored rich editor into reusable `createRichEditor(config)` component
- Email Center (inline): Uses `initECEditor()` with `ec-editor-mount` div
- SG popup: Gets full rich toolbar, CTA buttons, Card Library, source toggle
- Recovery popup: Gets same editor via `sgSetupEmail()`
- All three share one `createRichEditor()` function with instance-based state
- SG + Recovery stay as popups, Email Center stays as page
- Dead code cleanup: removed 37 lines of Session 19-20 duplicates

### Session 22 — Live Event Page (NEXT — GAME-CHANGER BUILD)
- **Branded live Zoom experience page** — replaces plain Zoom links
- **Pre-session**: Animated countdown timer, session details, Dr. Tracey bio, product cards, email capture for non-customers, referral sharing widget, ambient healing-energy animations
- **During session**: Embedded Zoom (Web SDK), floating reaction buttons (hearts, prayer hands, sparkles), minimized product sidebar
- **Post-session**: Auto-switch to replay mode (Vimeo), bundle upsell for single-session owners, related sessions carousel, reflection prompt, community link
- **Access control**: Free events (email gate), paid sessions (login + purchase check), bundle upsell overlay, non-customer teaser with purchase CTA
- **Swappable layout templates**: Admin panel gets "Live Event" config section — pick layout (Classic/Immersive/Minimal), set session, Zoom link, toggle widgets
- **URL**: `fusionsessions.com/live.html` (or similar)

### Session 23+ — Future Features
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
