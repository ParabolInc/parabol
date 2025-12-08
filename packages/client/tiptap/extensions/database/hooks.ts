import {useCallback, useEffect, useMemo, useState} from 'react'
import * as Y from 'yjs'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {DATABASE_CELL_MAX_CHARS} from '../../../utils/constants'
import {
  ColumnId,
  ColumnMeta,
  changeColumn,
  DataType,
  getColumns,
  getRows,
  RowData,
  RowId
} from './data'
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

export const useCell = (doc: Y.Doc, rowId: RowId, columnId: ColumnId) => {
  const {viewerId} = useAtmosphere()
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
        if (viewerId) {
          updateChangedAt(row, 'updated', viewerId)
        }
      })
    },
    [doc, row, columnId, viewerId]
  )

  return [value, setValue] as const
}

export const useColumnValues = (doc: Y.Doc, columnId: ColumnId) => {
  const data = doc.getMap<RowData>('data')
  return Array.from(data.values())
    .map((row) => row.get(columnId))
    .filter(Boolean) as string[]
}

export const useColumnMeta = (doc: Y.Doc, columnId: ColumnId) => {
  const columnMetaMap = doc.getMap<ColumnMeta>('columnMeta')
  const [meta, setMetaState] = useState<ColumnMeta>(() => {
    const existing = columnMetaMap.get(columnId)
    return existing ?? {name: `<Unknown>`, type: 'text'}
  })

  useEffect(() => {
    const updateMeta = () => {
      const meta = columnMetaMap.get(columnId)
      if (meta) {
        setMetaState(meta)
      }
    }

    const observer = (event: Y.YMapEvent<ColumnMeta>) => {
      if (event.keysChanged.has(columnId)) {
        updateMeta()
      }
    }
    updateMeta()
    columnMetaMap.observe(observer)

    return () => {
      columnMetaMap.unobserve(observer)
    }
  }, [columnMetaMap, columnId])

  const setMeta = useCallback(
    (newMeta: ColumnMeta) => {
      changeColumn(doc, columnId, newMeta)
    },
    [doc, columnId, columnMetaMap]
  )

  return [meta, setMeta] as const
}

// hook to get rows and columns with their types
// don't include the name in the column info, as it causes unnecessary re-renders of all cells on rename
export const useDatabase = (doc: Y.Doc) => {
  const columnIds = useYArray(getColumns(doc))
  const rows = useYArray(getRows(doc))

  const columnMeta = doc.getMap<ColumnMeta>('columnMeta')
  const [columnTypes, setColumnTypes] = useState<DataType[]>(() =>
    columnIds.map((id) => {
      const meta = columnMeta.get(id)
      return meta ? meta.type : 'text'
    })
  )

  useEffect(() => {
    const updateTypes = () => {
      const newTypes = columnIds.map((id) => {
        const meta = columnMeta.get(id)
        return meta ? meta.type : 'text'
      })
      if (JSON.stringify(newTypes) !== JSON.stringify(columnTypes)) {
        setColumnTypes(newTypes)
      }
    }

    columnMeta.observe(updateTypes)
    updateTypes()

    return () => {
      columnMeta.unobserve(updateTypes)
    }
  }, [columnIds, columnMeta])

  const columns = useMemo(
    () =>
      columnIds.map((id, index) => {
        const type = columnTypes[index] ?? 'text'
        return {
          id,
          type
        }
      }),
    [columnIds, columnTypes]
  )
  return {
    rows,
    columns
  }
}
