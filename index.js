const fs = require("fs");
const path = require("path");
const os = require("os");

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

// Create snippets directory
const snippetsDir = path.join(os.homedir(), "snippets");

if (!fs.existsSync(snippetsDir)) {
  fs.mkdirSync(snippetsDir, { recursive: true });
}

// Create server
const server = new Server(
  {
    name: "my-first-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// LIST TOOLS
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "save_snippet",
        description: "Save a code snippet to a file",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            language: { type: "string" },
            code: { type: "string" },
          },
          required: ["name", "language", "code"],
        },
      },
    ],
  };
});

// HANDLE TOOL EXECUTION
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "save_snippet") {
    const { name, language, code } = request.params.arguments;

    const extension =
      language === "javascript"
        ? "js"
        : language === "python"
        ? "py"
        : language === "html"
        ? "html"
        : language === "css"
        ? "css"
        : "txt";

    const filePath = path.join(snippetsDir, `${name}.${extension}`);

    fs.writeFileSync(filePath, code);

    return {
      content: [
        {
          type: "text",
          text: `Snippet saved to ${filePath}`,
        },
      ],
    };
  }
});

// START SERVER
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
