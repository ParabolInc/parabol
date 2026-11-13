import {type Editor, Extension} from '@tiptap/core'
import type {ResolvedPos} from '@tiptap/pm/model'
import {type EditorState, NodeSelection, Plugin, TextSelection} from '@tiptap/pm/state'
import type {EditorView} from '@tiptap/pm/view'
import {keepFocusInHost} from './keepFocusInHost'
import {exitSyncedBlock} from './syncedBlockFocus'

export interface SyncedBlockEdgesOptions {
  hostView: EditorView
  getPos: () => number | undefined
  getSize: () => number
}

const isFirstContent = ($head: ResolvedPos) => {
  if ($head.index(0) !== 1) return false
  for (let depth = 1; depth < $head.depth; depth++) {
    if ($head.index(depth) !== 0) return false
  }
  return true
}

const isLastContent = ($head: ResolvedPos) => {
  if ($head.index(0) !== $head.node(0).childCount - 1) return false
  for (let depth = 1; depth < $head.depth; depth++) {
    if ($head.index(depth) !== $head.node(depth).childCount - 1) return false
  }
  return true
}

const isSuggestionOpen = (state: EditorState) =>
  state.plugins.some((plugin) => {
    const pluginState: unknown = plugin.getState(state)
    return (
      typeof pluginState === 'object' &&
      pluginState !== null &&
      'active' in pluginState &&
      'query' in pluginState &&
      pluginState.active === true
    )
  })

export const SyncedBlockEdges = Extension.create<SyncedBlockEdgesOptions>({
  name: 'syncedBlockEdges',
  priority: 1000,

  addKeyboardShortcuts() {
    const {hostView, getPos, getSize} = this.options
    const leave = (editor: Editor, direction: 'up' | 'down' | 'left' | 'right') => {
      const {selection} = editor.state
      if (!selection.empty || isSuggestionOpen(editor.state)) return false
      const {$head} = selection
      const forward = direction === 'down' || direction === 'right'
      if (!(forward ? isLastContent($head) : isFirstContent($head))) return false
      if (!editor.view.endOfTextblock(direction)) return false
      const pos = getPos()
      if (pos === undefined) return false
      const vertical = direction === 'up' || direction === 'down'
      const x = vertical ? editor.view.coordsAtPos($head.pos).left : null
      return exitSyncedBlock(hostView, pos, getSize(), direction, x)
    }
    const nodeSelectInHost = () => {
      const pos = getPos()
      if (pos === undefined) return false
      const {state} = hostView
      keepFocusInHost(hostView.nodeDOM(pos))
      hostView.dispatch(state.tr.setSelection(NodeSelection.create(state.doc, pos)))
      hostView.focus()
      return true
    }
    const removeFromHost = () => {
      const pos = getPos()
      if (pos === undefined) return false
      const {state} = hostView
      hostView.dispatch(state.tr.delete(pos, pos + getSize()))
      hostView.focus()
      return true
    }
    return {
      ArrowUp: ({editor}) => leave(editor, 'up'),
      ArrowDown: ({editor}) => leave(editor, 'down'),
      ArrowLeft: ({editor}) => leave(editor, 'left'),
      ArrowRight: ({editor}) => leave(editor, 'right'),
      Escape: ({editor}) => !isSuggestionOpen(editor.state) && nodeSelectInHost(),
      Backspace: ({editor}) => {
        const {selection, doc} = editor.state
        if (!selection.empty) return false
        const {$head} = selection
        if ($head.depth !== 1 || $head.parentOffset !== 0 || $head.index(0) !== 1) return false
        if (doc.childCount === 2 && $head.parent.content.size === 0) return removeFromHost()
        return true
      },
      Delete: ({editor}) => {
        const {selection, doc} = editor.state
        if (!selection.empty) return false
        const {$head} = selection
        return (
          $head.depth === 1 &&
          $head.index(0) === doc.childCount - 1 &&
          $head.parentOffset === $head.parent.content.size
        )
      },
      'Mod-a': ({editor}) => {
        const {state, view} = editor
        const {doc} = state
        const from = doc.firstChild!.nodeSize + 1
        const to = doc.content.size - 1
        view.dispatch(state.tr.setSelection(TextSelection.create(doc, from, to)))
        return true
      }
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (_transactions, _oldState, state) => {
          const {selection, doc} = state
          const titleEnd = doc.firstChild!.nodeSize
          if (doc.childCount < 2 || selection.from >= titleEnd) return null
          const to = Math.max(selection.to, titleEnd + 1)
          return state.tr.setSelection(
            selection.empty
              ? TextSelection.near(doc.resolve(titleEnd), 1)
              : TextSelection.create(doc, titleEnd + 1, to)
          )
        }
      })
    ]
  }
})
