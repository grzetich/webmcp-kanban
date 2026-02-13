import { BoardProvider } from './store.jsx'
import Board from './components/Board.jsx'
import WebMCPTools from './components/WebMCPTools.jsx'

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
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              WebMCP Active
            </span>
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
