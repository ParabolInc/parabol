import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import {Plugin, PluginKey, type Transaction} from '@tiptap/pm/state'
import {ySyncPluginKey} from '@tiptap/y-tiptap'
import type {PageLinkBlockAttrs} from '../../../shared/tiptap/extensions/PageLinkBlockBase'
import {BLOCK_MOVE_DELETE_META} from '../../blockMove/blockMoveUndoStack'

export type SyncedBlockRemoval = {
  pageCode: number
  isOriginal: boolean
  attrs: PageLinkBlockAttrs
  pos: number
}

type OnSyncedBlockRemoved = (removal: SyncedBlockRemoval, editor: Editor) => void

const isSyncedLink = (node: Node) => node.type.name === 'pageLinkBlock' && !!node.attrs.synced

export const countSyncedLinks = (doc: Node, pageCode: number) => {
  let count = 0
  doc.descendants((node) => {
    if (isSyncedLink(node) && Number(node.attrs.pageCode) === pageCode) count++
  })
  return count
}

const isLocalEdit = (tr: Transaction) =>
  tr.docChanged &&
  !tr.getMeta(ySyncPluginKey) &&
  !tr.getMeta(BLOCK_MOVE_DELETE_META) &&
  tr.getMeta('uiEvent') !== 'cut'

const findRemoval = (tr: Transaction): SyncedBlockRemoval | null => {
  let removed: {node: Node; pos: number} | null = null
  for (let index = 0; index < tr.steps.length; index++) {
    const stepDoc = tr.docs[index]!
    const ranges: [number, number][] = []
    tr.steps[index]!.getMap().forEach((from, to) => {
      if (to > from) ranges.push([from, to])
    })
    for (const [from, to] of ranges) {
      const node = stepDoc.nodeAt(from)
      if (removed || !node || !isSyncedLink(node) || from + node.nodeSize !== to) return null
      removed = {node, pos: tr.mapping.slice(index).map(from, -1)}
    }
  }
  if (!removed) return null
  const {node, pos} = removed
  const pageCode = Number(node.attrs.pageCode)
  if (countSyncedLinks(tr.doc, pageCode) > 0) return null
  return {
    pageCode,
    isOriginal: !!node.attrs.canonical,
    attrs: node.attrs as PageLinkBlockAttrs,
    pos
  }
}

export const syncedBlockRemovalPlugin = (editor: Editor, onRemoved: OnSyncedBlockRemoved) => {
  const onTransaction = ({
    transaction,
    appendedTransactions
  }: {
    transaction: Transaction
    appendedTransactions: Transaction[]
  }) => {
    if (!editor.isEditable) return
    const transactions = [transaction, ...appendedTransactions]
    const removals = transactions.flatMap((tr, index) => {
      const removal = isLocalEdit(tr) ? findRemoval(tr) : null
      if (!removal) return []
      const pos = transactions
        .slice(index + 1)
        .reduce((mapped, later) => later.mapping.map(mapped, -1), removal.pos)
      return [{...removal, pos}]
    })
    if (removals.length !== 1) return
    const removal = removals[0]!
    if (countSyncedLinks(editor.state.doc, removal.pageCode) > 0) return
    onRemoved(removal, editor)
  }
  return new Plugin({
    key: new PluginKey('syncedBlockRemoval'),
    view: () => {
      editor.on('transaction', onTransaction)
      return {
        destroy: () => {
          editor.off('transaction', onTransaction)
        }
      }
    }
  })
}
