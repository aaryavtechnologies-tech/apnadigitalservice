import { createClient } from "npm:@supabase/supabase-js@2.118.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: cors });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "POST") return respond(405, { error: "Method not allowed." });

  const token = request.headers.get("Authorization")?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) return respond(401, { error: "Sign in again before creating an admin." });

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return respond(500, { error: "Staff creation is not configured in Supabase." });

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return respond(401, { error: "Sign in again before creating an admin." });

  const { data: caller, error: callerError } = await supabase
    .from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (callerError) return respond(500, { error: "Could not verify your staff permissions." });
  if (caller?.role !== "super_admin") return respond(403, { error: "Only a Super Admin can create staff accounts." });

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const password = body?.password;
  if (!email.includes("@") || !fullName || typeof password !== "string" || password.length < 8) {
    return respond(400, { error: "Enter a name, valid email address, and a password of at least 8 characters." });
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone },
    app_metadata: { apna_direct_staff: true },
  });
  if (error) {
    if (error.code === "email_exists" || error.code === "user_already_exists") {
      return respond(409, { error: "An account already exists with that email address." });
    }
    if (error.code === "weak_password" || error.code === "validation_failed" || error.code === "email_address_invalid") {
      return respond(400, { error: error.message });
    }
    console.error("Admin creation failed", error.code, error.status);
    return respond(500, { error: "Could not create the admin. Check the Supabase Auth logs." });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profileError || profile?.role !== "admin") {
    return respond(500, { error: "The account was created, but admin access could not be verified. Check the staff migration and account before retrying." });
  }

  return respond(201, { id: data.user.id });
});
