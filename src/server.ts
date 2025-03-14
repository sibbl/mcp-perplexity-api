import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { startSSEServer } from "mcp-proxy";

export type ServerConfig = {
  transport: "stdio" | "sse";
  endpoint: string;
  port: number;
  authentication: {
    headerKey: string;
    headerValue?: string;
  };
};

export async function startServer(server: McpServer, config: ServerConfig) {
  if (config.transport === "stdio") {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("Perplexity Ask MCP Server running on stdio");
  } else if (config.transport === "sse") {
    await startSSEServer({
      endpoint: config.endpoint,
      port: config.port,
      createServer: async (req) => {
        if (
          config.authentication.headerKey &&
          config.authentication.headerValue
        ) {
          const headerValue =
            req.headers[config.authentication.headerKey.toLowerCase()];
          if (headerValue !== config.authentication.headerValue) {
            throw new Response(null, {
              status: 401,
              statusText: "Unauthorized"
            });
          }
        }
        return server;
      },
      onConnect: () => {
        console.log("Client connected");
      },
      onClose: () => {
        console.log("Client disconnected");
      }
    });

    console.log(
      `Server started on ${config.port} with endpoint ${config.endpoint}`
    );
  } else {
    throw new Error("Invalid mode. Use 'stdio' or 'sse'.");
  }
}
