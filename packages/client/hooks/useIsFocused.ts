import type {Editor} from '@tiptap/core'
import {useEffect, useState} from 'react'

// editor.isFocused reads straight off the ProseMirror instance, so focus and blur mutate it
// without React hearing about it. Mirror it into state so the UI can respond to focus alone
const useIsFocused = (editor: Editor | null) => {
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (!editor) return
    const onFocus = () => setIsFocused(true)
    const onBlur = () => setIsFocused(false)
    // the editor can already hold focus by the time the listeners attach
    setIsFocused(editor.isFocused)
    editor.on('focus', onFocus)
    editor.on('blur', onBlur)
    return () => {
      editor.off('focus', onFocus)
      editor.off('blur', onBlur)
    }
  }, [editor])

  return isFocused
}

export default useIsFocused
