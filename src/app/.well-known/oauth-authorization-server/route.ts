export function GET() {
  return Response.json({
    issuer: "https://emraio.com",
    authorization_endpoint: "https://emraio.com/oauth/authorize",
    token_endpoint: "https://emraio.com/oauth/token",
    registration_endpoint: "https://emraio.com/oauth/register",
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
  });
}
