# Invoice System — Design Spec & Current State

**Created:** Session 32 (Mar 4, 2026)
**Last updated:** Session 36 (Mar 5, 2026)
**Status:** ✅ Built (Sessions 33-34), updated with Session 36 session types + multi-currency

---

## Overview

A branded invoice system for Dr. Tracey's 1-on-1 healing sessions. Invoices are auto-generated on Stripe payment as a premium receipt (not a payment collection tool). PDFs are QP-branded (dark navy, teal/taupe, Georgia serif). Viewable in both admin panel and patient portal.

**Key design decision:** Invoices are post-payment receipts, not billing instruments. Payment is collected via Stripe links. The invoice gives a premium feel over a generic Stripe receipt.

---

## Database: `invoices` Table ✅ Built

```sql
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,        -- 'QP-2026-0001' auto-incrementing
  booking_id uuid REFERENCES session_bookings(id),
  client_id uuid REFERENCES session_clients(id),
  email text NOT NULL,
  name text,

  -- Line items
  description text DEFAULT '1-on-1 Healing Session (30 min)',
  amount_cents integer NOT NULL,              -- 20000 = €200.00
  currency text DEFAULT 'EUR',               -- EUR default, CAD for Canadian clients
  tax_label text,                             -- e.g., 'HST' (null if no tax)
  tax_rate numeric(5,2),                      -- e.g., 13.00 for 13% HST
  tax_cents integer DEFAULT 0,
  total_cents integer NOT NULL,               -- amount_cents + tax_cents

  -- Status
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'paid', 'void', 'overdue')),

  -- Dates
  issued_at timestamptz,
  due_date date,
  paid_at timestamptz,
  voided_at timestamptz,

  -- Payment link
  stripe_payment_id text,
  pay_url text,

  -- PDF storage
  pdf_path text,                              -- Supabase Storage: invoices/{id}.pdf
  pdf_generated_at timestamptz,

  -- Meta
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Supporting objects:** `invoice_number_seq` (sequence), `generate_invoice_number()` (SECURITY DEFINER function)
**RLS:** Patient read via `lower(email) = lower(auth.jwt()->>'email')`
**Storage bucket:** `invoices` (private, signed URLs only)

### Invoice Number Format
`QP-{YEAR}-{PADDED_SEQ}` — e.g., `QP-2026-0001`, `QP-2026-0002`

### Status Flow
```
draft → sent → paid
              → overdue (auto, if due_date passed)
              → void (manual)
draft → void (cancelled before sending)
```

---

## How Invoices Are Generated

### Auto-Invoice on Stripe Payment (Primary Flow) ✅
1. Client pays via Stripe (public: upfront, regular: via day-before nudge)
2. `session-webhook.js` fires on `checkout.session.completed`
3. Webhook creates invoice record with status `paid`, generates invoice number via DB function
4. Calls `generate-invoice.js` internally to create branded PDF
5. Sends paid invoice email to client with PDF download link
6. All non-fatal — webhook never fails over invoice errors

### Manual Invoice from Admin ✅
- "📄 Invoice" button on completed/paid bookings in bookings grid
- Create/edit modal with description, amount, currency, tax, due date, notes
- "Generate PDF & Send" creates PDF + sends email + marks `sent`

### Bulk Invoice Generation ✅
- "Generate Invoices for Cycle" button in Invoices sub-tab
- Creates draft invoices for all completed bookings without existing invoices
- Progress bar during generation

---

## Session Types & Pricing (Updated Session 36)

Invoices now pull from `session_types` for accurate pricing:

| Session Type | Price | Currency | Duration |
|-------------|-------|----------|----------|
| Zoom Session | €200 | EUR | 30 min |
| Recorded Session | €150 | EUR | 30 min |

### Multi-Currency (Session 36)
- **EUR** — default for all international clients
- **CAD + 13% HST** — for Canadian clients (tracked via `session_clients.currency` + `tax_label` + `tax_rate`)
- **USD** — Academy courses only (not used for 1-on-1 sessions)

Per-booking price snapshot: `session_bookings.amount_cents` + `session_bookings.currency` captured at booking time. Invoice uses these values, not the current session type price.

For Canadian clients: invoice auto-calculates HST from `session_clients.tax_rate` (13%) and includes `tax_label` (HST) on the PDF.

---

## PDF Generation ✅ Built

### `netlify/functions/generate-invoice.js`
- Server-side PDF via `pdfkit` (npm)
- QP-branded: dark navy header/footer (#0e1a30), teal accents (#5ba8b2), taupe (#ad9b84), Georgia serif
- PAID watermark for paid invoices
- Signed URL preview in admin
- Uploaded to Supabase Storage `invoices` bucket

### PDF Layout
- Header: QP logo, invoice number, Dr. Tracey Clark contact
- Bill To: client name + email
- Dates: invoice date, due date, session date
- Line item: session type description + amount
- Tax row: only shown if tax_label is set (HST for Canadian clients)
- Total with PAID badge or pay URL
- Footer: Tracey headshot, tagline, QP branding

---

## Admin Panel Views ✅ Built

### Invoices Sub-Tab (under Bookings)
- Sortable grid: invoice number, client, session date, amount, status, issued date, actions
- Per-invoice actions: View PDF, Resend, Mark Paid, Void
- Bulk generate per cycle with progress bar

### Per-Booking Invoice Button
- On completed/paid bookings in Actions column
- No invoice → "Create Invoice" (auto-fills from booking + session type data)
- Draft → "Edit / Send"
- Sent/Paid → "View Invoice" (PDF preview modal)

---

## Patient Portal — billing.html ✅ Built

### Invoice Cards
- Invoice number, date, description, amount, status badge
- Paid: green badge + "Download PDF" button (signed URL, 1hr expiry)
- Sent/Overdue: yellow/red badge + "Pay Now" button
- Themed PDF modal for inline preview

---

## Email Integration ✅ Built

### Paid Invoice Email (Pipeline #3)
- Auto-sent on Stripe payment via `session-webhook.js`
- QP-branded template matching premium reminder style
- Invoice summary inline: number, session date, time, amount, PAID badge
- PDF download button (signed URL)
- Tracey headshot signature

---

## Answered Questions (from Tracey's Session 36 transcripts)

1. **Currency:** EUR for international, CAD for Canadian clients ✅ Built into session_types + session_clients
2. **Tax:** HST (13%) for Canadian clients only ✅ Schema supports via tax_label + tax_rate
3. **Auto-send:** Invoices auto-generate on Stripe payment ✅ Working via webhook
4. **Payment terms:** Not yet configured — Tracey hasn't specified (7 days? Due on receipt?)
5. **Business details:** Not yet added — needs business registration number / address from Tracey

---

## Still TODO

- ⬜ Invoice currency should pull from `session_bookings.currency` (currently hardcoded USD in webhook)
- ⬜ Tax auto-calculation from `session_clients.tax_rate` when generating invoice
- ⬜ Overdue status auto-update in `session-cron.js`
- ⬜ Default payment terms from Tracey
- ⬜ Business registration number / address on PDF
