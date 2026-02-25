# QP Admin Panel — Full Infrastructure Documentation

## 📋 SESSION HANDOFF PROTOCOL
This doc is 1 of 3 that must be updated at the end of every build session. These documents are a shared collaboration between Todd and Claude — they capture the accumulated knowledge of 9 build sessions. Keep them accurate and thorough.

**Last updated:** Session 11 (Feb 24, 2026)

---

## System Architecture Overview

### Hosting
- **QP Admin**: `qp-homepage.netlify.app/admin/` — Split into index.html + admin.css + admin.js
- **QP Referral Hub**: `qp-homepage.netlify.app/referral-hub.html` — Unified referral page (auto-themes via `?brand=fusion|academy`)
- **Fusion Admin**: `fusionsessions.com/admin.html` — Separate file, stays untouched until QP has full parity
- **Fusion Referral Hub**: `fusionsessions.com/referral-hub.html` — Now redirects to QP unified hub with `?brand=fusion`
- **Academy**: `qp-homepage.netlify.app/academy/` — Student-facing course platform
- **Fusion Sessions**: `fusionsessions.com` — Healing session platform with community

### Backend Services
- **Supabase** — Database (PostgreSQL), Auth, Storage, Realtime
- **Stripe** — Payments, checkout sessions
- **Netlify Functions** — Serverless endpoints for sensitive operations
- **Google Apps Script** — Email sending (3 scripts — see below)

### CDN Libraries
- **Supabase JS SDK** — loaded from CDN
- **Chart.js** — `https://cdn.jsdelivr.net/npm/chart.js` (added Session 7)

---

## Supabase Configuration

### Two Client Instances in QP Admin:
```javascript
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);      // reads + signInWithPassword
const sbAdmin = supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY); // ALL writes + admin data ops
```

**CRITICAL RULES**:
- Always use `sbAdmin` for writes. `sb` will silently fail on inserts/updates due to RLS policies.
- Always use `sb` for `signInWithPassword()`. `sbAdmin` (service role) bypasses auth entirely and CANNOT authenticate individual users.

### Auth Users Access
```javascript
// Direct REST API call (not SDK)
const res = await fetch(SUPABASE_URL + '/auth/v1/admin/users?page=' + page + '&per_page=500', {
  headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY }
});
```
Stored in `authUsersMap` (keyed by email).

---

## Admin Authentication System (Session 9)

### Login Flow
1. `sb.auth.signInWithPassword()` verifies email+password against Supabase Auth
2. Query `admin_users` table for matching email with `is_active = true`
3. If found: store full admin object in `sessionStorage`, apply permissions, show admin layout
4. If not found in `admin_users`: show "No admin access" error
5. Session persists via `sessionStorage` — survives page refreshes, cleared on logout or tab close

**NOTE (Session 10):** Legacy auth fallback (QPadmin/QPfs#2026) has been completely removed. All admins must have Supabase Auth accounts.

### CRITICAL: Auth Client Selection
- **`sb` (anon client)** → for `signInWithPassword()` — authenticates as a specific user
- **`sbAdmin` (service role)** → for data reads/writes — bypasses RLS, has full DB access
- Using `sbAdmin.auth.signInWithPassword()` will FAIL because service role bypasses the auth system entirely

### REMOVED: Legacy Fallback (Session 10)
- Legacy credentials (QPadmin/QPfs#2026) were completely removed in Session 10
- All admins must now authenticate via Supabase Auth
- Admin accounts require: (1) entry in `auth.users` with password, (2) row in `admin_users` with `is_active = true`

### Admin Account Requirements
An admin needs BOTH:
1. A Supabase Auth account (in `auth.users`) with a password set
2. A row in the `admin_users` table with `is_active = true`

To create a new admin auth account: sign up through fusionsessions.com/login.html (or any site using the same Supabase project). Note: `auth.create_user()` SQL function is NOT available on Supabase free tier.

### Permission System
```javascript
currentAdmin = {
  id: '...',
  email: 'admin@example.com',
  name: 'Todd',
  role: 'super_admin',  // or 'admin', 'assistant'
  permissions: {
    customers: true,     // Customers, Academy, Fusion, Sessions, Memberships, Referrals
    email: true,         // Email Campaigns
    promotions: true,    // Promotions page
    orders: true,        // Orders page
    community: true,     // Community page + moderators
    analytics: true,     // Analytics page
    suggestions: true,   // Smart Suggestions (dashboard)
    automation: true,    // Email Automation
    audit: true,         // Audit Log
    system: true,        // Admin Users (super_admin only)
    refund: true,        // Refund button in orders
    delete: true,        // Destructive actions
  }
};
```

### Role Defaults
| Permission | Super Admin | Admin | Assistant |
|------------|:-----------:|:-----:|:---------:|
| customers | ✅ | ✅ | ✅ |
| email | ✅ | ✅ | ✅ |
| promotions | ✅ | ✅ | ❌ |
| orders | ✅ | ✅ | ✅ |
| community | ✅ | ✅ | ✅ |
| analytics | ✅ | ✅ | ❌ |
| suggestions | ✅ | ✅ | ✅ |
| automation | ✅ | ✅ | ❌ |
| audit | ✅ | ✅ | ❌ |
| system | ✅ | ❌ | ❌ |
| refund | ✅ | ✅ | ❌ |
| delete | ✅ | ❌ | ❌ |

### Legacy Auth (TEMPORARY — remove in Session 10)
Old username "QPadmin" / password "QPfs#2026" still works as fallback. Grants super_admin. Checked BEFORE Supabase auth.

---

## Database Tables

### Core Tables (Read/Write)
| Table | Read Client | Write Client | RLS | Notes |
|-------|------------|-------------|-----|-------|
| `purchases` | sb | sbAdmin | Yes | Revoke uses `revoked__` prefix, refund uses `refunded__` |
| `referral_codes` | sb | sbAdmin | Yes | |
| `profiles` | sb | sbAdmin | Yes | `community_role` field for moderators |
| `credit_history` | sb | sbAdmin | Yes | |
| `qa_enrollments` | sb | sbAdmin | Yes | |
| `qa_courses` | sb | — | Yes | Read-only in admin |
| `qa_lesson_progress` | sb | sbAdmin | Yes | DELETE for reset |
| `admin_notes` | sb | sbAdmin | Yes | |
| `discussion_posts` | sb | sbAdmin | Yes | Pin/hide/delete |
| `qa_discussions` | sb | sbAdmin | Yes | |
| `email_campaigns` | sb | sbAdmin | Yes | |
| `email_tracking` | sb | sbAdmin | Yes | |
| `promotions` | sb | sbAdmin | Yes | **Use `coupon_id` for code** |
| `admin_audit_log` | sb | sbAdmin | Yes | `admin_user` column stores admin name |
| `admin_users` | sbAdmin | sbAdmin | Yes | **SESSION 9** — roles + permissions |
| `scheduled_emails` | sb | sbAdmin | Yes | **RLS applied SESSION 9** |
| `email_log` | sb | sbAdmin | Yes | **RLS applied SESSION 9** |
| `session_schedule` | sb | — | Yes | **RLS applied SESSION 9** Read-only |

### `admin_users` Table (Session 9)
```sql
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'assistant' CHECK (role IN ('super_admin', 'admin', 'assistant')),
  can_customers BOOLEAN DEFAULT true,
  can_email BOOLEAN DEFAULT true,
  can_promotions BOOLEAN DEFAULT false,
  can_orders BOOLEAN DEFAULT true,
  can_community BOOLEAN DEFAULT true,
  can_analytics BOOLEAN DEFAULT false,
  can_suggestions BOOLEAN DEFAULT true,
  can_automation BOOLEAN DEFAULT false,
  can_audit BOOLEAN DEFAULT false,
  can_system BOOLEAN DEFAULT false,
  can_refund BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### IMPORTANT: Promotions Table Field Names
- `coupon_id` — The actual promo code (e.g., "TEST50"). Use this for lookups.
- `name` — Display name
- `discount_type` — "percent", "fixed", or "set_price"
- Do NOT use `p.code` — this field does not exist.

### RLS Policies Applied in Session 9
```sql
ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON scheduled_emails FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON email_log FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE session_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON session_schedule FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON admin_users FOR ALL USING (true) WITH CHECK (true);
```

---

## Audit Log System (Redesigned Session 9 Continuation)

### Architecture
- `logAudit(action, targetEmail, details, metadata)` — stores clean details (no admin name prefix)
- Admin name stored in `admin_user` column of `admin_audit_log` table
- `auditSvg(name, col)` — renders inline SVG icons from a path dictionary

### Display Features
- Grouped by date headers
- Human-readable sentences: "Todd granted access to user@email.com"
- Color-coded badges by category: `grant` (green), `revoke` (red), `info` (teal), `neutral` (taupe)
- SVG feather-style icons in circular containers
- Search covers `target_email`, `details`, and `admin_user` fields

### Action Types
| Action | Category | Icon | Verb |
|--------|----------|------|------|
| grant_access | grant | check | granted access to |
| revoke_access | revoke | x-circle | revoked access for |
| block_user | revoke | lock | blocked/unblocked |
| adjust_credit | info | dollar | adjusted credits for |
| enroll_student | grant | grad | enrolled |
| assign_mod | grant | users | assigned moderator role to |
| remove_mod | revoke | users | removed moderator role from |
| add_admin | grant | shield | added as admin |
| send_email | info | mail | sent email campaign |
| create_promo | grant | tag | created promotion |
| suggestion_action | info | bulb | acted on suggestion |
| *(and more — see auditSvg function for full list)* |

---

## loadAllData() — Central Data Pipeline

Fetches 16 tables in a single `Promise.all()` call:
```
// 0: purchases → purchasesData
// 1: referral_codes → referralData
// 2: profiles → profilesData
// 3: credit_history → creditData
// 4: qa_enrollments → academyEnrollments
// 5: qa_courses → academyCourses
// 6: qa_lesson_progress → lessonProgress
// 7: admin_notes → adminNotesData
// 8: discussion_posts → allFusionPosts
// 9: qa_discussions → allAcadPosts
// 10: email_campaigns → emailCampaignsData (last 50)
// 11: email_tracking → emailTrackingData (last 500)
// 12: promotions → promotionsData (all, desc)
// 13: scheduled_emails → scheduledEmailsData (limit 100)
// 14: email_log → emailLogData (limit 200)
// 15: session_schedule → sessionScheduleData (all)
```

Plus `authUsersMap` from Supabase Admin API.

**Note:** `admin_users` is NOT in `loadAllData()` — it's fetched separately by `loadAdminUsers()` only when the Admin Users page is viewed (super_admin only).

---

## Moderator Management (Session 9)

### Location
Community page → "Moderators" tab (third tab after Academy Discussions and Fusion Community)

### Mechanism
- Uses `profiles.community_role` field (values: `member`, `moderator`, `admin`)
- Same field as Fusion admin — full compatibility
- Search uses `allCustomers` array (same as customer search)
- Assign: `sbAdmin.from('profiles').update({community_role: role}).eq('id', profileId)`
- Remove: sets `community_role` back to `'member'`
- Role selector has descriptions: "Moderator — Can moderate posts" / "Community Admin — Full community control"
- All actions audit-logged with admin name

---

## Email System Details (Sessions 6 + 8)

### Two Email Brands:
1. **Fusion Sessions** (`buildRichEmail()`) — Neon pink/purple/cyan
2. **Academy** (`buildAcademyEmail()`) — Teal/navy/Georgia serif, background #2f5f7f

### Multi-Card Rendering (Session 8):
- `parts[1]` = first card, `parts[2]` = second card
- Both positions handle: `{{qr_code}}`, bold markdown, code styling, smart CTA labels

---

## Netlify Functions

| Function | Purpose | Status |
|----------|---------|--------|
| `create-checkout.js` | Creates Stripe checkout session, validates promos | ✅ Live |
| `reset-password.js` | Sends password reset email | ✅ Live |
| `get-admin-users.js` | Fetches auth users list | ✅ Live |
| `admin-actions.js` | Referral code creation, magic links | ✅ Live |
| `email-track.js` | Open/click/conversion tracking | ✅ Live |
| `stripe-webhook.js` | Fusion purchase processing | ✅ Live |
| `stripe-refund.js` | Stripe refund processing | ✅ Live |
| `academy-checkout.js` | Academy checkout with prorated bundles | ✅ Live |
| `academy-webhook.js` | Academy purchase processing | ✅ Live |
| `admin-auth.js` | Server-side admin auth (primary login path) | Created Session 9, deployed Session 12 |

---

## Unified Referral Hub Architecture (Session 10)

### File: `referral-hub.html` (QP repo root, ~31KB)
Single-page application with dual theming. Uses ES module pattern with Supabase JS SDK from CDN.

### Theming System
- URL param `?brand=fusion` or `?brand=academy` sets the theme
- CSS classes on `<body>`: `body.fusion` (retro neon) or `body.academy` (clean modern)
- `BRAND_CONFIG` object holds per-brand: name, title, back URL, referral base URL, QR filename, share messages
- `applyTheme(brand)` swaps body class, updates header, updates URL without reload
- Toggle button in header switches between brands

### Auth Flow (Cross-Domain)
- On load: `supabase.auth.getSession()` — if session exists, load referral data immediately
- If no session: show inline login form (email + password)
- After login: query `referral_codes` table, render full hub
- Sign Out button clears session and shows login form for account switching
- All functions use `window.functionName` pattern (required for ES modules)

### Supabase Client
```javascript
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```
Uses anon client only (reads from `referral_codes` with user's own session).

### Referral Code Generation
- Users without a code see "Generate My Referral Code" button
- Generates 8-char alphanumeric code, inserts via anon client
- Requires RLS INSERT policy on `referral_codes` for authenticated users

### Integration Points
- **Fusion dashboard** (`fusionsessions.com/dashboard.html`): "Open Sharing Tools" → redirects through `fusionsessions.com/referral-hub.html` → unified hub with `?brand=fusion`
- **Academy dashboard** (`/Academy/dashboard.html`): "Open Referral Hub →" link in sidebar → `/referral-hub.html?brand=academy`
- **Admin email composer**: Can include referral hub links in email templates

---

## Google Apps Script Architecture

### Script 1: Stripe Webhook Handler
- Trigger: Stripe webhook on `checkout.session.completed`
- Routes to Fusion vs Academy, sends thank-you emails

### Script 2: Fusion Sessions Email Automation
- Trigger: Time-driven, every 15 minutes
- Reads `scheduled_emails`, processes pending, writes `email_log`

### Script 3: Bulk Email Sender v3
- Trigger: HTTP POST from QP Admin
- `{body: htmlContent, isHtml: true}` → sends as complete HTML
- **No changes needed for Sessions 6–9**

---

## Sidebar Navigation (Current — Session 9)

```
OVERVIEW
├── Dashboard
├── Customers
PRODUCTS
├── Academy
├── Fusion Sessions
├── 1-on-1 Sessions
├── Memberships
ENGAGE
├── Community (tabs: Academy | Fusion | Moderators)  ← Moderators added Session 9
├── Referrals & Credits
├── Email Campaigns
├── Email Automation
├── Promotions
├── Orders
├── Analytics
SYSTEM
├── Audit Log
├── Admin Users (super_admin only, hidden for others)  ← Session 9
└── Light/Dark toggle
```

---

## CSS Variables & Theming

```css
:root {
  --bg: #0c1824; --navy-card: #112a42; --text: #e8e8e8;
  --text-muted: #8899aa; --text-dim: #667788; --teal: #5ba8b2;
  --teal-glow: #4acfd9; --purple: #a78bfa; --pink: #ff006e;
  --success: #3dd68c; --danger: #ef5350; --taupe: #ad9b84;
  --warning: #f0b429;
}
```

### Session 9 CSS Additions:
- `.badge-success`, `.badge-danger`, `.badge-primary`, `.badge-purple`, `.badge-default` — Named badge variants
- `.avatar-sm` — Small avatar circle (32px) for tables
- `.label-sm` — Tiny label for form fields
- `.audit-date-group`, `.audit-date-label` — Date grouping headers
- `.audit-row`, `.audit-icon`, `.audit-body`, `.audit-sentence`, `.audit-admin`, `.audit-target` — Redesigned audit log layout
- `.audit-detail`, `.audit-meta`, `.audit-badge`, `.audit-time` — Audit entry metadata

---

## File Structure

```
quantum-physician/
├── admin/
│   └── index.html          ← THE admin panel (~405KB, everything in one file)
├── netlify/functions/
│   ├── create-checkout.js
│   ├── reset-password.js
│   ├── get-admin-users.js
│   ├── admin-actions.js
│   ├── email-track.js
│   ├── stripe-refund.js
│   ├── academy-checkout.js
│   ├── academy-webhook.js
│   ├── admin-auth.js       ← Session 9, deployed Session 12 (primary login)
│   └── admin-proxy.js      ← Session 12 (proxies all admin Supabase ops server-side)
├── academy/                ← Academy student-facing pages
├── fusion/                 ← Fusion Sessions pages
└── netlify.toml
```

---

## Known Technical Debt

1. **File size (~405KB)** — Grew from 378KB → ~405KB in Session 9. Code splitting strongly recommended.
2. **`showCustomerDetail()` is one massive line** — causes file truncation on upload
3. **Legacy auth fallback** — "QPadmin"/"QPfs#2026" still works. Remove once Supabase auth confirmed.
4. **Custom templates + query presets in localStorage** — not shared across admin users
5. **No Stripe Coupon sync** — promos are Supabase-only
6. **Auth user fetch** — `listUsers` pagination works but untested past 1000 users
7. **Academy referral hub page doesn't exist** — will 404
8. **Card Library not built** — Todd wants pre-built email card blocks (future session)
9. ~~`admin-auth.js` not deployed~~ — **DEPLOYED Session 12.** Primary admin login path.
10. **`admin-proxy.js` deployed Session 12** — Proxies ALL admin Supabase operations server-side. Service key never touches browser.
11. **Security headers deployed** — `_headers` file in root of both QP and Fusion repos.
12. **Service key rotated** — Old exposed key invalidated. New key in Netlify env vars only.
10. **Brave browser autofill** — Ignores autocomplete=off. Decided not to fight it.

## Session 10B Updates
- **Card Library uses own SVG helper** (`clSvg()`) — independent of `auditSvg()` scope, has 7 icons: link, users, calendar, star, zap, grad, key
- **Email renderers** (`buildRichEmail`, `buildAcademyEmail`) — card loop uses `for(cx=2;cx<parts.length;cx++)` pattern, border colors cycle via array
- **Terminal workflow confirmed** — all edits via Python scripts + git push, no file downloads

## Session 11 Updates — Weekly Goals + Rich Email + Auto-Promo

### Weekly Goals System
- **Panel location**: Between Smart Suggestions and Recent Purchases on dashboard
- **7 goals**: 5 auto-checked from `email_campaigns.campaign_type` (current week Mon-Mon), 2 manual
- **Goal types**: no_purchase, upsell_bundle, credit_reminder, referral_nudge, promote_session + promo_create (manual), review_analytics (manual)
- **Auto-check logic**: Queries `email_campaigns` for current week's sent types
- **Manual goals**: Stored in `localStorage` key `qp_weekly_goals_YYYY-MM-DD`, auto-resets weekly
- **Click behavior**: Opens `sgSetupEmail` compose modal with pre-built rich template

### Rich Email Templates
- Each goal has `buildTemplate(goalPromo)` that generates dynamic body text with `---` card blocks
- `---` separators create neon-bordered card sections in `buildRichEmail()`
- `{{session_image:session-XX}}` tokens render as `<img>` tags via `imgTokenReplace()` function
- `{{qr_code}}` tokens render QR code images for referral links
- Templates pull live data: next session from `session_schedule`, active promos, customer stats

### FUSION_IMAGES + FUSION_SHORT Constants
- `FUSION_IMAGES` — maps all 12 session IDs + bundle-all to Wix thumbnail URLs (350x250)
- `FUSION_SHORT` — short session names without "S1:" prefix for image alt text

### Auto-Promo Generation
- `autoCreatePromo(prefix, discount, appliesTo)` — creates unique promo in `promotions` table via `sbAdmin`
- Codes: `WELCOME###` (15% any), `BUNDLE###` (20% bundle-only), `SESSION###` (10% sessions-only)
- Each code: unique per click, 7-day expiry, one-per-user, stackable with credits
- Logged to audit as `create_promo`, saved to `promotionsData` in-memory
- "Auto" badge shown on auto-generated promos in Promotions list (checks `notes.indexOf('Weekly Goal')`)

### Recipient Filtering
- `filterGoalRecipients(rawEmails)` — removes opted-out users + those at weekly promo limit
- Checks `email_tracking` table for `email_type='promotional'` in last 7 days
- Uses `getWeeklyEmailLimit()` (default 3, configurable in System settings)
- `sgSetupEmail` wrapper auto-filters all promotional emails (suggestions + goals)

### File Size
- `admin.js` ~2370 lines (up from ~2150)

### Critical Bug Fixes (Session 11B)
- **var hoisting in generateSuggestions()**: All suggestion cards used `var emails=` in same function scope. JavaScript `var` hoisting meant all closures captured the LAST assignment (top referrers). Fixed by giving each card a unique variable: `unusedRefEmails`, `bundleEmails2`, `creditEmails`, `inactiveEmails`, `noPurchEmails`, `absentEmails`, `topRefEmails`.
- **marketing_opt_in field location**: Supabase Auth Admin API returns `marketing_opt_in` in `user_metadata` field, NOT `raw_user_meta_data` (even though the DB column is `raw_user_meta_data`). The API synthesizes `user_metadata` from `raw_user_meta_data` but they can diverge. All 12 opt-in checks in admin.js updated to: `(u.user_metadata||u.raw_user_meta_data||{}).marketing_opt_in===false`
- **DB truth**: In `auth.users` table, `raw_user_meta_data` DOES contain `marketing_opt_in` — but the JS Auth API may return it differently. Always check `user_metadata` first in JavaScript.
- New constants: FUSION_IMAGES, FUSION_SHORT (~12 lines)
- New functions: autoCreatePromo, filterGoalRecipients, getSessionImageBlock, getNextSessionProductId, imgTokenReplace, weeklyGoalAction, loadWeeklyGoals, completeManualGoal, getWeekStart, getWeekKey (~120 lines)


## Security Architecture (Session 12)

### Authentication Flow
1. User enters email/password on admin login page
2. `admin-auth.js` Netlify function verifies credentials + checks `admin_users` table
3. Returns Supabase session token, stored in `sessionStorage.qp_admin_token`
4. Fallback: direct `sb.auth.signInWithPassword()` if function unavailable

### Admin Operations Flow
1. Client calls `proxyFrom('table_name').select('*')` (or insert/update/delete)
2. `proxyFrom()` builds payload and sends to `/.netlify/functions/admin-proxy`
3. Auth token sent in `Authorization: Bearer` header
4. `admin-proxy.js` verifies token via `sbAnon.auth.getUser()`, checks `admin_users.is_active`
5. Executes operation using service role key (server-side only)
6. Returns `{data, error}` response

### Auth Admin API Flow (user management)
1. Client calls `authAdminAPI('list_users'|'generate_link'|'update_user', params)`
2. Routed through same `admin-proxy.js` with `type: 'auth_admin'`
3. Proxy makes direct REST calls to Supabase Auth API using service key

### Allowed Tables (admin-proxy.js)
`admin_audit_log`, `admin_notes`, `admin_users`, `email_campaigns`, `email_tracking`, `profiles`, `promotions`, `purchases`, `qa_enrollments`, `qa_profiles`, `referral_codes`, `scheduled_emails`, `session_schedule`

### Security Headers (_headers file)
Both QP and Fusion repos have `_headers` in root:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff  
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Content-Security-Policy: frame-ancestors 'self'; object-src 'none'; base-uri 'self'

### Environment Variables
**QP Netlify:** SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
**Fusion Netlify:** SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_KEY, ADMIN_PASSWORD

## Session 13 Updates

### Recovery Tool → Email Center Flow
The recovery tool no longer sends emails directly. After granting access (inserting purchase records via proxyFrom), it opens the sgSetupEmail compose modal pre-loaded with:
- Recipients: granted customer emails
- Subject: product-specific ("Your Fusion Sessions Bundle Is Ready!" or "Your Fusion Session Is Ready — {name}")
- Body: Recovery template with product image, how-to-access instructions, quick tips
- Brand: Fusion (Neon), From: Dr. Tracey (Personal)

The admin can then preview, edit, test, and send through the existing email pipeline.

### New Helper Functions
- `wrParseName(email)` — Smart first-name extraction from email address
- `wrNormalizeProduct(pid)` — Normalizes session-1 → session-01
- `wrComposeEmail()` — Opens sgSetupEmail for all listed recovery customers
- `wrClear()` — Clears recovery tool textarea and results
- `wrUpdateGrantBtn()` — Toggles grant button text based on compose checkbox

### buildRichEmail CTA Detection (updated)
Priority order for card CTA buttons:
1. "Collection" or "Upgrade" → COMPLETE YOUR BUNDLE
2. "Dashboard", "Log In", or "access your" → GO TO DASHBOARD → /login.html
3. "code", "Share", "referral" → GO TO REFERRAL HUB → /referral-hub.html
4. Default → CLAIM YOUR DISCOUNT → site root or coupon URL

### Allowed Tables (admin-proxy.js) — Updated
Added: `email_log`
Full list: `admin_audit_log`, `admin_notes`, `admin_users`, `email_campaigns`, `email_log`, `email_tracking`, `profiles`, `promotions`, `purchases`, `qa_enrollments`, `qa_profiles`, `referral_codes`, `scheduled_emails`, `session_schedule`

### Card Library (12 cards total)
Referral Invite, Community Invite, Upcoming Session, Welcome, Feature Highlight, Testimonial, Bold CTA, Academy Promo, QR Code Only, **Purchase Confirmation** (NEW), **Getting Started Tips** (NEW), **Session Product** (NEW), **Bundle Product** (NEW)

### Static Assets
- `favicon.ico` — Transparent lotus, multi-size ICO (16/32/48/256px)
- `apple-touch-icon.png` — 180px lotus PNG
- `netlify.toml` — Build config (publish: ".", functions: "netlify/functions") + security headers

### File Sizes (Session 13)
- `admin/admin.js` — ~352KB
- `admin/admin.css` — ~36KB
- `admin/index.html` — ~65KB
