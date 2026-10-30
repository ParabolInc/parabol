import type {Editor, JSONContent} from '@tiptap/react'
import {useEffect} from 'react'
import {isEqualWhenSerialized} from '../shared/isEqualWhenSerialized'

// Build an editor once and apply later props in place: rebuilding it drops focus, selection & menu positions
// Incoming content stays out of undo history, so undo can't restore what another user or task replaced
export const useTipTapEditorSync = (
  editor: Editor | null,
  content: JSONContent,
  editable: boolean
) => {
  useEffect(() => {
    if (!editor || editor.isDestroyed || isEqualWhenSerialized(editor.getJSON(), content)) return
    editor.chain().setMeta('addToHistory', false).setContent(content, {emitUpdate: false}).run()
  }, [editor, content])

  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    editor.setEditable(editable, false)
  }, [editor, editable])
}
