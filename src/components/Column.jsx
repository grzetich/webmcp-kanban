import { useState } from 'react'
import { useBoardDispatch } from '../store.jsx'
import Card from './Card.jsx'
import AddCardForm from './AddCardForm.jsx'

export default function Column({ id, title, color, cards }) {
  const dispatch = useBoardDispatch()
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const cardId = e.dataTransfer.getData('text/plain')
    if (cardId) {
      dispatch({ type: 'MOVE_CARD', payload: { cardId, toColumn: id } })
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-lg border-2 transition-colors flex flex-col ${
        isDragOver
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="px-3 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <h2 className="font-semibold text-sm text-gray-700">{title}</h2>
        </div>
        <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
          {cards.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {cards.map(card => (
          <Card key={card.id} card={card} />
        ))}
      </div>

      <div className="p-2 border-t border-gray-200">
        <AddCardForm columnId={id} />
      </div>
    </div>
  )
}
