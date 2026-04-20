import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client that bypasses RLS.
 * Alias for createServiceClient — use in MCP server context.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
