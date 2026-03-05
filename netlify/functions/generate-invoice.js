// /netlify/functions/generate-invoice.js
// Generates QP-branded PDF paid invoices using pdfkit
// Uploads to Supabase Storage 'invoices' bucket
// Called by: session-webhook.js (auto) or admin panel (manual)

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

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing env vars" }) };
  }

  const sbAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const body = JSON.parse(event.body || "{}");
    const { invoice_id, internal } = body;

    // If not an internal call (from webhook), verify admin auth
    if (!internal) {
      const sbAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const authHeader = event.headers["authorization"] || "";
      const token = authHeader.replace("Bearer ", "");
      if (!token) return { statusCode: 401, headers, body: JSON.stringify({ error: "No auth token" }) };

      const { data: { user }, error: authErr } = await sbAnon.auth.getUser(token);
      if (authErr || !user) return { statusCode: 401, headers, body: JSON.stringify({ error: "Invalid token" }) };
      const { data: adminUser } = await sbAdmin.from("admin_users").select("id").eq("email", user.email.toLowerCase()).eq("is_active", true).single();
      if (!adminUser) return { statusCode: 403, headers, body: JSON.stringify({ error: "Not admin" }) };
    }

    if (!invoice_id) return { statusCode: 400, headers, body: JSON.stringify({ error: "invoice_id required" }) };

    // Fetch invoice
    const { data: invoice, error: invErr } = await sbAdmin.from("invoices").select("*").eq("id", invoice_id).single();
    if (invErr || !invoice) return { statusCode: 404, headers, body: JSON.stringify({ error: "Invoice not found" }) };

    // Fetch booking details if linked
    let booking = null;
    if (invoice.booking_id) {
      const { data: bk } = await sbAdmin.from("session_bookings").select("date,start_time,end_time").eq("id", invoice.booking_id).single();
      booking = bk;
    }

    // Fetch QP logo as buffer for embedding
    let logoBuffer = null;
    try {
      const logoRes = await fetch("https://qp-homepage.netlify.app/assets/images/QP-Logo.png");
      if (logoRes.ok) logoBuffer = Buffer.from(await logoRes.arrayBuffer());
    } catch (e) { console.log("Logo fetch failed, using text fallback"); }

    // Fetch Tracey headshot
    let headshotBuffer = null;
    try {
      const hsRes = await fetch("https://qp-homepage.netlify.app/assets/images/tracey-headshot.jpg");
      if (hsRes.ok) headshotBuffer = Buffer.from(await hsRes.arrayBuffer());
    } catch (e) { console.log("Headshot fetch failed, skipping"); }

    // Generate PDF
    const PDFDocument = require("pdfkit");
    const pdfDoc = new PDFDocument({ size: "LETTER", margin: 0, bufferPages: true });

    const chunks = [];
    pdfDoc.on("data", (chunk) => chunks.push(chunk));

    // --- Brand Colors ---
    const navy = "#0e1a30";
    const navyLight = "#1a3a5c";
    const teal = "#5ba8b2";
    const white = "#ffffff";
    const offWhite = "#f8fafc";
    const textDark = "#1a1a2e";
    const textMuted = "#6b7280";
    const lightBorder = "#e2e8f0";
    const paidGreen = "#3dd68c";

    const pageW = 612;
    const pageH = 792;
    const margin = 50;

    // ═══════════════════════════════════
    // HEADER — Navy background
    // ═══════════════════════════════════
    pdfDoc.rect(0, 0, pageW, 130).fill(navy);

    // Logo
    if (logoBuffer) {
      try {
        pdfDoc.image(logoBuffer, margin, 28, { height: 50 });
      } catch (e) {
        pdfDoc.fontSize(22).font("Helvetica-Bold").fillColor(teal).text("Quantum Physician", margin, 35);
      }
    } else {
      pdfDoc.fontSize(22).font("Helvetica-Bold").fillColor(teal).text("Quantum Physician", margin, 35);
    }

    // Practitioner info
    pdfDoc.fontSize(10).font("Helvetica").fillColor("#94a3b8").text("Dr. Tracey Clark", margin, 85);
    pdfDoc.text("tracey@quantumphysician.com", margin, 99);

    // INVOICE title + number
    pdfDoc.fontSize(32).font("Helvetica-Bold").fillColor(white).text("INVOICE", 0, 40, { width: pageW - margin, align: "right" });
    pdfDoc.fontSize(11).font("Helvetica").fillColor(teal).text(invoice.invoice_number, 0, 78, { width: pageW - margin, align: "right" });

    // ═══════════════════════════════════
    // PAID WATERMARK (diagonal)
    // ═══════════════════════════════════
    if (invoice.status === "paid") {
      pdfDoc.save();
      pdfDoc.translate(pageW / 2, pageH / 2);
      pdfDoc.rotate(-35);
      pdfDoc.fontSize(120).font("Helvetica-Bold").fillColor(paidGreen).opacity(0.08);
      pdfDoc.text("PAID", -200, -60, { width: 400, align: "center" });
      pdfDoc.restore();
      pdfDoc.opacity(1);
    }

    // ═══════════════════════════════════
    // BILL TO + DATES
    // ═══════════════════════════════════
    const infoY = 150;

    pdfDoc.fontSize(8).font("Helvetica-Bold").fillColor(textMuted).text("BILL TO", margin, infoY);
    pdfDoc.fontSize(14).font("Helvetica-Bold").fillColor(textDark).text(invoice.name || "Client", margin, infoY + 16);
    pdfDoc.fontSize(10).font("Helvetica").fillColor(textMuted).text(invoice.email, margin, infoY + 34);

    const rightCol = 370;
    pdfDoc.fontSize(8).font("Helvetica-Bold").fillColor(textMuted).text("INVOICE DATE", rightCol, infoY);
    pdfDoc.fontSize(11).font("Helvetica").fillColor(textDark).text(formatDate(invoice.issued_at || invoice.created_at), rightCol, infoY + 14);

    if (invoice.due_date) {
      pdfDoc.fontSize(8).font("Helvetica-Bold").fillColor(textMuted).text("DUE DATE", rightCol, infoY + 36);
      pdfDoc.fontSize(11).font("Helvetica").fillColor(textDark).text(formatDate(invoice.due_date), rightCol, infoY + 50);
    }

    if (invoice.paid_at) {
      pdfDoc.fontSize(8).font("Helvetica-Bold").fillColor(paidGreen).text("PAID ON", rightCol + 130, infoY);
      pdfDoc.fontSize(11).font("Helvetica-Bold").fillColor(paidGreen).text(formatDate(invoice.paid_at), rightCol + 130, infoY + 14);
    }

    // ═══════════════════════════════════
    // SESSION DETAILS
    // ═══════════════════════════════════
    let currentY = infoY + 75;

    if (booking) {
      pdfDoc.roundedRect(margin, currentY, pageW - margin * 2, 50, 6).fillAndStroke(offWhite, lightBorder);
      pdfDoc.fontSize(8).font("Helvetica-Bold").fillColor(textMuted).text("SESSION DATE & TIME", margin + 16, currentY + 10);
      pdfDoc.fontSize(12).font("Helvetica-Bold").fillColor(textDark).text(
        formatDate(booking.date) + (booking.start_time ? "  ·  " + formatTime(booking.start_time) + " – " + formatTime(booking.end_time) : ""),
        margin + 16, currentY + 26
      );

      if (headshotBuffer) {
        try {
          pdfDoc.save();
          const hx = pageW - margin - 46, hy = currentY + 9, hr = 16;
          pdfDoc.circle(hx + hr, hy + hr, hr).clip();
          pdfDoc.image(headshotBuffer, hx, hy, { width: 32, height: 32 });
          pdfDoc.restore();
        } catch (e) { /* skip */ }
      }

      currentY += 65;
    }

    // ═══════════════════════════════════
    // LINE ITEMS TABLE
    // ═══════════════════════════════════
    currentY += 10;

    pdfDoc.roundedRect(margin, currentY, pageW - margin * 2, 32, 4).fill(navy);
    pdfDoc.fontSize(9).font("Helvetica-Bold").fillColor(white);
    pdfDoc.text("DESCRIPTION", margin + 16, currentY + 11);
    pdfDoc.text("AMOUNT", pageW - margin - 90, currentY + 11, { width: 74, align: "right" });

    currentY += 40;
    pdfDoc.fontSize(12).font("Helvetica").fillColor(textDark).text(invoice.description || "1-on-1 Healing Session (60 min)", margin + 16, currentY);
    pdfDoc.fontSize(12).font("Helvetica-Bold").fillColor(textDark).text(formatMoney(invoice.amount_cents, invoice.currency), pageW - margin - 90, currentY, { width: 74, align: "right" });

    // ═══════════════════════════════════
    // TOTALS
    // ═══════════════════════════════════
    currentY += 35;
    pdfDoc.moveTo(320, currentY).lineTo(pageW - margin, currentY).strokeColor(lightBorder).lineWidth(0.5).stroke();

    currentY += 12;
    pdfDoc.fontSize(10).font("Helvetica").fillColor(textMuted).text("Subtotal", 330, currentY);
    pdfDoc.fontSize(10).font("Helvetica").fillColor(textDark).text(formatMoney(invoice.amount_cents, invoice.currency), pageW - margin - 90, currentY, { width: 74, align: "right" });

    if (invoice.tax_cents && invoice.tax_cents > 0) {
      currentY += 22;
      const taxLabel = invoice.tax_label ? "Tax (" + invoice.tax_label + " " + invoice.tax_rate + "%)" : "Tax";
      pdfDoc.fontSize(10).font("Helvetica").fillColor(textMuted).text(taxLabel, 330, currentY);
      pdfDoc.fontSize(10).font("Helvetica").fillColor(textDark).text(formatMoney(invoice.tax_cents, invoice.currency), pageW - margin - 90, currentY, { width: 74, align: "right" });
    }

    currentY += 26;
    pdfDoc.moveTo(320, currentY).lineTo(pageW - margin, currentY).strokeColor(teal).lineWidth(2).stroke();
    currentY += 12;

    pdfDoc.fontSize(13).font("Helvetica-Bold").fillColor(teal).text("TOTAL", 330, currentY);
    pdfDoc.fontSize(16).font("Helvetica-Bold").fillColor(teal).text(formatMoney(invoice.total_cents, invoice.currency), pageW - margin - 90, currentY - 2, { width: 74, align: "right" });

    // ═══════════════════════════════════
    // PAID BADGE
    // ═══════════════════════════════════
    currentY += 40;
    if (invoice.status === "paid") {
      const badgeW = 140, badgeH = 32;
      pdfDoc.roundedRect(margin, currentY, badgeW, badgeH, 6).fill(paidGreen);
      pdfDoc.fontSize(14).font("Helvetica-Bold").fillColor(white).text("PAID", margin, currentY + 8, { width: badgeW, align: "center" });
      if (invoice.paid_at) {
        pdfDoc.fontSize(9).font("Helvetica").fillColor(textMuted).text("Payment received " + formatDate(invoice.paid_at), margin + badgeW + 12, currentY + 10);
      }
    }

    // ═══════════════════════════════════
    // NOTES
    // ═══════════════════════════════════
    if (invoice.notes) {
      currentY += 50;
      pdfDoc.moveTo(margin, currentY).lineTo(pageW - margin, currentY).strokeColor(lightBorder).lineWidth(0.5).stroke();
      currentY += 14;
      pdfDoc.fontSize(10).font("Helvetica-Oblique").fillColor(textMuted).text(invoice.notes, margin, currentY, { width: pageW - margin * 2 });
    }

    // ═══════════════════════════════════
    // FOOTER
    // ═══════════════════════════════════
    const footerY = pageH - 80;
    pdfDoc.rect(0, footerY, pageW, 80).fill(navy);

    if (headshotBuffer) {
      try {
        pdfDoc.save();
        const fx = margin, fy = footerY + 16, fr = 20;
        pdfDoc.circle(fx + fr, fy + fr, fr).clip();
        pdfDoc.image(headshotBuffer, fx, fy, { width: 40, height: 40 });
        pdfDoc.restore();
      } catch (e) { /* skip */ }
    }

    const footerTextX = headshotBuffer ? margin + 52 : margin;
    pdfDoc.fontSize(11).font("Helvetica-Bold").fillColor(teal).text("Dr. Tracey Clark", footerTextX, footerY + 18);
    pdfDoc.fontSize(9).font("Helvetica").fillColor("#94a3b8").text("Quantum Physician  ·  quantumphysician.com", footerTextX, footerY + 34);
    pdfDoc.fontSize(9).font("Helvetica").fillColor("#4a5568").text("Thank you for your trust in this healing journey.", 0, footerY + 52, { width: pageW, align: "center" });

    pdfDoc.end();

    const pdfBuffer = await new Promise((resolve) => {
      pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    // Upload to Supabase Storage
    const storagePath = invoice_id + ".pdf";
    const { error: uploadErr } = await sbAdmin.storage.from("invoices").upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (uploadErr) {
      console.error("Storage upload error:", uploadErr);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Upload failed: " + uploadErr.message }) };
    }

    // Update invoice record
    await sbAdmin.from("invoices").update({
      pdf_path: storagePath,
      pdf_generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", invoice_id);

    // Generate signed URL (1 hour expiry)
    const { data: signedData } = await sbAdmin.storage.from("invoices").createSignedUrl(storagePath, 3600);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        pdf_path: storagePath,
        pdf_url: signedData ? signedData.signedUrl : null,
        invoice_number: invoice.invoice_number,
      }),
    };
  } catch (err) {
    console.error("Invoice generation error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatTime(t) {
  if (!t) return "";
  var parts = t.slice(0, 5).split(":");
  var h = parseInt(parts[0]), m = parts[1];
  var ampm = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return h + ":" + m + " " + ampm;
}

function formatMoney(cents, currency) {
  var symbol = currency === "CAD" ? "CA$" : currency === "EUR" ? "€" : "$";
  return symbol + (cents / 100).toFixed(2);
}
