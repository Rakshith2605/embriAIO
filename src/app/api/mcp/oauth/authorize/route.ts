import { createServiceClient } from "@/lib/supabase";
import { hashPAT } from "@/lib/pat";

export async function POST(request: Request) {
  const body = await request.json();
  const { pat, client_id, redirect_uri, state, code_challenge } = body;

  if (!pat || !redirect_uri) {
    return Response.json(
      { error: "PAT and redirect_uri are required" },
      { status: 400 }
    );
  }

  // Validate the PAT
  const hash = await hashPAT(pat);
  const supabase = createServiceClient();

  const { data: token } = await supabase
    .from("personal_access_tokens")
    .select("id, user_id, expires_at")
    .eq("token_hash", hash)
    .is("revoked_at", null)
    .single();

  if (!token) {
    return Response.json(
      { error: "Invalid or revoked token" },
      { status: 400 }
    );
  }

  if (token.expires_at && new Date(token.expires_at) < new Date()) {
    return Response.json({ error: "Token has expired" }, { status: 400 });
  }

  // Generate a cryptographic authorization code
  const codeBytes = new Uint8Array(32);
  crypto.getRandomValues(codeBytes);
  const code = Array.from(codeBytes, (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");

  const { error } = await supabase.from("mcp_oauth_codes").insert({
    code,
    client_id: client_id ?? "",
    redirect_uri,
    code_challenge: code_challenge ?? null,
    token_value: pat,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min
  });

  if (error) {
    return Response.json(
      { error: "Failed to create authorization code" },
      { status: 500 }
    );
  }

  const url = new URL(redirect_uri);
  url.searchParams.set("code", code);
  if (state) url.searchParams.set("state", state);

  return Response.json({ redirect_url: url.toString() });
}
