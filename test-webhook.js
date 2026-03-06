// test-webhook.js
// Run with: node test-webhook.js
// Tests the session-webhook by sending a fake Stripe payload

const crypto = require("crypto");

// ── CONFIG ──────────────────────────────────────────────
const WEBHOOK_URL = "https://qp-homepage.netlify.app/.netlify/functions/session-webhook";
const WEBHOOK_SECRET = process.env.STRIPE_SESSION_WEBHOOK_SECRET || "PASTE_SECRET_HERE";

// From Supabase screenshot — Todd Test booking
const BOOKING_ID = "25e982ca-ad43-49b0-babb-09909a5ad61a";
const CLIENT_EMAIL = "btsol@hey.com";
const CLIENT_NAME = "Todd (Test)";
// ────────────────────────────────────────────────────────

const payload = JSON.stringify({
  id: "evt_test_" + Date.now(),
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_" + Date.now(),
      object: "checkout.session",
      payment_intent: "pi_test_" + Date.now(),
      amount_total: 15000, // $150.00
      customer_email: CLIENT_EMAIL,
      customer_details: { email: CLIENT_EMAIL, name: CLIENT_NAME },
      metadata: {
        type: "session_booking",
        booking_id: BOOKING_ID,
        email: CLIENT_EMAIL
      }
    }
  }
});

// Sign exactly as Stripe does
const timestamp = Math.floor(Date.now() / 1000);
const signedPayload = `${timestamp}.${payload}`;
const signature = crypto
  .createHmac("sha256", WEBHOOK_SECRET)
  .update(signedPayload)
  .digest("hex");
const stripeSignature = `t=${timestamp},v1=${signature}`;

async function run() {
  console.log("🚀 Firing test webhook...");
  console.log("   Booking ID:", BOOKING_ID);
  console.log("   Email:", CLIENT_EMAIL);
  console.log("   Amount: $150.00\n");

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": stripeSignature
    },
    body: payload
  });

  const text = await res.text();
  console.log("📡 Status:", res.status);
  try {
    const json = JSON.parse(text);
    console.log("📦 Response:", JSON.stringify(json, null, 2));
    if (json.ok) {
      console.log("\n✅ Webhook accepted! Now check:");
      console.log("   1. Admin → Bookings → booking should show PAID");
      console.log("   2. btsol@hey.com inbox → confirmation email");
      console.log("   3. Admin → Invoices tab → invoice with PDF");
      console.log("   4. btsol@hey.com inbox → invoice email");
      console.log("   5. members/billing.html → invoice card");
    } else {
      console.log("\n❌ Webhook returned error:", json.error || text);
    }
  } catch(e) {
    console.log("📦 Raw response:", text);
  }
}

run().catch(console.error);
