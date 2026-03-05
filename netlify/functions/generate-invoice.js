// /netlify/functions/generate-invoice.js
// Generates QP-branded PDF invoices using pdfkit, uploads to Supabase Storage

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

  // Auth check — must be admin
  const sbAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const sbAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const authHeader = event.headers["authorization"] || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return { statusCode: 401, headers, body: JSON.stringify({ error: "No auth token" }) };

  try {
    const { data: { user }, error: authErr } = await sbAnon.auth.getUser(token);
    if (authErr || !user) return { statusCode: 401, headers, body: JSON.stringify({ error: "Invalid token" }) };
    const { data: adminUser } = await sbAdmin.from("admin_users").select("id").eq("email", user.email.toLowerCase()).eq("is_active", true).single();
    if (!adminUser) return { statusCode: 403, headers, body: JSON.stringify({ error: "Not admin" }) };
  } catch (e) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Auth failed" }) };
  }

  try {
    const { invoice_id } = JSON.parse(event.body || "{}");
    if (!invoice_id) return { statusCode: 400, headers, body: JSON.stringify({ error: "invoice_id required" }) };

    // Fetch invoice
    const { data: invoice, error: invErr } = await sbAdmin.from("invoices").select("*").eq("id", invoice_id).single();
    if (invErr || !invoice) return { statusCode: 404, headers, body: JSON.stringify({ error: "Invoice not found" }) };

    // Generate PDF
    const PDFDocument = require("pdfkit");
    const pdfDoc = new PDFDocument({ size: "LETTER", margin: 50, bufferPages: true });

    const chunks = [];
    pdfDoc.on("data", (chunk) => chunks.push(chunk));

    // --- Colors ---
    const navy = "#0e1a30";
    const teal = "#5ba8b2";
    const taupe = "#ad9b84";
    const white = "#ffffff";
    const lightGray = "#e8e8e8";
    const textDark = "#1a1a2e";
    const textMuted = "#6b7280";

    // --- Header ---
    pdfDoc.rect(0, 0, 612, 110).fill(navy);
    pdfDoc.fontSize(28).font("Helvetica-Bold").fillColor(white).text("INVOICE", 50, 40, { align: "right" });
    pdfDoc.fontSize(18).font("Helvetica-Bold").fillColor(teal).text("Quantum Physician", 50, 38);
    pdfDoc.fontSize(10).font("Helvetica").fillColor("#94a3b8").text("Dr. Tracey Clark", 50, 62);
    pdfDoc.text("tracey@quantumphysician.com", 50, 76);

    // --- Invoice Number & Dates ---
    const infoY = 130;
    pdfDoc.fontSize(9).font("Helvetica-Bold").fillColor(textMuted).text("INVOICE NUMBER", 50, infoY);
    pdfDoc.fontSize(13).font("Helvetica-Bold").fillColor(teal).text(invoice.invoice_number, 50, infoY + 14);

    pdfDoc.fontSize(9).font("Helvetica-Bold").fillColor(textMuted).text("INVOICE DATE", 220, infoY);
    pdfDoc.fontSize(11).font("Helvetica").fillColor(textDark).text(formatDate(invoice.issued_at || invoice.created_at), 220, infoY + 14);

    if (invoice.due_date) {
      pdfDoc.fontSize(9).font("Helvetica-Bold").fillColor(textMuted).text("DUE DATE", 380, infoY);
      pdfDoc.fontSize(11).font("Helvetica").fillColor(textDark).text(formatDate(invoice.due_date), 380, infoY + 14);
    }

    // --- Bill To ---
    const billY = 185;
    pdfDoc.fontSize(9).font("Helvetica-Bold").fillColor(textMuted).text("BILL TO", 50, billY);
    pdfDoc.fontSize(12).font("Helvetica-Bold").fillColor(textDark).text(invoice.name || "Client", 50, billY + 14);
    pdfDoc.fontSize(10).font("Helvetica").fillColor(textMuted).text(invoice.email, 50, billY + 30);

    // Session date (from booking if available)
    if (invoice.booking_id) {
      const { data: booking } = await sbAdmin.from("session_bookings").select("date,start_time").eq("id", invoice.booking_id).single();
      if (booking) {
        pdfDoc.fontSize(9).font("Helvetica-Bold").fillColor(textMuted).text("SESSION DATE", 380, billY);
        pdfDoc.fontSize(11).font("Helvetica").fillColor(textDark).text(formatDate(booking.date) + (booking.start_time ? " at " + formatTime(booking.start_time) : ""), 380, billY + 14);
      }
    }

    // --- Separator ---
    const lineY = 240;
    pdfDoc.moveTo(50, lineY).lineTo(562, lineY).strokeColor(lightGray).lineWidth(1).stroke();

    // --- Line Items Table ---
    const tableY = 260;
    // Header row
    pdfDoc.rect(50, tableY, 512, 28).fill("#f8fafc");
    pdfDoc.fontSize(9).font("Helvetica-Bold").fillColor(textMuted);
    pdfDoc.text("DESCRIPTION", 60, tableY + 9);
    pdfDoc.text("AMOUNT", 460, tableY + 9, { width: 90, align: "right" });

    // Line item
    const rowY = tableY + 38;
    pdfDoc.fontSize(11).font("Helvetica").fillColor(textDark).text(invoice.description || "1-on-1 Healing Session (60 min)", 60, rowY);
    pdfDoc.fontSize(11).font("Helvetica-Bold").fillColor(textDark).text(formatMoney(invoice.amount_cents, invoice.currency), 460, rowY, { width: 90, align: "right" });

    // --- Totals ---
    pdfDoc.moveTo(350, rowY + 30).lineTo(562, rowY + 30).strokeColor(lightGray).lineWidth(0.5).stroke();

    let totalY = rowY + 42;
    pdfDoc.fontSize(10).font("Helvetica").fillColor(textMuted).text("Subtotal", 360, totalY);
    pdfDoc.fontSize(10).font("Helvetica").fillColor(textDark).text(formatMoney(invoice.amount_cents, invoice.currency), 460, totalY, { width: 90, align: "right" });

    if (invoice.tax_cents && invoice.tax_cents > 0) {
      totalY += 20;
      const taxLabel = invoice.tax_label ? "Tax (" + invoice.tax_label + " " + invoice.tax_rate + "%)" : "Tax";
      pdfDoc.fontSize(10).font("Helvetica").fillColor(textMuted).text(taxLabel, 360, totalY);
      pdfDoc.fontSize(10).font("Helvetica").fillColor(textDark).text(formatMoney(invoice.tax_cents, invoice.currency), 460, totalY, { width: 90, align: "right" });
    }

    totalY += 24;
    pdfDoc.moveTo(350, totalY).lineTo(562, totalY).strokeColor(teal).lineWidth(2).stroke();
    totalY += 10;
    pdfDoc.fontSize(14).font("Helvetica-Bold").fillColor(teal).text("TOTAL", 360, totalY);
    pdfDoc.fontSize(14).font("Helvetica-Bold").fillColor(teal).text(formatMoney(invoice.total_cents, invoice.currency), 460, totalY, { width: 90, align: "right" });

    // --- Status Badge ---
    totalY += 36;
    const statusColors = { draft: "#6b7280", sent: "#f0b429", paid: "#3dd68c", overdue: "#ef5350", void: "#6b7280" };
    const statusColor = statusColors[invoice.status] || "#6b7280";
    const statusText = invoice.status.toUpperCase() + (invoice.status === "paid" ? " ✓" : "");
    pdfDoc.fontSize(12).font("Helvetica-Bold").fillColor(statusColor).text("Status: " + statusText, 50, totalY);

    // --- Pay URL ---
    if (invoice.pay_url && invoice.status !== "paid" && invoice.status !== "void") {
      totalY += 22;
      pdfDoc.fontSize(10).font("Helvetica").fillColor(teal).text("Pay online: " + invoice.pay_url, 50, totalY, { link: invoice.pay_url, underline: true });
    }

    // --- Notes ---
    if (invoice.notes) {
      totalY += 30;
      pdfDoc.moveTo(50, totalY).lineTo(562, totalY).strokeColor(lightGray).lineWidth(0.5).stroke();
      totalY += 14;
      pdfDoc.fontSize(10).font("Helvetica-Oblique").fillColor(textMuted).text(invoice.notes, 50, totalY, { width: 512 });
    }

    // --- Footer ---
    const footerY = 710;
    pdfDoc.rect(0, footerY, 612, 82).fill(navy);
    pdfDoc.fontSize(10).font("Helvetica").fillColor("#94a3b8").text("Thank you for your trust in this healing journey.", 50, footerY + 20, { width: 512, align: "center" });
    pdfDoc.fontSize(9).fillColor(teal).text("quantumphysician.com", 50, footerY + 40, { width: 512, align: "center", link: "https://quantumphysician.com" });

    pdfDoc.end();

    // Wait for PDF to complete
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
      }),
    };
  } catch (err) {
    console.error("Invoice generation error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

function formatDate(d) {
  if (!d) return "—";
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
