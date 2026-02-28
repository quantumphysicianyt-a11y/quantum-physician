# QP Admin Panel — Full Infrastructure Documentation

**Last updated:** Session 22 (Feb 28, 2026)

---

## System Architecture Overview

### Hosting
- **QP Admin**: `qp-homepage.netlify.app/admin/` — Split into index.html + admin.css + admin.js
- **QP Referral Hub**: `qp-homepage.netlify.app/referral-hub.html` — Unified referral page (auto-themes via `?brand=fusion|academy`)
- **Fusion Admin**: `fusionsessions.com/admin.html` — Separate file, stays untouched until QP has full parity
- **Academy**: `qp-homepage.netlify.app/academy/` — Student-facing course platform
- **Fusion Sessions**: Domain TBD (⚠️ `fusionsessions.com` doesn't resolve — may be `fusionsessions.quantumphysician.com` or Netlify subdomain)

### Backend Services
- **Supabase** (rihlrfiqokqrlmzjjyxj): Database, auth, RLS policies
- **Stripe**: Payment processing (shared account for both platforms)
- **Netlify**: Hosting + serverless functions (QP repo + Fusion repo)
- **Google Apps Script**: Email sending (3 scripts), Stripe webhook handling
- **Vimeo**: Video hosting for Fusion session recordings

### Repo: `quantum-physician` (QP/Homepage)
```
quantum-physician/
├── _headers                    # Security headers
├── admin/
│   ├── index.html             # Admin panel HTML (~65KB)
│   ├── admin.css              # Admin panel styles
│   └── admin.js               # Admin panel logic (~3000 lines)
├── academy/
│   ├── builder.html           # Course builder
│   ├── course.html            # Course viewer
│   ├── dashboard.html         # Student dashboard
│   ├── index.html             # Academy landing
│   ├── learn.html             # Lesson viewer
│   ├── login.html             # Academy login
│   ├── preview.html           # Admin preview
│   ├── reset-password.html
│   ├── schedule.html
│   ├── seed-course.html
│   ├── css/academy.css
│   └── js/                    # Academy JS files
├── components/
│   ├── footer.html
│   └── header.html
├── css/shared.css
├── docs/
│   ├── admin-master-plan.md
│   ├── full-infrastructure-doc.md
│   └── fusion-gap-analysis.md
├── js/
│   ├── events-panel.js
│   └── shared.js
├── netlify/functions/
│   ├── academy-checkout.js    # Academy Stripe checkout
│   ├── academy-webhook.js     # Academy Stripe webhook
│   ├── admin-auth.js          # Admin login endpoint
│   ├── admin-proxy.js         # Server-side proxy for all admin ops
│   └── stripe-refund.js       # Stripe refund processing
├── netlify.toml               # Build config + headers
├── favicon.ico                # Lotus favicon (multi-size)
├── apple-touch-icon.png       # 180px lotus
├── index.html                 # QP homepage
└── referral-hub.html          # Unified referral hub
```

---

## Authentication System

### Admin Login Flow
1. User enters email + password on admin login screen
2. Primary path: `admin-auth.js` Netlify function
   - Creates Supabase anon client, calls `signInWithPassword()`
   - Checks `admin_users` table for active admin with matching email
   - Returns `{success, admin, token}` with session access_token
3. Fallback path: Direct `sb.auth.signInWithPassword()` if function unavailable
   - Same flow but client-side
4. Token stored: `sessionStorage.setItem('qp_admin_token', token)`
5. Refresh token stored: `sessionStorage.setItem('qp_admin_refresh', refresh_token)` (SESSION 20)

### Token Auto-Refresh (SESSION 20)
- **onAuthStateChange listener**: Fires whenever Supabase auto-refreshes internally. Saves new access_token + refresh_token to sessionStorage.
- **adminProxy 401 retry**: If any proxy call returns 401, automatically refreshes token via `sb.auth.refreshSession()` and retries once.
- **45-minute interval**: Background `setInterval` proactively refreshes before the 1-hour Supabase expiry.
- **Session restore on load**: On page load, calls `sb.auth.setSession()` with stored refresh_token to restore the Supabase client's session state.

### Admin Proxy (`admin-proxy.js`)
- Single Netlify function handling ALL admin Supabase operations
- **Dual clients**: `sbAnon` (validates caller's session token) + `sbAdmin` (performs operations with service role key)
- **Auth flow (line 42)**: `sbAnon.auth.getUser(token)` → verify → check `admin_users` table → execute operation
- **Allowlisted tables (13)**: purchases, referral_codes, profiles, credit_history, qa_enrollments, qa_lesson_progress, admin_notes, admin_audit_log, email_campaigns, email_tracking, promotions, scheduled_emails, admin_users, email_log
- **Write safety**: All writes require filter conditions (no unfiltered bulk ops)
- **Operations**: select, insert, update, delete, upsert, auth_admin (list_users, generate_link, etc.)

### Supabase API Key System
Two SEPARATE key systems (Session 20 learning):
1. **Legacy JWT Keys** (used by ALL code): `eyJhbGciOiJIUzI1NiIs...` (~170 chars)
   - `anon` key: client-side, in admin.js line 2
   - `service_role` key: server-side only, in Netlify env vars
2. **New Secret Keys**: `sb_secret_...` (~40 chars) — NOT used by any code
- Regenerating new-format keys does NOT affect legacy keys
- To rotate service_role: must rotate JWT Secret (breaks all sites until updated)

---

## Email System Architecture

### Email Sending (ALL emails go through Google Apps Script)
- **APPS_SCRIPT_URL** defined in admin.js (~line 833)
- `fetch(APPS_SCRIPT_URL, {method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain'}, body:JSON.stringify(payload)})`
- Payload: `{to, from, subject, body, isHtml}`
- If `isHtml:true`: body sent as-is (pre-built HTML from admin)
- If `isHtml:false`: Apps Script wraps in styled template
- `mode:'no-cors'` means response is opaque — can't confirm delivery programmatically

### 3 Google Apps Scripts
1. **Stripe Webhook Handler** — Handles checkout.session.completed events, routes Fusion vs Academy, sends purchase confirmation + notification to Tracey
2. **Fusion Sessions Email Automation** — Runs every 15 min via time trigger, processes `scheduled_emails` table, sends styled emails
3. **Bulk Email Sender v3** — Called by admin Email Center for campaigns + test emails. Supports `isHtml` flag.

### Email Center Features (Session 20 state)
- Rich text editor (WYSIWYG) with font/size/color/heading/alignment/lists/links/emoji/image/table/blockquote
- Source code toggle (switch between rich editor and raw markdown)
- 11 pre-built card templates in Card Library
- CTA button library (6 quick-insert + custom)
- Smart CTA detection from markdown links
- Live auto-preview with iframe
- Audience targeting: all-opted-in, bundle-owners, single-session, no-purchase, individual sessions, academy courses, custom list
- Campaign history with per-recipient tracking
- Weekly promo limit enforcement
- Brand switching (Fusion neon / Academy teal)
- Discount card with auto-promo generation
- Test email with styled modal
- Send to recipients with progress bar

### Email Builder Pipeline
1. User writes in rich editor (contenteditable div)
2. Rich editor syncs to hidden textarea as markdown (`**bold**`, `[text](url)`, `---` dividers)
3. On send: textarea value personalized ({{name}}, {{email}}, {{referral_code}})
4. If "Send as Rich HTML" checked: `buildRichEmail()` or `buildAcademyEmail()` converts markdown to styled HTML
5. Payload sent to Apps Script with `isHtml:true`
6. Apps Script sends via `GmailApp.sendEmail()`

### Two Email Builder Functions
- `buildRichEmail(bodyText, trackingId, siteUrl, discountConfig)` — Fusion neon template
- `buildAcademyEmail(bodyText, trackingId, siteUrl, discountConfig)` — Academy teal template
- Both support: `---` card splitting, `**bold**` → styled, session images, QR codes, tracking pixels, CTA buttons

---

## Key Constants & Variables

### admin.js Global State
- `sb` — Supabase anon client (line 4)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — lines 1-2
- `APPS_SCRIPT_URL` — Google Apps Script endpoint (~line 833)
- `FUSION_IMAGES` — Map of session product IDs → thumbnail URLs (line 16)
- `currentAdmin` — Logged-in admin object (from admin_users table)
- `allCustomers` — Built from profiles + purchases + referral_codes
- `authUsersMap` — Map of email → Supabase auth user object
- `emailCampaignsData`, `emailTrackingData`, `emailLogData`, etc. — Loaded on init
- `cardLibraryTemplates` — 11 pre-built card objects

### Session Storage Keys
- `qp_admin_auth` — JSON admin object (id, email, name, role, permissions)
- `qp_admin_token` — Supabase access_token (JWT)
- `qp_admin_refresh` — Supabase refresh_token (SESSION 20)

---

## File Sizes (Session 22)
- `admin/index.html` — ~555 lines (hardcoded toolbar replaced with mount div)
- `admin/admin.js` — ~3290 lines (unified editor component + bridge code)
- `admin/admin.css` — ~142 lines + editor styles

---

## Netlify Functions (5)
| Function | Purpose | Auth |
|----------|---------|------|
| `admin-proxy.js` | All admin Supabase operations | Bearer token → admin_users check |
| `admin-auth.js` | Admin login | Email + password → Supabase auth |
| `academy-checkout.js` | Academy Stripe checkout sessions | Public |
| `academy-webhook.js` | Academy Stripe webhook handler | Stripe signature |
| `stripe-refund.js` | Process Stripe refunds | Bearer token |

---

## Known Issues (Session 22 + Hotfix 7)
1. **✅ Fusion Sessions domain**: `fusionsessions.com` confirmed working.
2. **✅ CTA buttons + rich editor**: Fixed in Session 22 — selection save/restore handles focus loss.
3. **✅ Session 21 rebuilt**: Unified editor component working in Session 22.
4. **✅ Safari lookbehind crash**: Replaced `(?<!\*)` in `_reTextareaToRich` with Safari-safe `(?:^|([^*]))` alternation. Was likely cause of SG popup crash.
5. **✅ Academy email card links**: `buildAcademyEmail` additional cards now convert markdown links to styled `<a>` tags instead of stripping them.
6. **email-decode.min.js 404**: Netlify phantom, harmless.
5. **Test email delivery**: `mode:'no-cors'` means no confirmation. Check inbox manually.
6. **Rich editor → email fidelity**: Advanced formatting (tables, images) may not render perfectly in email HTML.
7. **Token refresh first-login**: After deploying auth changes, must log out + back in once to store refresh_token.
8. **Dead code from Session 19-20**: Old `ecInsertLibraryCard`/`insertEmailVar`/`ecInsertCTA` overrides (lines ~2635-2744) are overridden by Session 22 bridge. Low priority cleanup.
9. **prompt() for URLs**: Link, image, and custom CTA inputs use browser `prompt()` instead of `qpPrompt()`. Low priority upgrade.
