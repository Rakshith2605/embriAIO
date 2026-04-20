import { hashPAT } from "@/lib/pat";
import { createServiceClient } from "@/lib/supabase";

export async function validatePAT(
  request: Request
): Promise<{ userId: string } | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  if (!token.startsWith("pat_")) return null;

  const hash = await hashPAT(token);
  const supabase = createServiceClient();

  const { data: pat } = await supabase
    .from("personal_access_tokens")
    .select("id, user_id, expires_at")
    .eq("token_hash", hash)
    .is("revoked_at", null)
    .single();

  if (!pat) return null;
  if (pat.expires_at && new Date(pat.expires_at) < new Date()) return null;

  // Fire-and-forget last_used_at update
  supabase
    .from("personal_access_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", pat.id)
    .then(() => {});

  return { userId: pat.user_id };
}
