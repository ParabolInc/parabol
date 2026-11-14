import type {Editor} from '@tiptap/core'
import {TextSelection} from '@tiptap/pm/state'
import {unwrapCallout} from './unwrapCallout'

const getCaretInCallout = (editor: Editor) => {
  const {selection} = editor.state
  const {$from} = selection
  if ($from.depth < 2) return null
  const callout = $from.node(-1)
  if (callout.type.name !== 'callout') return null
  return {selection, $from, callout}
}

export const handleCalloutEnter = (editor: Editor) => {
  const caret = getCaretInCallout(editor)
  if (!caret) return false
  const {selection, $from, callout} = caret
  const {paragraph} = editor.schema.nodes
  if (!paragraph) return false
  const textblock = $from.parent
  if (textblock.type.name === 'calloutTitle') {
    if (!$from.sameParent(selection.$to)) return false
    const tr = editor.state.tr.deleteSelection()
    tr.split(tr.selection.from, 1, [{type: paragraph}])
    editor.view.dispatch(tr.scrollIntoView())
    return true
  }
  if (!selection.empty || textblock.type.spec.code || textblock.content.size > 0) return false
  const hasTitle = callout.firstChild?.type.name === 'calloutTitle'
  const bodyCount = callout.childCount - (hasTitle ? 1 : 0)
  const isLastLine = $from.index(-1) === callout.childCount - 1
  if (!isLastLine || bodyCount < 2) return editor.commands.splitBlock()
  const calloutEnd = $from.after(-1)
  const tr = editor.state.tr.delete($from.before(), $from.after())
  const afterCallout = tr.mapping.map(calloutEnd)
  const next = tr.doc.resolve(afterCallout).nodeAfter
  if (next?.type !== paragraph || next.content.size > 0) {
    tr.insert(afterCallout, paragraph.create())
  }
  tr.setSelection(TextSelection.create(tr.doc, afterCallout + 1))
  editor.view.dispatch(tr.scrollIntoView())
  return true
}

export const handleCalloutBackspace = (editor: Editor) => {
  const caret = getCaretInCallout(editor)
  if (!caret) return false
  const {selection, $from} = caret
  if (!selection.empty || $from.parentOffset !== 0 || $from.index(-1) !== 0) return false
  if (editor.commands.undoInputRule()) return true
  const tr = unwrapCallout(editor.state, $from.before(-1))
  if (!tr) return false
  editor.view.dispatch(tr.scrollIntoView())
  return true
}
