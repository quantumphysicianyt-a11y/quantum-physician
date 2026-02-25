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

**Last updated:** Session 13 (Feb 24, 2026)

---

## Session 12 Completion Summary — Security Hardening + Webhook Recovery

### Security Hardening

#### 1. Service Key Removed from Client-Side ✅
- **CRITICAL FIX**: `SUPABASE_SERVICE_KEY` was exposed in browser source on line 3 of admin.js
- Anyone visiting the admin page could copy the "god key" and bypass all RLS policies
- **Solution**: Built `admin-proxy.js` Netlify function — single server-side endpoint for all admin operations
- 55 operations migrated: 50 `sbAdmin.from()` calls → `proxyFrom()`, 5 REST API calls → `authAdminAPI()`
- Every request requires valid Supabase auth token, verified against `admin_users` table
- Allowlisted 13 tables, writes require filter conditions

#### 2. Service Key Rotated ✅
- Generated new secret key in Supabase dashboard ("Publishable and secret API keys" → "+ New secret key" → named "admin-proxy")
- Updated env vars in QP Netlify: `SUPABASE_SERVICE_ROLE_KEY`
- Updated env vars in Fusion Netlify: `SUPABASE_SERVICE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_KEY`
- Deleted old default secret key in Supabase — previously exposed key now dead
- Google Apps Scripts unaffected (all use anon key only)

#### 3. Security Headers Deployed ✅
- `_headers` file in root of both QP and Fusion repos
- Headers: X-Frame-Options (SAMEORIGIN), X-Content-Type-Options (nosniff), CSP (frame-ancestors, object-src, base-uri), Referrer-Policy (strict-origin-when-cross-origin), Permissions-Policy (camera/mic/geo blocked), X-XSS-Protection
- SecurityHeaders.com grade improved from D → should now be A/B

#### 4. Admin Auth Deployed ✅
- `admin-auth.js` Netlify function now primary login path
- Dual-client pattern: verifies credentials, checks `admin_users` table, returns session token
- Token stored in `sessionStorage.qp_admin_token`, sent with every proxy request
- Fallback to direct Supabase `signInWithPassword()` if function fails

### Webhook Recovery

#### 5. Webhook Recovery Tool ✅
- Built into admin panel — red "⚠ Recovery" button on Customers page, also Ctrl+Shift+R
- Accepts `email|amount|product` format, cross-references against database
- Shows missing purchases with checkboxes, auth status, profile status
- "Grant Access to Selected" creates purchase records + sends branded email
- "Load Known Missing" pre-fills the 34 customers from Stripe data analysis
- Audit log entries created for each recovery grant

#### 6. 34 Customers Recovered ✅
- Webhook was down ~Dec 15, 2025 – Jan 30, 2026
- 16 bundle buyers ($500) and 18 individual session buyers ($45-50) affected
- All now have purchase records in Supabase
- Confirmation emails sent (though template needs redesign — see Session 13)

### Files Modified (Session 12)
**QP Repo:**
- `admin/admin.js` — SERVICE_KEY removed, proxy wrappers, recovery tool, range/count support (337KB)
- `admin/index.html` — Recovery button added to Customers, orders HTML fixed
- `netlify/functions/admin-auth.js` — Deployed (from Session 9, fixed dual-client pattern)
- `netlify/functions/admin-proxy.js` — NEW: Server-side proxy for all admin operations
- `_headers` — NEW: Security headers file
- `index.html` — Accidentally overwritten then restored from git (homepage)

**Fusion Repo:**
- `netlify/functions/admin-actions.js` — Hardcoded password removed (uses env var `ADMIN_PASSWORD`)
- `_headers` — NEW: Security headers file

### Bugs Found & Fixed (Session 12)
1. **Service key exposure** — CRITICAL. Removed from client JS, rotated key.
2. **Audit log "q.range is not a function"** — `proxyFrom()` was missing `.range()` method. Added to client wrapper and proxy handler.
3. **Orders page raw HTML code** — Broken `setTimeout` fragment in index.html. Cleaned up.
4. **Modal stacking** — Recovery tool opened duplicate modals. Added removal of existing modal before creating new.
5. **SyntaxError: Unexpected token ':'** — Missing `}` brace in `proxyFrom.range()` function. Fixed.
6. **Homepage overwritten** — `git add index.html` committed a modified root index.html. Restored from previous commit.
7. **401 errors after deploy** — Old session tokens from pre-proxy auth. Fixed by clearing sessionStorage.

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
1. ~~File size ~405KB~~ — Code splitting done Session 10B (admin.css, admin.js, index.html)
2. ~~`admin-auth.js` not wired in~~ — **DEPLOYED Session 12.** Now the primary login path.
3. **Card Library enhancements** — Custom templates (save your own cards), card preview thumbnails in grid. Deferred.
4. **Referral code generation via anon client** — May need RLS insert policy or Netlify function routing.
5. **Fusion referral hub redirect** — Dashboard "Open Sharing Tools" still points to old local page (works via redirect).
6. ~~Service key in client-side JS~~ — **FIXED Session 12.** All admin ops go through `admin-proxy.js`.
7. ~~Recovery email template needs redesign~~ — **FIXED Session 13.** Clean confirmation template with product images, how-to instructions, auth-aware guidance.
8. ~~Recovery tool needs deduplication~~ — **FIXED Session 13.** Checks for existing `webhook-recovery` purchases, shows "Already Recovered" badge, warns before re-granting.
9. ~~Recovery emails not logged~~ — **FIXED Session 13.** All recovery emails logged to `email_log` table with `template_type: 'recovery'`.
10. **`email-decode.min.js` 404** — Cloudflare email obfuscation injecting broken script. Disable in Netlify Post Processing settings.
11. **Missing favicon.ico** — Minor cosmetic 404 on admin page.

---

## Previous Session Summaries

### Session 8 ✅ — Smart Suggestions + Email Compose + Multi-Card Emails

## Session 13 Completion Summary — Recovery Email Redesign + Dedup + Logging

### What Was Built (Session 13)

#### 1. Recovery Email Template Redesign ✅
- **Complete rewrite of recovery email** — replaces ugly promo-style template with clean purchase confirmation
- **Product images** via `{{session_image:session-XX}}` tokens rendered by `buildRichEmail()`
- **How-to instructions** in a neon-bordered card block: visit site → login/signup → dashboard → start
- **Auth-aware guidance**: checks `hasAuth` field — "Sign in" for existing users, "Create an account" for new users
- **Bundle vs individual**: different subject lines and instructions ("all 12 sessions" vs "your session")
- **Better subject lines**: "Your Fusion Sessions Bundle Is Ready!" / "Your Fusion Session Is Ready — S1: Intolerance & Sensitivity"

#### 2. Recovery Tool Deduplication ✅
- **`hasRecoveryPurchase` check** in `wrAnalyze()` — scans `purchasesData` for existing `webhook-recovery` stripe_event_ids
- **"Already Recovered" badge** shown in analysis table (yellow warning style vs red "No Purchase Record")
- **Duplicate warning dialog** — if any selected customers already have recovery records, shows confirmation prompt before proceeding
- **Does not block re-granting** — just warns. Useful if a recovery failed and needs retry.

#### 3. Recovery Email Logging ✅
- **`email_log` table inserts** after each successful email send
- Fields: `recipient_email`, `subject`, `status: 'sent'`, `sent_at`, `template_type: 'recovery'`
- **`email_log` added to `admin-proxy.js` ALLOWED_TABLES** — was missing, would have caused proxy rejection

#### 4. Product ID Normalization ✅
- **`wrNormalizeProduct()` helper** — converts `session-1` → `session-01`, `session-2` → `session-02`, etc.
- Applied in `wrAnalyze()` so all product IDs match `FUSION_NAMES` / `FUSION_IMAGES` keys
- **All 34 hardcoded recovery entries** in `wrLoadStripeData()` fixed from `session-1` to `session-01`
- **Placeholder text** in recovery tool textarea updated

#### 5. Better Name Parsing ✅
- **`wrParseName()` helper** — extracts first name from email address
- Strips numbers, splits on dots/underscores/hyphens, capitalizes each word, returns first word
- `brucekruger@sasktel.net` → "Brucekruger" (before) → "Bruce" (after, if "bruce.kruger" format)
- Falls back to "Friend" if no alphabetic content

#### 6. UX Improvements ✅
- **Clear button** added to recovery tool modal (clears textarea + results)
- **Progress counter** shows "(3/34)" during batch processing
- **Email count in summary** — "Done: 3 granted, 0 failed, 3 emails sent"
- **Purchases insert via `proxyFrom()`** — was using `sb.from()` directly (bypassing proxy security)

### Files Modified (Session 13)
**QP Repo:**
- `admin/admin.js` — Recovery tool rewrite, helpers, dedup, email logging (346KB, up from 345KB)
- `netlify/functions/admin-proxy.js` — Added `email_log` to ALLOWED_TABLES

### Bugs Found & Fixed (Session 13)
1. **Product ID mismatch** — Recovery tool used `session-1` format but `FUSION_NAMES`/`FUSION_IMAGES` use `session-01`. `productName()` returned raw ID "session-1" instead of display name. Fixed with `wrNormalizeProduct()`.
2. **Recovery purchases used `sb.from()` directly** — Bypassed the proxy security layer added in Session 12. Changed to `proxyFrom('purchases').insert()`.
3. **`email_log` not in proxy allowed tables** — Would have caused 400 error when trying to log recovery emails. Added to ALLOWED_TABLES.
4. **Name parsing was naive** — `email.split('@')[0].replace(/[._]/g,' ')` produced "Brucekruger" from "brucekruger@". New `wrParseName()` is smarter about extracting first names.


### Session 7 ✅ — Analytics Dashboard + Reports + Custom Query
### Session 6 ✅ — Rich HTML Email + Automation + Academy Template
### Session 5 ✅ — Promotions & Orders (+ Edit Promotions + Refund UI)
### Session 4 ✅ — Email Center
### Session 3 ✅ — Audit, Notes, Danger Zone

### Lessons Learned (IMPORTANT FOR ALL FUTURE SESSIONS)
1. ~~ALWAYS use `sbAdmin`~~ — **Session 12: `sbAdmin` removed.** All writes now go through `proxyFrom()` → `admin-proxy.js` server-side.
2. **ALWAYS use `sb` (anon client) for `signInWithPassword()`** — sbAdmin bypasses auth.
3. **Check RLS policies BEFORE writing to any table for the first time.**
4. **After admin actions, reload data AND re-render**: `await loadAllData(); showCustomerDetail(email);`
5. **Use Python for complex replacements, not sed.** sed on minified JS is fragile.
6. **Never nest modals inside `.page` divs.** Use dynamic JS appended to `document.body`.
7. **Legacy/fallback auth must be checked BEFORE async operations** — prevents lockout.
8. **In ES modules (`type="module"`), use `window.fn = function()` for globally accessible functions.** Local `function` declarations are module-scoped and invisible to inline `onclick` handlers.
9. **Cross-domain Supabase sessions don't share cookies.** Each domain needs its own auth flow. Inline login forms are better than redirects for cross-domain UX.
10. **Terminal heredoc with HTML/JS is fragile.** Quote escaping breaks with complex content. Use Python base64+zlib for large file writes, or upload+edit workflow.
11. **Service keys belong server-side ONLY.** Never in browser JS, even behind login screens. If exposed, rotate immediately.
12. **Key rotation is non-negotiable.** If a key was ever in client-side code (even briefly), generate a new one and delete the old.
13. **Security audits before deployment.** Todd's instinct to audit before going live caught the critical service key exposure.
14. **Proxy pattern scales well.** One Netlify function handling 55+ operations is cleaner than 55 separate endpoints.
15. **`_headers` file in repo root** is the Netlify-native way to add security headers. No netlify.toml needed.
16. **`git add` specific files only.** Adding `index.html` when it had uncommitted changes from a previous session accidentally overwrote the homepage.
17. **Always `sessionStorage.clear()` after deploying auth changes.** Old tokens from pre-proxy sessions cause 401 errors.

---

## Updated Session Roadmap

**Session 3–9 — ALL COMPLETED ✅**

**Session 10 — Polish + Referral Hub + Auth Cleanup** ← CURRENT
- ✅ Remove legacy auth fallback (QPadmin/QPfs#2026) — SESSION 10
- ✅ Unified Referral Hub (auto-themed, cross-domain auth) — SESSION 10
- ✅ Academy dashboard referral hub link — SESSION 10
- ✅ Card Library (pre-built email card blocks) — SESSION 10B
- ✅ Code splitting: extract CSS and JS into separate files — SESSION 10B
- ✅ Create Scheduled Email UI — was already built Session 7 (undocumented)
- ✅ Edit Session Schedule UI — was already built Session 7 (undocumented)

**Session 11 — Weekly Goals + Rich Email Templates + Auto-Promo** ✅ COMPLETED
- ✅ Weekly Marketing Goals widget on dashboard — 7 goal chips, auto-check from email_campaigns
- ✅ Clickable goal chips open email compose modals with pre-built templates
- ✅ Rich email templates with `---` card blocks (session images, strikethrough pricing, bullet lists)
- ✅ `{{session_image:session-XX}}` token system for session thumbnails in email cards
- ✅ FUSION_IMAGES map with all 12 session thumbnail URLs
- ✅ Auto-promo generation per goal (WELCOME###/BUNDLE###/SESSION### unique codes)
- ✅ filterGoalRecipients() — opt-out + weekly promo limit pre-filtering
- ✅ sgSetupEmail wrapper auto-filters promotional emails for suggestions too
- ✅ "Auto" badge on auto-generated promos in Promotions list
- ✅ Gap analysis audit: Create Scheduled Email + Edit Session Schedule already existed from Session 7
- ✅ Full Fusion parity achieved — zero gaps remain

**Session 11B — Critical Bug Fixes**
- ✅ var hoisting closure bug: all suggestion cards shared same `var emails` — each card now uses unique variable (unusedRefEmails, bundleEmails2, etc.)
- ✅ marketing_opt_in field: Supabase Auth API returns opt-in in `user_metadata`, NOT `raw_user_meta_data` — all 12 opt-in checks updated to `(u.user_metadata||u.raw_user_meta_data||{}).marketing_opt_in`
- ✅ filterGoalRecipients: removed `user_metadata` fallback check that was double-counting opt-outs
- ✅ Debug logging cleaned up for production

**Session 12 — Security Hardening + Webhook Recovery** ✅ COMPLETED
- ✅ Supabase SERVICE_ROLE_KEY removed from client-side admin.js entirely
- ✅ New `admin-proxy.js` Netlify function — single endpoint proxying all 55 admin Supabase operations server-side
- ✅ `proxyFrom()` client wrapper replaces all `sbAdmin.from()` calls
- ✅ `authAdminAPI()` wrapper replaces all direct `/auth/v1/admin` REST API calls
- ✅ Token-based auth — every proxy request verified against `admin_users`
- ✅ Allowlisted tables (13) — proxy rejects operations on non-admin tables
- ✅ Write operations require filters — no unfiltered bulk ops allowed
- ✅ Service key rotated in Supabase — old exposed key deleted/invalidated
- ✅ All Netlify env vars updated (QP + Fusion) with new rotated key
- ✅ `admin-auth.js` Netlify function deployed and wired as primary login path
- ✅ Hardcoded password removed from Fusion `admin-actions.js`
- ✅ Security headers (`_headers` file) deployed to both repos: X-Frame-Options, X-Content-Type-Options, CSP, Referrer-Policy, Permissions-Policy
- ✅ Security scans clean: Sucuri (no malware, not blacklisted), SecurityHeaders.com (headers applied)
- ✅ Webhook Recovery Tool built — analyzes Stripe payments vs database, bulk-grants access with email
- ✅ 34 customers recovered from webhook outage (Dec 15, 2025 – Feb 24, 2026)
- ✅ Audit log fixed (proxy `.range()` and `.select({count})` support added)
- ✅ Orders page HTML fixed (broken code fragment removed)

**Session 13 — Recovery Email Redesign + Dedup + Logging** ✅ COMPLETED
- ✅ Recovery email template completely redesigned — clean confirmation with product images, how-to instructions, conditional auth guidance
- ✅ `{{session_image:session-XX}}` tokens in recovery emails for product thumbnails
- ✅ Step-by-step "How to access" instructions (visit site → login/create account → dashboard → start)
- ✅ Smart auth detection: email says "Sign in" for existing users, "Create an account" for new users
- ✅ Bundle vs individual session email variants (subject line + instructions differ)
- ✅ Recovery tool deduplication — checks for existing `webhook-recovery` purchases, shows "Already Recovered" badge
- ✅ Duplicate warning dialog before re-granting already-recovered customers
- ✅ Recovery emails now logged to `email_log` table (template_type: 'recovery')
- ✅ `email_log` added to admin-proxy.js ALLOWED_TABLES
- ✅ `wrParseName()` — smart first-name extraction from email (strips numbers, splits on dots/underscores, takes first word)
- ✅ `wrNormalizeProduct()` — normalizes `session-1` → `session-01` format for FUSION_NAMES compatibility
- ✅ All hardcoded recovery data fixed (34 entries: session-1 → session-01)
- ✅ Clear button added to recovery tool modal
- ✅ Progress counter shows (N/M) during batch processing
- ✅ Email count in completion summary ("3 granted, 0 failed, 3 emails sent")
- ✅ Purchases now insert via `proxyFrom()` instead of direct `sb.from()` (security consistency)

**Session 13 — Recovery Email Redesign + Customer Onboarding** ✅ COMPLETED
- See completion summary above

**Session 14+ — Course Builder, AI Copilot, Memberships, Assessments, Ecommerce, Multi-Instructor**

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
