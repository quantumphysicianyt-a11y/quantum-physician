# Session 26-29 Build Plan — Patient Portal & CRM

## Status (Post Session 29)

| Component | Status |
|-----------|--------|
| My Health sidebar | ✅ DONE (S26) |
| sessions.html | ✅ DONE (S26+S28) - recordings wired, deep linking, smart embeds |
| intake.html | ✅ DONE (S26) |
| progress.html | ✅ DONE (S26+S27) - charts, body map, before/after, milestones |
| billing.html | ✅ DONE (S26) |
| SQL migration (5 tables) | ✅ DONE (S26) |
| Admin CRM Client Profiles | ✅ DONE (S27) - needs merge into Clients tab |
| Cross-domain SSO | ✅ DONE (S27) |
| Demo data | ✅ DONE (S27) - 12mo check-ins |
| Progress charts/toggle/collapse | ✅ DONE (S27) |
| Session notes full CRUD | ✅ DONE (S28) - add/edit/delete, body regions, visibility |
| 28 bone-accurate body regions | ✅ DONE (S28) - extracted from GLB skeleton |
| Custom alignment regions | ✅ DONE (S28) - label + nearest standard region |
| Recording upload (Supabase) | ✅ DONE (S28) - drag & drop MP4 to storage bucket |
| Recording URL paste | ✅ DONE (S28) - Vimeo/GDrive/YouTube/Zoom |
| Smart video embeds | ✅ DONE (S28) - auto-detect source, inline player |
| Recording indicators in grid | ✅ DONE (S28) - emoji badges in toggle row |
| Real-time refresh | ✅ DONE (S28) - refreshBookingsView() |
| Green Complete button | ✅ DONE (S28) |
| Deep linking (progress→sessions) | ✅ DONE (S28) - ?highlight=bookingId |
| Recordings on sessions page | ✅ DONE (S28) |
| CRM merge into Clients tab | ✅ DONE (S29) - sub-nav roster/profiles, clickable cards |
| Email reminders UI | ✅ DONE (S29) - toggles, preview, manual send. TRUE automation pending S30 |
| 3D body model (Three.js) | ⬜ PENDING (S31+) |

---

## Overview

Build the patient-facing portal pages and matching admin CRM panel for the 1-on-1 Sessions system. The member dashboard sidebar gets a collapsible "My Health" section with 4 sub-pages. The admin panel gets a matching "Client Profiles" view.

---

## Sidebar Navigation Update

Current sidebar (BUILT):
```
Dashboard
─── My Health ──────
  Sessions & Recordings
  Intake Form
  Progress Tracker
  Billing History
────────────────────
Book a Session
Academy
Fusion Sessions
Account Settings
─────────
Main Site
```

---

## Page 1: Sessions & Recordings (`/members/sessions.html`) — ✅ COMPLETE

### Built Features (Session 26 + 28)
- Tabbed view: Upcoming | Past | All
- Session cards with date badges, time, status pills
- Confirm & Pay buttons for proposed sessions (links to checkout)
- Zoom link "Join" button for upcoming paid sessions
- Countdown indicators ("in 3 days")
- **Session notes** (visible_to_patient only) with body region badges (S28)
- **Smart recording embeds** (S28):
  - Supabase hosted → native HTML5 `<video>` player + Download button
  - Vimeo → embedded Vimeo player (no overlay)
  - Google Drive → embedded GDrive preview
  - YouTube → embedded YouTube player
  - Zoom/other → "Opens in new tab" link
- **Deep linking**: `?highlight=bookingId` auto-opens Past tab, expands details, scrolls to card
- Download icon in SVG sprite

### Database Tables Used
- `session_bookings` — booking data
- `session_notes` — per-session notes (filtered by `visible_to_patient = true`)
- `session_recordings` — recording URLs/uploads

---

## Page 2: Intake Form (`/members/intake.html`) — ✅ COMPLETE

### Built Features (Session 26)
- 5 sections: Personal Info, Health History, Current Symptoms, Lifestyle, Consent
- Auto-save to Supabase on section change
- Severity sliders for symptoms
- Pre-fills from existing intake data

---

## Page 3: Progress Tracker (`/members/progress.html`) — ✅ COMPLETE

### Built Features (Session 26 + 27)
- Chart.js symptom tracking with time range filters (1mo/3mo/6mo/All)
- Energy & Sleep Recovery chart
- Before/After Healing Journey card with Scores/% Change toggle
- Quick Stats dropdown (Overview / Top Symptoms / Wellness Scores)
- Milestone markers from practitioner notes
- All chart sections collapsible (collapsed by default)
- Add Check-In modal
- 2D body map overlay (to be replaced with Three.js 3D model)

---

## Page 4: Billing History (`/members/billing.html`) — ✅ COMPLETE

### Built Features (Session 26)
- Purchase history list with date, description, amount
- Running totals

---

## Admin CRM: Client Profiles — ✅ COMPLETE (needs merge)

### Built Features (Session 27 + 28)
- **Client List View**: searchable, filterable, sortable, paginated
- **Client Detail View** with 5 tabs:
  - **Sessions**: all bookings with collapsible notes/recordings, + Note / + Recording buttons, edit/delete/toggle visibility, recording indicators
  - **Intake Form**: read-only view of patient health questionnaire
  - **Progress**: patient check-ins + practitioner notes with add buttons
  - **Billing**: purchase history with totals
  - **Notes**: internal admin notes (add/delete)

### Session 28 Additions to CRM/Bookings
- **28 body region chips** in note modal with custom region support
- **YES/NO visibility toggle** with helper text
- **Edit note modal** with pre-filled content, regions, visibility
- **Delete note** with confirmation
- **Recording upload modal** (Upload File + Paste URL tabs)
- **Delete recording** with Supabase Storage file cleanup
- **Collapsible rows**: `▸ 📝 2 notes · 🎥 1 recording click to expand`
- **refreshBookingsView()**: unified parallel refresh for all actions
- **Green "✓ Complete" button** on paid bookings

### ✅ COMPLETE: Merged into Clients Tab (Session 29)
CRM merged into Clients tab with sub-nav (Client Roster | All Client Profiles). Clickable client cards with teal hover. Action buttons use stopPropagation. Back button returns to active sub-view. Session notes collapsed by default with expand toggle. Progress tab has keyword/date/type filters.

---

## Session Recordings Architecture (Session 28)

### Storage Options
| Source | Patient Experience | Tracey's Workflow | Cost |
|--------|-------------------|-------------------|------|
| Supabase upload | Native HTML5 player + download | Drag & drop in admin | $25/mo Pro (100GB) |
| Vimeo URL | Embedded Vimeo player | Upload to Vimeo, paste link | Free (existing account) |
| Google Drive URL | Embedded GDrive player | Upload to Drive, paste link | $2-10/mo |
| YouTube URL | Embedded YouTube player | Upload to YouTube, paste link | Free |
| Zoom URL | Link out (can't embed) | Copy share link | Free with paid Zoom |

### Recommendation
Use both upload + URL paste. Start with URL pasting (free), switch to Supabase upload when convenient. System supports both simultaneously per recording.

### Database: session_recordings
```sql
id uuid PRIMARY KEY,
booking_id uuid REFERENCES session_bookings(id),
recording_url text NOT NULL,
title text DEFAULT 'Session Recording',
duration_minutes int4,
uploaded_at timestamptz DEFAULT now(),  -- ⚠️ NOT created_at
source_type text DEFAULT 'external',    -- 'external' or 'supabase'
file_path text,                          -- Supabase Storage path
file_size_mb numeric                     -- File size for display
```

### Supabase Storage Bucket: session-recordings
- Public read, authenticated write/delete
- File organization: `{booking_id}/{timestamp}.{ext}`
- Max 50MB per file
- Free plan: 1GB total, Pro: 100GB ($0.021/GB overage)

---

## Body Regions System (Session 28)

### 28 Standard Regions
atlas, c1-c2, cervical-spine, left-neck, right-neck, thoracic-spine, lumbar-spine, sacrum, coccyx, left-shoulder, right-shoulder, left-elbow, right-elbow, left-wrist, right-wrist, left-hip, right-hip, left-knee, right-knee, left-ankle, right-ankle, pelvis, sternum, left-ribs, right-ribs, tmj, cranium, full-spine

### Custom Regions
- Admin enters custom label (e.g. "Right Psoas", "Occipital Ridge")
- Selects nearest standard region from dropdown for 3D map positioning
- Creates teal chip showing: custom label + placement region
- Stored: standard region slug goes in `body_regions` jsonb, custom label appended to note content as `[Custom alignments: ...]`

### Coordinates
All 28 regions have precise 3D coordinates extracted from the GLB skeleton's inverse bind matrices. Male/female coordinate offsets applied. Stored in `bodyRegionCoords` object in admin.js.
