// /netlify/functions/admin-auth.js
// Verifies admin login credentials and returns permissions

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

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing env vars" }) };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const { action, email, password } = JSON.parse(event.body || "{}");

    if (action === "login") {
      if (!email || !password) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Email and password required" }) };
      }

      // Step 1: Verify Supabase auth credentials
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (authError) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: "Invalid email or password" }) };
      }

      // Step 2: Check admin_users table for this email
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("is_active", true)
        .single();

      if (adminError || !adminUser) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: "You don't have admin access. Contact the super admin." }) };
      }

      // Step 3: Update last_login
      await supabase
        .from("admin_users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", adminUser.id);

      // Step 4: Return admin user with permissions
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          admin: {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
            permissions: {
              customers: adminUser.can_customers,
              email: adminUser.can_email,
              promotions: adminUser.can_promotions,
              orders: adminUser.can_orders,
              community: adminUser.can_community,
              analytics: adminUser.can_analytics,
              suggestions: adminUser.can_suggestions,
              automation: adminUser.can_automation,
              audit: adminUser.can_audit,
              system: adminUser.can_system,
              refund: adminUser.can_refund,
              delete: adminUser.can_delete,
            },
          },
          // Return a session token (the Supabase access token)
          token: authData.session?.access_token || null,
        }),
      };
    }

    if (action === "verify") {
      // Verify an existing session token is still valid
      const { token } = JSON.parse(event.body || "{}");
      if (!token) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: "No token" }) };
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: "Invalid token" }) };
      }

      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", user.email.toLowerCase())
        .eq("is_active", true)
        .single();

      if (!adminUser) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: "Admin access revoked" }) };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          valid: true,
          admin: {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
            permissions: {
              customers: adminUser.can_customers,
              email: adminUser.can_email,
              promotions: adminUser.can_promotions,
              orders: adminUser.can_orders,
              community: adminUser.can_community,
              analytics: adminUser.can_analytics,
              suggestions: adminUser.can_suggestions,
              automation: adminUser.can_automation,
              audit: adminUser.can_audit,
              system: adminUser.can_system,
              refund: adminUser.can_refund,
              delete: adminUser.can_delete,
            },
          },
        }),
      };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown action" }) };
  } catch (err) {
    console.error("Admin auth error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
