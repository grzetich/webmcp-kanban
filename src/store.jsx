import { createContext, useContext, useEffect, useReducer } from 'react'

const STORAGE_KEY = 'webmcp-kanban-board'

const SEED_CARDS = [
  {
    id: 'seed-1',
    title: 'Research WebMCP specification',
    description: 'Read the W3C draft community group report and understand the navigator.modelContext API surface.',
    priority: 'high',
    labels: ['research', 'webmcp'],
    column: 'done',
    createdAt: '2026-02-08T10:00:00.000Z',
  },
  {
    id: 'seed-2',
    title: 'Set up React + Vite project',
    description: 'Initialize the project with React 18, Vite, and Tailwind CSS.',
    priority: 'high',
    labels: ['setup'],
    column: 'done',
    createdAt: '2026-02-09T09:00:00.000Z',
  },
  {
    id: 'seed-3',
    title: 'Implement board state management',
    description: 'Create React Context + useReducer store with localStorage persistence.',
    priority: 'critical',
    labels: ['core', 'state'],
    column: 'in-progress',
    createdAt: '2026-02-10T08:00:00.000Z',
  },
  {
    id: 'seed-4',
    title: 'Register WebMCP tools',
    description: 'Wire up all 8 tools using useWebMCP hooks with Zod schemas.',
    priority: 'critical',
    labels: ['webmcp', 'core'],
    column: 'in-progress',
    createdAt: '2026-02-10T11:00:00.000Z',
  },
  {
    id: 'seed-5',
    title: 'Add drag-and-drop between columns',
    description: 'Implement native HTML5 DnD with visual feedback on drag over.',
    priority: 'high',
    labels: ['ux', 'dnd'],
    column: 'todo',
    createdAt: '2026-02-11T10:00:00.000Z',
  },
  {
    id: 'seed-6',
    title: 'Write blog posts',
    description: 'Three blog posts explaining WebMCP, the implementation, and comparison with traditional MCP.',
    priority: 'medium',
    labels: ['docs', 'blog'],
    column: 'todo',
    createdAt: '2026-02-11T14:00:00.000Z',
  },
  {
    id: 'seed-7',
    title: 'Add card editing UI',
    description: 'Click on a card to open an edit modal with title, description, priority, and labels fields.',
    priority: 'low',
    labels: ['ux'],
    column: 'backlog',
    createdAt: '2026-02-12T09:00:00.000Z',
  },
  {
    id: 'seed-8',
    title: 'Mobile responsive layout',
    description: 'Make the board scroll horizontally on small screens.',
    priority: 'low',
    labels: ['ux', 'responsive'],
    column: 'backlog',
    createdAt: '2026-02-12T10:00:00.000Z',
  },
]

const INITIAL_STATE = {
  columns: ['backlog', 'todo', 'in-progress', 'done'],
  columnMeta: {
    backlog: { title: 'Backlog', color: '#6B7280' },
    todo: { title: 'To Do', color: '#3B82F6' },
    'in-progress': { title: 'In Progress', color: '#F59E0B' },
    done: { title: 'Done', color: '#10B981' },
  },
  cards: SEED_CARDS,
}

function boardReducer(state, action) {
  switch (action.type) {
    case 'LOAD_BOARD':
      return { ...state, cards: action.payload.cards }

    case 'ADD_CARD': {
      const newCard = {
        id: action.payload.id || crypto.randomUUID(),
        title: action.payload.title,
        description: action.payload.description || '',
        priority: action.payload.priority || 'medium',
        labels: action.payload.labels || [],
        column: action.payload.column || 'backlog',
        createdAt: new Date().toISOString(),
      }
      return { ...state, cards: [...state.cards, newCard] }
    }

    case 'MOVE_CARD': {
      const { cardId, toColumn } = action.payload
      return {
        ...state,
        cards: state.cards.map(card =>
          card.id === cardId ? { ...card, column: toColumn } : card
        ),
      }
    }

    case 'UPDATE_CARD': {
      const { cardId, updates } = action.payload
      return {
        ...state,
        cards: state.cards.map(card =>
          card.id === cardId ? { ...card, ...updates } : card
        ),
      }
    }

    case 'DELETE_CARD':
      return {
        ...state,
        cards: state.cards.filter(card => card.id !== action.payload.cardId),
      }

    case 'ADD_LABEL': {
      const { cardId, label } = action.payload
      return {
        ...state,
        cards: state.cards.map(card => {
          if (card.id !== cardId) return card
          if (card.labels.includes(label)) return card
          return { ...card, labels: [...card.labels, label] }
        }),
      }
    }

    case 'REORDER_COLUMN': {
      const { column, cardIds } = action.payload
      const otherCards = state.cards.filter(c => c.column !== column)
      const reorderedCards = cardIds
        .map(id => state.cards.find(c => c.id === id))
        .filter(Boolean)
      return { ...state, cards: [...otherCards, ...reorderedCards] }
    }

    default:
      return state
  }
}

const BoardContext = createContext(null)
const BoardDispatchContext = createContext(null)

export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, INITIAL_STATE, (initial) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const cards = JSON.parse(saved)
        if (Array.isArray(cards) && cards.length > 0) {
          return { ...initial, cards }
        }
      }
    } catch {
      // Ignore parse errors, use seed data
    }
    return initial
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cards))
  }, [state.cards])

  return (
    <BoardContext.Provider value={state}>
      <BoardDispatchContext.Provider value={dispatch}>
        {children}
      </BoardDispatchContext.Provider>
    </BoardContext.Provider>
  )
}

export function useBoardState() {
  return useContext(BoardContext)
}

export function useBoardDispatch() {
  return useContext(BoardDispatchContext)
}
