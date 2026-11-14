import { createClient } from "npm:@supabase/supabase-js@2.118.0";

// Operator-only recovery tool. Never accepts a URL supplied by a caller.
// The dashboard's service-role test client can invoke it without exporting keys.
const bucket = "final-documents";
const prefix = `storage://${bucket}/`;
const maxBytes = 5 * 1024 * 1024;
const reply = (status: number, body: unknown) => Response.json(body, { status });
const hash = async (bytes: Uint8Array) => Array.from(new Uint8Array(
  await crypto.subtle.digest("SHA-256", bytes),
)).map(b => b.toString(16).padStart(2, "0")).join("");

async function fetchPdf(source: string, authenticatedSource = false) {
  const url = new URL(source);
  if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" ||
      url.username || url.password || url.port ||
      !/^\/m1gqubzu\/(image|raw)\/upload\//.test(url.pathname)) {
    throw new Error("Unsupported legacy source; record preserved.");
  }
  let downloadUrl = url;
  if (authenticatedSource) {
    // Only original, versioned PDFs may use the temporary owner credential.
    // Never transform an image into a PDF or accept an arbitrary download target.
    const asset = url.pathname.match(/^\/m1gqubzu\/(image|raw)\/upload\/v\d+\/(.+)\.pdf$/i);
    if (!asset || url.search || url.hash) throw new Error("Unsupported authenticated source; record preserved.");
    const apiKey = Deno.env.get("LEGACY_CLOUDINARY_API_KEY");
    const apiSecret = Deno.env.get("LEGACY_CLOUDINARY_API_SECRET");
    if (!apiKey || !apiSecret) throw new Error("Legacy recovery credentials are not configured; record preserved.");
    const publicId = decodeURIComponent(asset[2]) + (asset[1] === "raw" ? ".pdf" : "");
    const timestamp = Math.floor(Date.now() / 1000);
    const parameters = new URLSearchParams({
      expires_at: String(timestamp + 300), format: "pdf", public_id: publicId,
      timestamp: String(timestamp), type: "upload",
    });
    const toSign = Array.from(parameters.entries()).map(([key, value]) => `${key}=${value}`).join("&");
    const signature = Array.from(new Uint8Array(await crypto.subtle.digest(
      "SHA-1", new TextEncoder().encode(toSign + apiSecret),
    ))).map(b => b.toString(16).padStart(2, "0")).join("");
    parameters.set("api_key", apiKey);
    parameters.set("signature", signature);
    downloadUrl = new URL(`https://api.cloudinary.com/v1_1/m1gqubzu/${asset[1]}/download`);
    downloadUrl.search = parameters.toString();
  }
  const response = await fetch(downloadUrl, { redirect: "error", signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Legacy provider returned HTTP ${response.status}; record preserved.`);
  }
  if (Number(response.headers.get("content-length")) > maxBytes) {
    await response.body?.cancel();
    throw new Error("Legacy PDF exceeds 5 MB; record preserved.");
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Legacy provider returned no document.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maxBytes) throw new Error("Legacy PDF exceeds 5 MB; record preserved.");
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") {
    throw new Error("Legacy response is not a PDF; record preserved.");
  }
  return bytes;
}

Deno.serve(async request => {
  if (request.method !== "POST") return reply(405, { error: "POST required" });
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const token = request.headers.get("Authorization")?.match(/^Bearer (\S+)$/i)?.[1];
  if (!secret || !token) {
    return reply(403, { error: "Operator access required" });
  }
  // PostgREST verifies the signed token and grants this RPC only to service_role.
  // Dashboard-issued and runtime-issued service JWTs need not be byte-identical.
  const operator = createClient(Deno.env.get("SUPABASE_URL")!, token, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: allowed, error: denied } = await operator.rpc("apna_legacy_migration_operator");
  if (denied || allowed !== true) return reply(403, { error: "Operator access required" });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.commit !== "boolean") return reply(400, { error: "Specify commit: false for inspection or commit: true for migration." });
  const client = createClient(Deno.env.get("SUPABASE_URL")!, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let query = client.from("service_requests").select("application_id,document_url")
    .not("document_url", "is", null).not("document_url", "like", `${prefix}%`)
    .order("application_id").limit(20);
  if (body.applicationId) query = query.eq("application_id", body.applicationId);
  const { data: records, error } = await query;
  if (error) return reply(500, { error: "Could not inspect application records." });
  const results = [];
  for (const record of records || []) {
    try {
      const bytes = await fetchPdf(record.document_url, body.authenticatedSource === true);
      const digest = await hash(bytes);
      if (!body.commit) {
        results.push({ applicationId: record.application_id, status: "ready", bytes: bytes.length });
        continue;
      }
      // Preserve original references in an operator-only ledger before any update.
      const { error: backupError } = await client.from("final_pdf_migration_backups").upsert({
        application_id: record.application_id, source_url: record.document_url, sha256: digest,
      }, { onConflict: "application_id,source_url", ignoreDuplicates: true });
      if (backupError) throw new Error("Could not preserve source reference; record unchanged.");
      const path = `${record.application_id}/legacy-${digest}.pdf`;
      const storage = client.storage.from(bucket);
      const { error: uploadError } = await storage.upload(path, bytes, { contentType: "application/pdf", upsert: false });
      // A retry may find the deterministic object already present: always verify its bytes.
      const { data: stored, error: readError } = await storage.download(path);
      if (readError || !stored || await hash(new Uint8Array(await stored.arrayBuffer())) !== digest) {
        throw new Error(uploadError ? "Storage upload failed; record preserved." : "Storage verification failed; record preserved.");
      }
      const { data: updated, error: updateError } = await client.from("service_requests")
        .update({ document_url: prefix + path }).eq("application_id", record.application_id)
        .eq("document_url", record.document_url).select("application_id").maybeSingle();
      if (updateError || !updated) throw new Error("Application changed or update failed; original reference preserved.");
      results.push({ applicationId: record.application_id, status: "migrated", bytes: bytes.length, verified: true });
    } catch (error) {
      // Do not log or return source URLs, document contents, or credentials.
      const message = error instanceof Error ? error.message : "Migration failed; record preserved.";
      results.push({ applicationId: record.application_id, status: "blocked", error: message.startsWith("Legacy") || message.startsWith("Storage") || message.startsWith("Could not") || message.startsWith("Application") || message.startsWith("Unsupported") ? message : "Provider request failed; record preserved." });
    }
  }
  return reply(200, { commit: body.commit, results });
});
