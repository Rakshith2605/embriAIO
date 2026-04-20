-- ============================================================
-- Personal Access Tokens + OAuth shim tables
-- ============================================================

CREATE TABLE IF NOT EXISTS public.personal_access_tokens (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         text NOT NULL,
  token_hash   text UNIQUE NOT NULL,
  token_prefix text NOT NULL,
  last_used_at timestamptz,
  expires_at   timestamptz,
  revoked_at   timestamptz,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pat_token_hash ON public.personal_access_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_pat_user_id    ON public.personal_access_tokens(user_id);

-- OAuth client registrations (for Claude connector)
CREATE TABLE IF NOT EXISTS public.mcp_oauth_clients (
  client_id     text PRIMARY KEY,
  client_name   text,
  redirect_uris text[] NOT NULL DEFAULT '{}',
  created_at    timestamptz DEFAULT now()
);

-- OAuth authorization codes (short-lived, single-use)
CREATE TABLE IF NOT EXISTS public.mcp_oauth_codes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code           text UNIQUE NOT NULL,
  client_id      text NOT NULL,
  redirect_uri   text NOT NULL,
  code_challenge text,
  token_value    text NOT NULL,
  expires_at     timestamptz NOT NULL,
  used           boolean DEFAULT false,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oauth_codes_code ON public.mcp_oauth_codes(code);
