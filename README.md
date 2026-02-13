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
      "args": ["-y", "@mcp-b/chrome-devtools-mcp@latest", "--channel", "stable"]
    }
  }
}
```

> **Note:** The `--channel stable` flag tells the MCP server to use your regular Chrome installation. Without it, the server looks for Chrome Dev channel, which most people don't have installed. If you use Chrome Canary or Beta, replace `stable` with `canary` or `beta`.

Restart Claude Desktop after editing the config.

### Workflow

1. Run `npm run dev` to start the kanban board (or use the [live deployment](https://webmcp-kanban.vercel.app))
2. Open Claude Desktop and ask it to navigate to your kanban board URL
3. Ask Claude to interact with the board

**Important:** The MCP server launches and controls its own Chrome window. This is the window where you'll see the board and watch cards appear in real time. If you have Chrome already open, the MCP-controlled window will be a separate instance — make sure you're watching that window, not your regular browser.

To start, tell Claude:

> "Navigate to http://localhost:5174 and list the WebMCP tools"

Claude will call `list_webmcp_tools` and discover all 8 kanban tools. Then you can ask it to interact with the board naturally.

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

## Blog Post

[Building a WebMCP Kanban Board: Browser-Native AI Integration With Zero Backend](https://grzeti.ch/blog/webmcp-kanban.html)

## Credits

Drag-and-drop implementation adapted from patterns described by [surajon.dev](https://www.surajon.dev/building-a-kanban-board-with-drag-and-drop-in-react).
