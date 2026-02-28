// /netlify/functions/admin-proxy.js
const { createClient } = require("@supabase/supabase-js");

const ALLOWED_TABLES = [
  "admin_audit_log", "admin_notes", "admin_users",
  "email_campaigns", "email_log", "email_tracking", "profiles",
  "promotions", "purchases", "qa_enrollments", "qa_profiles",
  "referral_codes", "qa_bundles", "qa_bundle_courses", "qa_courses", "qa_lessons", "qa_modules", "scheduled_emails", "session_schedule",
  "session_config", "session_cycles", "session_availability",
  "session_clients", "session_bookings", "session_waitlist"
];

const WRITABLE_TABLES = [...ALLOWED_TABLES];

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing env vars" }) };
  }

  const sbAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const sbAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const authHeader = event.headers["authorization"] || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) return { statusCode: 401, headers, body: JSON.stringify({ error: "No auth token" }) };

  let adminEmail;
  try {
    const { data: { user }, error } = await sbAnon.auth.getUser(token);
    if (error || !user) return { statusCode: 401, headers, body: JSON.stringify({ error: "Invalid token" }) };
    adminEmail = user.email.toLowerCase();

    const { data: adminUser, error: adminErr } = await sbAdmin
      .from("admin_users").select("id, is_active")
      .eq("email", adminEmail).eq("is_active", true).single();

    if (adminErr || !adminUser) return { statusCode: 403, headers, body: JSON.stringify({ error: "Not an active admin" }) };
  } catch (e) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Auth failed: " + e.message }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { type } = body;

    if (type === "query") return await handleQuery(sbAdmin, body, headers);
    if (type === "insert") return await handleInsert(sbAdmin, body, headers);
    if (type === "update") return await handleUpdate(sbAdmin, body, headers);
    if (type === "delete") return await handleDelete(sbAdmin, body, headers);
    if (type === "auth_admin") return await handleAuthAdmin(SUPABASE_URL, SUPABASE_SERVICE_KEY, body, headers);

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown type: " + type }) };
  } catch (err) {
    console.error("Proxy error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

async function handleQuery(sb, body, headers) {
  const { table, select, filters, order, limit, single, range, count } = body;

  if (!table || !ALLOWED_TABLES.includes(table)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid table: " + table }) };
  }

  // Support count option in select
  let selectOpts = {};
  if (count) selectOpts.count = count;
  let query = sb.from(table).select(select || "*", Object.keys(selectOpts).length ? selectOpts : undefined);
  
  query = applyFilters(query, filters);
  if (order) query = query.order(order.column, { ascending: order.ascending !== false });
  if (range) query = query.range(range.from, range.to);
  if (limit) query = query.limit(limit);
  if (single) query = query.single();

  const result = await query;
  if (result.error) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: result.error.message }) };
  }
  
  // Include count in response if requested
  const responseBody = { data: result.data };
  if (result.count !== undefined && result.count !== null) {
    responseBody.count = result.count;
  }
  
  return { statusCode: 200, headers, body: JSON.stringify(responseBody) };
}

async function handleInsert(sb, body, headers) {
  const { table, data: rowData, select: returnSelect } = body;
  if (!table || !WRITABLE_TABLES.includes(table)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid table: " + table }) };
  }

  let query = sb.from(table).insert(Array.isArray(rowData) ? rowData : [rowData]);
  if (returnSelect) query = query.select(returnSelect);

  const { data, error } = await query;
  if (error) return { statusCode: 400, headers, body: JSON.stringify({ error: error.message }) };
  return { statusCode: 200, headers, body: JSON.stringify({ data }) };
}

async function handleUpdate(sb, body, headers) {
  const { table, data: updateData, filters } = body;
  if (!table || !WRITABLE_TABLES.includes(table)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid table: " + table }) };
  }
  if (!filters || filters.length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Update requires filters" }) };
  }

  let query = sb.from(table).update(updateData);
  query = applyFilters(query, filters);

  const { data, error } = await query;
  if (error) return { statusCode: 400, headers, body: JSON.stringify({ error: error.message }) };
  return { statusCode: 200, headers, body: JSON.stringify({ data }) };
}

async function handleDelete(sb, body, headers) {
  const { table, filters } = body;
  if (!table || !WRITABLE_TABLES.includes(table)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid table: " + table }) };
  }
  if (!filters || filters.length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Delete requires filters" }) };
  }

  let query = sb.from(table).delete();
  query = applyFilters(query, filters);

  const { data, error } = await query;
  if (error) return { statusCode: 400, headers, body: JSON.stringify({ error: error.message }) };
  return { statusCode: 200, headers, body: JSON.stringify({ data }) };
}

async function handleAuthAdmin(supabaseUrl, serviceKey, body, headers) {
  const { action, params } = body;
  const authHeaders = {
    "Content-Type": "application/json",
    "apikey": serviceKey,
    "Authorization": "Bearer " + serviceKey,
  };

  if (action === "list_users") {
    const page = params.page || 1;
    const perPage = params.per_page || 500;
    const res = await fetch(supabaseUrl + "/auth/v1/admin/users?page=" + page + "&per_page=" + perPage, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) return { statusCode: res.status, headers, body: JSON.stringify({ error: "Auth API error", details: data }) };
    return { statusCode: 200, headers, body: JSON.stringify({ data }) };
  }

  if (action === "generate_link") {
    const res = await fetch(supabaseUrl + "/auth/v1/admin/generate_link", { method: "POST", headers: authHeaders, body: JSON.stringify(params) });
    const data = await res.json();
    if (!res.ok) return { statusCode: res.status, headers, body: JSON.stringify({ error: "Auth API error", details: data }) };
    return { statusCode: 200, headers, body: JSON.stringify({ data }) };
  }

  if (action === "update_user") {
    const { userId, userData } = params;
    const res = await fetch(supabaseUrl + "/auth/v1/admin/users/" + userId, { method: "PUT", headers: authHeaders, body: JSON.stringify(userData) });
    const data = await res.json();
    if (!res.ok) return { statusCode: res.status, headers, body: JSON.stringify({ error: "Auth API error", details: data }) };
    return { statusCode: 200, headers, body: JSON.stringify({ data }) };
  }

  return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown auth action: " + action }) };
}

function applyFilters(query, filters) {
  if (!filters || !Array.isArray(filters)) return query;
  for (const f of filters) {
    const { column, op, value } = f;
    switch (op) {
      case "eq": query = query.eq(column, value); break;
      case "neq": query = query.neq(column, value); break;
      case "gt": query = query.gt(column, value); break;
      case "gte": query = query.gte(column, value); break;
      case "lt": query = query.lt(column, value); break;
      case "lte": query = query.lte(column, value); break;
      case "like": query = query.like(column, value); break;
      case "ilike": query = query.ilike(column, value); break;
      case "is": query = query.is(column, value); break;
      case "in": query = query.in(column, value); break;
      case "not": query = query.not(column, f.filterOp || "eq", value); break;
      case "or": query = query.or(value); break;
      case "maybeSingle": query = query.maybeSingle(); break;
      default: break;
    }
  }
  return query;
}
