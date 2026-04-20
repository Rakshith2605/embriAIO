import { createServiceClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();
  const { client_name, redirect_uris } = body;

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const clientId = Array.from(bytes, (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");

  const supabase = createServiceClient();
  const { error } = await supabase.from("mcp_oauth_clients").insert({
    client_id: clientId,
    client_name: client_name ?? "Unknown",
    redirect_uris: redirect_uris ?? [],
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(
    {
      client_id: clientId,
      client_name: client_name ?? "Unknown",
      redirect_uris: redirect_uris ?? [],
    },
    { status: 201 }
  );
}
