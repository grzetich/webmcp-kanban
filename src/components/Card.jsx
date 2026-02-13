import { useState } from 'react'

const PRIORITY_STYLES = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
}

export default function Card({ card }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', card.id)
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => setIsDragging(true), 0)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[card.priority]}`}
        >
          {card.priority}
        </span>
      </div>

      <h3 className="text-sm font-medium text-gray-900 mb-1">{card.title}</h3>

      {card.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
          {card.description}
        </p>
      )}

      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.labels.map(label => (
            <span
              key={label}
              className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
