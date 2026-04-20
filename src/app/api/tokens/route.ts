import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { generatePAT } from "@/lib/pat";

// GET /api/tokens — list user's active tokens
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile)
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: tokens } = await supabase
    .from("personal_access_tokens")
    .select(
      "id, name, token_prefix, last_used_at, expires_at, revoked_at, created_at"
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(tokens ?? []);
}

// POST /api/tokens — create a new PAT (returns raw token once)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name =
    (typeof body.name === "string" ? body.name.trim() : "") || "API Token";

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile)
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { count } = await supabase
    .from("personal_access_tokens")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .is("revoked_at", null);

  if ((count ?? 0) >= 10) {
    return NextResponse.json(
      { error: "Maximum 10 active tokens per user" },
      { status: 429 }
    );
  }

  const { token, hash, prefix } = await generatePAT();

  const { error } = await supabase.from("personal_access_tokens").insert({
    user_id: profile.id,
    name,
    token_hash: hash,
    token_prefix: prefix,
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ token, prefix, name }, { status: 201 });
}

// DELETE /api/tokens — revoke a token
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const tokenId = body.id;
  if (!tokenId)
    return NextResponse.json(
      { error: "Token ID required" },
      { status: 400 }
    );

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile)
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { error } = await supabase
    .from("personal_access_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", tokenId)
    .eq("user_id", profile.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
