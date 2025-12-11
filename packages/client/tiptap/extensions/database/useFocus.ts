import {HocuspocusProvider} from '@hocuspocus/provider'
import {useCallback, useEffect, useState} from 'react'
import * as Y from 'yjs'
import {getColumns, getRows} from './data'

const findNextFocusable = (
  doc: Y.Doc,
  currentKey: string,
  direction: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown'
): string | null => {
  const [columnId, rowId] = currentKey.split(':')
  const columns = getColumns(doc).toArray()
  const rows = getRows(doc).toArray()

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
      if (rowId) {
        return `${columns[columnIndex - 1]!}:${rowId}`
      } else {
        return columns[columnIndex - 1]!
      }
    }
  } else if (direction === 'ArrowRight') {
    if (columnIndex < columns.length - 1) {
      if (rowId) {
        return `${columns[columnIndex + 1]!}:${rowId}`
      } else {
        return columns[columnIndex + 1]!
      }
    }
  }
  return null
}

export const useFocus = (provider: HocuspocusProvider, key: string, ref: HTMLElement | null) => {
  const {awareness, document} = provider

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

  useEffect(() => {
    if (!ref) return
    if (focusedCell === key) {
      if (
        'selectionStart' in ref &&
        'selectionEnd' in ref &&
        'value' in ref &&
        typeof ref.value === 'string'
      ) {
        ref.selectionStart = 0
        ref.selectionEnd = ref.value.length
      }
      ref.focus()
    }
  }, [focusedCell, key, ref])

  useEffect(() => {
    if (!ref) return
    const onKeyDown = (e: KeyboardEvent) => {
      console.log('onKeyDown', e.key, key)
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return

      if (e.key === 'ArrowLeft') {
        const isAtStart = e.target && 'selectionStart' in e.target && e.target.selectionStart === 0
        if (!isAtStart) {
          return
        }
      }
      if (e.key === 'ArrowRight') {
        const isAtEnd =
          e.target &&
          'selectionEnd' in e.target &&
          'value' in e.target &&
          typeof e.target.value === 'string' &&
          e.target.selectionEnd === e.target.value?.length
        if (!isAtEnd) {
          return
        }
      }

      e.preventDefault()
      const nextKey = findNextFocusable(
        provider.document,
        key,
        e.key as 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown'
      )
      awareness?.setLocalStateField('focusedCell', nextKey)
    }
    ref.addEventListener('keydown', onKeyDown)
    return () => {
      ref.removeEventListener('keydown', onKeyDown)
    }
  }, [key, ref, document, awareness])

  useEffect(() => {
    if (!ref) return
    const onFocus = () => {
      awareness?.setLocalStateField('focusedCell', key)
    }
    ref.addEventListener('focus', onFocus)
    return () => {
      ref.removeEventListener('focus', onFocus)
    }
  }, [key, ref, awareness])

  const focusCell = useCallback(() => {
    awareness?.setLocalStateField('focusedCell', key)
  }, [awareness, key])

  const isFocused = focusedCell === key

  return {isFocused, focusCell}
}
