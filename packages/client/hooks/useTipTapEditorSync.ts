import type {Editor, JSONContent} from '@tiptap/react'
import {useEffect, useReducer} from 'react'
import {isEqualWhenSerialized} from '../shared/isEqualWhenSerialized'

// Build an editor once and apply later props in place: rebuilding it drops focus, selection & menu positions
// Incoming content stays out of undo history, so undo can't restore what another user or task replaced
// The editor doesn't re-render on transactions, so re-render once after applying content for callers that read it while rendering
export const useTipTapEditorSync = (
  editor: Editor | null,
  content: JSONContent,
  editable: boolean
) => {
  const [, rerender] = useReducer((renderCount: number) => renderCount + 1, 0)

  useEffect(() => {
    if (!editor || editor.isDestroyed || isEqualWhenSerialized(editor.getJSON(), content)) return
    editor.chain().setMeta('addToHistory', false).setContent(content, {emitUpdate: false}).run()
    rerender()
  }, [editor, content])

  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    editor.setEditable(editable, false)
  }, [editor, editable])
}
