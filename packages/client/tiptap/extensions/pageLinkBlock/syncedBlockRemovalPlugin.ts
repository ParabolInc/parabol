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

const countSyncedLinks = (doc: Node, pageCode: number) => {
  let count = 0
  doc.descendants((node) => {
    if (isSyncedLink(node) && Number(node.attrs.pageCode) === pageCode) count++
  })
  return count
}

const isLocalEdit = (tr: Transaction) =>
  tr.docChanged && !tr.getMeta(ySyncPluginKey) && !tr.getMeta(BLOCK_MOVE_DELETE_META)

const findRemoval = (tr: Transaction): SyncedBlockRemoval | null => {
  const removedByCode = new Map<number, {node: Node; pos: number}[]>()
  tr.steps.forEach((step, index) => {
    const stepDoc = tr.docs[index]!
    const mapToEnd = tr.mapping.slice(index)
    step.getMap().forEach((from, to) => {
      stepDoc.nodesBetween(from, to, (node, pos) => {
        if (!isSyncedLink(node)) return true
        if (pos >= from && pos + node.nodeSize <= to) {
          const pageCode = Number(node.attrs.pageCode)
          const removed = removedByCode.get(pageCode) ?? []
          removedByCode.set(pageCode, [...removed, {node, pos: mapToEnd.map(pos, -1)}])
        }
        return false
      })
    })
  })
  const gone = [...removedByCode].filter(([pageCode]) => countSyncedLinks(tr.doc, pageCode) === 0)
  if (gone.length !== 1) return null
  const [pageCode, removed] = gone[0]!
  if (removed.length !== 1) return null
  const {node, pos} = removed[0]!
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
