import { useBoardState } from '../store.jsx'
import Column from './Column.jsx'

export default function Board() {
  const { columns, columnMeta, cards } = useBoardState()

  return (
    <div className="grid grid-cols-4 gap-4 min-h-[calc(100vh-120px)]">
      {columns.map(columnId => (
        <Column
          key={columnId}
          id={columnId}
          title={columnMeta[columnId].title}
          color={columnMeta[columnId].color}
          cards={cards.filter(c => c.column === columnId)}
        />
      ))}
    </div>
  )
}
