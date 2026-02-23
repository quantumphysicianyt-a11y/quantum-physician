// /netlify/functions/stripe-refund.js
// Processes refunds via Stripe API — called from QP Admin panel

const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!STRIPE_SECRET_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing Stripe env vars" }) };
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
  const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    : null;

  try {
    const { stripe_session_id, email, amount } = JSON.parse(event.body || "{}");

    if (!stripe_session_id) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing stripe_session_id" }) };
    }

    console.log("Processing refund for:", { stripe_session_id, email });

    // Retrieve the checkout session to get the payment intent
    const session = await stripe.checkout.sessions.retrieve(stripe_session_id);

    if (!session.payment_intent) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "No payment intent found for this session. It may have been a free/credit purchase." }),
      };
    }

    // Create the refund (full refund)
    const refund = await stripe.refunds.create({
      payment_intent: session.payment_intent,
      reason: "requested_by_customer",
    });

    console.log("Refund created:", {
      refund_id: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
    });

    // Optionally mark the purchase as refunded in Supabase
    if (supabase && email) {
      // Soft-mark by prefixing product_id with "refunded__"
      const { data: purchase } = await supabase
        .from("purchases")
        .select("id, product_id")
        .eq("stripe_session_id", stripe_session_id)
        .maybeSingle();

      if (purchase && !purchase.product_id.startsWith("refunded__") && !purchase.product_id.startsWith("revoked__")) {
        await supabase
          .from("purchases")
          .update({ product_id: "refunded__" + purchase.product_id })
          .eq("id", purchase.id);

        console.log("Purchase marked as refunded in Supabase");
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        refund_id: refund.id,
        amount_refunded: refund.amount / 100,
        status: refund.status,
      }),
    };
  } catch (err) {
    console.error("Refund error:", err);

    // Handle specific Stripe errors
    if (err.type === "StripeInvalidRequestError") {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: err.message || "Invalid refund request. The payment may have already been refunded.",
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
