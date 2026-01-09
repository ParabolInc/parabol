import {HocuspocusProvider} from '@hocuspocus/provider'
import {useCallback, useEffect, useRef, useState} from 'react'
import * as Y from 'yjs'
import {getColumns, getRows} from './data'

const findNextFocusable = (
  doc: Y.Doc,
  currentKey: string,
  direction: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown'
): string | null => {
  const columns = [...getColumns(doc).toArray(), 'append']
  const rows = [...getRows(doc).toArray(), 'append']
  const [columnId, rowId] = currentKey.split(':')

  if (direction === 'ArrowUp' || direction === 'ArrowDown') {
    const rowIndex = rows.findIndex((id) => id === rowId)
    if (direction === 'ArrowUp') {
      if (rowIndex > 0) {
        return `${columnId}:${rows[rowIndex - 1]}`
      } else {
        return columnId! // move to header
      }
    } else {
      if (!rowId) {
        // from header to first row
        if (rows.length > 0) {
          return `${columnId}:${rows[0]}`
        }
      }
      if (rowIndex > -1 && rowIndex < rows.length - 1) {
        return `${columnId}:${rows[rowIndex + 1]}`
      }
    }
    return null
  }
  const columnIndex = columns.findIndex((id) => id === columnId)
  if (direction === 'ArrowLeft') {
    if (columnIndex > 0) {
      return rowId ? `${columns[columnIndex - 1]!}:${rowId}` : columns[columnIndex - 1]!
    }
  } else if (direction === 'ArrowRight') {
    if (columnIndex < columns.length - 1) {
      return rowId ? `${columns[columnIndex + 1]!}:${rowId}` : columns[columnIndex + 1]!
    }
    return null
  }
  return null
}

export const useFocusedCell = (provider: HocuspocusProvider) => {
  const {awareness} = provider

  const [focusedCell, setFocusedCell] = useState<string | null>(
    awareness?.getLocalState()?.focusedCell ?? null
  )
  useEffect(() => {
    const onChange = () => {
      const state = awareness?.getLocalState()
      setFocusedCell(state?.focusedCell ?? null)
    }
    awareness?.on('change', onChange)
    return () => {
      awareness?.off('change', onChange)
    }
  }, [awareness])

  return focusedCell
}

export const useFocusFallback = (provider: HocuspocusProvider) => {
  const doc = provider.document

  const columns = getColumns(doc)
  const rows = getRows(doc)

  const currentRowIndex = useRef<number | null>(null)
  const currentColumnIndex = useRef<number | null>(null)

  const focusedCell = useFocusedCell(provider)
  const focusedCellRef = useRef(focusedCell)

  const findCurrentIndexes = () => {
    const currentKey = focusedCellRef.current
    if (!currentKey) return
    const [columnId, rowId] = currentKey.split(':')
    if (rowId) {
      const allRows = [...rows.toArray(), 'append']
      const rowIndex = allRows.findIndex((id) => id === rowId)
      currentRowIndex.current = rowIndex === -1 ? null : rowIndex
    } else {
      currentRowIndex.current = null
    }
    const allColumns = [...columns.toArray(), 'append']
    const columnIndex = allColumns.findIndex((id) => id === columnId)
    currentColumnIndex.current = columnIndex === -1 ? null : columnIndex
  }

  useEffect(() => {
    focusedCellRef.current = focusedCell
    findCurrentIndexes()
  }, [focusedCell])

  useEffect(() => {
    const onRowDelete = (event: Y.YArrayEvent<string>) => {
      if (event.delta.some((d) => d.delete)) {
        const currentKey = focusedCellRef.current
        if (!currentKey) return
        const [columnId, rowId] = currentKey.split(':')
        if (!rowId) return

        const currentIndex = rows.toArray().findIndex((id) => id === rowId)
        if (currentIndex === -1) {
          if (currentRowIndex.current !== null) {
            const allRows = [...rows.toArray(), 'append']
            const nextRowId =
              allRows[currentRowIndex.current - 1] || allRows[allRows.length - 2] || null
            const nextKey = nextRowId ? `${columnId}:${nextRowId}` : columnId
            provider.awareness?.setLocalStateField('focusedCell', nextKey)
          }
        } else {
          currentRowIndex.current = currentIndex
        }
      }
    }
    rows.observe(onRowDelete)
    return () => {
      rows.unobserve(onRowDelete)
    }
  }, [rows])

  useEffect(() => {
    const onColumnDelete = (event: Y.YArrayEvent<string>) => {
      console.log('onColumnDelete', event.delta)
      if (event.delta.some((d) => d.delete)) {
        const currentKey = focusedCellRef.current
        if (!currentKey) return
        const [columnId, rowId] = currentKey.split(':')

        const allColumns = [...columns.toArray(), 'append']
        const currentIndex = allColumns.findIndex((id) => id === columnId)
        if (currentIndex === -1) {
          if (currentColumnIndex.current !== null) {
            const allColumns = [...columns.toArray(), 'append']
            const nextColumnId =
              allColumns[currentColumnIndex.current - 1] ||
              allColumns[allColumns.length - 2] ||
              null
            const nextKey = rowId
              ? nextColumnId
                ? `${nextColumnId}:${rowId}`
                : rowId
              : nextColumnId
            provider.awareness?.setLocalStateField('focusedCell', nextKey)
          }
        } else {
          currentColumnIndex.current = currentIndex
        }
      }
    }
    columns.observe(onColumnDelete)
    return () => {
      columns.unobserve(onColumnDelete)
    }
  }, [columns])
}

type Props = {
  provider: HocuspocusProvider
  key: string
  onStartEditing?: (replace: boolean) => void
  onStopEditing?: () => void
}
export const useFocus = (props: Props) => {
  const {provider, key, onStartEditing, onStopEditing} = props
  const {awareness} = provider

  const focusedCell = useFocusedCell(provider)
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (focusedCell === key) {
      requestAnimationFrame(() => {
        ref.current?.focus()
      })
    }
  }, [focusedCell, key, ref])

  const onKeyDown = useCallback(
    (e: Pick<KeyboardEvent, 'preventDefault' | 'target' | 'key'>) => {
      if (e.target !== ref.current) {
        if (e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault()
          onStopEditing?.()
          requestAnimationFrame(() => {
            ref.current?.focus()
          })
        }
        return
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        onStartEditing?.(false)
        return
      }

      if (
        e.target === ref.current &&
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
      ) {
        e.preventDefault()
        const nextKey = findNextFocusable(
          provider.document,
          key,
          e.key as 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown'
        )
        awareness?.setLocalStateField('focusedCell', nextKey)
        return
      }

      // forward input to child
      onStartEditing?.(true)
    },
    [key, provider.document, awareness, onStartEditing, onStopEditing, ref.current]
  )

  const onFocus = useCallback(() => {
    if (focusedCell === key) return
    awareness?.setLocalStateField('focusedCell', key)
  }, [awareness, key, focusedCell])

  const focusCell = useCallback(() => {
    //requestAnimationFrame(() => {
    ref.current?.focus()
    //})
  }, [ref.current])

  const isFocused = focusedCell === key

  const focusProps = {
    ref: <T extends HTMLElement>(r: T | null) => (ref.current = r),
    onKeyDown,
    onFocus,
    tabIndex: isFocused ? 0 : -1
  }
  return {isFocused, focusCell, focusProps}
}
