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
Todd (the founder/developer of Quantum Physician) and Claude have built this admin panel together across 25+ intensive sessions. Todd cares deeply about polish, design details, and getting things right. These handoff documents represent a **shared history** — every bug fix, every design decision, every architectural choice was made collaboratively and often through multiple iterations. The next Claude instance inherits this context and trust. **Treat these docs with the same care Todd does**: update them thoroughly at the end of every session, preserve hard-won lessons, and never make changes that contradict documented decisions without discussing with Todd first. This isn't just a codebase — it's a partnership.

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

**Last updated:** Session 25 (Mar 2, 2026)

---

## Sessions 14-24 Summary

See previous handoff docs for full details. Key milestones:
- **Sessions 14-18**: Academy Course Builder + Student Experience
- **Sessions 19-20**: Email Center Card Library, Rich Text Editor, Auth Auto-Refresh
- **Session 21**: Unified Rich Editor (rolled back — lessons documented)
- **Session 22**: Unified Rich Editor rebuilt successfully + 7 hotfixes
- **Session 23**: Full 1-on-1 Sessions system — 6 database tables, admin panel tab, public booking page, offer slot flow
- **Session 24**: Stripe payment backend + frontend checkout (session-checkout.js, session-webhook.js, pay token flow)

---

## Session 25 Summary — QP Member Portal + Dashboard (Mar 2, 2026)

### Member Area Pages Built ✅

**`members/login.html`** — Auth gateway
- Sign In / Create Account tabs
- Supabase auth: signInWithPassword + signUp
- Forgot password flow → sends reset email → redirects to reset-password.html
- QP branding: navy bg, teal accents, logo hero
- Redirects to dashboard on successful auth

**`members/dashboard.html`** — Main member hub ✅
- **Sidebar layout matching Academy dashboard** — fixed left sidebar with:
  - Large QP logo at top
  - Profile section: avatar (photo or initials with pulse animation), name, email
  - Referral card: code + copy button, credit/earned/referrals stats, earning info ($10 session / $25 bundle), "Open Referral Hub →" link
  - Nav links: Dashboard (active), Book a Session, Academy, Fusion Sessions, Account Settings, divider, Main Site
  - Sign Out in footer
- **Time-of-day greeting** ("Good afternoon, Todd")
- **Customizable 3-card grid** — user picks 3 of 6 available cards:
  1. Upcoming Sessions — pulls from `session_bookings` by email
  2. Upcoming Events — pulls from `session_schedule`
  3. Continue Learning — pulls from `qa_enrollments` + `qa_courses`, shows progress bar
  4. Community — pulls from `discussion_posts`, shows latest threads
  5. Live Events — checks `session_schedule` for today's events
  6. Recent Progress — enrollment + lesson completion stats
- **"Customize Dashboard" link** → modal with checkboxes, select exactly 3, saves to localStorage (`qp_dash_cards`)
- **Quick Links + My Account** bottom grid
- **Cross-domain SSO** — Fusion Sessions link passes access_token + refresh_token in URL hash for seamless auth
- **Mobile responsive** — sidebar collapses, floating hamburger button

**`members/settings.html`** — Account management ✅
- **Profile & Avatar**: upload photo to Supabase `avatars` bucket, initials fallback, edit name
- **Password**: verify current → set new (6+ chars, must match)
- **Notifications**: 4 toggle switches (session_reminders, booking_confirmations, cycle_announcements, academy_updates) → saves to `notification_preferences` table
- Same sidebar aesthetic, auth-gated

**`members/reset-password.html`** — Password reset handler ✅
- Detects Supabase recovery token from URL
- New password + confirm fields
- Updates via `sb.auth.updateUser()`

### Auth-Aware Shared Header (`js/shared.js`) ✅
- After shared header loads, checks Supabase session
- **Logged out**: header unchanged (Sign Up / Login links)
- **Logged in**: removes Sign Up/Login, injects avatar circle in top right
  - Click → animated dropdown with: name, email, Member Dashboard, Academy Dashboard, Book a Session, Account Settings, Sign Out
  - Closes on outside click or Escape
- Works on ALL QP pages that load shared.js + Supabase SDK
- Styles injected dynamically (no external CSS needed)

### SVG Icon System Standardization ✅
- **All member pages use SVG sprite icons** — NO emojis anywhere
- Icons defined as `<symbol>` elements in hidden `<svg>`, referenced via `<use href="#i-xxx"/>`
- Feather/Lucide style: stroke-based, 2px stroke-width, round linecaps/linejoins
- Icons: i-cal, i-video, i-book, i-chat, i-radio, i-trophy, i-user, i-zap, i-settings, i-home, i-gift, i-logout, i-arrow, i-chevron, i-check, i-sliders, i-heart, i-grad, i-layers, i-mail, i-play, i-layout, i-menu, i-lock, i-camera, i-bell
- Sizing: inline `width/height` or utility approach
- Matches Academy dashboard icon system exactly

### Key Technical Decisions
- **Referral lookup by email** (not user_id) — matches how `referral_codes` table stores data
- **Referral hub link**: `/referral-hub.html?brand=academy` opens teal/navy theme
- **Cross-domain SSO**: QP passes `access_token` + `refresh_token` in URL hash to Fusion — Fusion side needs a small SSO receiver snippet (NOT YET ADDED to Fusion repo)
- **Card preferences in localStorage**: key `qp_dash_cards`, defaults to `['sessions','learning','progress']`
- **Avatars**: Supabase `avatars` bucket (public, already exists with 4 policies)
- **Notification preferences**: `notification_preferences` table (exists, needs boolean columns verified)

### What Was NOT Done (Deferred)
- Cross-domain SSO receiver snippet on Fusion side (`fusionsessions.com/dashboard.html`)
- Fusion link still shows login page until SSO receiver is added
- Admin panel not modified in this session
- No new Netlify functions

---

## Session 24 Summary — Stripe Payment Backend + Frontend Checkout (Mar 2, 2026)

### Netlify Functions Created ✅

**`session-checkout.js`** (~240 lines) — NEW
- **Two checkout modes**:
  - **Token-based**: `{token: "abc123"}` → looks up proposed booking by `confirmation_token`, validates 72-hour expiry, creates Stripe checkout
  - **Public booking**: `{email, name, date, start_time}` → validates availability, checks conflicts, creates proposed booking, redirects to Stripe
- Fetches session config (price $150, duration 60 min) from `session_config` table
- Product display: "Private Healing Session — {Date}" with session image
- Success URL: `/pages/one-on-sessions.html?payment=success&booking_id={id}`
- Cancel URL: `/pages/one-on-sessions.html?payment=cancelled`

**`session-webhook.js`** (~300 lines) — NEW
- Handles `checkout.session.completed` where `metadata.type === "session_booking"`
- Updates booking: `proposed` → `paid`, stores `stripe_payment_id`, sets `confirmed_at`
- Updates waitlist: if email matches `notified` entry → `status: "booked"`
- Sends QP-branded confirmation email via Apps Script
- Logs to `admin_audit_log`
- Idempotency: skips if booking already `paid`
- **Requires separate Stripe webhook endpoint** (configured)

### Admin.js Updates ✅
- `generateBookingToken()` — 64-char hex token generator
- All 4 booking insert points now include `confirmation_token`
- `buildOfferEmailBody()` — CTA links to real checkout URL with token
- Bookings Grid: "🔗 Pay Link" button, "Mark Paid" replaces "Confirm", paid/expired badges
- Status tracker: "proposed / paid / declined"

### Frontend — one-on-sessions.html Updates ✅
- **`?pay=TOKEN` handler** — Instant redirect: page hidden, calls session-checkout, redirects to Stripe. No flash of sessions page.
- **`?payment=success` overlay** — Floating navy card over blurred sessions page: QP logo, checkmark, "Payment Confirmed!", "Back to Sessions" CTA
- **`?payment=cancelled` overlay** — Same style: X icon, "Payment Cancelled", "Your slot is still reserved for 72 hours"
- **Slot selection modal** — Replaces old alert. Clean modal: date/time/price display, name + email inputs, "Confirm & Pay" → calls session-checkout → redirects to Stripe

### Database Changes ✅
- `session_bookings`: Added `confirmation_token` column (text, nullable)
- `session_bookings`: Updated status check constraint to include `paid` and `expired`
- `qa_discussions`: Added `user_email`, `user_name`, `is_hidden`, `content` columns (fixed admin 400 error)

### Stripe Configuration ✅
- Webhook endpoint created: `https://qp-homepage.netlify.app/.netlify/functions/session-webhook`
- Listens for: `checkout.session.completed`
- Signing secret stored as `STRIPE_SESSION_WEBHOOK_SECRET` in Netlify env vars
- Product image: `assets/images/1on1-sessions-payment.png`

### Booking Status Flow (FINALIZED)
```
proposed → paid → completed
                → cancelled (48-hour policy)
                → no_show
proposed → declined (slot freed)
proposed → expired (72 hours passed without payment)
```
No separate "confirmed" state — confirm & pay is one atomic step via Stripe checkout.

---

## Session 23 Summary — 1-on-1 Sessions System (Feb 28, 2026)

### What Was Built (Previous Bot — Session 23a)

**Database: 6 new Supabase tables created ✅**
- `session_config`, `session_cycles`, `session_availability`, `session_clients`, `session_bookings`, `session_waitlist`

**Admin Proxy: 6 tables added to allowlist ✅**
- All session tables in `admin-proxy.js` ALLOWED_TABLES array

**Admin Panel — Full Sessions Tab (page-sessions) ✅**
- Tab switching (Cycles, Availability, Clients, Bookings, Public & Waitlist)
- Cycle Manager, Availability Calendar, Client Roster, Auto-Populate, Bookings Grid
- Offer Slot flow with email preview/test/send
- Public booking controls + waitlist manager

### Frontend — Dynamic Booking Page (pages/one-on-sessions.html) ✅
- Three dynamic states based on `session_config.public_booking_status` + active cycle
- Waitlist signup form → inserts into `session_waitlist`
- Monthly calendar with time slot picker (when open)

---

## 🔴 PRIORITY NEXT STEPS (Session 26)

### 1. Patient CRM / Portal (MAJOR BUILD — see session-26-crm-plan.md)
Full plan documented in `session-26-crm-plan.md`. Summary:
- **4 new patient portal pages**: Sessions & Recordings, Intake Form, Progress Tracker, Billing History
- **Sidebar update**: Collapsible "My Health" section in member dashboard sidebar
- **5 new database tables**: session_notes, session_recordings, patient_intake, patient_checkins, patient_progress_notes
- **Admin CRM**: Client Profiles tab with per-client detail view
- **Pre-build**: Run SQL migration script from plan doc, verify tables

### 2. Cross-Domain SSO — Fusion Side (PENDING)
- QP→Fusion token passing built (Session 25)
- **STILL NEEDED**: Add SSO receiver snippet to Fusion `dashboard.html`:
```javascript
// ─── Cross-domain SSO from QP ───
(async function checkSSO() {
    const hash = window.location.hash;
    if (hash.includes('access_token=') && hash.includes('type=sso')) {
        const params = new URLSearchParams(hash.substring(1));
        const access = params.get('access_token');
        const refresh = params.get('refresh_token');
        if (access && refresh) {
            await supabase.auth.setSession({ access_token: access, refresh_token: refresh });
            window.location.hash = '';
        }
    }
})();
```

### 3. End-to-End Payment Test
- Switch to Stripe test mode OR do a real $150 payment + refund
- Verify webhook fires → booking updates to `paid` → confirmation email sends
- Test waitlist → offer slot → pay → booking complete flow

### 4. QP-Branded Email Template for Sessions
- Currently uses `buildAcademyEmail` (teal template) — needs proper QP branded template

### 5. Full Email Automation System
- Auto-send confirmations, 24hr/1hr reminders, post-session follow-up
- Waitlist auto-notify on cancellations
- 72-hour offer expiry automation

### Session 27+ — Future Features
- **Stripe Checkout Polish**: Consistent branding across all checkout screens
- **Live Event Page**: Branded Zoom experience page
- **Student tools**: Flashcards, highlighting, journal, summarizer
- **Custom card templates**: Save your own
- **AI Copilot**: Smart email writing
- **Memberships / Subscriptions**

---

## Known Issues (Session 25)
1. **email-decode.min.js 404** — Netlify phantom. Harmless.
2. **Test email no delivery confirmation** — `mode:'no-cors'` means opaque response. Check inbox manually.
3. **Rich editor → email fidelity** — Advanced formatting may not render perfectly in all email clients.
4. **Token refresh first-login** — After deploying auth changes, must log out + back in once.
5. **Dead code from Session 19-20** — Old EC overrides still present. Low priority cleanup.
6. **Webhook untested with real payment** — session-webhook.js deployed but not yet triggered by actual Stripe payment.
7. **Calendar needs active cycle** — Frontend shows "filled" when all cycles completed. Intentional.
8. **Pre-deploy bookings lack tokens** — Bookings before Session 24 don't have `confirmation_token`.
9. **Stripe checkout formatting** — Stripe ignores `\n` in descriptions.
10. **Cross-domain SSO incomplete** — QP side sends tokens, Fusion side doesn't have receiver yet. Clicking "Fusion Sessions" in QP dashboard still shows Fusion login.
11. **notification_preferences columns** — Need to verify boolean columns exist: session_reminders, booking_confirmations, cycle_announcements, academy_updates.

---

## File Sizes (Session 25)
- `admin/index.html` — ~555 lines (unchanged)
- `admin/admin.js` — ~4789 lines (unchanged)
- `admin/admin.css` — ~142 lines (unchanged)
- `pages/one-on-sessions.html` — ~1333 lines (unchanged)
- `members/login.html` — ~NEW (Session 25)
- `members/dashboard.html` — ~NEW (Session 25, sidebar layout)
- `members/settings.html` — ~NEW (Session 25)
- `members/reset-password.html` — ~NEW (Session 25)
- `js/shared.js` — UPDATED (auth-aware header with avatar dropdown)
- `components/header.html` — UPDATED (login/signup links)

---

## Lessons Learned (ALL SESSIONS)
1-22: See previous docs
23. **Column name mismatches cause silent failures** — Always check `res.error` after inserts.
24. **Frontend needs active cycle to show booking calendar** — Check both `public_booking_status` and cycle status.
25. **Admin-proxy allowlist must be updated for new tables**
26. **RLS policies needed for public-facing pages**
27. **Referral codes stored by email, not user_id** — All referral lookups must use `.eq('email', email.toLowerCase())`, not `.eq('user_id', id)`. The `referral_codes` table doesn't have a user_id column.
28. **Cross-domain auth requires token passing** — Supabase sessions are in localStorage, which is domain-specific. QP and Fusion are on different domains, so auth doesn't carry across. Solution: pass access_token + refresh_token in URL hash.
29. **SVG sprites are the icon standard** — No emojis anywhere in the member portal or dashboard. All icons are `<symbol>` elements referenced via `<use href="#i-xxx"/>`. Matches Academy dashboard system.
30. **Sidebar layout creates visual consistency** — Member dashboard matches Academy dashboard layout for ecosystem coherence.
