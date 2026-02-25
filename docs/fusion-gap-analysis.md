# Fusion Admin → QP Unified Admin: Feature Gap Analysis

## ⚠️ CRITICAL STRATEGIC DECISION (DO NOT LOSE)
**The QP unified admin will REPLACE the Fusion admin entirely.**
- Build QP admin first with full feature parity → then retire Fusion admin
- Do NOT modify the Fusion admin while building — it stays live and untouched
- Once QP admin covers everything, fusionsessions.com/admin.html gets decommissioned
- One admin panel at qp-homepage.netlify.app/admin/ manages both platforms

## 📋 SESSION HANDOFF PROTOCOL — READ THIS FIRST
This doc is 1 of 3 that must be updated at the end of every build session and uploaded at the start of every new chat. These documents represent a shared collaboration between Todd and Claude across 9 sessions — treat them with care and keep them accurate.

**Last updated:** Session 10 (Feb 24, 2026)

---

## Fusion Admin Sections (7,932 lines)
1. Quick Stats Dashboard (clickable drill-down panels)
2. Overview Charts (Chart.js with multiple chart types)
3. Campaign Performance
4. Customer Management (search, detail cards, browser)
5. Quick Grant Access
6. Community Moderation (posts + moderators)
7. Recent Activity (purchases, referrals, credits tabs)
8. Email Center (compose, audience targeting, templates)
9. Promotions Manager (create/edit coupons, trackable links)
10. Email Automation (scheduled emails, logs, session schedule)

---

## Feature-by-Feature Comparison

### ✅ Already in QP Admin (parity or better)
| Feature | Fusion Admin | QP Admin | Notes |
|---------|-------------|----------|-------|
| Customer search + autocomplete | ✅ | ✅ | QP adds name search |
| Customer detail card | ✅ | ✅ | QP has tabbed view (All/Academy/Fusion) |
| Login As | ✅ Single destination | ✅ Dropdown (Academy/Fusion) | QP is better |
| Reset Password | ✅ via Netlify function | ✅ Direct Supabase Admin API | QP is better |
| Block/Unblock | ✅ | ✅ SESSION 3 | |
| Grant/Revoke access | ✅ Fusion products | ✅ Fusion + Academy products | QP is better |
| Credit add/remove/set | ✅ | ✅ SESSION 3 | |
| Referral code management | ✅ | ✅ SESSION 3 | |
| Community moderation | ✅ Posts + moderators | ✅ Posts + moderators | **SESSION 9: Full parity** |
| **Moderator management** | ✅ Add/remove/badges | ✅ SESSION 9 | Full parity, descriptive roles |
| Customer browser | ✅ | ✅ SESSION 3 | |
| Academy enrollments | ❌ | ✅ | QP-only feature |
| Audit log | ❌ | ✅ SESSION 3 + 9 redesign | QP-only, grouped by date, SVG icons, admin names |
| Admin notes | ✅ localStorage | ✅ SESSION 3 | QP: Supabase (better) |
| Email compose UI | ✅ | ✅ SESSION 4 | |
| Audience segments | ✅ 8 segments | ✅ SESSION 4 | QP adds Academy courses + custom list |
| Email templates | ✅ | ✅ SESSION 4 | |
| Campaign history | ✅ | ✅ SESSION 4 | |
| Per-recipient tracking | ✅ | ✅ SESSION 4 | |
| Weekly promo limit | ✅ | ✅ SESSION 4 | |
| Promotions Manager | ✅ | ✅ SESSION 5 | |
| **Edit Promotions** | ✅ | ✅ SESSION 5 | Was undocumented, confirmed working |
| Orders/Transaction Browser | ✅ | ✅ SESSION 5 | QP adds CSV export |
| **Stripe Refund from Admin** | ✅ | ✅ SESSION 5 | `stripe-refund.js` + UI button |
| Rich HTML email builder | ✅ | ✅ SESSION 6 | |
| Tracking pixel + click tracking | ✅ | ✅ SESSION 6 | |
| Discount card in emails | ✅ | ✅ SESSION 6 | |
| QR code in emails | ✅ | ✅ SESSION 6 | |
| Email Automation page | ✅ | ✅ SESSION 6 | |
| Academy email template | ❌ | ✅ SESSION 6 | QP has BOTH brands |
| Email brand selector | ❌ | ✅ SESSION 6 | QP-only |
| Dashboard Charts | ✅ | ✅ SESSION 7 | QP has 9 types + popout |
| Time range filter | ✅ | ✅ SESSION 7 | |
| Key metrics cards | ✅ | ✅ SESSION 7 | |
| Downloadable Reports | ❌ | ✅ SESSION 7 | QP-only (6 CSV reports) |
| Custom Analytics Query | ❌ | ✅ SESSION 7 | QP-only |
| Suggestion Engine | ✅ Auto email suggestions | ✅ SESSION 8 | QP: behavior-driven, multi-category |
| Smart email compose | ❌ | ✅ SESSION 8 | QP: live preview, brand switch |
| Multi-card emails | ❌ | ✅ SESSION 8 | QP: separate discount + referral cards |
| Card swap/reorder | ❌ | ✅ SESSION 8 | QP: ↕ Swap button with live preview |
| Academy QR codes | ❌ | ✅ SESSION 8 | QP: QR in both templates |
| **Admin login (Supabase auth)** | ❌ Basic password | ✅ SESSION 9 | QP: email+password, Supabase-based |
| **Admin roles & permissions** | ❌ | ✅ SESSION 9 | QP-only: 3 roles, 12 permission flags |
| **Admin user management** | ❌ | ✅ SESSION 9 | QP-only: add/edit/disable admins |
| **Permission-based sidebar** | ❌ | ✅ SESSION 9 | QP-only: auto-hide unauthorized sections |
| **Admin name on audit** | ❌ | ✅ SESSION 9 | QP-only: admin_user column + metadata |
| **Audit log redesign** | ❌ | ✅ SESSION 9 | Grouped by date, SVG icons, human-readable, color-coded |
| **Legacy auth removed** | N/A | ✅ SESSION 10 | Supabase auth only, no more QPadmin/QPfs#2026 |
| **Unified Referral Hub** | ✅ Fusion-only page | ✅ SESSION 10 | One page, two themes (Fusion neon / Academy modern), cross-domain auth |
| **Referral hub login** | ❌ (same domain) | ✅ SESSION 10 | Inline login for cross-domain sessions |

### ❌ In Fusion Admin but MISSING from QP Admin
| Feature | What Fusion Has | Priority | Session |
|---------|----------------|----------|---------|
| **Create Scheduled Email** | UI to create new scheduled emails from admin | ✅ DONE | Session 7 (undocumented) |
| **Edit Session Schedule** | Modify session dates/Zoom links from admin | ✅ DONE | Session 7 (undocumented) |
| **Weekly Goals** | Clickable weekly marketing targets with rich email templates | ✅ DONE | Session 11 |

### 🎉 FUSION PARITY STATUS: COMPLETE ✅
All features from Fusion admin are now in QP admin. Zero gaps remain. **The QP admin is ready to replace the Fusion admin.**

### Session 11 Additions (Beyond Parity)
- Weekly Goals widget with auto-check from email_campaigns table
- Rich email templates with `---` card blocks, session thumbnails, strikethrough pricing
- `{{session_image:session-XX}}` token rendering in buildRichEmail
- Auto-promo generation (WELCOME/BUNDLE/SESSION prefixes, unique per click, 7-day expiry)
- filterGoalRecipients() — opt-out + weekly promo limit pre-filtering
- sgSetupEmail wrapper auto-filters promotional emails globally
- "Auto" badge on auto-generated promos in Promotions list
- FUSION_IMAGES + FUSION_SHORT constants for all 12 session thumbnails

### Critical Bug Fixes (Session 11B)
- var hoisting: unique variable names per suggestion card closure
- marketing_opt_in: check `user_metadata` first (Supabase Auth API quirk), `raw_user_meta_data` as fallback
- 12 opt-in checks across admin.js updated

---

### Database Tables Read by QP Admin (16 tables + admin_users)
| Table | Added In | Purpose |
|-------|----------|---------|
| `purchases` | Session 1 | All transactions |
| `referral_codes` | Session 1 | Referral system |
| `profiles` | Session 1 | User profiles + community_role |
| `credit_history` | Session 1 | Credit audit trail |
| `qa_enrollments` | Session 1 | Academy enrollments |
| `qa_courses` | Session 1 | Course catalog |
| `qa_lesson_progress` | Session 1 | Lesson completion |
| `admin_notes` | Session 3 | Admin notes per customer |
| `discussion_posts` | Session 3 | Community posts |
| `qa_discussions` | Session 3 | Academy discussions |
| `email_campaigns` | Session 4 | Sent campaign history |
| `email_tracking` | Session 4 | Per-recipient tracking |
| `promotions` | Session 5 | Promo codes and discounts |
| `scheduled_emails` | Session 6 | Automated email queue |
| `email_log` | Session 6 | Individual email send records |
| `session_schedule` | Session 6 | Fusion session dates and Zoom info |
| `admin_users` | Session 9 | Admin accounts + permissions |
| `auth.users` (Admin API) | Session 3 | Email verification, last login, opt-in |

### Database Tables Written by QP Admin
| Table | Added In | Operations |
|-------|----------|------------|
| `admin_audit_log` | Session 3 | INSERT (admin_user column for admin name) |
| `admin_notes` | Session 3 | INSERT, DELETE |
| `referral_codes` | Session 3 | INSERT, UPDATE |
| `purchases` | Session 3 | UPDATE, DELETE |
| `profiles` | Session 3 | UPDATE (includes community_role) |
| `qa_enrollments` | Session 3 | INSERT, UPDATE |
| `qa_lesson_progress` | Session 3 | DELETE |
| `email_campaigns` | Session 4 | INSERT |
| `email_tracking` | Session 4 | INSERT |
| `promotions` | Session 5 | INSERT, UPDATE, DELETE |
| `scheduled_emails` | Session 6 | UPDATE |
| `admin_users` | Session 9 | SELECT, INSERT, UPDATE |

---

## Updated Session Roadmap (Post-Session 9)

### Session 3–11 — ALL COMPLETED ✅

### Session 12+ — Course Builder, AI Copilot, Memberships, Assessments, Ecommerce

---

## Key Architectural Notes

**Service Role Key**: All writes use `sbAdmin`. Reads use `sb` where RLS allows.
**Auth Login**: Use `sb.auth.signInWithPassword()` (anon client). NEVER use `sbAdmin` for auth — it bypasses authentication.
**Legacy Fallback**: REMOVED in Session 10. All admins must use Supabase auth.
**Admin Account Setup**: Must exist in both `auth.users` (with password) AND `admin_users` table.
**Permission Enforcement**: `applyPermissions()` hides sidebar links. `canDo(perm)` helper for inline checks.
**Soft Delete Pattern**: Revoke prefixes product_id with `revoked__`. Refund prefixes with `refunded__`. Archive bans auth + blocks profile.
**Rich Email Flow**: Compose → brand select → `buildRichEmail()` or `buildAcademyEmail()` → Apps Script `{body: html, isHtml: true}`.
**Multi-Card Email Flow**: Body text split on `\n---\n` into parts[0] (body), parts[1] (card 1), parts[2] (card 2).
**Moderator Management (SESSION 9)**: Community → Moderators tab → search + assign role on `profiles.community_role`.
**Audit Log (SESSION 9 Redesign)**: `logAudit()` stores clean details + admin name in `admin_user` column. Display uses `auditSvg()` for icons, grouped by date, color-coded by category.
**Modal Pattern**: NEVER nest inside `.page` divs. Always append to `document.body`.
**Promotions field**: Use `coupon_id` for the promo code (NOT `code`).
**Browser autofill**: Left enabled after multiple failed attempts to block (Brave ignores all standard methods).

## Session 10B Updates
- **Email composer now supports unlimited cards** — was hardcoded to 2, now loops all
- **Card management UX** — drag reorder pills, delete buttons, multi-insert from library
- No new Fusion gaps identified this session

## Session 10 Updates
- **Legacy auth removed** — QPadmin/QPfs#2026 credentials completely removed from admin.js
- **Unified Referral Hub built** — `referral-hub.html` at QP repo root, replaces Fusion's separate page
- **Fusion referral-hub.html** now redirects to unified hub with `?brand=fusion`
- **Academy dashboard** linked to unified hub with `?brand=academy`
- **Cross-domain auth solved** with inline login form on referral hub
- **Referral hub file**: `referral-hub.html` (root of QP repo, ~31KB)
- **Academy dashboard file**: `Academy/dashboard.html` (note: capital A on Mac filesystem)


## Session 12 Updates — Security + Recovery

### Security Parity
- ✅ Both QP and Fusion now have `_headers` security files deployed
- ✅ Fusion `admin-actions.js` hardcoded password removed (uses `ADMIN_PASSWORD` env var)
- ✅ Fusion Netlify env vars updated with rotated service key (3 variables)
- ✅ Fusion admin still live as safety net (redirect page ready but not deployed)

### Webhook Recovery
- ✅ Recovery tool built in QP admin — cross-references Stripe payments with database
- ✅ 34 customers recovered from Dec 15–Jan 30 webhook outage
- ⚠️ Recovery emails need redesign (using wrong template, no product images, no how-to instructions)
- ⚠️ Recovery emails not logged to `email_log` table

### Remaining Fusion Admin Status
- Fusion admin still accessible at fusionsessions.com/admin.html
- Redirect page ready to deploy when confident in QP admin stability
- Both admins read/write same Supabase database — no conflicts
- Decision: Keep both live during active development as safety net
