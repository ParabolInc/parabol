import type {Editor, JSONContent} from '@tiptap/core'
import type {EditorState, Transaction} from '@tiptap/pm/state'
import {yUndoPluginKey} from '@tiptap/y-tiptap'
import type * as Y from 'yjs'
import type {MovedBlock} from './appendBlocksToFragment'

export type BlockMoveMeta = {
  targetPageId: string
  targetTitle: string
  moved: MovedBlock[]
  blocks: JSONContent[]
  restored?: MovedBlock[]
}

export type StackItem = Y.UndoManager['undoStack'][number]

type Direction = 'undo' | 'redo'

const BLOCK_MOVE_META_KEY = 'blockMove'

export const getUndoManager = (state: EditorState): Y.UndoManager | undefined =>
  yUndoPluginKey.getState(state)?.undoManager

export const getMoveMeta = (stackItem: StackItem | undefined): BlockMoveMeta | undefined =>
  stackItem?.meta.get(BLOCK_MOVE_META_KEY)

export const setMoveMeta = (stackItem: StackItem, meta: BlockMoveMeta) => {
  stackItem.meta.set(BLOCK_MOVE_META_KEY, meta)
}

export const dispatchBlockMoveDelete = (
  editor: Editor,
  tr: Transaction,
  meta: BlockMoveMeta | null
) => {
  const undoManager = getUndoManager(editor.state)
  if (!meta || !undoManager) {
    editor.view.dispatch(meta ? tr : tr.setMeta('addToHistory', false))
    return
  }
  const tagStackItem = ({stackItem}: {stackItem: StackItem}) => {
    setMoveMeta(stackItem, meta)
  }
  undoManager.stopCapturing()
  undoManager.on('stack-item-added', tagStackItem)
  try {
    editor.view.dispatch(tr)
  } finally {
    undoManager.off('stack-item-added', tagStackItem)
    undoManager.stopCapturing()
  }
}

// Yjs keeps popping past a step that changes nothing, so each pop sees only the steps it may touch
export const popIsolated = (
  undoManager: Y.UndoManager,
  direction: Direction,
  items: StackItem[]
) => {
  const key = direction === 'undo' ? 'undoStack' : 'redoStack'
  const rest = undoManager[key].filter((item) => !items.includes(item))
  let added: StackItem | undefined
  const onAdded = ({stackItem}: {stackItem: StackItem}) => {
    added = stackItem
  }
  undoManager[key] = [...items]
  undoManager.on('stack-item-added', onAdded)
  try {
    const popped = direction === 'undo' ? undoManager.undo() : undoManager.redo()
    return {popped, added}
  } finally {
    undoManager.off('stack-item-added', onAdded)
    undoManager[key] = [...rest, ...undoManager[key]]
  }
}

export const popOrdinary = (undoManager: Y.UndoManager, direction: Direction) => {
  const stack = direction === 'undo' ? undoManager.undoStack : undoManager.redoStack
  const lastMoveIndex = stack.findLastIndex((item) => getMoveMeta(item))
  popIsolated(undoManager, direction, stack.slice(lastMoveIndex + 1))
}
