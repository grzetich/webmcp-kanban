# WebMCP Kanban Board

A pure client-side React kanban board with 8 AI-callable tools registered via [WebMCP](https://github.com/webmachinelearning/webmcp) (`navigator.modelContext`). No backend. All state in React Context + localStorage. AI agents can create cards, move them between columns, add labels, and reorder by priority — with every change visible on screen instantly.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5174. The board loads with seed cards across four columns (Backlog, To Do, In Progress, Done). Drag cards between columns, add new cards via the form at the bottom of each column.

## Connecting Claude

The Chrome DevTools MCP server bridges Claude to the WebMCP tools registered on the page. It connects to Chrome via the DevTools Protocol, discovers your tools through `navigator.modelContext`, and exposes them as standard MCP tools.

### Claude Code

```bash
claude mcp add chrome-devtools npx @mcp-b/chrome-devtools-mcp@latest
```

Or, if you're working inside the `webmcp-kanban/` directory, the `.claude/settings.json` file pre-configures this automatically.

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@mcp-b/chrome-devtools-mcp@latest"]
    }
  }
}
```

### Workflow

1. Run `npm run dev` to start the kanban board
2. Open http://localhost:5174 in Chrome
3. Ask Claude to interact with the board

Claude uses two bridge tools to reach your app:

- **`list_webmcp_tools`** — discovers all 8 kanban tools on the page
- **`call_webmcp_tool`** — invokes a tool by name with arguments

Example conversation:

> "Read the kanban board and create three bug cards in the To Do column, then prioritize that column."

Claude will call `get_board` to read the current state, `create_card` three times, then `prioritize_column` — and you'll see every card appear on screen in real time.

## Tools Reference

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_board` | Returns all columns and cards with their positions, priorities, and labels | None |
| `create_card` | Creates a new card in a specified column | `title` (required), `description`, `priority`, `labels`, `column` |
| `move_card` | Moves a card to a different column | `cardId`, `toColumn` |
| `update_card` | Updates a card's title, description, priority, or labels | `cardId`, plus any fields to update |
| `delete_card` | Removes a card from the board | `cardId` |
| `add_label` | Adds a label to an existing card (duplicates ignored) | `cardId`, `label` |
| `get_column_summary` | Returns a column's card count, priority breakdown, and card list | `column` |
| `prioritize_column` | Reorders cards within a column by priority (critical first) | `column` |

## Architecture

```
Claude Code/Desktop
    |
    | stdio (JSON-RPC)
    v
Chrome DevTools MCP Server (@mcp-b/chrome-devtools-mcp)
    |
    | Chrome DevTools Protocol (CDP)
    v
Chrome Browser Tab (http://localhost:5174)
    |
    | navigator.modelContext (WebMCP)
    v
React App (useWebMCP hooks -> dispatch -> React state -> UI)
    |
    | useEffect
    v
localStorage (persistence)
```

The AI agent and the user operate on the same React state. When Claude creates a card, the user sees it instantly. When the user drags a card, Claude's next `get_board` call reflects the change. No sync protocol, no polling, no WebSocket — one state, two actors.

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Native HTML5 Drag and Drop
- [@mcp-b/global](https://www.npmjs.com/package/@mcp-b/global) (WebMCP polyfill)
- [@mcp-b/react-webmcp](https://www.npmjs.com/package/@mcp-b/react-webmcp) (useWebMCP hook + Zod schemas)
- [zod](https://www.npmjs.com/package/zod) (tool parameter validation)

## Blog Series

1. [Why a Kanban Board is the Perfect WebMCP Demo](./docs/blog-webmcp-kanban-why.md)
2. [Building a WebMCP Kanban Board: From React State to AI-Callable Tools](./docs/blog-webmcp-kanban-implementation.md)
3. [What This Would Look Like With Traditional MCP](./docs/blog-webmcp-kanban-vs-traditional.md)
4. [Connecting Claude to Your WebMCP App via Chrome DevTools MCP](./docs/blog-webmcp-kanban-bridge.md)

## Credits

Drag-and-drop implementation adapted from patterns described by [surajon.dev](https://www.surajon.dev/building-a-kanban-board-with-drag-and-drop-in-react).
