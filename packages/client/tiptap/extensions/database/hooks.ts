import {useCallback, useEffect, useMemo, useState} from 'react'
import * as Y from 'yjs'
import {DATABASE_CELL_MAX_CHARS} from '../../../utils/constants'
import {ColumnId, ColumnMeta, getColumns, getRows, RowData, RowId} from './data'
import {updateChangedAt} from './utils'

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

export const useCell = (doc: Y.Doc, rowId: RowId, columnId: ColumnId, userId?: string) => {
  const data = doc.getMap<RowData>('data')
  const row = data.get(rowId)

  const [value, setValueState] = useState<string | null>(() => row?.get(columnId) ?? null)

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
      if (!row) return
      doc.transact(() => {
        if (value === null) {
          row.delete(columnId)
        } else {
          // TODO validate and set an error here
          row.set(columnId, value.substring(0, DATABASE_CELL_MAX_CHARS))
        }
        if (userId) {
          updateChangedAt(row, 'updated', userId)
        }
      })
    },
    [doc, row, columnId, userId]
  )

  return [value, setValue] as const
}

export const useColumnValues = (doc: Y.Doc, columnId: ColumnId) => {
  const data = doc.getMap<RowData>('data')
  return Array.from(data.values())
    .map((row) => row.get(columnId))
    .filter(Boolean) as string[]
}

export const useDatabase = (doc: Y.Doc) => {
  const columnIds = useYArray(getColumns(doc))
  const rows = useYArray(getRows(doc))
  const columnMeta = useYMap(doc.getMap<ColumnMeta>('columnMeta'))

  const columns = useMemo(
    () =>
      columnIds.map((id, index) => {
        let meta = columnMeta.get(id)
        if (!meta) {
          meta = {name: `Column ${index + 1}`, type: 'text'}
          doc.getMap<ColumnMeta>('columnMeta').set(id, meta)
        }
        return {
          id,
          ...meta
        }
      }),
    [columnIds, columnMeta]
  )
  return {
    rows,
    columns
  }
}
