# Fusion Admin → QP Unified Admin: Feature Gap Analysis

## ⚠️ CRITICAL STRATEGIC DECISION (DO NOT LOSE)
**The QP unified admin will REPLACE the Fusion admin entirely.**
- Build QP admin first with full feature parity → then retire Fusion admin
- Do NOT modify the Fusion admin while building — it stays live and untouched
- Once QP admin covers everything, fusionsessions.com/admin.html gets decommissioned
- One admin panel at qp-homepage.netlify.app/admin/ manages both platforms

**Last updated:** Session 29 (Mar 3, 2026)

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
- **Admin CRM**: Client Profiles merged into Clients tab (Session 29) with 5-tab detail view
- **Session notes**: full CRUD, body regions, visibility toggle, custom alignments
- **Recording system**: file upload (Supabase Storage) + URL paste, smart video embeds
- **Progress tracking**: symptom charts, energy/sleep, before/after, milestones
- **28 bone-accurate body regions** from GLB skeleton
- **Real-time refresh** for all bookings tab actions
- **Email automation** (Session 29): day-before reminders, post-session follow-ups, intake nudges with QP-branded templates

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
| Progress Tracking | ❌ | ✅ Charts, milestones, before/after |
| Billing History | ❌ | ✅ Purchase history with totals |
| Body Region Mapping | ❌ | ✅ 28 bone-accurate regions on 3D model |
| Deep Linking | ❌ | ✅ Progress → sessions with highlight |
| Achievements | ✅ | ❌ Not yet (future) |
| Community Forum | ✅ Full | ✅ Card in dashboard (links to Fusion) |
| Auth-Aware Header | ❌ | ✅ All QP pages via shared.js |

**QP member portal significantly exceeds Fusion's member experience.**

---

## Planned Features (Not Yet Built)

### 🔴 Session 30 — 3D Body Model + Stripe Test
- ⬜ Three.js 3D body model on progress.html (replacing 2D overlay)
- ⬜ Interactive markers using 28 bone-accurate coordinates
- ⬜ End-to-end Stripe payment test
- ⬜ Stripe checkout branding review (all 3 flows)
- ⬜ 72-hour offer expiry automation (wire toggle to backend)
- ⬜ Persist automation toggle states to database

### Future
- ⬜ Student tools: flashcards, highlighting, reflection journal, summarizer
- ⬜ Custom card templates (save your own)
- ⬜ AI Copilot for email writing
- ⬜ Memberships / Subscriptions
- ⬜ Live Event Page: Branded Zoom experience
- ⬜ Multi-instructor support

---

## Database Tables (28 + admin_users + auth.users)

### Session System (6)
session_config, session_cycles, session_availability, session_clients, session_bookings, session_waitlist

### Patient CRM (5)
session_notes, session_recordings, patient_intake, patient_checkins, patient_progress_notes

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
