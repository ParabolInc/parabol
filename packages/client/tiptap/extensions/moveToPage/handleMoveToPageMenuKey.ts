import type * as React from 'react'

const ROW_SELECTOR = '[role="menuitem"]:not([data-disabled])'

type Actions = {
  pickFirst: () => void
  appendToSearch: (text: string) => void
}

export const handleMoveToPageMenuKey = (
  e: React.KeyboardEvent<HTMLElement>,
  {pickFirst, appendToSearch}: Actions
) => {
  const input = e.currentTarget.querySelector('input')
  const rows = e.currentTarget.querySelectorAll<HTMLElement>(ROW_SELECTOR)
  if (input && e.target === input) {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter') {
      e.preventDefault()
      pickFirst()
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      rows[e.key === 'ArrowDown' ? 0 : rows.length - 1]?.focus()
    }
    return
  }
  if (e.key === 'ArrowUp' && e.target === rows[0]) {
    e.preventDefault()
    input?.focus()
    return
  }
  const isPrintable = e.key.length === 1 && e.key !== ' ' && !e.metaKey && !e.ctrlKey && !e.altKey
  if (!isPrintable || !input) return
  e.preventDefault()
  input.focus()
  appendToSearch(e.key)
}
