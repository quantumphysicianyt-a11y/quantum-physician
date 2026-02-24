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

**Last updated:** Session 9 Continuation (Feb 23, 2026)

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

### Known Issues (Session 9)
1. **File size ~405KB** — Code splitting strongly recommended for Session 10.
2. **Legacy auth fallback should be removed** once all admins confirmed on Supabase auth
3. **`admin-auth.js` Netlify function created but not wired in** — Optional enhancement
4. **Academy referral hub page still 404s** — Not addressed this session
5. **Card Library not yet built** — Deferred to future session

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

---

## Updated Session Roadmap

**Session 3–9 — ALL COMPLETED ✅**

**Session 10 — Polish + Card Library + Code Split** ← NEXT
- Remove legacy auth fallback (QPadmin/QPfs#2026)
- Card Library (pre-built email card blocks)
- Code splitting: extract CSS and JS into separate files
- Academy referral hub page (or redirect)
- Create Scheduled Email UI
- Edit Session Schedule UI
- Weekly Goals (configurable targets)

**Session 11+ — Course Builder, AI Copilot, Memberships, Assessments, Ecommerce, Multi-Instructor**

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
