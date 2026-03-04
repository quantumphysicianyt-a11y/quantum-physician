# Fusion Admin → QP Unified Admin: Feature Gap Analysis

## ⚠️ CRITICAL STRATEGIC DECISION (DO NOT LOSE)
**The QP unified admin will REPLACE the Fusion admin entirely.**
- Build QP admin first with full feature parity → then retire Fusion admin
- Do NOT modify the Fusion admin while building — it stays live and untouched
- Once QP admin covers everything, fusionsessions.com/admin.html gets decommissioned
- One admin panel at qp-homepage.netlify.app/admin/ manages both platforms

**Last updated:** Session 30 (Mar 4, 2026)

---

## 🎉 FUSION PARITY STATUS: COMPLETE ✅ (since Session 11)
All features from Fusion admin are now in QP admin. Zero gaps remain.

---

## QP Admin — Beyond Parity Features

### Email Center (Sessions 4-6, 8, 11, 19-20, 22) ✅
- Rich HTML email builder with Fusion + Academy brand templates
- Unified Rich Editor component, 11 card templates, CTA Button Library
- Campaign history with per-recipient tracking

### Course Builder (Sessions 14-18) ✅
- Full course builder with lesson creation, quiz builder, student tools

### Admin & Security (Sessions 9, 12, 20) ✅
- Supabase-based admin login with roles + 12 permission flags
- Admin-proxy server-side pattern (30 allowed tables)
- Auth token auto-refresh (3-layer system)

### 1-on-1 Sessions System (Sessions 23-24) ✅
- Full admin panel tab with 5 sub-tabs
- Cycle Manager, Availability Calendar, Client Roster, Bookings Grid
- Offer Slot flow with branded emails
- Stripe checkout + payment webhook

### Member Portal (Session 25) ✅
- Login/signup/reset-password, member dashboard, settings, auth-aware shared header
- SVG icon system, cross-domain SSO

### Patient CRM & Portal (Sessions 26-29) ✅
- **4 patient portal pages**: sessions, intake, progress, billing
- **Admin CRM merged into Clients tab** (Session 29) — sub-nav: "Client Roster" | "All Client Profiles"
- **Clickable client cards** — whole card opens profile, teal hover, action buttons independent
- **Session notes**: full CRUD, body regions, visibility toggle, custom alignments, **collapsed by default** with expand toggle
- **Recording system**: file upload (Supabase Storage) + URL paste, smart video embeds
- **Progress tracking**: symptom charts, energy/sleep, before/after, milestones, **keyword/date/type filters** (Session 29)
- **28 bone-accurate body regions** from GLB skeleton
- **Real-time refresh** for all bookings tab actions

### Email Automation — 1-on-1 Sessions (Sessions 29-30) ✅
- 4 automation toggle cards persisted to `system_config` table
- QP-branded email templates (teal/taupe, Georgia serif) — 5 template types
- Preview modals, per-session send buttons, batch send
- **Netlify cron** (`session-cron.js`) — daily 8 AM ET, fully automated
- **Idempotent send logic** — UNIQUE INDEX + pre-check prevents double-sends
- **Automation log viewer** in admin — last 50 sends with type/status badges
- **New Google Apps Script** (Pipeline #3) — standalone, isolated from Fusion/Academy
- **`email_automation_log` table** — tracks every automated send
- **`system_config` table** — persists toggle states across sessions
- **72-hour auto-expiry** — proposed bookings auto-expire, slots freed, notice sent

---

## QP Member Portal vs Fusion Member Experience

| Feature | Fusion | QP |
|---------|--------|-----|
| Login/Signup | ✅ | ✅ |
| Dashboard | ✅ Retro neon | ✅ Navy/teal sidebar |
| Profile/Avatar | ✅ Basic | ✅ Full settings + avatar upload |
| Password Change | ❌ | ✅ |
| Notification Prefs | ❌ | ✅ |
| Referral Code | ✅ | ✅ + earnings info |
| Session History | ✅ Basic view | ✅ Full sessions page with recordings |
| Session Recordings | ❌ | ✅ Inline video player (Supabase/Vimeo/GDrive/YouTube) |
| Session Notes | ❌ | ✅ Visible notes with body region badges |
| Health Intake | ❌ | ✅ 5-section questionnaire |
| Progress Tracking | ❌ | ✅ Charts, milestones, before/after, filters |
| Billing History | ❌ | ✅ Purchase history with totals |
| Body Region Mapping | ❌ | ✅ 28 bone-accurate regions on 3D model |
| Deep Linking | ❌ | ✅ Progress → sessions with highlight |
| Achievements | ✅ | ❌ Not yet (future) |
| Community Forum | ✅ Full | ✅ Card in dashboard (links to Fusion) |
| Auth-Aware Header | ❌ | ✅ All QP pages via shared.js |

**QP member portal significantly exceeds Fusion's member experience.**

---

## Planned Features (Not Yet Built)

### 🔴 Session 31 — Deploy + Test + 3D Body Model
- ⬜ Deploy Session 30 automation pipeline (SQL, cron, Apps Script, env var)
- ⬜ End-to-end test: day-before, follow-up, intake nudge, payment expiry
- ⬜ End-to-end Stripe payment test
- ⬜ Three.js 3D body model on progress.html (replacing 2D overlay)
- ⬜ Interactive markers using 28 bone-accurate coordinates
- ⬜ Stripe checkout branding review (all 3 flows)

### Needs Tracey's Input
- ⬜ Pre/post session patient forms — recurring quick check-ins before and after each session
- Key design: token-based URLs (no login), mobile-first, pre-populated from intake, 30-60 second completion

### Future
- ⬜ Session invoicing: Multi-currency (CAD+HST, EUR), printable PDFs, refund buttons, batch generation
- ⬜ Student tools: flashcards, highlighting, reflection journal, summarizer
- ⬜ Custom card templates (save your own)
- ⬜ AI Copilot for email writing
- ⬜ Memberships / Subscriptions
- ⬜ Live Event Page: Branded Zoom experience
- ⬜ Multi-instructor support

---

## Email Pipeline Architecture (Session 29 Decision)

**Four self-contained pipelines — NEVER cross-contaminate:**

| # | Pipeline | Template Style | Trigger | Log Table | Status |
|---|----------|---------------|---------|-----------|--------|
| 1 | Fusion Sessions | Purple/neon gradient | Apps Script cron (15 min) | `scheduled_emails` + `email_log` | ✅ Live |
| 2 | Academy/Marketing | Purple/neon + custom HTML | Manual from admin | `email_campaigns` + `email_tracking` | ✅ Live |
| 3 | 1-on-1 Sessions | QP teal/taupe, Georgia serif | Netlify cron (8 AM ET) → Apps Script | `email_automation_log` | ✅ Built (Session 30) |
| 4 | QP General | QP branded | Transactional | TBD | ⬜ Future |

---

## Database Tables (30 + admin_users + auth.users)

### Session System (6)
session_config, session_cycles, session_availability, session_clients, session_bookings, session_waitlist

### Patient CRM (5)
session_notes, session_recordings, patient_intake, patient_checkins, patient_progress_notes

### Automation & Config (2 — Session 30)
email_automation_log, system_config

### Existing (17 + admin_users)
purchases, referral_codes, profiles, credit_history, notification_preferences, qa_enrollments, qa_courses, qa_lessons, qa_modules, qa_lesson_progress, admin_notes, discussion_posts, qa_discussions, email_campaigns, email_tracking, email_log, promotions, scheduled_emails, session_schedule

### Supabase Storage Buckets (6)
avatars (public), session-recordings (public, Session 28), course-videos (private), course-files (private), course-thumbnails (public), achievements (public)

---

## Cross-Domain Integration Status
- SSO QP → Fusion: ✅ WORKING (token passing via URL hash)
- SSO Fusion → QP: Not yet implemented
- Shared Supabase project: ✅ Same project (rihlrfiqokqrlmzjjyxj)
- Shared Stripe account: ✅ Same account
- Cross-site credit sharing: ✅ Via referral system
- Unified admin panel: ✅ QP admin manages both platforms
