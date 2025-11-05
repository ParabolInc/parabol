import {useEffect, useState} from 'react'
import * as Y from 'yjs'
import {ColumnId, RowId} from './data'

export const useYArray = <T>(yarray: Y.Array<T>) => {
  if (!yarray) throw new Error('yarray is undefined')
  const [items, setItems] = useState<T[]>(yarray.toArray())

  useEffect(() => {
    const updateItems = (yarray: Y.Array<T>) => {
      setItems(yarray.toArray())
    }

    const observeArray = (event: Y.YArrayEvent<T>) => {
      updateItems(event.target)
    }

    yarray.observe(observeArray)
    updateItems(yarray)

    return () => {
      yarray.unobserve(observeArray)
    }
  }, [yarray])

  return items
}

export const useYText = (ytext: Y.Text) => {
  if (!ytext) throw new Error('ytext is undefined')
  const [text, setText] = useState<string>(ytext.toString())

  useEffect(() => {
    const updateText = (ytext: Y.Text) => {
      setText(ytext.toString())
    }

    const observeText = (event: Y.YTextEvent) => {
      updateText(event.target)
    }

    ytext.observe(observeText)
    updateText(ytext)

    return () => {
      ytext.unobserve(observeText)
    }
  }, [ytext])

  return text
}

export const useCell = (doc: Y.Doc, rowId: RowId, columnId: ColumnId) => {
  const id = `${rowId}-${columnId}`
  const data = doc.getMap<Y.Text>('data')
  const ytext = data.get(id)
  if (ytext) {
    return ytext
  }
  const newText = new Y.Text()
  data.set(id, newText)
  return newText
}
