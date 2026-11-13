import {type Editor, Extension, type JSONContent} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import type {EditorState, Transaction} from '@tiptap/pm/state'
import {yUndoPluginKey} from '@tiptap/y-tiptap'
import * as Y from 'yjs'
import type Atmosphere from '../../Atmosphere'
import {appendBlocksToFragment, type MovedBlock} from '../blockMove/appendBlocksToFragment'
import {findYItem} from '../blockMove/findYItem'
import {getBlockMoveMessage} from '../blockMove/getBlockMoveMessage'
import {removeMovedBlocks} from '../blockMove/removeMovedBlocks'
import type {TrackedRange} from '../blockMove/trackRange'
import {BLOCK_MOVE_TIMEOUT_MS, waitForSaved} from '../blockMove/waitForSaved'
import {providerManager} from '../providerManager'

export type BlockMoveMeta = {
  targetPageId: string
  targetTitle: string
  moved: MovedBlock[]
  blocks: JSONContent[]
  restored?: MovedBlock[]
}

type StackItem = Y.UndoManager['undoStack'][number]

type PendingRedo = {cancelled: boolean}

type BlockMoveHistoryStorage = {
  atmosphere: Atmosphere
  queue: Promise<void>
  pendingRedo: PendingRedo | null
}

declare module '@tiptap/core' {
  interface Storage {
    blockMoveHistory: BlockMoveHistoryStorage
  }
}

const BLOCK_MOVE_META_KEY = 'blockMove'
const BLOCK_MOVE_SNACK_KEY = 'blockMove'

const undoneMoves = new WeakSet<JSONContent[]>()

const isBlockBoundary = (doc: Node, pos: number) =>
  pos >= 0 && pos <= doc.content.size && !doc.resolve(pos).parent.inlineContent

const getUndoManager = (state: EditorState): Y.UndoManager | undefined =>
  yUndoPluginKey.getState(state)?.undoManager

const getMeta = (stackItem: StackItem | undefined): BlockMoveMeta | undefined =>
  stackItem?.meta.get(BLOCK_MOVE_META_KEY)

const enqueue = (storage: BlockMoveHistoryStorage, task: () => Promise<void>) => {
  storage.queue = storage.queue.then(task).catch((error) => {
    console.error(error)
  })
  return storage.queue
}

const getUndoMessage = (removed: number, kept: number, title: string) => {
  const total = removed + kept
  if (removed === 0) {
    return total === 1
      ? `That block was edited on ${title}, so it stayed there.`
      : `Those blocks were edited on ${title}, so they stayed there.`
  }
  const keptClause =
    kept === 1
      ? `One was edited on ${title}, so it stayed there.`
      : `${kept} were edited on ${title}, so they stayed there.`
  return `Moved back ${removed} of ${total} blocks. ${keptClause}`
}

const getUnrestorableMessage = (count: number, title: string) =>
  count === 1
    ? `Couldn’t move it back here, so it stayed on ${title}.`
    : `Couldn’t move them back here, so they stayed on ${title}.`

type TargetOutcome = 'done' | 'offline' | 'readonly' | 'unsaved'

const withTarget = async (
  targetPageId: string,
  update: (frag: Y.XmlFragment) => void
): Promise<TargetOutcome> => {
  const provider = await providerManager.openSynced(targetPageId, BLOCK_MOVE_TIMEOUT_MS)
  if (!provider) return 'offline'
  try {
    if (provider.authorizedScope === 'readonly') return 'readonly'
    update(provider.document.getXmlFragment('default'))
    return (await waitForSaved(provider, BLOCK_MOVE_TIMEOUT_MS)) ? 'done' : 'unsaved'
  } finally {
    providerManager.unregister(targetPageId)
  }
}

const showSnack = (atmosphere: Atmosphere, key: string, message: string) => {
  atmosphere.eventEmitter.emit('addSnackbar', {key, message, autoDismiss: 10})
}

const showMoveSnack = (atmosphere: Atmosphere, message: string) => {
  atmosphere.eventEmitter.emit('removeSnackbar', ({key}) => key === BLOCK_MOVE_SNACK_KEY)
  showSnack(atmosphere, BLOCK_MOVE_SNACK_KEY, message)
}

const takeBackFromTarget = async (atmosphere: Atmosphere, meta: BlockMoveMeta) => {
  if (meta.moved.length === 0) return
  let result = {removed: 0, kept: 0}
  const outcome = await withTarget(meta.targetPageId, (frag) => {
    result = removeMovedBlocks(frag, meta.moved)
  })
  if (outcome !== 'done') {
    showSnack(
      atmosphere,
      'blockMoveUndo',
      `Moved back here. ${meta.targetTitle} couldn’t be reached, so the copy there stayed.`
    )
    return
  }
  if (result.kept === 0) return
  showSnack(
    atmosphere,
    'blockMoveUndo',
    getUndoMessage(result.removed, result.kept, meta.targetTitle)
  )
}

// Yjs keeps popping past a step that changes nothing, so each pop sees only the steps it may touch
const popIsolated = (undoManager: Y.UndoManager, type: 'undo' | 'redo', items: StackItem[]) => {
  const key = type === 'undo' ? 'undoStack' : 'redoStack'
  const rest = undoManager[key].filter((item) => !items.includes(item))
  let added: StackItem | undefined
  const onAdded = ({stackItem}: {stackItem: StackItem}) => {
    added = stackItem
  }
  undoManager[key] = [...items]
  undoManager.on('stack-item-added', onAdded)
  try {
    const popped = type === 'undo' ? undoManager.undo() : undoManager.redo()
    return {popped, added}
  } finally {
    undoManager.off('stack-item-added', onAdded)
    undoManager[key] = [...rest, ...undoManager[key]]
  }
}

const popOrdinary = (undoManager: Y.UndoManager, type: 'undo' | 'redo') => {
  const stack = type === 'undo' ? undoManager.undoStack : undoManager.redoStack
  const lastMoveIndex = stack.findLastIndex((item) => getMeta(item))
  popIsolated(undoManager, type, stack.slice(lastMoveIndex + 1))
}

const collectRestored = (doc: Y.Doc, stackItem: StackItem) => {
  const restored: MovedBlock[] = []
  stackItem.insertions.clients.forEach((ranges, client) => {
    ranges.forEach(({clock, len}) => {
      for (let at = clock; at < clock + len; ) {
        const item = findYItem(doc, client, at)
        if (!item) return
        at = item.id.clock + item.length
        if (item.deleted || !(item.content instanceof Y.ContentType)) continue
        const parentItem = item.parent instanceof Y.AbstractType ? item.parent._item : null
        if (parentItem && Y.isDeleted(stackItem.insertions, parentItem.id)) continue
        restored.push({client, clock: item.id.clock, snapshot: item.content.type.toString()})
      }
    })
  })
  return restored
}

const isRestoredEdited = (doc: Y.Doc, restored: readonly MovedBlock[]) =>
  restored.some(({client, clock, snapshot}) => {
    const item = findYItem(doc, client, clock)
    if (!item || item.deleted) return false
    return !(item.content instanceof Y.ContentType) || item.content.type.toString() !== snapshot
  })

const undoMoveItem = (editor: Editor, undoManager: Y.UndoManager, item: StackItem) => {
  const meta = getMeta(item)
  if (!meta) return false
  const docBefore = editor.state.doc
  const {popped, added} = popIsolated(undoManager, 'undo', [item])
  undoneMoves.add(meta.blocks)
  if (!popped || editor.state.doc.eq(docBefore)) return false
  added?.meta.set(BLOCK_MOVE_META_KEY, {...meta, restored: collectRestored(undoManager.doc, added)})
  const storage = editor.storage.blockMoveHistory
  enqueue(storage, () => takeBackFromTarget(storage.atmosphere, meta))
  return true
}

const reportRedoFailure = (
  editor: Editor,
  pending: PendingRedo,
  result: 'offline' | 'readonly' | 'streaming' | 'unsaved',
  meta: BlockMoveMeta
) => {
  if (pending.cancelled || editor.isDestroyed) return
  const message = getBlockMoveMessage(result, meta.blocks.length, meta.targetTitle)
  if (message) showMoveSnack(editor.storage.blockMoveHistory.atmosphere, message)
}

const redoMove = async (
  editor: Editor,
  undoManager: Y.UndoManager,
  item: StackItem,
  meta: BlockMoveMeta,
  pending: PendingRedo
) => {
  const provider = await providerManager.openSynced(meta.targetPageId, BLOCK_MOVE_TIMEOUT_MS)
  if (!provider) {
    reportRedoFailure(editor, pending, 'offline', meta)
    return
  }
  try {
    if (provider.authorizedScope === 'readonly') {
      reportRedoFailure(editor, pending, 'readonly', meta)
      return
    }
    const frag = provider.document.getXmlFragment('default')
    if (frag.querySelector('thinkingBlock')) {
      reportRedoFailure(editor, pending, 'streaming', meta)
      return
    }
    if (pending.cancelled || editor.isDestroyed) return
    const moved = appendBlocksToFragment(frag, meta.blocks, editor.schema)
    const saved = await waitForSaved(provider, BLOCK_MOVE_TIMEOUT_MS)
    if (!saved || pending.cancelled || editor.isDestroyed) {
      removeMovedBlocks(frag, moved)
      if (!saved) reportRedoFailure(editor, pending, 'unsaved', meta)
      return
    }
    if (isRestoredEdited(undoManager.doc, meta.restored ?? [])) {
      undoManager.redoStack = undoManager.redoStack.filter((redoItem) => redoItem !== item)
      const message = getBlockMoveMessage('copied', meta.blocks.length, meta.targetTitle)
      if (message) showMoveSnack(editor.storage.blockMoveHistory.atmosphere, message)
      return
    }
    const {added} = popIsolated(undoManager, 'redo', [item])
    undoneMoves.delete(meta.blocks)
    added?.meta.set(BLOCK_MOVE_META_KEY, {...meta, moved, restored: undefined})
  } finally {
    providerManager.unregister(meta.targetPageId)
  }
}

const startRedoMove = (
  editor: Editor,
  undoManager: Y.UndoManager,
  item: StackItem,
  meta: BlockMoveMeta
) => {
  const storage = editor.storage.blockMoveHistory
  const pending: PendingRedo = {cancelled: false}
  storage.pendingRedo = pending
  enqueue(storage, async () => {
    try {
      await redoMove(editor, undoManager, item, meta, pending)
    } finally {
      if (storage.pendingRedo === pending) storage.pendingRedo = null
    }
  })
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
    stackItem.meta.set(BLOCK_MOVE_META_KEY, meta)
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

export const undoBlockMove = async (editor: Editor, meta: BlockMoveMeta, gap: TrackedRange) => {
  if (editor.isDestroyed || undoneMoves.has(meta.blocks)) return
  const storage = editor.storage.blockMoveHistory
  const undoManager = getUndoManager(editor.state)
  const moveItem = undoManager?.undoStack.find((item) => getMeta(item)?.blocks === meta.blocks)
  const latestMeta = getMeta(moveItem) ?? meta
  if (undoManager && moveItem && undoMoveItem(editor, undoManager, moveItem)) {
    await storage.queue
    return
  }
  const docBefore = editor.state.doc
  const gapPosition = gap.current()?.from
  const insertAt =
    gapPosition !== undefined && isBlockBoundary(docBefore, gapPosition)
      ? gapPosition
      : docBefore.content.size
  editor.chain().setMeta('addToHistory', false).insertContentAt(insertAt, meta.blocks).run()
  if (editor.state.doc.eq(docBefore)) return
  undoneMoves.add(meta.blocks)
  await enqueue(storage, () => takeBackFromTarget(storage.atmosphere, latestMeta))
}

export const BlockMoveHistory = Extension.create<{atmosphere: Atmosphere}, BlockMoveHistoryStorage>(
  {
    name: 'blockMoveHistory',

    addStorage() {
      return {atmosphere: this.options.atmosphere, queue: Promise.resolve(), pendingRedo: null}
    },

    // Runs below Collaboration's priority so these replace its undo/redo, which its Mod-z/Mod-y/Shift-Mod-z call
    addCommands() {
      const {editor, storage} = this
      return {
        undo:
          () =>
          ({tr, state, dispatch}) => {
            tr.setMeta('preventDispatch', true)
            const undoManager = getUndoManager(state)
            if (!undoManager) return false
            const {pendingRedo} = storage
            if (pendingRedo && !pendingRedo.cancelled) {
              if (dispatch) pendingRedo.cancelled = true
              return true
            }
            const top = undoManager.undoStack.at(-1)
            if (!top) return false
            if (!dispatch) return true
            const meta = getMeta(top)
            if (!meta) {
              popOrdinary(undoManager, 'undo')
              return true
            }
            if (!undoMoveItem(editor, undoManager, top)) {
              showSnack(
                storage.atmosphere,
                'blockMoveUndo',
                getUnrestorableMessage(meta.blocks.length, meta.targetTitle)
              )
            }
            return true
          },
        redo:
          () =>
          ({tr, state, dispatch}) => {
            tr.setMeta('preventDispatch', true)
            const undoManager = getUndoManager(state)
            if (!undoManager) return false
            const {pendingRedo} = storage
            if (pendingRedo) {
              if (dispatch) pendingRedo.cancelled = false
              return true
            }
            const top = undoManager.redoStack.at(-1)
            if (!top) return false
            if (!dispatch) return true
            const meta = getMeta(top)
            if (meta) startRedoMove(editor, undoManager, top, meta)
            else popOrdinary(undoManager, 'redo')
            return true
          }
      }
    }
  }
)
