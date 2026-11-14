import type {Editor} from '@tiptap/core'
import {useEffect, useState} from 'react'

const readName = (editor: Editor | null) => {
  const firstNode = editor?.state.doc.firstChild
  return firstNode?.type.name === 'heading' ? firstNode.textContent : ''
}

export const useSyncedBlockName = (editor: Editor | null) => {
  const [name, setName] = useState(() => readName(editor))
  useEffect(() => {
    setName(readName(editor))
    if (!editor) return
    const handleUpdate = () => setName(readName(editor))
    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor])
  return name
}
