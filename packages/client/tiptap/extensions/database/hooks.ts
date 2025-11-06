import {useEffect, useState} from 'react'
import * as Y from 'yjs'
import {ColumnId, RowId} from './data'

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
    const updateItems = (ymap: Y.Map<T>) => {
      setItems(yMapToMap(ymap))
    }

    const observe = (event: Y.YMapEvent<T>) => {
      updateItems(event.target)
    }

    ymap.observe(observe)
    updateItems(ymap)

    return () => {
      ymap.unobserve(observe)
    }
  }, [ymap])

  return items
}

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

export const useColumnValues = (doc: Y.Doc, columnId: ColumnId) => {
  const rows = useYArray<RowId>(doc.getArray<RowId>('rows'))

  const data = doc.getMap<Y.Text>('data')
  const values = rows.map((rowId) => data.get(`${rowId}-${columnId}`)?.toString())

  return values
}

/*
type ObserverCallback = () => void
type Observer = (event: Y.YMapEvent<any>, transaction: Y.Transaction) => void

const observers = new Map<string, {observer: Observer, listeners: Map<string, ObserverCallback>}>()

const registerListener = (key: string, map: Y.Map<any>, id: string, callback: ObserverCallback) => {
  const existing = observers.get(key)
  if (existing) {
    existing.listeners.set(id, callback)
    return
  }

  const listeners = new Map<string, ObserverCallback>()
  const observer: Observer = (event, _transaction) => {
    event.keysChanged.forEach((changedKey) => {
      listeners.get(changedKey)?.()
    })
  }

  listeners.set(id, callback)
  observers.set(key, {observer, listeners})
  map.observe(observer)
}

const unregisterListener = (key: string, map: Y.Map<any>, id: string) => {
  const existing = observers.get(key)
  if (!existing) return

  existing.listeners.delete(id)
  if (existing.listeners.size === 0) {
    map.unobserve(existing.observer)
    observers.delete(key)
  }
}

export const useColumnMeta = (doc: Y.Doc, columnId: ColumnId) => {
  const columnMetaMap = doc.getMap<ColumnMeta>('columnMeta')
  const [meta, setMeta] = useState<ColumnMeta | undefined>(columnMetaMap.get(columnId))

  useEffect(() => {
    const updateMeta = () => {
      setMeta(columnMetaMap.get(columnId))
    }

    const observeMeta = (event: Y.YMapEvent<{name: string; type: string}>) => {
      if (event.keysChanged.has(columnId)) {
        updateMeta()
      }
    }
    columnMetaMap.observe(observeMeta)

    return () => {
      columnMetaMap.unobserve(observeMeta)
    }
  }, [columnMetaMap, columnId])

  return meta
}
*/
