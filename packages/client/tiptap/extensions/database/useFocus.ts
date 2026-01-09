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
