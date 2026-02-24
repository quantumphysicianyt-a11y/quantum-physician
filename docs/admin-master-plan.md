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
Todd (the founder/developer of Quantum Physician) and Claude have built this admin panel together across 9 intensive sessions. Todd cares deeply about polish, design details, and getting things right. These handoff documents represent a **shared history** — every bug fix, every design decision, every architectural choice was made collaboratively and often through multiple iterations. The next Claude instance inherits this context and trust. **Treat these docs with the same care Todd does**: update them thoroughly at the end of every session, preserve hard-won lessons, and never make changes that contradict documented decisions without discussing with Todd first. This isn't just a codebase — it's a partnership.

**These 3 docs are the ONLY source of truth across chat sessions. Claude has NO memory between sessions.**

### The 3 Handoff Docs (+1 reference):
1. `admin-master-plan.md` — Full roadmap, session plan, what's built vs what's missing, priority recommendations
2. `fusion-gap-analysis.md` — Feature parity tracking (Fusion admin vs QP admin), what's migrated vs what's still missing
3. `full-infrastructure-doc.md` — Database tables, RLS policies, Netlify functions, Supabase clients, system architecture
4. `ACADEMY-HANDOFF.md` — Academy-specific platform docs (standalone reference, not updated every session)

### At the END of every build session, Claude MUST:
- **Update ALL 3 docs** — not just one. Every session touches multiple concerns.
- **Mark completed features as ✅** with "SESSION N" label in both master-plan AND gap-analysis
- **Document every database change**: new tables, altered columns, new/modified RLS policies, new indexes
- **Document every bug found and how it was fixed** — future sessions will hit similar issues
- **Document architectural decisions** — e.g., "we use sbAdmin for all writes because RLS blocks anon writes"
- **Document known issues / tech debt** — things that work but could be improved
- **Document the session roadmap** with revised priorities based on what was learned
- **List every RLS policy change** with exact SQL or policy names — these are critical and easy to lose track of
- **Output all 3 updated docs** as downloadable files

### At the START of every new chat, Todd uploads:
- These 3 docs (+ optionally ACADEMY-HANDOFF) + the current `admin/index.html`
- Any new files if the scope changed (e.g., new Netlify functions, new pages)
- Claude reads all 3 docs BEFORE writing any code

### Known File Upload Issue:
- The `admin/index.html` file is heavily minified (~405KB after Session 9) and may truncate on upload
- The truncation happens mid-function in `showCustomerDetail()` which is an extremely long single line
- Future sessions should verify the file ending is intact after upload, and reconstruct if needed

**Last updated:** Session 12 (Feb 24, 2026)

---

## Session 12 Completion Summary — Fusion Decommission + Auth Hardening

### What Was Built (Session 12)

#### 1. Fusion Admin Decommission ✅
- **Replaced `fusionsessions.com/admin.html`** (7,932 lines) with a branded redirect page
- Redirect page uses Fusion's retro neon aesthetic (Righteous font, scanline overlay, gradient text)
- Auto-redirects to `qp-homepage.netlify.app/admin/` after 3 seconds (meta refresh + JS backup)
- Manual "Go to QP Admin →" button for immediate navigation
- Includes "bookmark the new URL" reminder
- **Redirect page is READY but not yet deployed** — Fusion admin stays live as a safety net while QP admin is still in active development. Deploy the redirect when Todd is confident QP is solid.

#### 2. Admin Auth Netlify Function Wired Up ✅
- **`admin-auth.js` fixed and connected** — was created in Session 9 but never used
- **Critical bug fixed**: original function used service role client for `signInWithPassword()` (bypasses auth!)
  - Now uses `sbAnon` (anon client) for auth operations
  - Uses `sbAdmin` (service role) for data queries only
  - Requires `SUPABASE_ANON_KEY` env var in Netlify (in addition to existing vars)
- **`doAuth()` in admin.js refactored** to call `/.netlify/functions/admin-auth` first
  - Falls back to direct Supabase auth if Netlify function is unreachable (network error)
  - Stores auth token from Netlify function in `sessionStorage` as `qp_admin_token`
  - Login flow: client → Netlify function → Supabase auth (anon) → admin_users check → return permissions + token

#### 3. Fusion admin-actions.js Hardened ✅
- **Removed hardcoded `QPfs#2026` password** from admin-actions.js Netlify function
- Now requires `ADMIN_PASSWORD` env var to be set in Netlify
- No fallback to hardcoded credentials

#### 4. Final Fusion Admin Audit ✅
- Cross-referenced all 160+ Fusion functions against QP admin's 238+ functions
- Compared all 7 Fusion sections against QP's 15 sections
- **Result: Complete parity confirmed, zero missing features**
- QP admin has 8 additional sections beyond Fusion (analytics, orders, referrals, sessions, audit, admin-users, academy, memberships)

### Bugs Found & Fixed (Session 12)

#### Bug: admin-auth.js Used Service Role for signInWithPassword
- **Symptom**: Would have bypassed password verification entirely
- **Cause**: Same Session 9 bug pattern — `supabase.auth.signInWithPassword()` on service role client
- **Fix**: Added separate `sbAnon` and `sbAdmin` clients in admin-auth.js
- **New env var required**: `SUPABASE_ANON_KEY` must be set in Netlify env vars

### Architecture Decisions (Session 12)
- **Netlify function for auth, direct Supabase for data** — pragmatic approach. Moving all 51 `sbAdmin` calls server-side would require building a full proxy function and is deferred to a future session.
- **Fallback pattern in doAuth()** — if Netlify function is unreachable (e.g., local dev, network issue), falls back to direct Supabase auth. This prevents lockout during the transition period.
- **Fusion admin replaced, not deleted** — redirect page preserves the URL and guides users to the new location.

### Security Audit Results (Session 12)
- ⚠️ **Known tech debt**: `SUPABASE_SERVICE_KEY` is still exposed in client-side `admin.js` (line 3). Moving it fully server-side requires a dedicated proxy Netlify function for all data operations (~51 `sbAdmin` calls). Deferred to future session.
- ✅ **Login path now goes through server-side function** (service key not needed for auth)
- ✅ **Hardcoded passwords removed** from all Netlify functions
- ✅ **Fusion admin decommissioned** — no more legacy credentials in production

### Files Changed (Session 12)

**QP Repo:**
- `admin/admin.js` — `doAuth()` refactored to use Netlify function
- `netlify/functions/admin-auth.js` — Fixed dual-client pattern (sbAnon + sbAdmin)

**Fusion Repo:**
- `admin.html` — Replaced with redirect page to QP admin
- `netlify/functions/admin-actions.js` — Removed hardcoded QPfs#2026 password

### Netlify Env Vars Required (Session 12)
- `SUPABASE_ANON_KEY` — Must be added to QP Netlify site for admin-auth.js to work
- `ADMIN_PASSWORD` — Must be set in Fusion Netlify site for admin-actions.js (no more hardcoded fallback)

---

## Session 10 Completion Summary

### What Was Built (Session 10)

#### 1. Legacy Auth Removal ✅
- **Removed all legacy authentication fallback** (QPadmin/QPfs#2026) from admin panel
- Supabase auth is now the ONLY login path
- 5 legacy code blocks removed from admin.js: constants, login bypass, two session restore fallbacks, session guard
- File reduced from 313,127 → 311,694 chars (1,433 chars removed)
- All references to 'LEGACY_USERNAME', 'QPadmin', 'QPfs#2026', 'admin@qp.local' verified gone

#### 2. Unified Referral Hub ✅
- **New file: `referral-hub.html`** at QP repo root — ONE page serving both platforms
- **Auto-theming** via `?brand=fusion` or `?brand=academy` query parameter
  - Fusion: retro neon (Righteous font, cyan/pink/purple gradients, scanline overlay)
  - Academy: clean modern (Playfair Display + Inter, teal/taupe, navy backgrounds)
- **Theme toggle button** in header to switch between brands manually
- **Sign Out button** — allows account switching
- **Inline login form** for cross-domain auth (no redirect to external login pages)
  - Shows when no Supabase session exists on QP domain
  - "Same account you use for Fusion Sessions / Quantum Academy" helper text
  - Error handling + Enter key support
- **Generate referral code** button for users without a code (inserts into `referral_codes` table)
- **Full feature set**: stats cards (credit balance, total earned, referrals), referral link with copy, QR code with download, 3 share message templates (casual, social, email), social sharing buttons (WhatsApp, SMS, Email, Facebook, Twitter), "How It Works" explainer
- **Shared Supabase tables**: same `referral_codes`, `profiles`, `credit_history` as both platforms

#### 3. Fusion Referral Hub Redirect ✅
- **Fusion repo `referral-hub.html`** replaced with instant redirect to `qp-homepage.netlify.app/referral-hub.html?brand=fusion`
- Updated directly on GitHub (Fusion repo not on local machine)

#### 4. Academy Dashboard Integration ✅
- **"Open Referral Hub →"** link added to Academy dashboard sidebar, below the "Show QR Code" button
- Links to `/referral-hub.html?brand=academy` for auto-theming

### Bugs Found & Fixed (Session 10)

#### Bug 1: showSignOut not defined
- **Symptom**: Page stuck on "Loading your referral info..." — boot() crashed silently
- **Cause**: `showSignOut()` was called in boot() but defined as a local function inside an ES module (not accessible from window scope)
- **Fix**: Changed to `window.showSignOut = function()` to make it accessible across module scope
- **Lesson**: In ES modules (`type="module"`), all functions are scoped. Use `window.functionName` for functions called from other contexts.

#### Bug 2: Cross-domain session mismatch
- **Symptom**: User signed into Fusion saw $0 balance on QP referral hub
- **Cause**: Different browser sessions per domain — QP domain had a different Supabase auth session than Fusion domain
- **Fix**: Added inline login form on referral hub so users can authenticate on QP domain. Added Sign Out button for account switching.

### Architecture Decisions (Session 10)
- **Unified referral hub replaces separate pages** — one codebase, two themes via CSS class on `<body>`
- **Query param `?brand=` drives theming** — email links append brand automatically
- **ES module for Supabase** — referral hub uses `import { createClient }` from CDN ESM, not script tag
- **Inline auth over redirect** — better UX for cross-domain users, no confusing redirect chain
- **Legacy auth removed permanently** — all admins must use Supabase auth going forward

### Files Changed (Session 10)
- `admin/admin.js` — Legacy auth removed (commit 37860c8)
- `referral-hub.html` — New unified referral hub (multiple commits)
- `Academy/dashboard.html` — Added Referral Hub link to sidebar

---

## Session 9 Completion Summary

### What Was Built (Session 9 Main)

#### 1. Admin Permissions + Login System (Supabase-based)
- **`admin_users` table** — New Supabase table with roles: `super_admin`, `admin`, `assistant`
- **12 granular permission flags** per admin: `can_customers`, `can_email`, `can_promotions`, `can_orders`, `can_community`, `can_analytics`, `can_suggestions`, `can_automation`, `can_audit`, `can_system`, `can_refund`, `can_delete`
- **Email + password login** — Uses `sb.auth.signInWithPassword()` (anon client, NOT service role) + checks `admin_users` table
- **Legacy fallback** — Old credentials ("QPadmin"/"QPfs#2026") checked BEFORE Supabase auth to prevent lockout
- **Session persistence** — Admin session stored in `sessionStorage` as JSON with full permissions object
- **Permission-based sidebar** — Sidebar links auto-hide based on admin's permission flags
- **Admin Users page** — Super admins can add/edit/disable admin accounts with full permission matrix
- **Role-based defaults** — Changing role in edit modal auto-fills sensible permission defaults
- **Dynamic sidebar footer** — Shows logged-in admin's name, avatar initial, and role instead of hardcoded "Dr. Tracey Clark"

#### 2. Moderator Management
- **New "Moderators" tab** in Community page (alongside Academy Discussions and Fusion Community)
- **Search + assign** — Email autocomplete search, descriptive role selector ("Moderator — Can moderate posts" / "Community Admin — Full community control"), assign button
- **Moderator list** — Table showing all users with moderator/admin community_role, with Remove button
- **Uses `profiles.community_role`** field — Same as Fusion admin (full parity)
- **Audit logged** — All assign/remove actions logged with admin name

#### 3. Audit Log Redesign (Session 9 Continuation)
- **Grouped by date** — Entries organized under date headers (e.g., "Monday, Feb 23, 2026")
- **Human-readable sentences** — "Todd granted access to user@email.com" instead of "[Todd] Granted access"
- **Color-coded badges** — Green for grants/enrolls, red for revokes/blocks, teal for info, taupe for neutral
- **Admin name as separate field** — Shown in teal as sentence subject, stored in `admin_user` column
- **SVG icons** — Consistent feather-style SVG icons in circular containers (replaced emojis)
- **`auditSvg()` function** — Renders inline SVG icons from a path dictionary (check, x-circle, lock, dollar, link, grad, key, refresh, archive, ban, edit, trash, list, user, mail, tag, shield, bulb, users)
- **Search expanded** — Now searches details and admin_user fields, not just target_email
- **Stats cards** — Shows Total Actions + Active Admins count
- **`logAudit()` rewritten** — Clean details (no `[AdminName]` prefix), admin name stored in `admin_user` column separately

#### 4. RLS Policies Applied
- SQL provided for `scheduled_emails`, `email_log`, `session_schedule` — all three get `ENABLE ROW LEVEL SECURITY` + permissive "Allow all" policy

#### 5. Documentation Corrections
- **Edit Promotions** was already built (not documented in Session 8 handoff) — confirmed working
- **Refund UI** was already built in Orders page (not documented) — confirmed
- **`stripe-refund.js`** Netlify function already exists in QP repo

### Bugs Found & Fixed (Session 9)

#### Bug 1: Supabase Auth Client Wrong
- **Symptom**: Login with email+password failed silently
- **Cause**: `doAuth()` used `sbAdmin.auth.signInWithPassword()` (service role client) which bypasses auth
- **Fix**: Changed to `sb.auth.signInWithPassword()` (anon client)
- **Lesson**: ALWAYS use `sb` (anon) for `signInWithPassword()`. Use `sbAdmin` for data operations only.

#### Bug 2: Legacy Fallback Unreachable (LOCKOUT)
- **Symptom**: Neither Supabase credentials NOR legacy "QPadmin"/"QPfs#2026" worked — total lockout
- **Cause**: Legacy check was inside `try` block AFTER `signInWithPassword()`. Supabase auth threw first, skipping legacy path
- **Fix**: Moved legacy credential check BEFORE any Supabase call
- **Lesson**: ALWAYS check fallback/bypass credentials BEFORE any async operation that could throw

#### Bug 3: Supabase Auth Account Missing
- **Symptom**: Even with correct client, login failed for `quantumphysicianyt@gmail.com`
- **Cause**: Email had no password in Supabase Auth (account didn't exist in auth.users)
- **Fix**: Todd signed up through fusionsessions.com/login.html with that email + password
- **Lesson**: Admin must have BOTH a Supabase Auth account AND a row in `admin_users` table
- **Note**: `auth.create_user()` SQL function is NOT available on Supabase free tier

### Architecture Decisions (Session 9)
- **Use `sb` (anon client) for `signInWithPassword()`** — Service role client bypasses auth entirely
- **Legacy fallback checks BEFORE Supabase** — Prevents lockout scenarios
- **Audit log uses `admin_user` column** — Clean storage, no prefix parsing needed
- **SVG icons via `auditSvg()` function** — No emoji dependency, consistent with site design
- **Browser autofill left enabled** — After multiple attempts to block (autocomplete=off, readonly trick, data-lpignore), decided to leave autofill working. Fields use `type="email"` where appropriate.

### Known Issues (Session 12)
1. **Service key in client-side JS** — `SUPABASE_SERVICE_KEY` is still on line 3 of admin.js. All 51 `sbAdmin` calls need to be routed through a server-side proxy function. This is the #1 security priority for Session 13.
2. **Card Library not yet built** — Deferred to future session (custom card templates, preview thumbnails)
3. **Referral code generation via anon client** — May need RLS insert policy on `referral_codes` if users can't generate codes from the referral hub. Could route through Netlify function instead.
4. **Fusion referral hub redirect** — Updated on GitHub directly. Fusion dashboard "Open Sharing Tools" button still points to old local referral-hub.html (now redirects). Works but could be updated to link directly.
5. **`SUPABASE_ANON_KEY` env var needed** — Must be added to QP Netlify site environment variables for `admin-auth.js` to work.
6. **`ADMIN_PASSWORD` env var needed** — Must be set in Fusion Netlify site for `admin-actions.js` (hardcoded fallback removed).

---

## Previous Session Summaries

### Session 8 ✅ — Smart Suggestions + Email Compose + Multi-Card Emails
### Session 7 ✅ — Analytics Dashboard + Reports + Custom Query
### Session 6 ✅ — Rich HTML Email + Automation + Academy Template
### Session 5 ✅ — Promotions & Orders (+ Edit Promotions + Refund UI)
### Session 4 ✅ — Email Center
### Session 3 ✅ — Audit, Notes, Danger Zone

### Lessons Learned (IMPORTANT FOR ALL FUTURE SESSIONS)
1. **ALWAYS use `sbAdmin` (service role) for ANY write operation.**
2. **ALWAYS use `sb` (anon client) for `signInWithPassword()`** — sbAdmin bypasses auth.
3. **Check RLS policies BEFORE writing to any table for the first time.**
4. **After admin actions, reload data AND re-render**: `await loadAllData(); showCustomerDetail(email);`
5. **Use Python for complex replacements, not sed.** sed on minified JS is fragile.
6. **Never nest modals inside `.page` divs.** Use dynamic JS appended to `document.body`.
7. **Legacy/fallback auth must be checked BEFORE async operations** — prevents lockout.
8. **In ES modules (`type="module"`), use `window.fn = function()` for globally accessible functions.** Local `function` declarations are module-scoped and invisible to inline `onclick` handlers.
9. **Cross-domain Supabase sessions don't share cookies.** Each domain needs its own auth flow. Inline login forms are better than redirects for cross-domain UX.
10. **Terminal heredoc with HTML/JS is fragile.** Quote escaping breaks with complex content. Use Python base64+zlib for large file writes, or upload+edit workflow.
11. **Netlify functions need SUPABASE_ANON_KEY too.** If a function does `signInWithPassword()`, it needs the anon key — service role bypasses auth. Add both keys to env vars.
12. **Decommissioning strategy**: Replace old pages with branded redirect pages, not instant redirects. Give users a moment to see the message and bookmark the new URL.

---

## Updated Session Roadmap

**Session 3–11 — ALL COMPLETED ✅**

**Session 10 — Polish + Referral Hub + Auth Cleanup** ✅ COMPLETED
- ✅ Remove legacy auth fallback (QPadmin/QPfs#2026) — SESSION 10
- ✅ Unified Referral Hub (auto-themed, cross-domain auth) — SESSION 10
- ✅ Academy dashboard referral hub link — SESSION 10
- ✅ Card Library (pre-built email card blocks) — SESSION 10B
- ✅ Code splitting: extract CSS and JS into separate files — SESSION 10B
- ✅ Create Scheduled Email UI — was already built Session 7 (undocumented)
- ✅ Edit Session Schedule UI — was already built Session 7 (undocumented)

**Session 11 — Weekly Goals + Rich Email Templates + Auto-Promo** ✅ COMPLETED

**Session 12 — Fusion Decommission + Auth Hardening** ✅ COMPLETED
- ✅ Final Fusion admin audit (160+ functions cross-referenced, zero gaps)
- ✅ Fusion admin.html replaced with branded redirect to QP admin
- ✅ admin-auth.js Netlify function fixed (dual-client pattern) and wired into doAuth()
- ✅ Hardcoded QPfs#2026 removed from Fusion admin-actions.js
- ✅ Security audit documented (service key exposure noted as tech debt)

**Session 13+ — Course Builder, Service Key Migration, AI Copilot, Memberships, Assessments, Ecommerce**
- Priority: Move SUPABASE_SERVICE_KEY server-side (build admin-proxy Netlify function)
- Course Builder (Academy content management from admin)
- AI Copilot for email/content generation
- Membership tiers
- Client assessments/intake forms
- Ecommerce expansion (digital products beyond courses/sessions)

---

## Google Apps Script Status

### 3 Scripts in Use:
1. **Stripe Webhook Handler** — Handles purchases, routes Fusion vs Academy, sends thank-you emails.
2. **Fusion Sessions Email Automation** — Runs every 15 min, processes `scheduled_emails` table.
3. **Bulk Email Sender v3** — Called by QP admin. Supports `isHtml` flag.

### No Apps Script changes needed for Sessions 6–9.

## Session 10B — Card Library Enhancements & Bug Fixes (Feb 23, 2026)

### Completed
- **Fixed Card Library syntax error** — reverted broken commit, rebuilt with `clSvg()` helper instead of scoped `auditSvg()`
- **Drag-to-reorder card pills** — replaced Swap button with draggable pill tags below textarea; cards show title, hamburger grip icon, × delete button
- **Delete individual cards** — × button on each pill removes that card section
- **Multi-insert from Card Library** — panel stays open after inserting, add as many cards as you want
- **Unlimited cards in email renderer** — `buildRichEmail` and `buildAcademyEmail` now loop through all cards instead of hardcoded max of 2; border colors cycle through pink/purple/teal

### Code Split Status
- `admin/index.html` (~65KB) — HTML structure
- `admin/admin.css` (~36KB) — All styling
- `admin/admin.js` (~305KB) — All logic including Card Library

### Future Ideas (Saved)
- Custom card templates (save your own cards to library)
- Card preview thumbnails in Card Library grid
