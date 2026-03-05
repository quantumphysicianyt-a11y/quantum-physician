# Invoice System — Full Design Spec

**Created:** Session 32 (Mar 4, 2026)
**Status:** Planning — ready to build in Session 33

---

## Overview

A branded invoice system for Dr. Tracey's 1-on-1 healing sessions. Invoices are generated per-booking (not per-cycle), can be sent manually or auto-generated on session completion, and are viewable in both the admin panel and patient portal. PDFs are QP-branded (dark navy, teal/taupe, Georgia serif — matching session emails).

---

## Database: `invoices` Table

```sql
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,        -- 'QP-2026-0001' auto-incrementing
  booking_id uuid REFERENCES session_bookings(id),
  client_id uuid REFERENCES session_clients(id),
  email text NOT NULL,
  name text,

  -- Line items (simple for now — single session type)
  description text DEFAULT '1-on-1 Healing Session (60 min)',
  amount_cents integer NOT NULL,              -- 15000 = $150.00
  currency text DEFAULT 'USD',
  tax_label text,                             -- e.g., 'HST' (null if no tax)
  tax_rate numeric(5,2),                      -- e.g., 13.00 for 13% HST
  tax_cents integer DEFAULT 0,
  total_cents integer NOT NULL,               -- amount_cents + tax_cents

  -- Status
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'paid', 'void', 'overdue')),

  -- Dates
  issued_at timestamptz,                      -- when sent to client
  due_date date,                              -- issued_at + 7 days (configurable)
  paid_at timestamptz,                        -- when payment confirmed
  voided_at timestamptz,

  -- Payment link
  stripe_payment_id text,                     -- from session_bookings if already paid
  pay_url text,                               -- confirmation_token pay link

  -- PDF storage
  pdf_path text,                              -- Supabase Storage path: invoices/{id}.pdf
  pdf_generated_at timestamptz,

  -- Meta
  notes text,                                 -- optional line on invoice (e.g., "Thank you!")
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-incrementing invoice numbers
CREATE SEQUENCE invoice_number_seq START 1;

-- RLS: patients see their own invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY invoices_patient_read ON invoices
  FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Index for fast lookups
CREATE INDEX idx_invoices_email ON invoices(email);
CREATE INDEX idx_invoices_booking ON invoices(booking_id);
CREATE INDEX idx_invoices_status ON invoices(status);
```

### Invoice Number Format
`QP-{YEAR}-{PADDED_SEQ}` — e.g., `QP-2026-0001`, `QP-2026-0002`

Generated server-side in admin-proxy or a Netlify function to avoid race conditions:
```sql
SELECT 'QP-' || EXTRACT(YEAR FROM now())::text || '-' || LPAD(nextval('invoice_number_seq')::text, 4, '0');
```

### Status Flow
```
draft → sent → paid
              → overdue (auto, if due_date passed)
              → void (manual)
draft → void (cancelled before sending)
```

---

## Infrastructure Updates

### admin-proxy.js
Add `invoices` to the allowlisted tables (becomes 33 total).

### Supabase Storage
New bucket: `invoices` (private — only accessible via signed URLs or admin)
- Path pattern: `{invoice_id}.pdf`
- Max size: 2MB per file

---

## PDF Generation

### Approach: Netlify Function (`generate-invoice.js`)

Server-side PDF generation using `pdfkit` (npm). Keeps branding consistent and avoids client-side library bloat.

**Flow:**
1. Admin clicks "Generate Invoice" or auto-triggers on completion
2. Client JS calls `/api/generate-invoice` with booking_id
3. Function fetches booking + client data, generates PDF with pdfkit
4. Uploads PDF to Supabase Storage `invoices` bucket
5. Updates `invoices` row with `pdf_path` and `pdf_generated_at`
6. Returns signed URL for immediate download/preview

### PDF Layout (QP-Branded)

```
┌─────────────────────────────────────────┐
│  [QP Logo]              INVOICE         │
│  Quantum Physician      QP-2026-0001    │
│  Dr. Tracey Clark                       │
│  tracey@quantumphysician.com            │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Bill To:                               │
│  Jane Smith                             │
│  jane@example.com                       │
│                                         │
│  Invoice Date: March 4, 2026            │
│  Due Date: March 11, 2026              │
│  Session Date: March 3, 2026            │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Description              Amount        │
│  ─────────────────────────────────────  │
│  1-on-1 Healing Session   $150.00       │
│  (60 min)                               │
│                                         │
│  ─────────────────────────────────────  │
│                    Subtotal: $150.00     │
│                    Tax (HST): $19.50    │
│                    ───────────────       │
│                    TOTAL: $169.50        │
│                                         │
│  Status: PAID ✓ (or PAY NOW button URL) │
│                                         │
│  ─────────────────────────────────────  │
│  Thank you for your trust in this       │
│  healing journey.                       │
│                                         │
│  quantumphysician.com                   │
└─────────────────────────────────────────┘
```

**Colors:** Dark navy background (#0e1a30) on header/footer, teal (#5ba8b2) accents, taupe (#ad9b84) secondary, Georgia serif for body text.

**Note:** For clients without tax (most US clients), the tax row is omitted entirely. Tax fields are optional per-invoice for Canadian clients (HST) or future EU clients.

---

## Admin Panel — Invoice Views

### Option A: Sub-tab under Bookings (Recommended)
Add "Invoices" as a 5th sub-tab alongside Active | Completed | Cancelled | All.

### Per-Booking Actions
- **"📄 Invoice" button** on completed/paid bookings in the Actions column
  - If no invoice exists → "Create Invoice" (auto-fills from booking data)
  - If draft invoice exists → "Edit / Send Invoice"
  - If sent/paid invoice exists → "View Invoice" (opens PDF preview)

### Invoice Creation Modal
```
┌─────────────────────────────────────────┐
│  Create Invoice                         │
│                                         │
│  Client: Jane Smith (jane@example.com)  │
│  Session: March 3, 2026 at 10:00 AM    │
│                                         │
│  Description: [1-on-1 Healing Session]  │
│  Amount: [$150.00]                      │
│  Currency: [USD ▾]                      │
│                                         │
│  □ Add Tax                              │
│    Tax Label: [HST]                     │
│    Tax Rate: [13] %                     │
│    Tax Amount: $19.50 (auto-calculated) │
│                                         │
│  Due Date: [March 11, 2026]             │
│  Notes: [Thank you for your trust...]   │
│                                         │
│  [Save Draft]  [Generate PDF & Send]    │
└─────────────────────────────────────────┘
```

### Invoices Sub-Tab Grid
| # | Client | Session Date | Amount | Status | Issued | Actions |
|---|--------|-------------|--------|--------|--------|---------|
| QP-2026-0001 | Jane Smith | Mar 3, 2026 | $150.00 | Paid ✓ | Mar 4 | 📄 View · 📧 Resend |
| QP-2026-0002 | Bob Jones | Mar 5, 2026 | $169.50 | Sent | Mar 6 | 📄 View · ✓ Mark Paid |
| QP-2026-0003 | Alice Chen | Mar 10, 2026 | $150.00 | Draft | — | ✏️ Edit · 📧 Send |

### Bulk Invoice Generation
"Generate Invoices for Cycle" button — creates draft invoices for all completed bookings in the selected cycle that don't already have one. Shows a preview checklist (same pattern as bulk payment requests).

---

## Patient Portal — billing.html Updates

The existing `billing.html` shows purchase history. Add an **Invoices** section:

### Invoice List (Patient View)
Each invoice card:
```
┌─────────────────────────────────────────┐
│  QP-2026-0001          March 4, 2026    │
│  1-on-1 Healing Session                 │
│  Session: March 3, 2026                 │
│                                         │
│  $150.00                    PAID ✓      │
│                                         │
│  [Download PDF]  [View Details]         │
└─────────────────────────────────────────┘
```

- **Paid invoices:** Green "PAID" badge, download PDF button
- **Sent/Overdue invoices:** Yellow/Red badge, "Pay Now" button (links to Stripe checkout via confirmation_token)
- **PDF download:** Signed URL from Supabase Storage (expires after 1 hour)

---

## Email Integration

### Invoice Email (New Template — Pipeline #3)
When admin clicks "Generate PDF & Send":
1. PDF is generated and stored
2. Email sent via Apps Script Pipeline #3 with:
   - QP-branded template (matching existing session emails)
   - Invoice summary inline (number, date, amount, status)
   - "View Invoice" CTA button → billing.html
   - PDF attached OR link to download (TBD — Apps Script attachment limits)

### Auto-Send Options (system_config toggles)
- `auto_invoice_on_completion`: Auto-generate draft invoice when session marked complete
- `auto_invoice_on_payment`: Auto-generate and mark paid when Stripe payment confirmed

---

## Implementation Sequence (Session 33)

### Phase 1: Database + Admin CRUD
1. Run SQL migration: `invoices` table + sequence + RLS + indexes
2. Add `invoices` to admin-proxy allowlist (33 tables)
3. Create Supabase Storage `invoices` bucket
4. Build admin UI: Invoices sub-tab, Create/Edit modal, status management
5. Invoice number generation (server-side via admin-proxy custom endpoint or DB function)

### Phase 2: PDF Generation
6. Create `netlify/functions/generate-invoice.js` with pdfkit
7. QP-branded PDF template
8. Upload to Supabase Storage, update invoice record
9. Admin: "Generate PDF" and "Download PDF" buttons

### Phase 3: Patient Portal + Email
10. Update billing.html with Invoices section
11. Invoice email template (Pipeline #3)
12. "Send Invoice" flow: generate PDF → send email → update status to 'sent'

### Phase 4: Automation + Bulk
13. system_config toggles for auto-generation
14. Bulk invoice generation per cycle
15. Overdue status auto-update in session-cron.js

---

## Multi-Currency Support (Future)

The schema already supports this via `currency`, `tax_label`, and `tax_rate` columns. When Dr. Tracey has Canadian or EU clients:
- CAD + 13% HST (Ontario) → `currency: 'CAD', tax_label: 'HST', tax_rate: 13.00`
- EUR + 0% → `currency: 'EUR', tax_label: null, tax_rate: null`
- USD + 0% → default, no tax row on PDF

Invoice number sequence is global (not per-currency).

---

## Open Questions for Tracey
1. **Default payment terms:** 7 days? 14 days? Due on receipt?
2. **Tax:** Does she charge HST to Canadian clients? Any other tax jurisdictions?
3. **Auto-send:** Should invoices auto-send on session completion, or always manual?
4. **Notes:** Default thank-you message on invoices?
5. **Business details:** Any business registration number or address to include on invoices?
