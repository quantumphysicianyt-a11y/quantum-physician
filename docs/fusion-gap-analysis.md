# Fusion Admin → QP Unified Admin: Feature Gap Analysis

## ⚠️ CRITICAL STRATEGIC DECISION (DO NOT LOSE)
**The QP unified admin will REPLACE the Fusion admin entirely.**
- Build QP admin first with full feature parity → then retire Fusion admin
- Do NOT modify the Fusion admin while building — it stays live and untouched
- Once QP admin covers everything, fusionsessions.com/admin.html gets decommissioned
- One admin panel at qp-homepage.netlify.app/admin/ manages both platforms

**Last updated:** Session 25 (Mar 2, 2026)

---

## 🎉 FUSION PARITY STATUS: COMPLETE ✅ (since Session 11)
All features from Fusion admin are now in QP admin. Zero gaps remain.

---

## QP Admin — Beyond Parity Features

### Email Center (Sessions 4-6, 8, 11, 19-20, 22) ✅
- Rich HTML email builder with Fusion + Academy brand templates
- Unified Rich Editor component (`createRichEditor`) shared across Email Center, SG popup, Recovery popup
- 11 pre-built card templates in Card Library
- CTA Button Library (6 quick-insert + custom)
- Campaign history with per-recipient tracking

### Course Builder (Sessions 14-18) ✅
- Full course builder with lesson creation, quiz builder, student tools
- Light/dark mode, focus timer, interactive checkboxes

### Admin & Security (Sessions 9, 12, 20) ✅
- Supabase-based admin login with roles + 12 permission flags
- Admin-proxy server-side pattern (55+ operations)
- Auth token auto-refresh (3-layer system)

### 1-on-1 Sessions System (Sessions 23-24) ✅ CORE BUILT
- Full admin panel tab with 5 sub-tabs
- Cycle Manager, Availability Calendar, Client Roster, Bookings Grid
- Offer Slot flow with branded emails
- Stripe checkout (token-based + public modes)
- Payment webhook with booking status updates
- Public booking page with dynamic status

### Member Portal (Session 25) ✅ NEW
- **Login/signup/reset-password** — Full auth flow with Supabase
- **Member dashboard** — Sidebar layout matching Academy, customizable 3-card grid (6 cards available), referral card, time-of-day greeting
- **Settings page** — Profile editing, avatar upload (Supabase storage), password change, notification preferences
- **Auth-aware shared header** — Avatar dropdown on all QP pages when logged in (via shared.js)
- **SVG icon system** — Standardized across member portal, no emojis, matches Academy
- **Cross-domain SSO** — Token passing from QP to Fusion (Fusion receiver pending)

### Other ✅
- Unified Referral Hub, Weekly Marketing Goals, CSV reports, Custom Analytics Query
- Webhook Recovery Tool with deduplication

---

## QP Member Portal vs Fusion Member Experience

### Feature Comparison
| Feature | Fusion (fusionsessions.com) | QP (qp-homepage.netlify.app/members/) |
|---------|---------------------------|---------------------------------------|
| Login/Signup | ✅ login.html | ✅ login.html (SESSION 25) |
| Dashboard | ✅ dashboard.html (retro neon) | ✅ dashboard.html (navy/teal sidebar) (SESSION 25) |
| Profile/Avatar | ✅ Basic profile in sidebar | ✅ Full settings page + avatar upload (SESSION 25) |
| Password Change | ❌ Not available | ✅ In settings (SESSION 25) |
| Notification Prefs | ❌ Not available | ✅ Toggle switches (SESSION 25) |
| Referral Code | ✅ In sidebar | ✅ In sidebar + earnings info (SESSION 25) |
| Session History | ✅ Basic view | ✅ In dashboard cards + full page planned (SESSION 26) |
| Achievements | ✅ Achievement system | ❌ Not yet (future) |
| Community Forum | ✅ Full community | ✅ Card in dashboard (links to Fusion) |
| Progress Tracking | ❌ Not available | ⬜ Planned (SESSION 26) |
| Intake Forms | ❌ Not available | ⬜ Planned (SESSION 26) |
| Billing History | ❌ Not available | ⬜ Planned (SESSION 26) |
| Session Recordings | ❌ Not available | ⬜ Planned (SESSION 26) |
| Auth-Aware Header | ❌ Only on Fusion pages | ✅ All QP pages via shared.js (SESSION 25) |

**QP member portal already exceeds Fusion's member experience** with settings, notifications, avatar upload, and the auth-aware global header. Session 26 will add CRM features that Fusion doesn't have at all.

---

## Planned Features (Not Yet Built)

### 🔴 Session 26 — Patient CRM / Portal (MAJOR NEW FEATURE)
See `session-26-crm-plan.md` for full details.
- ⬜ Sessions & Recordings page (`/members/sessions.html`)
- ⬜ Intake Form page (`/members/intake.html`)
- ⬜ Progress Tracker page (`/members/progress.html`)
- ⬜ Billing History page (`/members/billing.html`)
- ⬜ Sidebar "My Health" collapsible section
- ⬜ 5 new database tables (session_notes, session_recordings, patient_intake, patient_checkins, patient_progress_notes)
- ⬜ Admin CRM: Client Profiles tab with per-client detail view

### Session 26 Also — Pending Items
- ⬜ Cross-domain SSO receiver on Fusion side
- ⬜ End-to-end payment test with real Stripe transaction
- ⬜ QP-branded premium email template for session communications
- ⬜ Full email automation (confirmations, reminders, follow-ups)
- ⬜ 72-hour offer expiry automation
- ⬜ notification_preferences column verification

### Session 27 — Stripe Checkout Polish (ALL PRODUCTS)
- ⬜ Review all Stripe checkout screens (sessions, Academy, Fusion)
- ⬜ Consistent branding, formatting, images
- ⬜ Stripe Dashboard branding settings

### Session 28 — Live Event Page
- ⬜ Branded live Zoom experience page (pre/during/post states)
- ⬜ Countdown timer, embedded Zoom, live reactions, replay mode
- ⬜ Access control, swappable layout templates

### Future
- ⬜ Student tools: flashcards, highlighting, reflection journal, summarizer, progress dashboard, goal tracking
- ⬜ Custom card templates (save your own)
- ⬜ AI Copilot for email writing
- ⬜ Memberships / Subscriptions
- ⬜ Multi-instructor support

---

## Database Tables (23 tables + admin_users + auth.users)

### Existing Tables (17 + admin_users)
| Table | Purpose |
|-------|---------|
| `purchases` | All transactions |
| `referral_codes` | Referral system (keyed by email, NOT user_id) |
| `profiles` | User profiles (includes avatar_url column) |
| `credit_history` | Credit audit trail |
| `notification_preferences` | Member notification toggles (SESSION 25) |
| `qa_enrollments` | Academy enrollments |
| `qa_courses` | Course catalog |
| `qa_lesson_progress` | Lesson completion |
| `admin_notes` | Admin notes per customer |
| `discussion_posts` | Fusion community |
| `qa_discussions` | Academy discussions |
| `email_campaigns` | Sent campaign history |
| `email_tracking` | Per-recipient tracking |
| `promotions` | Promo codes |
| `scheduled_emails` | Automated email queue |
| `email_log` | Email send records |
| `session_schedule` | Fusion session dates/Zoom info |
| `admin_users` | Admin accounts + permissions |

### Session 23-24 Tables (6)
| Table | Purpose |
|-------|---------|
| `session_config` | Global settings: price ($150), duration (60 min), timezone, buffer, booking status |
| `session_cycles` | 4-month booking cycles with status pipeline |
| `session_availability` | Daily time blocks: date, start/end time, status, visibility |
| `session_clients` | Recurring client roster: frequency, preferred day/time, priority |
| `session_bookings` | Individual appointments: date, time, status, type, stripe_payment_id, confirmation_token |
| `session_waitlist` | Public waitlist queue with preferences |

### Session 26 Tables (5 planned — NOT YET CREATED)
| Table | Purpose |
|-------|---------|
| `session_notes` | Per-session notes from Tracey (visible_to_patient toggle) |
| `session_recordings` | Zoom recording URLs per booking |
| `patient_intake` | Pre-first-session health questionnaire |
| `patient_checkins` | Patient self-reported symptom check-ins |
| `patient_progress_notes` | Tracey's alignment/progress notes per patient |

### Supabase Storage Buckets
| Bucket | Access | Purpose |
|--------|--------|---------|
| `avatars` | PUBLIC (4 policies) | User profile photos (SESSION 25) |
| `course-videos` | Private (2 policies) | Academy video content |
| `course-files` | Private (2 policies) | Academy downloadable files |
| `course-thumbnails` | PUBLIC (2 policies) | Academy course thumbnails |
| `achievements` | PUBLIC (0 policies) | Achievement badge images |

### RLS Policies Added (Session 23-24)
- `session_config`, `session_cycles`, `session_availability`, `session_bookings`: Public SELECT
- `session_waitlist`: Public INSERT
- All session tables: Admin access via admin-proxy

### RLS Policies Added (Session 26-27)
- patient_checkins: ALL for user_id = auth.uid()
- patient_progress_notes: SELECT for user_id = auth.uid()
- session_bookings: Added "Users can read own bookings" SELECT for email match
- session_notes: SELECT via email join (patient reads own visible notes)
- session_recordings: SELECT via email join (patient reads own recordings)

---

## Session 27 Status Update

### QP Admin Now Covers Nearly All Fusion Admin Features
Remaining Fusion-only features to port: Forum moderation, achievement badge management, notification center management. All other features have QP equivalents or are QP-only additions.

### Cross-Domain Integration Status
- SSO QP to Fusion: WORKING (token passing via URL hash, commit 84cc1d2)
- SSO Fusion to QP: Not yet implemented
- Shared Supabase project: Same project (rihlrfiqokqrlmzjjyxj)
- Shared Stripe account: Same account
- Cross-site credit sharing: Via referral system
- Unified admin panel: QP admin manages both platforms
