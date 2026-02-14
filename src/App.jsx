import { useState, useRef, useEffect } from 'react'
import { BoardProvider } from './store.jsx'
import Board from './components/Board.jsx'
import WebMCPTools from './components/WebMCPTools.jsx'

function ConnectDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
      >
        Connect to Claude
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4 text-sm text-gray-700">
          <h3 className="font-semibold text-gray-900 mb-2">Claude Desktop</h3>
          <p className="mb-2">Add this MCP server to your <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">claude_desktop_config.json</code>:</p>
          <pre className="bg-gray-50 border border-gray-200 rounded p-2 text-xs overflow-x-auto mb-3 whitespace-pre">{`{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "@mcp-b/chrome-devtools-mcp@latest",
        "--channel", "stable"
      ]
    }
  }
}`}</pre>
          <p className="mb-1 text-xs text-gray-500">Then restart Claude Desktop. Use <code className="bg-gray-100 px-1 py-0.5 rounded">canary</code> or <code className="bg-gray-100 px-1 py-0.5 rounded">beta</code> instead of <code className="bg-gray-100 px-1 py-0.5 rounded">stable</code> if preferred.</p>

          <hr className="my-3 border-gray-200" />

          <h3 className="font-semibold text-gray-900 mb-2">Claude Code</h3>
          <pre className="bg-gray-50 border border-gray-200 rounded p-2 text-xs overflow-x-auto mb-3 whitespace-pre">claude mcp add chrome-devtools -- \
  npx @mcp-b/chrome-devtools-mcp@latest</pre>

          <a href="https://grzeti.ch/blog/webmcp-kanban.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
            Full walkthrough &rarr;
          </a>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <BoardProvider>
      <WebMCPTools />
      <div className="min-h-screen">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">WebMCP Kanban Board</h1>
              <p className="text-sm text-gray-500">AI agents can manage this board via WebMCP tools</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                WebMCP Active
              </span>
              <ConnectDropdown />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Board />
        </main>
      </div>
    </BoardProvider>
  )
}

export default App
