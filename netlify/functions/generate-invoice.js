// /netlify/functions/generate-invoice.js
// Premium QP-branded PDF invoice generator
// pdfkit — pixel-precise layout, PAID watermark, logo + headshot

const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing env vars" }) };

  const sbAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const body = JSON.parse(event.body || "{}");
    const { invoice_id, internal } = body;

    if (!internal) {
      const sbAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const authHeader = event.headers["authorization"] || "";
      const token = authHeader.replace("Bearer ", "");
      if (!token) return { statusCode: 401, headers, body: JSON.stringify({ error: "No auth token" }) };
      const { data: { user }, error: authErr } = await sbAnon.auth.getUser(token);
      if (authErr || !user) return { statusCode: 401, headers, body: JSON.stringify({ error: "Invalid token" }) };
      const { data: adm } = await sbAdmin.from("admin_users").select("id").eq("email", user.email.toLowerCase()).eq("is_active", true).single();
      if (!adm) return { statusCode: 403, headers, body: JSON.stringify({ error: "Not admin" }) };
    }
    if (!invoice_id) return { statusCode: 400, headers, body: JSON.stringify({ error: "invoice_id required" }) };

    const { data: inv, error: invErr } = await sbAdmin.from("invoices").select("*").eq("id", invoice_id).single();
    if (invErr || !inv) return { statusCode: 404, headers, body: JSON.stringify({ error: "Invoice not found" }) };

    let booking = null;
    if (inv.booking_id) {
      const { data: bk } = await sbAdmin.from("session_bookings").select("date,start_time,end_time").eq("id", inv.booking_id).single();
      booking = bk;
    }

    // Fetch assets
    let logoBuffer = null, headshotBuffer = null;
    try { const r = await fetch("https://qp-homepage.netlify.app/assets/images/QP-Logo.png"); if (r.ok) logoBuffer = Buffer.from(await r.arrayBuffer()); } catch(e) {}
    try { const r = await fetch("https://qp-homepage.netlify.app/assets/images/tracey-about-me.png"); if (r.ok) headshotBuffer = Buffer.from(await r.arrayBuffer()); } catch(e) {}

    // ═══════════════════════════════════════════════
    // PDF GENERATION
    // ═══════════════════════════════════════════════
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ size: "LETTER", margins: { top: 0, bottom: 0, left: 0, right: 0 } });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));

    const W = 612, H = 792;
    const L = 54, R = W - 54; // left/right margins
    const contentW = R - L;

    // Colors
    const navy     = "#0b1829";
    const navyMid  = "#0f2240";
    const teal     = "#5ba8b2";
    const tealDk   = "#4a939c";
    const taupe    = "#ad9b84";
    const green    = "#2ec97a";
    const white    = "#ffffff";
    const offWhite = "#f7f8fa";
    const grayDk   = "#374151";
    const grayMd   = "#6b7280";
    const grayLt   = "#9ca3af";
    const border   = "#e5e7eb";
    const isPaid   = inv.status === "paid";

    // ── HEADER BAR ──────────────────────────────
    doc.rect(0, 0, W, 100).fill(navy);

    if (logoBuffer) {
      try { doc.image(logoBuffer, L, 20, { height: 42 }); } catch(e) {
        doc.font("Helvetica-Bold").fontSize(18).fillColor(teal).text("QUANTUM PHYSICIAN", L, 30);
      }
    } else {
      doc.font("Helvetica-Bold").fontSize(18).fillColor(teal).text("QUANTUM PHYSICIAN", L, 30);
    }
    doc.font("Helvetica").fontSize(8.5).fillColor(grayLt).text("Dr. Tracey Clark  ·  tracey@quantumphysician.com", L, 80);

    // Invoice title block (right)
    doc.font("Helvetica-Bold").fontSize(11).fillColor(grayLt).text("INVOICE", 0, 28, { width: R, align: "right" });
    doc.font("Helvetica-Bold").fontSize(20).fillColor(white).text(inv.invoice_number, 0, 42, { width: R, align: "right" });
    if (isPaid) {
      doc.font("Helvetica-Bold").fontSize(13).fillColor(green).text("PAID", 0, 66, { width: R, align: "right" });
    }

    // ── PAID WATERMARK ──────────────────────────
    if (isPaid) {
      doc.save();
      doc.translate(W / 2, H / 2 - 30);
      doc.rotate(-38);
      doc.font("Helvetica-Bold").fontSize(140).fillColor(green).opacity(0.06);
      doc.text("PAID", -240, -70, { width: 480, align: "center" });
      doc.restore();
      doc.opacity(1);
    }

    // ── CLIENT + DATE INFO ──────────────────────
    let y = 120;

    // Left: Bill To
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(grayLt).text("BILL TO", L, y);
    y += 13;
    doc.font("Helvetica-Bold").fontSize(13).fillColor(grayDk).text(inv.name || "Client", L, y);
    y += 17;
    doc.font("Helvetica").fontSize(9.5).fillColor(grayMd).text(inv.email, L, y);

    // Right: Dates column
    const dCol = 380;
    let dy = 120;
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(grayLt).text("DATE", dCol, dy);
    dy += 12;
    doc.font("Helvetica").fontSize(9.5).fillColor(grayDk).text(fmtDate(inv.issued_at || inv.created_at), dCol, dy);

    if (inv.due_date) {
      dy += 20;
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor(grayLt).text("DUE", dCol, dy);
      dy += 12;
      doc.font("Helvetica").fontSize(9.5).fillColor(grayDk).text(fmtDate(inv.due_date), dCol, dy);
    }

    if (isPaid && inv.paid_at) {
      dy += 20;
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor(green).text("PAID", dCol, dy);
      dy += 12;
      doc.font("Helvetica-Bold").fontSize(9.5).fillColor(green).text(fmtDate(inv.paid_at), dCol, dy);
    }

    // ── DIVIDER ─────────────────────────────────
    y = 188;
    doc.moveTo(L, y).lineTo(R, y).strokeColor(border).lineWidth(0.75).stroke();

    // ── SESSION DETAILS ROW ─────────────────────
    if (booking) {
      y += 14;
      doc.roundedRect(L, y, contentW, 44, 5).fill(offWhite);
      doc.roundedRect(L, y, contentW, 44, 5).strokeColor(border).lineWidth(0.5).stroke();

      doc.font("Helvetica-Bold").fontSize(7).fillColor(grayLt).text("SESSION", L + 14, y + 9);
      doc.font("Helvetica-Bold").fontSize(11).fillColor(grayDk).text(
        fmtDate(booking.date), L + 14, y + 22
      );
      doc.font("Helvetica").fontSize(10).fillColor(grayMd).text(
        fmtTime(booking.start_time) + " – " + fmtTime(booking.end_time),
        L + 220, y + 23
      );

      // Headshot badge (right side of session row)
      if (headshotBuffer) {
        try {
          doc.save();
          const cx = R - 32, cy = y + 10, r = 12;
          doc.circle(cx + r, cy + r, r).clip();
          doc.image(headshotBuffer, cx, cy, { width: 24, height: 24 });
          doc.restore();
        } catch(e) {}
      }

      y += 56;
    } else {
      y += 18;
    }

    // ── LINE ITEMS TABLE ────────────────────────
    // Header
    doc.rect(L, y, contentW, 26).fill(navy);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(white);
    doc.text("DESCRIPTION", L + 14, y + 9);
    doc.text("AMOUNT", R - 90, y + 9, { width: 76, align: "right" });
    y += 34;

    // Row
    doc.font("Helvetica").fontSize(10.5).fillColor(grayDk).text(inv.description || "1-on-1 Healing Session (60 min)", L + 14, y);
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(grayDk).text(fmtMoney(inv.amount_cents, inv.currency), R - 90, y, { width: 76, align: "right" });

    // ── TOTALS ──────────────────────────────────
    y += 30;
    const tL = 340; // totals left edge
    doc.moveTo(tL, y).lineTo(R, y).strokeColor(border).lineWidth(0.5).stroke();
    y += 10;

    doc.font("Helvetica").fontSize(9).fillColor(grayMd).text("Subtotal", tL, y);
    doc.font("Helvetica").fontSize(9).fillColor(grayDk).text(fmtMoney(inv.amount_cents, inv.currency), R - 90, y, { width: 76, align: "right" });

    if (inv.tax_cents && inv.tax_cents > 0) {
      y += 18;
      const tLbl = inv.tax_label ? inv.tax_label + " (" + inv.tax_rate + "%)" : "Tax";
      doc.font("Helvetica").fontSize(9).fillColor(grayMd).text(tLbl, tL, y);
      doc.font("Helvetica").fontSize(9).fillColor(grayDk).text(fmtMoney(inv.tax_cents, inv.currency), R - 90, y, { width: 76, align: "right" });
    }

    y += 20;
    doc.moveTo(tL, y).lineTo(R, y).strokeColor(teal).lineWidth(1.5).stroke();
    y += 10;

    doc.font("Helvetica-Bold").fontSize(10).fillColor(teal).text("TOTAL", tL, y);
    doc.font("Helvetica-Bold").fontSize(14).fillColor(teal).text(fmtMoney(inv.total_cents, inv.currency), R - 90, y - 2, { width: 76, align: "right" });

    // ── PAID STAMP ──────────────────────────────
    if (isPaid) {
      y += 34;
      // Green pill badge
      const pillW = 90, pillH = 24;
      doc.roundedRect(L, y, pillW, pillH, pillH / 2).fill(green);
      doc.font("Helvetica-Bold").fontSize(10).fillColor(white).text("PAID", L, y + 6, { width: pillW, align: "center" });
      if (inv.paid_at) {
        doc.font("Helvetica").fontSize(8.5).fillColor(grayMd).text("Payment received " + fmtDate(inv.paid_at), L + pillW + 10, y + 7);
      }
    }

    // ── NOTES ────────────────────────────────────
    if (inv.notes) {
      y += isPaid ? 42 : 34;
      doc.moveTo(L, y).lineTo(R, y).strokeColor(border).lineWidth(0.5).stroke();
      y += 10;
      doc.font("Helvetica-Oblique").fontSize(9).fillColor(grayMd).text(inv.notes, L, y, { width: contentW });
    }

    // ── FOOTER ──────────────────────────────────
    const fY = H - 100;
    doc.rect(0, fY, W, 100).fill(navy);

    // Centered headshot
    if (headshotBuffer) {
      try {
        doc.save();
        const cx = W / 2 - 18, cy = fY + 10, fr = 18;
        doc.circle(cx + fr, cy + fr, fr).clip();
        doc.image(headshotBuffer, cx, cy, { width: 36, height: 36 });
        doc.restore();
      } catch(e) {}
    }

    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(teal).text("Dr. Tracey Clark", 0, fY + 50, { width: W, align: "center" });
    doc.font("Helvetica").fontSize(8).fillColor(grayLt).text("Quantum Physician  ·  quantumphysician.com", 0, fY + 64, { width: W, align: "center" });
    doc.font("Helvetica-Oblique").fontSize(7.5).fillColor(grayLt).text("Thank you for your trust in this healing journey.", 0, fY + 80, { width: W, align: "center" });

    doc.end();

    const pdfBuffer = await new Promise((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    // Upload
    const storagePath = invoice_id + ".pdf";
    const { error: upErr } = await sbAdmin.storage.from("invoices").upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });
    if (upErr) return { statusCode: 500, headers, body: JSON.stringify({ error: "Upload failed: " + upErr.message }) };

    await sbAdmin.from("invoices").update({ pdf_path: storagePath, pdf_generated_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", invoice_id);

    const { data: signed } = await sbAdmin.storage.from("invoices").createSignedUrl(storagePath, 3600);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, pdf_path: storagePath, pdf_url: signed?.signedUrl || null, invoice_number: inv.invoice_number }) };

  } catch (err) {
    console.error("Invoice error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
function fmtTime(t) {
  if (!t) return "";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  return (h > 12 ? h - 12 : h || 12) + ":" + String(m).padStart(2, "0") + " " + (h >= 12 ? "PM" : "AM");
}
function fmtMoney(cents, cur) {
  const sym = cur === "CAD" ? "CA$" : cur === "EUR" ? "€" : "$";
  return sym + (cents / 100).toFixed(2);
}
