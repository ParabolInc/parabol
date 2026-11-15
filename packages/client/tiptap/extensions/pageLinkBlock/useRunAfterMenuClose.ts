import {useCallback, useRef} from 'react'

export const useRunAfterMenuClose = () => {
  const pendingRef = useRef<(() => void) | null>(null)
  const runAfterClose = useCallback((action: () => void) => {
    pendingRef.current = action
  }, [])
  const handleCloseAutoFocus = useCallback((event: Event) => {
    const action = pendingRef.current
    if (!action) return
    pendingRef.current = null
    event.preventDefault()
    action()
  }, [])
  return {runAfterClose, handleCloseAutoFocus}
}
