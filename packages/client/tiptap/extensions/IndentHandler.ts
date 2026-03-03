import type {Editor} from '@tiptap/core'
import {Extension} from '@tiptap/core'
import {TextSelection} from '@tiptap/pm/state'

// See also: https://github.com/ueberdosis/tiptap/issues/457#issuecomment-2285456957
// TipTap has troble receiving the Tab input in certain contexts

// Move a details block into the previous sibling's detailsContent
function sinkDetails(editor: Editor): boolean {
  const {state} = editor
  const {$from} = state.selection

  // Find the nearest details ancestor
  let detailsDepth = -1
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === 'details') {
      detailsDepth = d
      break
    }
  }
  if (detailsDepth < 1) return true

  const detailsNode = $from.node(detailsDepth)
  const detailsStart = $from.before(detailsDepth)
  const detailsEnd = $from.after(detailsDepth)
  const cursorOffset = $from.pos - detailsStart

  // Need a previous sibling that is also a details block
  const parentNode = $from.node(detailsDepth - 1)
  const indexInParent = $from.index(detailsDepth - 1)
  if (indexInParent === 0) return true

  const prevSibling = parentNode.child(indexInParent - 1)
  if (prevSibling.type.name !== 'details') return true

  // Find the insertion point: end of the previous sibling's detailsContent
  const prevSiblingStart = detailsStart - prevSibling.nodeSize
  let contentEndOffset = -1
  prevSibling.forEach((child, offset) => {
    if (child.type.name === 'detailsContent') {
      contentEndOffset = offset + 1 + child.content.size
    }
  })
  if (contentEndOffset === -1) return true

  // Absolute position at the end of prev sibling's detailsContent content
  const insertPos = prevSiblingStart + 1 + contentEndOffset

  // Delete first (higher position), then insert (lower position) — avoids position shifts
  const tr = state.tr
  tr.delete(detailsStart, detailsEnd)
  tr.insert(insertPos, detailsNode)

  // Restore cursor inside the moved node
  try {
    tr.setSelection(TextSelection.create(tr.doc, insertPos + cursorOffset))
  } catch {
    tr.setSelection(TextSelection.create(tr.doc, insertPos + 2))
  }
  tr.scrollIntoView()

  editor.view.dispatch(tr)
  return true
}

// Lift a details block out of its parent detailsContent into the grandparent.
function liftDetails(editor: Editor): boolean {
  const {state} = editor
  const {$from} = state.selection

  // Find the nearest details ancestor
  let detailsDepth = -1
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === 'details') {
      detailsDepth = d
      break
    }
  }
  if (detailsDepth < 2) return true

  // Must be nested: details > detailsContent > details (current)
  if ($from.node(detailsDepth - 1).type.name !== 'detailsContent') return true
  if ($from.node(detailsDepth - 2).type.name !== 'details') return true

  const detailsNode = $from.node(detailsDepth)
  const detailsStart = $from.before(detailsDepth)
  const detailsEnd = $from.after(detailsDepth)
  const cursorOffset = $from.pos - detailsStart
  const grandparentEnd = $from.after(detailsDepth - 2)

  // Insert after grandparent (higher position) first, then delete original (lower position)
  const tr = state.tr
  tr.insert(grandparentEnd, detailsNode)
  tr.delete(detailsStart, detailsEnd)

  // The moved node now starts at: grandparentEnd - deletedSize
  const newDetailsStart = grandparentEnd - (detailsEnd - detailsStart)
  try {
    tr.setSelection(TextSelection.create(tr.doc, newDetailsStart + cursorOffset))
  } catch {
    tr.setSelection(TextSelection.create(tr.doc, newDetailsStart + 2))
  }
  tr.scrollIntoView()

  editor.view.dispatch(tr)
  return true
}

export const IndentHandler = Extension.create({
  name: 'indentHandler',
  addKeyboardShortcuts() {
    return {
      Tab: ({editor}) => {
        if (editor.isActive('listItem')) {
          editor.chain().sinkListItem('listItem').run()
          return true
        }
        if (editor.isActive('taskItem')) {
          editor.chain().sinkListItem('taskItem').run()
          return true
        }
        if (editor.isActive('detailsSummary')) {
          return sinkDetails(editor)
        }
        return true
      },
      'Shift-Tab': ({editor}) => {
        if (editor.isActive('listItem')) {
          editor.chain().liftListItem('listItem').run()
          return true
        }
        if (editor.isActive('taskItem')) {
          editor.chain().liftListItem('taskItem').run()
          return true
        }
        if (editor.isActive('detailsSummary')) {
          return liftDetails(editor)
        }
        return true
      }
    }
  }
})
