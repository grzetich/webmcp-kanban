import { useEffect, useRef } from 'react'
import { useWebMCP } from '@mcp-b/react-webmcp'
import { z } from 'zod'
import { useBoardState, useBoardDispatch } from '../store.jsx'

const COLUMNS = ['backlog', 'todo', 'in-progress', 'done']
const columnEnum = z.enum(['backlog', 'todo', 'in-progress', 'done'])
const priorityEnum = z.enum(['low', 'medium', 'high', 'critical'])

export default function WebMCPTools() {
  const state = useBoardState()
  const dispatch = useBoardDispatch()

  // Keep a ref to the latest state so async handlers always read current data.
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Tool 1: get_board
  useWebMCP({
    name: 'get_board',
    description:
      'Get the full kanban board state including all columns and all cards with their titles, descriptions, priorities, labels, and column assignments.',
    handler: async () => {
      const s = stateRef.current
      const columns = s.columns.map(colId => ({
        column: colId,
        title: s.columnMeta[colId].title,
        cardCount: s.cards.filter(c => c.column === colId).length,
        cards: s.cards
          .filter(c => c.column === colId)
          .map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            priority: c.priority,
            labels: c.labels,
            createdAt: c.createdAt,
          })),
      }))
      return { columns, totalCards: s.cards.length }
    },
  })

  // Tool 2: create_card
  useWebMCP({
    name: 'create_card',
    description:
      'Create a new card on the kanban board in a specified column. Returns the created card with its generated ID.',
    inputSchema: {
      title: z.string().min(1).describe('Card title (required)'),
      description: z.string().optional().describe('Card description'),
      priority: priorityEnum.default('medium').describe('Card priority level'),
      labels: z.array(z.string()).optional().describe('Array of label strings'),
      column: columnEnum.default('backlog').describe('Column to place the card in'),
    },
    handler: async ({ title, description, priority, labels, column }) => {
      const id = crypto.randomUUID()
      const newCard = {
        id,
        title,
        description: description || '',
        priority: priority || 'medium',
        labels: labels || [],
        column: column || 'backlog',
      }
      dispatch({ type: 'ADD_CARD', payload: newCard })
      return { success: true, card: { ...newCard, createdAt: new Date().toISOString() } }
    },
  })

  // Tool 3: move_card
  useWebMCP({
    name: 'move_card',
    description:
      'Move a card from its current column to a different column on the kanban board.',
    inputSchema: {
      cardId: z.string().min(1).describe('The ID of the card to move'),
      toColumn: columnEnum.describe('Target column to move the card to'),
    },
    handler: async ({ cardId, toColumn }) => {
      const card = stateRef.current.cards.find(c => c.id === cardId)
      if (!card) return { success: false, error: `Card "${cardId}" not found` }
      if (card.column === toColumn) return { success: false, error: `Card is already in "${toColumn}"` }
      const fromColumn = card.column
      dispatch({ type: 'MOVE_CARD', payload: { cardId, toColumn } })
      return { success: true, cardId, fromColumn, toColumn }
    },
  })

  // Tool 4: update_card
  useWebMCP({
    name: 'update_card',
    description:
      'Update one or more fields of an existing card (title, description, priority, or labels).',
    inputSchema: {
      cardId: z.string().min(1).describe('The ID of the card to update'),
      title: z.string().min(1).optional().describe('New card title'),
      description: z.string().optional().describe('New card description'),
      priority: priorityEnum.optional().describe('New priority level'),
      labels: z.array(z.string()).optional().describe('Replace the entire labels array'),
    },
    handler: async ({ cardId, title, description, priority, labels }) => {
      const card = stateRef.current.cards.find(c => c.id === cardId)
      if (!card) return { success: false, error: `Card "${cardId}" not found` }
      const updates = {}
      if (title !== undefined) updates.title = title
      if (description !== undefined) updates.description = description
      if (priority !== undefined) updates.priority = priority
      if (labels !== undefined) updates.labels = labels
      dispatch({ type: 'UPDATE_CARD', payload: { cardId, updates } })
      return { success: true, cardId, updatedFields: Object.keys(updates) }
    },
  })

  // Tool 5: delete_card
  useWebMCP({
    name: 'delete_card',
    description: 'Permanently delete a card from the kanban board.',
    inputSchema: {
      cardId: z.string().min(1).describe('The ID of the card to delete'),
    },
    handler: async ({ cardId }) => {
      const card = stateRef.current.cards.find(c => c.id === cardId)
      if (!card) return { success: false, error: `Card "${cardId}" not found` }
      dispatch({ type: 'DELETE_CARD', payload: { cardId } })
      return { success: true, deletedCard: { id: card.id, title: card.title, column: card.column } }
    },
  })

  // Tool 6: add_label
  useWebMCP({
    name: 'add_label',
    description: 'Add a label to an existing card. Duplicate labels are ignored.',
    inputSchema: {
      cardId: z.string().min(1).describe('The ID of the card'),
      label: z.string().min(1).describe('The label text to add'),
    },
    handler: async ({ cardId, label }) => {
      const card = stateRef.current.cards.find(c => c.id === cardId)
      if (!card) return { success: false, error: `Card "${cardId}" not found` }
      if (card.labels.includes(label)) {
        return { success: true, alreadyExists: true, cardId, label }
      }
      dispatch({ type: 'ADD_LABEL', payload: { cardId, label } })
      return { success: true, cardId, label, newLabelCount: card.labels.length + 1 }
    },
  })

  // Tool 7: get_column_summary
  useWebMCP({
    name: 'get_column_summary',
    description:
      'Get a summary of a specific column including card count, priority breakdown, and list of card titles.',
    inputSchema: {
      column: columnEnum.describe('Column to summarize'),
    },
    handler: async ({ column }) => {
      const s = stateRef.current
      const cards = s.cards.filter(c => c.column === column)
      const meta = s.columnMeta[column]
      const priorities = { low: 0, medium: 0, high: 0, critical: 0 }
      cards.forEach(c => {
        priorities[c.priority]++
      })
      const allLabels = [...new Set(cards.flatMap(c => c.labels))]
      return {
        column,
        title: meta.title,
        cardCount: cards.length,
        priorities,
        labels: allLabels,
        cards: cards.map(c => ({ id: c.id, title: c.title, priority: c.priority })),
      }
    },
  })

  // Tool 8: prioritize_column
  useWebMCP({
    name: 'prioritize_column',
    description:
      'Reorder cards within a column by priority (critical first, then high, medium, low).',
    inputSchema: {
      column: columnEnum.describe('Column to reorder'),
    },
    handler: async ({ column }) => {
      const cards = stateRef.current.cards.filter(c => c.column === column)
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const sorted = [...cards].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      )
      const cardIds = sorted.map(c => c.id)
      dispatch({ type: 'REORDER_COLUMN', payload: { column, cardIds } })
      return {
        success: true,
        column,
        newOrder: sorted.map(c => ({ id: c.id, title: c.title, priority: c.priority })),
      }
    },
  })

  return null
}
