import { useState } from 'react'
import { useBoardDispatch } from '../store.jsx'

export default function AddCardForm({ columnId }) {
  const dispatch = useBoardDispatch()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    dispatch({
      type: 'ADD_CARD',
      payload: { title: title.trim(), priority, column: columnId },
    })
    setTitle('')
    setPriority('medium')
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full text-left text-sm text-gray-400 hover:text-gray-600 py-1 px-2 rounded hover:bg-gray-100 transition-colors"
      >
        + Add a card
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
        placeholder="Card title..."
        className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="w-full text-xs border border-gray-300 rounded px-2 py-1 text-gray-600"
      >
        <option value="low">Low priority</option>
        <option value="medium">Medium priority</option>
        <option value="high">High priority</option>
        <option value="critical">Critical priority</option>
      </select>
      <div className="flex gap-2">
        <button
          type="submit"
          className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
