import { createServiceClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let params: Record<string, string> = {};

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    for (const [k, v] of new URLSearchParams(text)) params[k] = v;
  } else {
    params = await request.json();
  }

  const { grant_type, code, code_verifier } = params;

  if (grant_type !== "authorization_code" || !code) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: authCode } = await supabase
    .from("mcp_oauth_codes")
    .select("*")
    .eq("code", code)
    .eq("used", false)
    .single();

  if (!authCode) {
    return Response.json({ error: "invalid_grant" }, { status: 400 });
  }

  if (new Date(authCode.expires_at) < new Date()) {
    return Response.json(
      { error: "invalid_grant", error_description: "Code expired" },
      { status: 400 }
    );
  }

  // PKCE S256 verification
  if (authCode.code_challenge && code_verifier) {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(code_verifier)
    );
    const expected = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    if (expected !== authCode.code_challenge) {
      return Response.json(
        {
          error: "invalid_grant",
          error_description: "PKCE verification failed",
        },
        { status: 400 }
      );
    }
  }

  // Mark code as used
  await supabase
    .from("mcp_oauth_codes")
    .update({ used: true })
    .eq("id", authCode.id);

  return Response.json({
    access_token: authCode.token_value,
    token_type: "bearer",
  });
}
