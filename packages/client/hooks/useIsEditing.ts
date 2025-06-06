import {Editor} from '@tiptap/core'
import {useEffect, useRef, useState} from 'react'
import useEventCallback from './useEventCallback'

const useIsEditing = (p: {
  editor: Editor | null
  onStartEditing?: () => void
  onStopEditing?: () => void
}) => {
  const {editor, onStartEditing, onStopEditing} = p

  const [isEditing, setIsEditing] = useState(false)
  const idleTimerIdRef = useRef<number>()
  useEffect(() => {
    return () => {
      window.clearTimeout(idleTimerIdRef.current)
    }
  }, [idleTimerIdRef])

  const ensureNotEditing = useEventCallback(() => {
    if (!isEditing) return
    // some delay in case the user just submitted the reflection, otherwise the update on other clients will remove and add a card which doesn't look good
    window.clearTimeout(idleTimerIdRef.current)
    idleTimerIdRef.current = window.setTimeout(() => {
      onStopEditing?.()
      setIsEditing(false)
    }, 500)
  })

  const ensureEditing = useEventCallback(() => {
    if (!isEditing) {
      onStartEditing?.()
      setIsEditing(true)
    }
    window.clearTimeout(idleTimerIdRef.current)
    idleTimerIdRef.current = window.setTimeout(() => {
      onStopEditing?.()
      setIsEditing(false)
    }, 5000)
  })

  const editorUpdating = useEventCallback(() => {
    if (editor && !editor.isEmpty) {
      ensureEditing()
    }
  })

  useEffect(() => {
    editor?.on('update', editorUpdating)
    editor?.on('focus', ensureEditing)
    editor?.on('blur', ensureNotEditing)
    return () => {
      editor?.off('update', editorUpdating)
      editor?.off('focus', ensureEditing)
      editor?.off('blur', ensureNotEditing)
    }
  }, [editor, editorUpdating, ensureEditing, ensureNotEditing])

  return isEditing
}

export default useIsEditing
