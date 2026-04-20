/**
 * PAT (Personal Access Token) utilities using Web Crypto API (Edge-compatible).
 */

export async function generatePAT(): Promise<{
  token: string;
  hash: string;
  prefix: string;
}> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    ""
  );
  const token = `pat_${hex}`;
  const hash = await hashPAT(token);
  const prefix = token.slice(0, 12); // "pat_" + 8 hex chars
  return { token, hash, prefix };
}

export async function hashPAT(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}
