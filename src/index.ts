import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { performChatCompletion } from "./perplexity-api.js";
import dotenv from "dotenv";
import { ServerConfig, startServer } from "./server.js";
dotenv.config();

const server = new McpServer({
  name: "Perplexity MCP Server",
  version: "0.1.0"
});

const config = {
  perplexity: {
    apiKey: process.env.MCP_PERPLEXITY_API_KEY,
    defaultModel: process.env.MCP_PERPLEXITY_DEFAULT_MODEL ?? "sonar-pro",
    models:
      process.env.MCP_PERPLEXITY_MODELS?.split(",") ??
      (["sonar", "sonar-pro"] as const),
    toolDescriptionSuffix: process.env.MCP_PERPLEXITY_TOOL_DESCRIPTION_SUFFIX
  },
  server: {
    transport:
      (process.env.MCP_TRANSPORT as ServerConfig["transport"] | undefined) ??
      "stdio",
    endpoint: process.env.MCP_SSE_ENDPOINT ?? "/sse",
    port: Number(process.env.MCP_SSE_PORT ?? "8080"),
    authentication: {
      headerKey: process.env.MCP_SSE_AUTH_HEADER_KEY ?? "authorization",
      headerValue: process.env.MCP_SSE_AUTH_HEADER_VALUE
    }
  } satisfies ServerConfig
};

if (!config.perplexity.apiKey) {
  throw new Error("Missing MCP_PERPLEXITY_API_KEY environment variable");
}

if (config.perplexity.models.length === 0) {
  throw new Error(
    "No models specified in MCP_PERPLEXITY_MODELS environment variable"
  );
}

let toolDescription =
  "Engages in a conversation using the Sonar API. Accepts an array of messages (each with a role and content) and returns a ask completion response from the Perplexity model.";
if (config.perplexity.toolDescriptionSuffix) {
  toolDescription += `\n${config.perplexity.toolDescriptionSuffix}`;
}

server.tool(
  "ask_perplexity",
  toolDescription,
  {
    messages: z
      .array(
        z.object({
          role: z
            .enum(["user", "assistant", "system"])
            .describe("Role of the message (e.g., system, user, assistant)"),
          content: z.string().describe("Content of the message")
        })
      )
      .min(1)
      .describe("Array of conversation messages"),
    model: z
      .enum([config.perplexity.models[0], ...config.perplexity.models.slice(0)])
      .default(config.perplexity.defaultModel)
      .describe("Perplexity model to use.")
  },
  async ({ messages, model }) => {
    if (!config.perplexity.apiKey) {
      return {
        content: [
          {
            type: "text",
            text: "Perplexity API key is not set."
          }
        ],
        isError: true
      };
    }
    const result = await performChatCompletion(
      config.perplexity.apiKey,
      model,
      messages.map((msg) => ({
        role: msg.role,
        content: msg.content || ""
      }))
    );
    return {
      content: [{ type: "text", text: result }],
      isError: false
    };
  }
);

await startServer(server, config.server);
