import type {Editor} from '@tiptap/core'
import type {Node as ProseMirrorNode} from '@tiptap/pm/model'
import type {EditorState, Transaction} from '@tiptap/pm/state'
import {Plugin, PluginKey, TextSelection} from '@tiptap/pm/state'
import {Decoration, DecorationSet} from '@tiptap/pm/view'
import {
  absolutePositionToRelativePosition,
  type ProsemirrorBinding,
  relativePositionToAbsolutePosition,
  ySyncPluginKey
} from '@tiptap/y-tiptap'
import * as Y from 'yjs'
import {
  PAGE_COMMENT_MARK_NAME,
  PageCommentMarkBase
} from '../../../shared/tiptap/extensions/PageCommentMarkBase'

const HIGHLIGHT_CLASS = 'cursor-pointer border-b-2 print:border-0 print:bg-transparent'
const OPEN_CLASS = `${HIGHLIGHT_CLASS} border-gold-400 bg-gold-200/60 dark:border-gold-600 dark:bg-gold-500/25`
const ACTIVE_CLASS = `${HIGHLIGHT_CLASS} border-gold-500 bg-gold-300 dark:bg-gold-500/55`

// Positions can only be mapped through local changes, because a remote change replaces the
// whole doc. The relative positions carry the range through a remote change, and the quote
// finds the range again when that change rebuilt its block, which orphans them
interface PageCommentDraft {
  from: number
  to: number
  anchor: Y.RelativePosition
  head: Y.RelativePosition
  quote: string | null
}

type YSyncState = {doc: Y.Doc; type: Y.XmlFragment; binding: ProsemirrorBinding}

interface PageCommentState {
  openThreadIds: ReadonlySet<string>
  activeThreadId: string | null
  draft: PageCommentDraft | null
}

interface PageCommentPluginState extends PageCommentState {
  decorations: DecorationSet
}

interface PageCommentMeta {
  openThreadIds?: string[]
  activeThreadId?: string | null
  draft?: PageCommentDraft | null
}

export const pageCommentKey = new PluginKey<PageCommentPluginState>('pageComment')

// The server can only mark text, so the range is trimmed to the text nodes that it covers
const getTextRange = (doc: ProseMirrorNode, from: number, to: number) => {
  const range: {from: number | null; to: number | null} = {from: null, to: null}
  doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isText) return true
    const textFrom = Math.max(pos, from)
    const textTo = Math.min(pos + node.nodeSize, to)
    if (textTo > textFrom) {
      range.from ??= textFrom
      range.to = textTo
    }
    return false
  })
  return range.from !== null && range.to !== null ? {from: range.from, to: range.to} : null
}

// a leaf node counts as 1 character, so an offset into the text is an offset into the block
const LEAF_TEXT = '\ufffc'

// null if the range spans blocks, since a quote is only looked up inside a block
const getQuote = (doc: ProseMirrorNode, from: number, to: number) => {
  const isInOneBlock = doc.resolve(from).sameParent(doc.resolve(to))
  return isInOneBlock ? doc.textBetween(from, to, undefined, LEAF_TEXT) : null
}

const findQuote = (doc: ProseMirrorNode, quote: string | null, nearPos: number) => {
  const closest: {from: number | null} = {from: null}
  if (!quote) return null
  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true
    const blockText = node.textBetween(0, node.content.size, undefined, LEAF_TEXT)
    for (let idx = blockText.indexOf(quote); idx !== -1; idx = blockText.indexOf(quote, idx + 1)) {
      const from = pos + 1 + idx
      const isCloser =
        closest.from === null || Math.abs(from - nearPos) < Math.abs(closest.from - nearPos)
      if (isCloser) closest.from = from
    }
    return false
  })
  return closest.from === null ? null : {from: closest.from, to: closest.from + quote.length}
}

const toRelativePositions = (ySync: YSyncState, from: number, to: number) => ({
  anchor: absolutePositionToRelativePosition(from, ySync.type, ySync.binding.mapping),
  head: absolutePositionToRelativePosition(to, ySync.type, ySync.binding.mapping)
})

const makeDraft = (doc: ProseMirrorNode, ySync: YSyncState, from: number, to: number) => ({
  from,
  to,
  ...toRelativePositions(ySync, from, to),
  quote: getQuote(doc, from, to)
})

const remapDraft = (tr: Transaction, draft: PageCommentDraft | null, oldState: EditorState) => {
  if (!draft || !tr.docChanged) return draft
  if (!tr.getMeta(ySyncPluginKey)?.isChangeOrigin) {
    const from = tr.mapping.map(draft.from, 1)
    const to = tr.mapping.map(draft.to, -1)
    return to > from ? {...draft, from, to} : null
  }
  const ySync: YSyncState = ySyncPluginKey.getState(oldState)
  const {doc, type, binding} = ySync
  const from = relativePositionToAbsolutePosition(doc, type, draft.anchor, binding.mapping)
  const to = relativePositionToAbsolutePosition(doc, type, draft.head, binding.mapping)
  const resolvedRange = from !== null && to !== null && to > from ? {from, to} : null
  const isIntact =
    resolvedRange &&
    (!draft.quote || getQuote(tr.doc, resolvedRange.from, resolvedRange.to) === draft.quote)
  const range = isIntact
    ? resolvedRange
    : (findQuote(tr.doc, draft.quote, draft.from) ?? resolvedRange)
  return range ? makeDraft(tr.doc, ySync, range.from, range.to) : null
}

const buildDecorations = (doc: ProseMirrorNode, state: PageCommentState) => {
  const {openThreadIds, activeThreadId, draft} = state
  const decorations: Decoration[] = []
  if (openThreadIds.size > 0) {
    doc.descendants((node, pos) => {
      if (!node.isInline) return true
      node.marks.forEach((mark) => {
        const {threadId} = mark.attrs
        if (mark.type.name !== PAGE_COMMENT_MARK_NAME || !openThreadIds.has(threadId)) return
        decorations.push(
          Decoration.inline(pos, pos + node.nodeSize, {
            class: threadId === activeThreadId ? ACTIVE_CLASS : OPEN_CLASS
          })
        )
      })
      return false
    })
  }
  if (draft) {
    decorations.push(
      Decoration.inline(draft.from, draft.to, {class: ACTIVE_CLASS, 'data-page-comment-draft': ''})
    )
  }
  return DecorationSet.create(doc, decorations)
}

const getOpenThreadIdAt = (target: EventTarget | null, openThreadIds: ReadonlySet<string>) => {
  let element = target instanceof Element ? target.closest('[data-thread-id]') : null
  while (element) {
    const threadId = element.getAttribute('data-thread-id')
    if (threadId && openThreadIds.has(threadId)) return threadId
    element = element.parentElement?.closest('[data-thread-id]') ?? null
  }
  return null
}

const encodePosition = (position: Y.RelativePosition) =>
  btoa(String.fromCharCode(...Y.encodeRelativePosition(position)))

export const getPageCommentDraftAnchor = (editor: Editor) => {
  const {state} = editor
  const draft = pageCommentKey.getState(state)?.draft
  if (!draft) return null
  const {anchor, head} = toRelativePositions(ySyncPluginKey.getState(state), draft.from, draft.to)
  return {anchor: encodePosition(anchor), head: encodePosition(head)}
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageComment: {
      startPageCommentDraft: () => ReturnType
      discardPageCommentDraft: () => ReturnType
      setActivePageThread: (threadId: string | null) => ReturnType
      setOpenPageThreads: (threadIds: string[]) => ReturnType
    }
  }
  interface Storage {
    pageComment: {isCommentingEnabled: boolean}
  }
}

// merged, because chained commands share a transaction
const setMeta = (tr: Transaction, meta: PageCommentMeta) =>
  tr.setMeta(pageCommentKey, {...tr.getMeta(pageCommentKey), ...meta})

export const PageComment = PageCommentMarkBase.extend({
  addStorage() {
    return {isCommentingEnabled: false}
  },

  addCommands() {
    return {
      startPageCommentDraft:
        () =>
        ({state, tr, dispatch}) => {
          const {from, to} = state.selection
          const range = getTextRange(state.doc, from, to)
          const ySync: YSyncState | undefined = ySyncPluginKey.getState(state)
          if (!this.storage.isCommentingEnabled || !range || !ySync?.binding) return false
          if (dispatch) {
            const draft = makeDraft(state.doc, ySync, range.from, range.to)
            setMeta(tr, {draft, activeThreadId: null})
            tr.setSelection(TextSelection.create(tr.doc, range.to))
          }
          return true
        },
      discardPageCommentDraft:
        () =>
        ({tr, dispatch}) => {
          if (dispatch) setMeta(tr, {draft: null})
          return true
        },
      setActivePageThread:
        (threadId) =>
        ({tr, dispatch}) => {
          if (dispatch) setMeta(tr, {activeThreadId: threadId})
          return true
        },
      setOpenPageThreads:
        (threadIds) =>
        ({tr, dispatch}) => {
          if (dispatch) setMeta(tr, {openThreadIds: threadIds})
          return true
        }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-m': () => this.editor.commands.startPageCommentDraft()
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<PageCommentPluginState>({
        key: pageCommentKey,
        state: {
          init: () => ({
            openThreadIds: new Set(),
            activeThreadId: null,
            draft: null,
            decorations: DecorationSet.empty
          }),
          apply: (tr, prev, oldState) => {
            const meta = tr.getMeta(pageCommentKey) as PageCommentMeta | undefined
            if (!meta && !tr.docChanged) return prev
            const next: PageCommentState = {
              openThreadIds: meta?.openThreadIds ? new Set(meta.openThreadIds) : prev.openThreadIds,
              activeThreadId:
                meta?.activeThreadId !== undefined ? meta.activeThreadId : prev.activeThreadId,
              draft: meta?.draft !== undefined ? meta.draft : remapDraft(tr, prev.draft, oldState)
            }
            return {...next, decorations: buildDecorations(tr.doc, next)}
          }
        },
        props: {
          decorations(state) {
            return this.getState(state)?.decorations
          },
          handleClick(view, _pos, event) {
            const pluginState = pageCommentKey.getState(view.state)
            if (!pluginState) return false
            const {openThreadIds, activeThreadId} = pluginState
            const threadId = getOpenThreadIdAt(event.target, openThreadIds)
            if (threadId !== activeThreadId) {
              view.dispatch(setMeta(view.state.tr, {activeThreadId: threadId}))
            }
            return false
          }
        }
      })
    ]
  }
})
