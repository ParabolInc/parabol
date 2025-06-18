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
    window.clearTimeout(idleTimerIdRef.current)
    idleTimerIdRef.current = 0
    onStopEditing?.()
    setIsEditing(false)
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

  const editorFocusing = useEventCallback(() => {
    if (editor && !editor.isEmpty) {
      ensureEditing()
    }
  })

  const editorBlurring = useEventCallback(() => {
    if (editor && editor.isEmpty) {
      ensureNotEditing()
    }
  })

  useEffect(() => {
    editor?.on('update', editorUpdating)
    editor?.on('focus', editorFocusing)
    editor?.on('blur', editorBlurring)
    return () => {
      editor?.off('update', editorUpdating)
      editor?.off('focus', editorFocusing)
      editor?.off('blur', editorBlurring)
      ensureNotEditing()
    }
  }, [editor, editorUpdating, ensureEditing, ensureNotEditing])

  return isEditing
}

export default useIsEditing
