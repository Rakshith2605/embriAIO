export function GET() {
  return Response.json({
    resource: "https://emraio.com/api/mcp",
    authorization_servers: ["https://emraio.com"],
  });
}
