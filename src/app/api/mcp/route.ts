import { validatePAT } from "@/lib/mcp/auth";
import { handleToolCall, TOOL_DEFINITIONS } from "@/lib/mcp/tools";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string };
}

function rpcError(
  id: string | number,
  code: number,
  message: string
): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function rpcResult(id: string | number, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

export async function POST(request: Request) {
  let body: JsonRpcRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json(rpcError(0, -32700, "Parse error"), { status: 400 });
  }

  if (body.jsonrpc !== "2.0" || !body.method) {
    return Response.json(rpcError(body.id ?? 0, -32600, "Invalid request"), {
      status: 400,
    });
  }

  const { id, method, params } = body;

  if (method === "initialize") {
    return Response.json(
      rpcResult(id, {
        protocolVersion: "2024-11-05",
        serverInfo: { name: "embriAIo", version: "1.0.0" },
        capabilities: { tools: {} },
      })
    );
  }

  if (method === "tools/list") {
    return Response.json(rpcResult(id, { tools: TOOL_DEFINITIONS }));
  }

  if (method === "tools/call") {
    const auth = await validatePAT(request);
    if (!auth) {
      return Response.json(
        rpcError(id, -32001, "Unauthorized: invalid or missing PAT"),
        { status: 401 }
      );
    }

    const toolName = (params as { name?: string })?.name;
    const toolArgs =
      (params as { arguments?: Record<string, unknown> })?.arguments ?? {};

    if (!toolName) {
      return Response.json(rpcError(id, -32602, "Missing tool name"), {
        status: 400,
      });
    }

    try {
      const result = await handleToolCall(toolName, toolArgs, auth.userId);
      return Response.json(rpcResult(id, result));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Tool execution failed";
      return Response.json(
        rpcResult(id, {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        })
      );
    }
  }

  return Response.json(rpcError(id, -32601, `Method not found: ${method}`), {
    status: 404,
  });
}

export async function GET() {
  return Response.json({
    name: "embriAIo MCP Server",
    version: "1.0.0",
    description: "MCP server for embriAIo learning platform",
  });
}
