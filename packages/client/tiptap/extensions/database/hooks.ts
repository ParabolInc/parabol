import {useCallback, useEffect, useState} from 'react'
import * as Y from 'yjs'
import {ColumnId, RowData, RowId} from './data'

const yMapToMap = <T>(ymap: Y.Map<T>): Map<string, T> => {
  const result = new Map<string, T>()
  ymap.forEach((value, key) => {
    result.set(key, value)
  })
  return result
}

export const useYMap = <T>(ymap: Y.Map<T>) => {
  if (!ymap) throw new Error('ymap is undefined')

  const [items, setItems] = useState<Map<string, T>>(yMapToMap(ymap))

  useEffect(() => {
    const updateItems = () => {
      setItems(yMapToMap(ymap))
    }

    ymap.observe(updateItems)
    updateItems()

    return () => {
      ymap.unobserve(updateItems)
    }
  }, [ymap])

  return items
}

export const useYArray = <T>(yarray: Y.Array<T>) => {
  if (!yarray) throw new Error('yarray is undefined')
  const [items, setItems] = useState<T[]>(yarray.toArray())

  useEffect(() => {
    const updateItems = () => {
      setItems(yarray.toArray())
    }

    yarray.observe(updateItems)
    updateItems()

    return () => {
      yarray.unobserve(updateItems)
    }
  }, [yarray])

  return items
}

export const useYText = (ytext: Y.Text) => {
  if (!ytext) throw new Error('ytext is undefined')
  const [text, setText] = useState<string>(ytext.toString())

  useEffect(() => {
    const updateText = () => {
      setText(ytext.toString())
    }

    ytext.observe(updateText)
    updateText()

    return () => {
      ytext.unobserve(updateText)
    }
  }, [ytext])

  return text
}

export const useCell = (doc: Y.Doc, rowId: RowId, columnId: ColumnId) => {
  const data = doc.getMap<RowData>('data')
  const row = data.get(rowId)

  const [value, setValueState] = useState<string | null>(row?.get(columnId) ?? null)

  useEffect(() => {
    const updateValue = () => {
      const cellValue = row?.get(columnId)
      setValueState(cellValue ?? null)
    }

    const observer = (event: Y.YMapEvent<string>) => {
      if (event.keysChanged.has(columnId)) {
        updateValue()
      }
    }
    updateValue()
    row?.observe(observer)

    return () => {
      row?.unobserve(observer)
    }
  }, [row, columnId])

  const setValue = useCallback(
    (value: string | null) => {
      if (value === null) {
        row?.delete(columnId)
      } else {
        row?.set(columnId, value)
      }
    },
    [row, columnId]
  )

  return [value, setValue] as const
}

export const useColumnValues = (doc: Y.Doc, columnId: ColumnId) => {
  const data = doc.getMap<RowData>('data')
  return Array.from(data.values())
    .map((row) => row.get(columnId))
    .filter(Boolean) as string[]
}
